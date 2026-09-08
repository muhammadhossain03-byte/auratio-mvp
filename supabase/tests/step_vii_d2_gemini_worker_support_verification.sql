-- Auratio Step VII-D2 Gemini-worker support verification.
-- Runs on the separate test project. All fixture rows roll back.

do $$
begin
  if has_function_privilege(
    'authenticated',
    'public.svc_ai_provider_schedule_file_poll(uuid,text,integer)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated role can directly schedule provider file polling';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.svc_ai_provider_schedule_file_poll(uuid,text,integer)',
    'EXECUTE'
  ) then
    raise exception 'Service role cannot schedule provider file polling';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000821','vii-d2-owner@example.invalid');

insert into storage.objects(bucket_id,name,owner) values
(
  'evaluation-videos',
  '00000000-0000-4000-8000-000000000821/provider-d2.mp4',
  '00000000-0000-4000-8000-000000000821'
);

do $$
declare
  v_create jsonb;
  v_request_id uuid;
  v_claims jsonb;
  v_claim jsonb;
  v_claim_token uuid;
  v_context jsonb;
begin
  v_create := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000821',
    'informative',
    'ai',
    '00000000-0000-4000-8000-000000000821/provider-d2.mp4',
    300::numeric,
    4321::bigint,
    'video/mp4'
  );
  v_request_id := (v_create->>'request_id')::uuid;

  v_claims := public.svc_ai_provider_claim_jobs(1);
  if jsonb_array_length(v_claims) <> 1 then
    raise exception 'Expected one D2 provider claim';
  end if;

  v_claim := v_claims->0;
  v_claim_token := (v_claim->>'claim_token')::uuid;

  perform public.svc_ai_start_attempt(v_request_id, 'gemini-3.8-flash');
  perform public.svc_ai_provider_mark_initializing(v_claim_token);

  v_context := public.svc_ai_provider_runtime_context(v_request_id);

  if v_context->>'video_mime_type' <> 'video/mp4' then
    raise exception 'Runtime context did not expose canonical video MIME type';
  end if;
  if (v_context->>'video_size_bytes')::bigint <> 4321 then
    raise exception 'Runtime context did not expose stored video byte size';
  end if;
  if jsonb_array_length(v_context->'criteria') <> 16 then
    raise exception 'Runtime context lost canonical 16-criterion rubric';
  end if;

  perform public.svc_ai_provider_record_file(
    v_claim_token,
    'files/auratio-vii-d2',
    'https://generativelanguage.googleapis.com/v1beta/files/auratio-vii-d2'
  );

  perform public.svc_ai_provider_schedule_file_poll(
    v_claim_token,
    'PROCESSING',
    5
  );

  if not exists (
    select 1
    from private.ai_provider_jobs j
    where j.request_id = v_request_id
      and j.state = 'file_ready'
      and j.provider_status = 'PROCESSING'
      and j.poll_count = 1
      and j.claim_token is null
      and j.interaction_id is null
      and j.next_action_at > now()
  ) then
    raise exception 'Provider file polling was not durably scheduled';
  end if;
end $$;

rollback;

select 'VII-D2 Gemini worker support verification PASS' as result;
