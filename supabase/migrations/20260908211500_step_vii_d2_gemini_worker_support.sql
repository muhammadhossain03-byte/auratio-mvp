-- Auratio Step VII-D2 — Gemini worker support for file-processing polling
-- and complete private runtime media metadata.

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
    'video_mime_type', v_video.mime_type,
    'video_size_bytes', v_video.size_bytes,
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

create or replace function public.svc_ai_provider_schedule_file_poll(
  p_claim_token uuid,
  p_provider_status text,
  p_delay_seconds integer default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job private.ai_provider_jobs%rowtype;
  v_status text := upper(btrim(coalesce(p_provider_status, '')));
  v_delay integer := least(greatest(coalesce(p_delay_seconds, 5), 3), 120);
begin
  if v_status = '' then
    raise exception 'Provider file status is required';
  end if;

  select * into v_job
  from private.ai_provider_jobs
  where claim_token = p_claim_token
  for update;

  if v_job.attempt_id is null then
    raise exception 'Active AI provider claim not found';
  end if;
  if v_job.state <> 'file_ready' then
    raise exception 'AI provider job is not awaiting provider file readiness';
  end if;
  if v_job.provider_file_name is null or v_job.provider_file_uri is null then
    raise exception 'AI provider file identity is missing';
  end if;
  if v_job.interaction_id is not null then
    raise exception 'Provider file polling is forbidden after Interaction creation';
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
    'state', 'file_ready',
    'provider_status', v_status,
    'next_action_at',
      (select next_action_at
       from private.ai_provider_jobs
       where attempt_id = v_job.attempt_id)
  );
end;
$$;

revoke execute on function public.svc_ai_provider_schedule_file_poll(uuid,text,integer)
  from public, anon, authenticated;
grant execute on function public.svc_ai_provider_schedule_file_poll(uuid,text,integer)
  to service_role;
