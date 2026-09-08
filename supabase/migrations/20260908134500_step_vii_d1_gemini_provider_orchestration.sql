-- Auratio Step VII-D1 — durable Gemini provider orchestration foundation.
-- This migration adds only server-private provider state and service-role RPCs.
-- It does not call Gemini and does not duplicate scoring/finalization logic.

create type private.ai_provider_job_state as enum (
  'queued',
  'initializing',
  'file_ready',
  'interaction_creating',
  'interaction_pending',
  'cleanup_pending',
  'cleaned'
);

create table private.ai_provider_jobs (
  attempt_id uuid primary key
    references private.ai_evaluation_attempts(id) on delete restrict,
  request_id uuid not null unique
    references public.evaluation_requests(id) on delete restrict,
  evaluation_version_id uuid not null unique
    references public.evaluation_versions(id) on delete restrict,

  provider text not null default 'gemini',
  model_identifier text not null default 'gemini-3.8-flash',
  state private.ai_provider_job_state not null default 'queued',

  provider_file_name text,
  provider_file_uri text,
  provider_file_uploaded_at timestamptz,

  interaction_id text,
  interaction_creation_started_at timestamptz,
  interaction_creation_uncertain_at timestamptz,
  interaction_created_at timestamptz,
  provider_status text,

  poll_count integer not null default 0,
  last_polled_at timestamptz,
  next_action_at timestamptz not null default now(),

  claim_token uuid,
  claimed_at timestamptz,

  cleanup_attempt_count integer not null default 0,
  provider_file_deleted_at timestamptz,
  interaction_deleted_at timestamptz,
  cleaned_at timestamptz,

  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_provider_job_provider_check
    check (provider = 'gemini'),
  constraint ai_provider_job_model_nonempty
    check (length(btrim(model_identifier)) > 0),
  constraint ai_provider_job_file_pair
    check (
      (provider_file_name is null and provider_file_uri is null and provider_file_uploaded_at is null)
      or
      (
        provider_file_name is not null
        and length(btrim(provider_file_name)) > 0
        and provider_file_uri is not null
        and length(btrim(provider_file_uri)) > 0
        and provider_file_uploaded_at is not null
      )
    ),
  constraint ai_provider_job_interaction_shape
    check (
      (interaction_id is null and interaction_created_at is null)
      or
      (
        interaction_id is not null
        and length(btrim(interaction_id)) > 0
        and interaction_created_at is not null
      )
    ),
  constraint ai_provider_job_claim_shape
    check (
      (claim_token is null and claimed_at is null)
      or
      (claim_token is not null and claimed_at is not null)
    ),
  constraint ai_provider_job_counts_nonnegative
    check (poll_count >= 0 and cleanup_attempt_count >= 0),
  constraint ai_provider_job_error_nonempty
    check (last_error is null or length(btrim(last_error)) > 0),
  constraint ai_provider_job_cleaned_shape
    check (
      (state <> 'cleaned' and cleaned_at is null)
      or
      (state = 'cleaned' and cleaned_at is not null and claim_token is null and claimed_at is null)
    )
);

create index ai_provider_jobs_action_idx
  on private.ai_provider_jobs(state, next_action_at, created_at);

create unique index ai_provider_jobs_claim_token_uidx
  on private.ai_provider_jobs(claim_token)
  where claim_token is not null;

revoke all on private.ai_provider_jobs from public, anon, authenticated;
grant select, insert, update on private.ai_provider_jobs to service_role;

create or replace function private.create_ai_provider_job_for_attempt()
returns trigger
language plpgsql
security definer
set search_path = public, private, auth
as $$
begin
  insert into private.ai_provider_jobs(
    attempt_id,
    request_id,
    evaluation_version_id,
    model_identifier
  )
  values(
    new.id,
    new.request_id,
    new.evaluation_version_id,
    'gemini-3.8-flash'
  )
  on conflict (attempt_id) do nothing;

  return new;
end;
$$;

revoke execute on function private.create_ai_provider_job_for_attempt()
  from public, anon, authenticated;

drop trigger if exists ai_attempt_create_provider_job
  on private.ai_evaluation_attempts;

create trigger ai_attempt_create_provider_job
after insert on private.ai_evaluation_attempts
for each row
execute function private.create_ai_provider_job_for_attempt();

