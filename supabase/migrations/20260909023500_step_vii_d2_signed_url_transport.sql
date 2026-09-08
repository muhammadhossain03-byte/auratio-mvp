-- Step VII-D2: signed HTTPS URL transport for Gemini video input.
--
-- Live test-project verification on 2026-09-09 established that a background
-- Agentic Video Interaction created from a Gemini Files API URI can later fail
-- retrieval with "Unsupported file uri: blobstore:///...". The same video sent
-- through a short-lived external Supabase signed HTTPS URL produced a
-- retrievable Interaction. New jobs therefore skip provider-file persistence.
--
-- The signed URL is ephemeral and is never persisted in ai_provider_jobs.

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
  if v_job.state not in ('initializing','file_ready') then
    raise exception 'AI provider job is not ready for Interaction creation';
  end if;
  if v_job.state = 'file_ready'
     and (v_job.provider_file_name is null or v_job.provider_file_uri is null) then
    raise exception 'Legacy AI provider file identity is missing';
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
