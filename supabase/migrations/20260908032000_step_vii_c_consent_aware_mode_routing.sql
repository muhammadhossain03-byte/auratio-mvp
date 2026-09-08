-- Auratio Step VII-C1 — consent-aware AI-requested -> Human effective routing.
--
-- `evaluation_requests.mode` remains the effective/current execution mode so all
-- existing Human/AI lifecycle, report, progress, and leaderboard services keep
-- operating on the final evaluator mode. `requested_mode` permanently preserves
-- the End-User's originally requested method. A privileged End-User-consent RPC
-- is the only legal AI -> Human mode transition.

alter table public.evaluation_requests
  add column requested_mode public.evaluation_mode;

update public.evaluation_requests
set requested_mode = mode
where requested_mode is null;

alter table public.evaluation_requests
  alter column requested_mode set not null;

alter table public.evaluation_requests
  add constraint evaluation_request_requested_mode_route check (
    requested_mode = mode
    or (requested_mode = 'ai'::public.evaluation_mode and mode = 'human'::public.evaluation_mode)
  );

create table public.evaluation_mode_redirect_consents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.evaluation_requests(id) on delete restrict,
  consented_by_user_id uuid not null references public.profiles(user_id) on delete restrict,
  from_mode public.evaluation_mode not null,
  to_mode public.evaluation_mode not null,
  consent_copy_version text not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint evaluation_mode_redirect_consent_direction check (
    from_mode = 'ai'::public.evaluation_mode
    and to_mode = 'human'::public.evaluation_mode
  ),
  constraint evaluation_mode_redirect_consent_copy_nonempty check (
    length(btrim(consent_copy_version)) > 0
  )
);

create index evaluation_mode_redirect_consents_user_idx
  on public.evaluation_mode_redirect_consents(consented_by_user_id, consented_at desc);

alter table public.evaluation_mode_redirect_consents enable row level security;
revoke all on public.evaluation_mode_redirect_consents from public, anon, authenticated;
grant select on public.evaluation_mode_redirect_consents to authenticated;

create policy evaluation_mode_redirect_consents_read
on public.evaluation_mode_redirect_consents
for select
to authenticated
using (
  private.is_admin_or_super()
  or exists (
    select 1
    from public.evaluation_requests er
    where er.id = evaluation_mode_redirect_consents.request_id
      and er.user_id = (select auth.uid())
      and private.is_active_user()
  )
);

-- Step V's accepted request guard historically made evaluation_requests.mode
-- immutable. Preserve that invariant for every route except the one explicit,
-- consent-backed AI -> Human transition introduced here. The existing
-- evaluation_requests_guard trigger continues to call this function.
create or replace function public.guard_evaluation_request()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_owner uuid;
  v_mode public.evaluation_mode;
  v_consented_ai_to_human boolean := false;