-- Backfill attempts created before VII-D. No pre-VII-D attempt is allowed to
-- silently create a second/unknown provider interaction.
insert into private.ai_provider_jobs(
  attempt_id,
  request_id,
  evaluation_version_id,
  model_identifier,
  state,
  interaction_creation_started_at,
  interaction_creation_uncertain_at,
  cleaned_at,
  last_error,
  next_action_at
)
select
  a.id,
  a.request_id,
  a.evaluation_version_id,
  coalesce(nullif(btrim(a.model_identifier), ''), 'gemini-3.8-flash'),
  case
    when a.status = 'created'
      and er.mode = 'ai'
      and er.status = 'processing'
      then 'queued'::private.ai_provider_job_state
    when a.status = 'in_flight'
      then 'interaction_creating'::private.ai_provider_job_state
    else 'cleaned'::private.ai_provider_job_state
  end,
  case when a.status = 'in_flight' then coalesce(a.started_at, now()) else null end,
  case when a.status = 'in_flight' then now() else null end,
  case
    when a.status not in ('created','in_flight') then now()
    else null
  end,
  case
    when a.status = 'in_flight'
      then 'pre_vii_d_in_flight_attempt_requires_fail_closed'
    else null
  end,
  now()
from private.ai_evaluation_attempts a
join public.evaluation_requests er on er.id = a.request_id
where not exists (
  select 1
  from private.ai_provider_jobs j
  where j.attempt_id = a.id
);

create or replace function public.svc_ai_provider_claim_jobs(
  p_limit integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 5), 1), 10);
  v_rows jsonb;
begin
  with candidates as (
    select j.attempt_id
    from private.ai_provider_jobs j
    where j.state in (
        'queued',
        'initializing',
        'file_ready',
        'interaction_creating',
        'interaction_pending',
        'cleanup_pending'
      )
      and j.next_action_at <= now()
      and (
        j.claim_token is null
        or j.claimed_at <= now() - interval '10 minutes'
      )
    order by j.next_action_at, j.created_at, j.attempt_id
    for update skip locked
    limit v_limit
  ),
  claimed as (
    update private.ai_provider_jobs j
    set claim_token = gen_random_uuid(),
        claimed_at = now(),
        updated_at = now()
    from candidates c
    where j.attempt_id = c.attempt_id
    returning j.*
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attempt_id', c.attempt_id,
        'request_id', c.request_id,
        'evaluation_version_id', c.evaluation_version_id,
        'provider', c.provider,
        'model_identifier', c.model_identifier,
        'state', c.state::text,
        'provider_file_name', c.provider_file_name,
        'provider_file_uri', c.provider_file_uri,
        'interaction_id', c.interaction_id,
        'interaction_creation_started_at', c.interaction_creation_started_at,
        'interaction_creation_uncertain_at', c.interaction_creation_uncertain_at,
        'provider_status', c.provider_status,
        'poll_count', c.poll_count,
        'next_action_at', c.next_action_at,
        'claim_token', c.claim_token,
        'claimed_at', c.claimed_at,
        'cleanup_attempt_count', c.cleanup_attempt_count,
        'provider_file_deleted_at', c.provider_file_deleted_at,
        'interaction_deleted_at', c.interaction_deleted_at,
        'request_requested_mode', er.requested_mode::text,
        'request_mode', er.mode::text,
        'request_status', er.status::text,
        'attempt_status', a.status::text
      )
      order by c.next_action_at, c.created_at, c.attempt_id
    ),
    '[]'::jsonb
  )
  into v_rows
  from claimed c
  join public.evaluation_requests er on er.id = c.request_id
  join private.ai_evaluation_attempts a on a.id = c.attempt_id;

  return v_rows;
end;
$$;

revoke execute on function public.svc_ai_provider_claim_jobs(integer)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_claim_jobs(integer)
  to service_role;

