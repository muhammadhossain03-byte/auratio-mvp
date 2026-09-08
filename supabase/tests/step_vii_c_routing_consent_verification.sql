-- Auratio Step VII-C1 verification.
-- Intended for a freshly migrated disposable/local database. All test rows roll back.

do $$
begin
  if has_function_privilege(
    'authenticated',
    'public.svc_end_user_consent_ai_to_human(uuid,uuid,text)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated role can directly execute consent-aware routing RPC';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.svc_end_user_consent_ai_to_human(uuid,uuid,text)',
    'EXECUTE'
  ) then
    raise exception 'Service role cannot execute consent-aware routing RPC';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'evaluation_requests'
      and column_name = 'requested_mode'
      and is_nullable = 'NO'
  ) then
    raise exception 'evaluation_requests.requested_mode is missing or nullable';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'evaluation_mode_redirect_consents'
      and policyname = 'evaluation_mode_redirect_consents_read'
  ) then
    raise exception 'Consent audit read policy is missing';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000701','vii-c-owner@example.invalid'),
('00000000-0000-4000-8000-000000000702','vii-c-other@example.invalid'),
('00000000-0000-4000-8000-000000000703','vii-c-volunteer@example.invalid'),
('00000000-0000-4000-8000-000000000704','vii-c-admin@example.invalid');

update public.profiles
set role = 'volunteer'
where user_id = '00000000-0000-4000-8000-000000000703';

update public.profiles
set role = 'admin'
where user_id = '00000000-0000-4000-8000-000000000704';

insert into storage.objects(bucket_id,name,owner) values
(
  'evaluation-videos',
  '00000000-0000-4000-8000-000000000701/redirect.mp4',
  '00000000-0000-4000-8000-000000000701'
);

do $$
declare
  v_create jsonb;
  v_redirect jsonb;
  v_request_id uuid;
  v_version_id uuid;
  v_attempt_status text;
begin
  v_create := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000701',
    'informative',
    'ai',
    '00000000-0000-4000-8000-000000000701/redirect.mp4',
    300::numeric,
    1000::bigint,
    'video/mp4'
  );

  v_request_id := (v_create->>'request_id')::uuid;
  v_version_id := (v_create->>'evaluation_version_id')::uuid;

  if not exists (
    select 1
    from public.evaluation_requests er
    where er.id = v_request_id
      and er.requested_mode = 'ai'
      and er.mode = 'ai'
      and er.status = 'processing'
  ) then
    raise exception 'AI request did not preserve matching requested/effective mode before redirect';
  end if;

  select a.status::text
    into v_attempt_status
  from private.ai_evaluation_attempts a
  where a.request_id = v_request_id;

  if v_attempt_status <> 'created' then
    raise exception 'AI attempt was not in created state before redirect';
  end if;

  -- The legacy request guard must remain closed to direct mode mutation. The
  -- only allowed AI -> Human transition is the consent RPC, which persists the
  -- consent row before changing the effective mode.
  begin
    update public.evaluation_requests
    set mode = 'human', status = 'unassigned'
    where id = v_request_id;
    raise exception 'TEST_SENTINEL direct AI-to-Human mode mutation was accepted without consent';
  exception when others then
    if sqlerrm like 'TEST_SENTINEL%' then
      raise;
    end if;
  end;

  begin
    perform public.svc_end_user_consent_ai_to_human(
      '00000000-0000-4000-8000-000000000702',
      v_request_id,
      'ai-to-human-v1'
    );
    raise exception 'TEST_SENTINEL wrong owner was allowed to redirect';
  exception when others then
    if sqlerrm like 'TEST_SENTINEL%' then
      raise;
    end if;
  end;

  v_redirect := public.svc_end_user_consent_ai_to_human(
    '00000000-0000-4000-8000-000000000701',
    v_request_id,
    'ai-to-human-v1'
  );

  if v_redirect->>'routing' <> 'redirected_human'
     or v_redirect->>'requested_mode' <> 'ai'
     or v_redirect->>'mode' <> 'human'
     or v_redirect->>'status' <> 'unassigned' then
    raise exception 'Consent-aware routing RPC returned an incoherent route receipt';
  end if;

  if not exists (
    select 1
    from public.evaluation_requests er
    where er.id = v_request_id
      and er.requested_mode = 'ai'
      and er.mode = 'human'
      and er.status = 'unassigned'
      and er.terminal_at is null
  ) then
    raise exception 'Persisted request did not preserve requested AI while routing effectively to Human';
  end if;

  if (select count(*) from public.evaluation_mode_redirect_consents c where c.request_id = v_request_id) <> 1 then
    raise exception 'Exactly one explicit mode-redirection consent record is required';
  end if;

  if not exists (
    select 1
    from public.evaluation_mode_redirect_consents c
    where c.request_id = v_request_id
      and c.consented_by_user_id = '00000000-0000-4000-8000-000000000701'::uuid
      and c.from_mode = 'ai'
      and c.to_mode = 'human'
      and c.consent_copy_version = 'ai-to-human-v1'
  ) then
    raise exception 'Persisted explicit consent provenance is incomplete';
  end if;

  if (select status::text from private.ai_evaluation_attempts where request_id = v_request_id) <> 'cancelled' then
    raise exception 'Redirect did not close the superseded AI attempt';
  end if;

  if (select started_at from public.evaluation_versions where id = v_version_id) is not null then
    raise exception 'Redirected Human draft retained an AI started_at timestamp';
  end if;

  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000704',
    v_request_id,
    '00000000-0000-4000-8000-000000000703'
  );

  if not exists (
    select 1
    from public.evaluation_requests er
    join public.human_assignments ha on ha.request_id = er.id
    where er.id = v_request_id
      and er.requested_mode = 'ai'
      and er.mode = 'human'
      and er.status = 'assigned'
      and ha.volunteer_user_id = '00000000-0000-4000-8000-000000000703'::uuid
      and ha.status = 'assigned'
  ) then
    raise exception 'Redirected request could not enter the accepted persisted Human lifecycle';
  end if;

  begin
    perform public.svc_end_user_consent_ai_to_human(
      '00000000-0000-4000-8000-000000000701',
      v_request_id,
      'ai-to-human-v1'
    );
    raise exception 'TEST_SENTINEL duplicate redirect was accepted';
  exception when others then
    if sqlerrm like 'TEST_SENTINEL%' then
      raise;
    end if;
  end;

  begin
    update public.evaluation_requests
    set requested_mode = 'human'
    where id = v_request_id;
    raise exception 'TEST_SENTINEL requested_mode mutation was accepted';
  exception when others then
    if sqlerrm like 'TEST_SENTINEL%' then
      raise;
    end if;
  end;

  if not exists (
    select 1
    from public.audit_log al
    where al.request_id = v_request_id
      and al.action = 'evaluation_request.redirected_ai_to_human_with_consent'
      and al.actor_user_id = '00000000-0000-4000-8000-000000000701'::uuid
  ) then
    raise exception 'Consent-aware route audit entry is missing';
  end if;
end $$;

rollback;

select 'VII-C1 routing consent verification PASS' as result;