begin
  select user_id into v_owner
  from public.submissions
  where id = new.submission_id;

  if v_owner is null or v_owner <> new.user_id then
    raise exception 'Evaluation request user must match submission owner';
  end if;

  if tg_op = 'INSERT' then
    if new.mode = 'ai' and new.status <> 'processing' then
      raise exception 'AI request must start Processing';
    end if;
    if new.mode = 'human' and new.status <> 'unassigned' then
      raise exception 'Human request must start Unassigned';
    end if;
  else
    if old.status in ('approved','rejected','cancelled') then
      raise exception 'Terminal evaluation request cannot transition';
    end if;

    if new.submission_id <> old.submission_id or new.user_id <> old.user_id then
      raise exception 'Evaluation request identity is immutable';
    end if;

    v_consented_ai_to_human := (
      old.requested_mode = 'ai'::public.evaluation_mode
      and old.mode = 'ai'::public.evaluation_mode
      and old.status = 'processing'::public.evaluation_request_status
      and new.mode = 'human'::public.evaluation_mode
      and new.status = 'unassigned'::public.evaluation_request_status
      and exists (
        select 1
        from public.evaluation_mode_redirect_consents c
        where c.request_id = old.id
          and c.consented_by_user_id = old.user_id
          and c.from_mode = 'ai'::public.evaluation_mode
          and c.to_mode = 'human'::public.evaluation_mode
      )
    );

    if new.mode <> old.mode and not v_consented_ai_to_human then
      raise exception 'Evaluation request mode is immutable without explicit End-User AI-to-Human consent';
    end if;

    if not v_consented_ai_to_human then
      v_mode := old.mode;
      if v_mode = 'ai' then
        if not (
          old.status = 'processing'
          and new.status in ('processing','approved','rejected','cancelled')
        ) then
          raise exception 'Invalid AI request transition % -> %', old.status, new.status;
        end if;
      else
        if not (
          new.status = old.status
          or (old.status='unassigned' and new.status in ('assigned','cancelled'))
          or (old.status='assigned' and new.status in ('accepted','unassigned','cancelled','rejected'))
          or (old.status='accepted' and new.status in ('in_evaluation','unassigned','cancelled','rejected'))
          or (old.status='in_evaluation' and new.status in ('submitted','unassigned','cancelled','rejected'))
          or (old.status='submitted' and new.status in ('pending_moderation','approved','reopened','rejected'))
          or (old.status='pending_moderation' and new.status in ('approved','reopened','assigned','rejected'))
          or (old.status='reopened' and new.status in ('assigned','rejected'))
        ) then
          raise exception 'Invalid Human request transition % -> %', old.status, new.status;
        end if;
      end if;
    end if;
  end if;

  if new.status in ('approved','rejected','cancelled') then
    new.terminal_at := coalesce(new.terminal_at, now());
  else
    new.terminal_at := null;
  end if;

  return new;
end;
$$;

create or replace function private.guard_evaluation_request_mode_history()
returns trigger
language plpgsql
security definer
set search_path = public, private, auth
as $$
begin
  if tg_op = 'INSERT' then
    if new.requested_mode is null then
      new.requested_mode := new.mode;
    end if;
    if new.requested_mode <> new.mode then
      raise exception 'New evaluation request requested mode must equal effective mode';
    end if;
    return new;
  end if;

  if new.requested_mode is distinct from old.requested_mode then
    raise exception 'Originally requested evaluation mode is immutable';
  end if;

  if new.mode is distinct from old.mode then
    if not (
      old.requested_mode = 'ai'::public.evaluation_mode
      and old.mode = 'ai'::public.evaluation_mode
      and old.status = 'processing'::public.evaluation_request_status
      and new.mode = 'human'::public.evaluation_mode
      and new.status = 'unassigned'::public.evaluation_request_status
      and exists (
        select 1
        from public.evaluation_mode_redirect_consents c
        where c.request_id = old.id
          and c.consented_by_user_id = old.user_id
          and c.from_mode = 'ai'::public.evaluation_mode
          and c.to_mode = 'human'::public.evaluation_mode
      )
    ) then
      raise exception 'Evaluation mode may change only from AI to Human after explicit End-User consent';
    end if;
  end if;

  return new;
end;
$$;
revoke execute on function private.guard_evaluation_request_mode_history() from public, anon, authenticated;

drop trigger if exists evaluation_requests_guard_mode_history on public.evaluation_requests;
create trigger evaluation_requests_guard_mode_history
before insert or update on public.evaluation_requests
for each row execute function private.guard_evaluation_request_mode_history();