create or replace function public.svc_ai_provider_runtime_context(
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
  v_submission public.submissions%rowtype;
  v_video public.submission_videos%rowtype;
  v_rubric jsonb;
  v_submission_code text;
  v_minutes integer;
  v_seconds integer;
begin
  select * into v_req
  from public.evaluation_requests
  where id = p_request_id;

  if v_req.id is null or v_req.mode <> 'ai' then
    raise exception 'Active AI request not found';
  end if;
  if v_req.status <> 'processing' then
    raise exception 'AI request is not Processing';
  end if;

  select * into v_attempt
  from private.ai_evaluation_attempts
  where request_id = p_request_id;

  if v_attempt.id is null then
    raise exception 'AI attempt record missing';
  end if;
  if v_attempt.status <> 'in_flight' then
    raise exception 'AI attempt is not in flight';
  end if;

  select * into v_submission
  from public.submissions
  where id = v_req.submission_id;

  select * into v_video
  from public.submission_videos
  where submission_id = v_req.submission_id;

  if v_video.submission_id is null then
    raise exception 'AI video metadata missing';
  end if;
  if v_video.lifecycle_status <> 'retained' then
    raise exception 'AI source video is no longer retained';
  end if;

  v_rubric := private.ai_expected_rubric(p_request_id);
  if jsonb_array_length(v_rubric) <> 16 then
    raise exception 'AI runtime rubric must contain exactly 16 criteria';
  end if;

  v_submission_code := private.ai_submission_code(v_submission.id);
  v_minutes := floor(v_video.duration_seconds / 60)::integer;
  v_seconds := floor(mod(v_video.duration_seconds, 60))::integer;

  return jsonb_build_object(
    'request_id', p_request_id,
    'evaluation_version_id', v_attempt.evaluation_version_id,
    'attempt_id', v_attempt.id,
    'submission_id', v_submission_code,
    'track_slug', v_submission.track_id,
    'duration_seconds', v_video.duration_seconds,
    'duration_mm_ss',
      lpad(v_minutes::text, 2, '0') || ':' || lpad(v_seconds::text, 2, '0'),
    'video_bucket', v_video.bucket_name,
    'video_object_path', v_video.object_path,
    'prompt_version', v_attempt.prompt_version,
    'rubric_version', v_attempt.rubric_version,
    'schema_version', v_attempt.output_schema_version,
    'model_identifier', v_attempt.model_identifier,
    'criteria', v_rubric
  );
end;
$$;

revoke execute on function public.svc_ai_provider_runtime_context(uuid)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_runtime_context(uuid)
  to service_role;

create or replace function public.svc_ai_provider_mark_initializing(
  p_claim_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_attempt_status private.ai_attempt_status;
begin
  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state not in ('queued','initializing') then
    raise exception 'AI provider job is not ready for initialization';
  end if;

  select status into v_attempt_status
  from private.ai_evaluation_attempts
  where id = v_job.attempt_id;

  if v_attempt_status <> 'in_flight' then
    raise exception 'AI attempt must be in flight before provider initialization';
  end if;

  update private.ai_provider_jobs
  set state = 'initializing',
      last_error = null,
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'state', 'initializing'
  );
end;
$$;

revoke execute on function public.svc_ai_provider_mark_initializing(uuid)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_mark_initializing(uuid)
  to service_role;

create or replace function public.svc_ai_provider_record_file(
  p_claim_token uuid,
  p_provider_file_name text,
  p_provider_file_uri text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_name text := btrim(coalesce(p_provider_file_name, ''));
  v_uri text := btrim(coalesce(p_provider_file_uri, ''));
begin
  if v_name = '' or v_uri = '' then
    raise exception 'Provider file name and URI are required';
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state not in ('initializing','file_ready') then
    raise exception 'AI provider job is not ready to record a provider file';
  end if;

  if v_job.provider_file_name is not null
     and (v_job.provider_file_name <> v_name or v_job.provider_file_uri <> v_uri) then
    raise exception 'Provider file is already recorded with different identity';
  end if;

  update private.ai_provider_jobs
  set state = 'file_ready',
      provider_file_name = v_name,
      provider_file_uri = v_uri,
      provider_file_uploaded_at = coalesce(provider_file_uploaded_at, now()),
      last_error = null,
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'state', 'file_ready'
  );
end;
$$;

revoke execute on function public.svc_ai_provider_record_file(uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_record_file(uuid,text,text)
  to service_role;

create or replace function public.svc_ai_provider_begin_interaction(
  p_claim_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
begin
  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state <> 'file_ready' then
    raise exception 'AI provider file is not ready for Interaction creation';
  end if;
  if v_job.provider_file_name is null or v_job.provider_file_uri is null then
    raise exception 'AI provider file identity is missing';
  end if;
  if v_job.interaction_id is not null then
    raise exception 'Gemini Interaction already exists; retry is forbidden';
  end if;

  select * into v_req
  from public.evaluation_requests
  where id = v_job.request_id;

  select * into v_attempt
  from private.ai_evaluation_attempts
  where id = v_job.attempt_id;

  if v_req.mode <> 'ai' or v_req.status <> 'processing' then
    raise exception 'AI request is no longer active for Interaction creation';
  end if;
  if v_attempt.status <> 'in_flight' then
    raise exception 'AI attempt is no longer active for Interaction creation';
  end if;

  update private.ai_provider_jobs
  set state = 'interaction_creating',
      interaction_creation_started_at = now(),
      interaction_creation_uncertain_at = null,
      provider_status = null,
      last_error = null,
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'request_id', v_job.request_id,
    'state', 'interaction_creating'
  );
end;
$$;

revoke execute on function public.svc_ai_provider_begin_interaction(uuid)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_begin_interaction(uuid)
  to service_role;

create or replace function public.svc_ai_provider_record_interaction(
  p_claim_token uuid,
  p_interaction_id text,
  p_provider_status text default 'in_progress'
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_interaction_id text := btrim(coalesce(p_interaction_id, ''));
  v_status text := lower(btrim(coalesce(p_provider_status, 'in_progress')));
begin
  if v_interaction_id = '' then
    raise exception 'Gemini Interaction ID is required';
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state <> 'interaction_creating' then
    raise exception 'AI provider job is not creating an Interaction';
  end if;
  if v_job.interaction_id is not null then
    raise exception 'Gemini Interaction already recorded; retry is forbidden';
  end if;

  update private.ai_provider_jobs
  set state = 'interaction_pending',
      interaction_id = v_interaction_id,
      interaction_created_at = now(),
      provider_status = v_status,
      next_action_at = now() + interval '15 seconds',
      claim_token = null,
      claimed_at = null,
      last_error = null,
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'interaction_id', v_interaction_id,
    'state', 'interaction_pending',
    'provider_status', v_status
  );
end;
$$;

revoke execute on function public.svc_ai_provider_record_interaction(uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_record_interaction(uuid,text,text)
  to service_role;

create or replace function public.svc_ai_provider_schedule_poll(
  p_claim_token uuid,
  p_provider_status text,
  p_delay_seconds integer default 15
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_status text := lower(btrim(coalesce(p_provider_status, '')));
  v_delay integer := least(greatest(coalesce(p_delay_seconds, 15), 5), 300);
begin
  if v_status = '' then
    raise exception 'Provider status is required';
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state <> 'interaction_pending' or v_job.interaction_id is null then
    raise exception 'AI provider job is not awaiting the existing Interaction';
  end if;

  update private.ai_provider_jobs
  set provider_status = v_status,
      poll_count = poll_count + 1,
      last_polled_at = now(),
      next_action_at = now() + make_interval(secs => v_delay),
      claim_token = null,
      claimed_at = null,
      last_error = null,
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'interaction_id', v_job.interaction_id,
    'state', 'interaction_pending',
    'provider_status', v_status,
    'next_action_at',
      (select next_action_at
       from private.ai_provider_jobs
       where attempt_id = v_job.attempt_id)
  );
end;
$$;

revoke execute on function public.svc_ai_provider_schedule_poll(uuid,text,integer)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_schedule_poll(uuid,text,integer)
  to service_role;

create or replace function public.svc_ai_provider_mark_interaction_uncertain(
  p_claim_token uuid,
  p_error text default 'provider_interaction_creation_uncertain'
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_error text := left(btrim(coalesce(p_error, '')), 1000);
begin
  if v_error = '' then
    v_error := 'provider_interaction_creation_uncertain';
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state <> 'interaction_creating' or v_job.interaction_id is not null then
    raise exception 'AI provider job is not in uncertain Interaction creation state';
  end if;

  update private.ai_provider_jobs
  set interaction_creation_uncertain_at = now(),
      last_error = v_error,
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'state', 'interaction_creating',
    'uncertain', true
  );
end;
$$;

revoke execute on function public.svc_ai_provider_mark_interaction_uncertain(uuid,text)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_mark_interaction_uncertain(uuid,text)
  to service_role;

create or replace function public.svc_ai_provider_mark_cleanup_pending(
  p_claim_token uuid,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_error text := case
    when p_error is null then null
    else left(btrim(p_error), 1000)
  end;
begin
  if v_error = '' then
    v_error := null;
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state = 'cleaned' then
    raise exception 'AI provider job is already cleaned';
  end if;

  update private.ai_provider_jobs
  set state = 'cleanup_pending',
      next_action_at = now(),
      claim_token = null,
      claimed_at = null,
      last_error = coalesce(v_error, last_error),
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', true,
    'attempt_id', v_job.attempt_id,
    'state', 'cleanup_pending'
  );
end;
$$;

revoke execute on function public.svc_ai_provider_mark_cleanup_pending(uuid,text)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_mark_cleanup_pending(uuid,text)
  to service_role;

create or replace function public.svc_ai_provider_cleanup_result(
  p_claim_token uuid,
  p_provider_file_deleted boolean,
  p_interaction_deleted boolean,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_error text := case
    when p_error is null then null
    else left(btrim(p_error), 1000)
  end;
  v_file_done boolean;
  v_interaction_done boolean;
  v_attempts integer;
  v_delay interval;
begin
  if v_error = '' then
    v_error := null;
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state <> 'cleanup_pending' then
    raise exception 'AI provider job is not pending cleanup';
  end if;

  v_file_done :=
    v_job.provider_file_name is null
    or v_job.provider_file_deleted_at is not null
    or coalesce(p_provider_file_deleted, false);

  v_interaction_done :=
    v_job.interaction_id is null
    or v_job.interaction_deleted_at is not null
    or coalesce(p_interaction_deleted, false);

  if v_file_done and v_interaction_done then
    update private.ai_provider_jobs
    set state = 'cleaned',
        provider_file_deleted_at = case
          when provider_file_name is null then provider_file_deleted_at
          else coalesce(provider_file_deleted_at, now())
        end,
        interaction_deleted_at = case
          when interaction_id is null then interaction_deleted_at
          else coalesce(interaction_deleted_at, now())
        end,
        cleaned_at = now(),
        claim_token = null,
        claimed_at = null,
        last_error = null,
        updated_at = now()
    where attempt_id = v_job.attempt_id;

    return jsonb_build_object(
      'ok', true,
      'attempt_id', v_job.attempt_id,
      'state', 'cleaned'
    );
  end if;

  v_attempts := v_job.cleanup_attempt_count + 1;
  v_delay := case
    when v_attempts <= 1 then interval '1 minute'
    when v_attempts = 2 then interval '5 minutes'
    when v_attempts = 3 then interval '15 minutes'
    else interval '1 hour'
  end;

  update private.ai_provider_jobs
  set provider_file_deleted_at = case
        when provider_file_name is not null
             and coalesce(p_provider_file_deleted, false)
          then coalesce(provider_file_deleted_at, now())
        else provider_file_deleted_at
      end,
      interaction_deleted_at = case
        when interaction_id is not null
             and coalesce(p_interaction_deleted, false)
          then coalesce(interaction_deleted_at, now())
        else interaction_deleted_at
      end,
      cleanup_attempt_count = v_attempts,
      next_action_at = now() + v_delay,
      claim_token = null,
      claimed_at = null,
      last_error = coalesce(v_error, 'provider_cleanup_incomplete'),
      updated_at = now()
  where attempt_id = v_job.attempt_id;

  return jsonb_build_object(
    'ok', false,
    'attempt_id', v_job.attempt_id,
    'state', 'cleanup_pending',
    'cleanup_attempt_count', v_attempts,
    'next_action_at',
      (select next_action_at
       from private.ai_provider_jobs
       where attempt_id = v_job.attempt_id)
  );
end;
$$;

revoke execute on function public.svc_ai_provider_cleanup_result(uuid,boolean,boolean,text)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_cleanup_result(uuid,boolean,boolean,text)
  to service_role;

-- No client role may directly inspect provider orchestration state through SQL.
revoke usage on schema private from public, anon, authenticated;
