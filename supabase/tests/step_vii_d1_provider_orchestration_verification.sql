-- Auratio Step VII-D1 provider orchestration verification.
-- Intended for the separate development/test project after migration.
-- Test rows roll back.

do $$
begin
  if has_table_privilege(
    'authenticated',
    'private.ai_provider_jobs',
    'SELECT'
  ) then
    raise exception 'Authenticated role can directly read AI provider jobs';
  end if;

  if not has_table_privilege(
    'service_role',
    'private.ai_provider_jobs',
    'SELECT'
  ) then
    raise exception 'Service role cannot read AI provider jobs';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.svc_ai_provider_claim_jobs(integer)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated role can directly claim AI provider work';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.svc_ai_provider_claim_jobs(integer)',
    'EXECUTE'
  ) then
    raise exception 'Service role cannot claim AI provider work';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'ai_attempt_create_provider_job'
      and not tgisinternal
  ) then
    raise exception 'AI attempt -> provider job trigger is missing';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000801','vii-d1-owner@example.invalid');

insert into storage.objects(bucket_id,name,owner) values
(
  'evaluation-videos',
  '00000000-0000-4000-8000-000000000801/provider-d1.mp4',
  '00000000-0000-4000-8000-000000000801'
);

do $$
declare
  v_create jsonb;
  v_request_id uuid;
  v_attempt_id uuid;
  v_claims jsonb;
  v_claim jsonb;
  v_claim_token uuid;
  v_context jsonb;
  v_second_error boolean := false;
begin
  v_create := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000801',
    'informative',
    'ai',
    '00000000-0000-4000-8000-000000000801/provider-d1.mp4',
    300::numeric,
    1000::bigint,
    'video/mp4'
  );

  v_request_id := (v_create->>'request_id')::uuid;

  select a.id into v_attempt_id
  from private.ai_evaluation_attempts a
  where a.request_id = v_request_id;

  if v_attempt_id is null then
    raise exception 'AI attempt was not created';
  end if;

  if not exists (
    select 1
    from private.ai_provider_jobs j
    where j.attempt_id = v_attempt_id
      and j.request_id = v_request_id
      and j.state = 'queued'
      and j.model_identifier = 'gemini-3.8-flash'
      and j.interaction_id is null
  ) then
    raise exception 'AI attempt did not create a queued Gemini provider job';
  end if;

  v_claims := public.svc_ai_provider_claim_jobs(1);

  if jsonb_array_length(v_claims) <> 1 then
    raise exception 'Expected exactly one provider claim';
  end if;

  v_claim := v_claims->0;
  v_claim_token := (v_claim->>'claim_token')::uuid;

  if v_claim->>'state' <> 'queued'
     or v_claim->>'request_mode' <> 'ai'
     or v_claim->>'request_status' <> 'processing'
     or v_claim->>'attempt_status' <> 'created' then
    raise exception 'Provider claim did not expose coherent initial state';
  end if;

  perform public.svc_ai_start_attempt(v_request_id, 'gemini-3.8-flash');
  perform public.svc_ai_provider_mark_initializing(v_claim_token);

  v_context := public.svc_ai_provider_runtime_context(v_request_id);

  if v_context->>'model_identifier' <> 'gemini-3.8-flash'
     or v_context->>'track_slug' <> 'informative'
     or jsonb_array_length(v_context->'criteria') <> 16
     or v_context->>'video_bucket' <> 'evaluation-videos' then
    raise exception 'Provider runtime context is incomplete or incoherent';
  end if;

  perform public.svc_ai_provider_record_file(
    v_claim_token,
    'files/auratio-vii-d1',
    'https://generativelanguage.googleapis.com/v1beta/files/auratio-vii-d1'
  );

  perform public.svc_ai_provider_begin_interaction(v_claim_token);

  if (select state::text
      from private.ai_provider_jobs
      where attempt_id = v_attempt_id) <> 'interaction_creating' then
    raise exception 'Provider job did not enter interaction_creating';
  end if;

  perform public.svc_ai_provider_record_interaction(
    v_claim_token,
    'v1_test_interaction_vii_d1',
    'in_progress'
  );

  if not exists (
    select 1
    from private.ai_provider_jobs j
    where j.attempt_id = v_attempt_id
      and j.state = 'interaction_pending'
      and j.interaction_id = 'v1_test_interaction_vii_d1'
      and j.claim_token is null
  ) then
    raise exception 'Provider Interaction identity was not durably recorded';
  end if;

  begin
    perform public.svc_ai_provider_record_interaction(
      v_claim_token,
      'v1_second_interaction_forbidden',
      'in_progress'
    );
  exception when others then
    v_second_error := true;
  end;

  if not v_second_error then
    raise exception 'A second provider Interaction was accepted';
  end if;

  -- Make the same pending job immediately claimable for the poll transition.
  update private.ai_provider_jobs
  set next_action_at = now()
  where attempt_id = v_attempt_id;

  v_claims := public.svc_ai_provider_claim_jobs(1);
  if jsonb_array_length(v_claims) <> 1 then
    raise exception 'Expected one poll claim';
  end if;

  v_claim := v_claims->0;
  v_claim_token := (v_claim->>'claim_token')::uuid;

  perform public.svc_ai_provider_schedule_poll(
    v_claim_token,
    'in_progress',
    5
  );

  if not exists (
    select 1
    from private.ai_provider_jobs j
    where j.attempt_id = v_attempt_id
      and j.state = 'interaction_pending'
      and j.poll_count = 1
      and j.claim_token is null
  ) then
    raise exception 'Existing Interaction poll was not scheduled idempotently';
  end if;

  -- Convert the provider job to cleanup_pending without creating any new model
  -- Interaction, then prove provider artifact cleanup can reach cleaned.
  update private.ai_provider_jobs
  set next_action_at = now()
  where attempt_id = v_attempt_id;

  v_claims := public.svc_ai_provider_claim_jobs(1);
  v_claim := v_claims->0;
  v_claim_token := (v_claim->>'claim_token')::uuid;

  perform public.svc_ai_provider_mark_cleanup_pending(
    v_claim_token,
    'verification_cleanup'
  );

  v_claims := public.svc_ai_provider_claim_jobs(1);
  v_claim := v_claims->0;
  v_claim_token := (v_claim->>'claim_token')::uuid;

  perform public.svc_ai_provider_cleanup_result(
    v_claim_token,
    true,
    true,
    null
  );

  if not exists (
    select 1
    from private.ai_provider_jobs j
    where j.attempt_id = v_attempt_id
      and j.state = 'cleaned'
      and j.cleaned_at is not null
      and j.provider_file_deleted_at is not null
      and j.interaction_deleted_at is not null
      and j.claim_token is null
  ) then
    raise exception 'Provider cleanup did not reach cleaned state';
  end if;
end $$;

rollback;

select 'VII-D1 provider orchestration verification PASS' as result;