create or replace function public.svc_end_user_consent_ai_to_human(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_consent_copy_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_actor_role public.app_role;
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
  v_version public.evaluation_versions%rowtype;
  v_consent_id uuid;
  v_consented_at timestamptz;
  v_copy_version text := btrim(coalesce(p_consent_copy_version, ''));
begin
  if v_copy_version = '' then
    raise exception 'Consent copy version is required';
  end if;

  select p.role
    into v_actor_role
  from public.profiles p
  where p.user_id = p_actor_user_id
    and p.account_status = 'active';

  if v_actor_role <> 'end_user'::public.app_role then
    raise exception 'Active End User account required';
  end if;

  select *
    into v_req
  from public.evaluation_requests
  where id = p_request_id
  for update;

  if v_req.id is null then
    raise exception 'Evaluation request not found';
  end if;
  if v_req.user_id <> p_actor_user_id then
    raise exception 'Only the request owner may consent to mode redirection';
  end if;
  if v_req.requested_mode <> 'ai'::public.evaluation_mode
     or v_req.mode <> 'ai'::public.evaluation_mode then
    raise exception 'Only an originally AI-requested request may redirect to Human';
  end if;
  if v_req.status <> 'processing'::public.evaluation_request_status then
    raise exception 'Only a Processing AI request may redirect to Human';
  end if;
  if exists (
    select 1
    from public.evaluation_mode_redirect_consents c
    where c.request_id = p_request_id
  ) then
    raise exception 'Mode redirection consent has already been recorded';
  end if;

  select *
    into v_attempt
  from private.ai_evaluation_attempts
  where request_id = p_request_id
  for update;

  if v_attempt.id is null then
    raise exception 'AI attempt record missing';
  end if;
  if v_attempt.status not in ('created', 'in_flight') then
    raise exception 'AI request is no longer redirectable';
  end if;

  select *
    into v_version
  from public.evaluation_versions
  where id = v_attempt.evaluation_version_id
  for update;

  if v_version.id is null or v_version.status <> 'draft'::public.evaluation_version_status then
    raise exception 'AI evaluator version is no longer redirectable';
  end if;
  if v_version.overall_summary is not null
     or v_version.universal_score is not null
     or v_version.structural_score is not null
     or v_version.track_score is not null
     or v_version.final_score is not null
     or exists (
       select 1
       from public.evaluation_criterion_results r
       where r.evaluation_version_id = v_version.id
     ) then
    raise exception 'AI evaluator version already contains persisted evaluation output';
  end if;

  perform set_config('auratio.actor_user_id', p_actor_user_id::text, true);

  insert into public.evaluation_mode_redirect_consents(
    request_id,
    consented_by_user_id,
    from_mode,
    to_mode,
    consent_copy_version
  )
  values(
    p_request_id,
    p_actor_user_id,
    'ai',
    'human',
    v_copy_version
  )
  returning id, consented_at into v_consent_id, v_consented_at;

  update private.ai_evaluation_attempts
  set status = 'cancelled',
      validation_outcome = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where id = v_attempt.id;

  -- The same v1 draft becomes the first Human evaluator draft. AI-attempt
  -- provenance stays in private.ai_evaluation_attempts; Human work receives a
  -- clean started_at and no AI output is carried across.
  update public.evaluation_versions
  set started_at = null
  where id = v_version.id;

  update public.evaluation_requests
  set mode = 'human',
      status = 'unassigned',
      updated_at = now()
  where id = p_request_id;

  insert into public.audit_log(
    actor_user_id,
    action,
    entity_type,
    entity_id,
    request_id,
    metadata
  )
  values(
    p_actor_user_id,
    'evaluation_request.redirected_ai_to_human_with_consent',
    'evaluation_request',
    p_request_id::text,
    p_request_id,
    jsonb_build_object(
      'requested_mode', 'ai',
      'effective_mode', 'human',
      'consent_id', v_consent_id,
      'consent_copy_version', v_copy_version,
      'ai_attempt_id', v_attempt.id,
      'ai_attempt_status_before', v_attempt.status::text
    )
  );

  return jsonb_build_object(
    'ok', true,
    'request_id', p_request_id,
    'requested_mode', 'ai',
    'mode', 'human',
    'routing', 'redirected_human',
    'status', 'unassigned',
    'consent_id', v_consent_id,
    'consented_at', v_consented_at,
    'consent_copy_version', v_copy_version
  );
end;
$$;

revoke execute on function public.svc_end_user_consent_ai_to_human(uuid,uuid,text)
  from public, anon, authenticated;
grant execute on function public.svc_end_user_consent_ai_to_human(uuid,uuid,text)
  to service_role;
