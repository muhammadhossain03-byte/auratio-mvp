-- Auratio Step VI-F verification. Intended for a migrated disposable/local database.
-- All fixture rows are rolled back.

do $$
begin
  if has_function_privilege('authenticated','public.svc_claim_video_deletion_jobs(integer)','EXECUTE') then
    raise exception 'Authenticated role can execute deletion claim RPC';
  end if;
  if has_function_privilege('authenticated','public.svc_complete_video_deletion(uuid,boolean)','EXECUTE') then
    raise exception 'Authenticated role can execute deletion completion RPC';
  end if;
  if has_function_privilege('authenticated','public.svc_fail_video_deletion(uuid,text)','EXECUTE') then
    raise exception 'Authenticated role can execute deletion failure RPC';
  end if;
  if not has_function_privilege('service_role','public.svc_claim_video_deletion_jobs(integer)','EXECUTE') then
    raise exception 'Service role cannot execute deletion claim RPC';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000601','vi-f-user@example.invalid'),
('00000000-0000-4000-8000-000000000602','vi-f-admin@example.invalid');

update public.profiles set role='admin'
where user_id='00000000-0000-4000-8000-000000000602';

insert into storage.objects(bucket_id,name,owner) values
('evaluation-videos','00000000-0000-4000-8000-000000000601/video-one.mp4','00000000-0000-4000-8000-000000000601'),
('evaluation-videos','00000000-0000-4000-8000-000000000601/video-two.mp4','00000000-0000-4000-8000-000000000601'),
('evaluation-reports','00000000-0000-4000-8000-000000000601/keep/report.docx','00000000-0000-4000-8000-000000000601');

do $$
declare
  v jsonb;
  v_request1 uuid;
  v_request2 uuid;
  v_submission1 uuid;
  v_submission2 uuid;
  v_claims jsonb;
  v_claim uuid;
  v_second jsonb;
begin
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000601',
    'informative',
    'ai',
    '00000000-0000-4000-8000-000000000601/video-one.mp4',
    300::numeric,
    1000::bigint,
    'video/mp4'
  );
  v_request1 := (v->>'request_id')::uuid;
  select submission_id into v_submission1 from public.evaluation_requests where id=v_request1;
  update public.submission_videos
  set object_path='00000000-0000-4000-8000-000000000601/already-missing-one.mp4'
  where submission_id=v_submission1;

  perform public.svc_ai_admin_cancel(
    '00000000-0000-4000-8000-000000000602',
    v_request1,
    'VI-F deletion verification'
  );

  if (select status from public.video_deletion_jobs where submission_id=v_submission1) <> 'pending' then
    raise exception 'Terminal request did not queue pending deletion';
  end if;
  if (select lifecycle_status from public.submission_videos where submission_id=v_submission1) <> 'deletion_pending' then
    raise exception 'Terminal request did not mark video deletion_pending';
  end if;

  v_claims := public.svc_claim_video_deletion_jobs(10);
  if jsonb_array_length(v_claims) <> 1 then
    raise exception 'Expected exactly one first deletion claim';
  end if;
  v_claim := (v_claims->0->>'claim_token')::uuid;

  v_second := public.svc_claim_video_deletion_jobs(10);
  if jsonb_array_length(v_second) <> 0 then
    raise exception 'Freshly claimed deletion job was claimed concurrently';
  end if;

  perform public.svc_complete_video_deletion(v_claim,true);

  if (select status from public.video_deletion_jobs where submission_id=v_submission1) <> 'succeeded' then
    raise exception 'Deletion job did not reach succeeded';
  end if;
  if (select lifecycle_status from public.submission_videos where submission_id=v_submission1) <> 'deleted' then
    raise exception 'Video metadata did not reach deleted';
  end if;
  if (select deleted_at from public.submission_videos where submission_id=v_submission1) is null then
    raise exception 'Deleted video metadata lacks deleted_at';
  end if;
  if not exists(
    select 1 from storage.objects
    where bucket_id='evaluation-reports'
      and name='00000000-0000-4000-8000-000000000601/keep/report.docx'
  ) then
    raise exception 'Video deletion path removed report object';
  end if;
  if not exists(
    select 1 from public.audit_log
    where request_id=v_request1 and action='video.deleted'
  ) then
    raise exception 'Successful deletion audit event missing';
  end if;

  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000601',
    'informative',
    'ai',
    '00000000-0000-4000-8000-000000000601/video-two.mp4',
    300::numeric,
    1000::bigint,
    'video/mp4'
  );
  v_request2 := (v->>'request_id')::uuid;
  select submission_id into v_submission2 from public.evaluation_requests where id=v_request2;

  perform public.svc_ai_admin_cancel(
    '00000000-0000-4000-8000-000000000602',
    v_request2,
    'VI-F retry verification'
  );

  v_claims := public.svc_claim_video_deletion_jobs(10);
  if jsonb_array_length(v_claims) <> 1 then
    raise exception 'Expected retry fixture deletion claim';
  end if;
  v_claim := (v_claims->0->>'claim_token')::uuid;

  perform public.svc_fail_video_deletion(v_claim,'simulated storage outage');

  if (select status from public.video_deletion_jobs where submission_id=v_submission2) <> 'retry' then
    raise exception 'Failed deletion did not enter retry';
  end if;
  if (select attempt_count from public.video_deletion_jobs where submission_id=v_submission2) <> 1 then
    raise exception 'Retry attempt count incorrect after first failure';
  end if;
  if (select next_attempt_at from public.video_deletion_jobs where submission_id=v_submission2) <= now() then
    raise exception 'Retry was not scheduled into the future';
  end if;
  if (select lifecycle_status from public.submission_videos where submission_id=v_submission2) <> 'deletion_failed' then
    raise exception 'Failed video lifecycle not marked deletion_failed';
  end if;
  if not exists(
    select 1 from public.audit_log
    where request_id=v_request2 and action='video.deletion_failed'
  ) then
    raise exception 'Deletion failure audit event missing';
  end if;

  update public.video_deletion_jobs
  set next_attempt_at=now()-interval '1 second'
  where submission_id=v_submission2;

  v_claims := public.svc_claim_video_deletion_jobs(10);
  if jsonb_array_length(v_claims) <> 1 then
    raise exception 'Due retry was not reclaimed';
  end if;
  v_claim := (v_claims->0->>'claim_token')::uuid;

  if (select attempt_count from public.video_deletion_jobs where submission_id=v_submission2) <> 2 then
    raise exception 'Retry claim did not increment attempt count';
  end if;
  if (select lifecycle_status from public.submission_videos where submission_id=v_submission2) <> 'deletion_pending' then
    raise exception 'Retry claim did not return lifecycle to deletion_pending';
  end if;

  update public.submission_videos
  set object_path='00000000-0000-4000-8000-000000000601/already-missing-two.mp4'
  where submission_id=v_submission2;

  perform public.svc_complete_video_deletion(v_claim,true);

  if (select status from public.video_deletion_jobs where submission_id=v_submission2) <> 'succeeded' then
    raise exception 'Retry did not ultimately succeed';
  end if;
  if (select attempt_count from public.video_deletion_jobs where submission_id=v_submission2) <> 2 then
    raise exception 'Successful retry changed attempt count unexpectedly';
  end if;
end $$;

rollback;

select
  case
    when (select count(*) from auth.users)=0
     and (select count(*) from public.submissions)=0
     and (select count(*) from public.evaluation_requests)=0
     and (select count(*) from public.video_deletion_jobs)=0
     and (select count(*) from public.audit_log)=0
    then 'VI-F verification PASS'
    else 'VI-F rollback FAILED'
  end as result;
