-- Auratio Step VI-B verification. Intended for a migrated disposable/local database.
-- All test rows are rolled back.

do $$
begin
  if has_function_privilege('authenticated','public.svc_create_evaluation_request(uuid,text,public.evaluation_mode,text,numeric,bigint,text)','EXECUTE') then
    raise exception 'Authenticated role can execute privileged request RPC';
  end if;
  if not has_function_privilege('service_role','public.svc_create_evaluation_request(uuid,text,public.evaluation_mode,text,numeric,bigint,text)','EXECUTE') then
    raise exception 'Service role cannot execute request RPC';
  end if;
  if has_function_privilege('authenticated','public.svc_human_admin_assign(uuid,uuid,uuid)','EXECUTE') then
    raise exception 'Authenticated role can execute Human admin RPC';
  end if;
  if has_function_privilege('authenticated','public.svc_human_volunteer_submit(uuid,uuid)','EXECUTE') then
    raise exception 'Authenticated role can execute Human volunteer RPC';
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='submissions' and cmd='INSERT') then
    raise exception 'Direct submission INSERT policy still exists';
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='submission_videos' and cmd='INSERT') then
    raise exception 'Direct video metadata INSERT policy still exists';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000201','vi-b-user@example.invalid'),
('00000000-0000-4000-8000-000000000202','vi-b-volunteer-1@example.invalid'),
('00000000-0000-4000-8000-000000000203','vi-b-volunteer-2@example.invalid'),
('00000000-0000-4000-8000-000000000204','vi-b-admin@example.invalid');

update public.profiles set role='volunteer'
where user_id in (
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000203'
);
update public.profiles set role='admin'
where user_id='00000000-0000-4000-8000-000000000204';

insert into storage.objects(bucket_id,name,owner) values
('evaluation-videos','00000000-0000-4000-8000-000000000201/pre-reassign.mp4','00000000-0000-4000-8000-000000000201'),
('evaluation-videos','00000000-0000-4000-8000-000000000201/score-80.mp4','00000000-0000-4000-8000-000000000201'),
('evaluation-videos','00000000-0000-4000-8000-000000000201/score-70.mp4','00000000-0000-4000-8000-000000000201'),
('evaluation-videos','00000000-0000-4000-8000-000000000201/score-40.mp4','00000000-0000-4000-8000-000000000201'),
('evaluation-videos','00000000-0000-4000-8000-000000000201/post-reassign.mp4','00000000-0000-4000-8000-000000000201');

do $$
declare
  v jsonb;
  v_submit jsonb;
  v_open jsonb;
  v_request uuid;
  v_version uuid;
begin
  -- Pre-submission reassignment must clear partial draft content and transfer active ownership.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000201','informative','human',
    '00000000-0000-4000-8000-000000000201/pre-reassign.mp4',300::numeric,1000::bigint,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;

  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000202'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  perform public.svc_human_volunteer_save_criterion(
    '00000000-0000-4000-8000-000000000202',v_request,'ud-pacing','Competent',
    4::smallint,1::numeric,'Evidence','Strength','Weakness','Improvement'
  );
  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000202',v_request,'Partial summary'
  );

  v := public.svc_human_admin_reassign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000203','Coverage reassignment'
  );
  v_version := (v->>'evaluation_version_id')::uuid;

  if (select count(*) from public.evaluation_criterion_results where evaluation_version_id=v_version) <> 0 then
    raise exception 'Pre-submission reassignment retained prior Volunteer draft criteria';
  end if;
  if (select overall_summary from public.evaluation_versions where id=v_version) is not null then
    raise exception 'Pre-submission reassignment retained prior Volunteer summary';
  end if;
  if (select evaluator_user_id from public.evaluation_versions where id=v_version)
     <> '00000000-0000-4000-8000-000000000203'::uuid then
    raise exception 'Pre-submission reassignment did not transfer evaluator ownership';
  end if;

  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000203',v_request,'decline','Cannot take assignment'
  );
  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000202'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'accept',null
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'return','Video is not assessable'
  );
  perform public.svc_human_admin_cancel(
    '00000000-0000-4000-8000-000000000204',v_request,'Request terminated after return'
  );
  if (select status from public.evaluation_requests where id=v_request) <> 'cancelled' then
    raise exception 'Pre-submission cancellation failed';
  end if;

  -- First Approved Human evaluation in a user+track scope always requires moderation.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000201','informative','human',
    '00000000-0000-4000-8000-000000000201/score-80.mp4',300::numeric,1000::bigint,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000202'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  perform public.svc_human_volunteer_save_criterion(
    '00000000-0000-4000-8000-000000000202',v_request,c.id,'Competent',
    (case when c.max_points=5 then 4 else 8 end)::smallint,1::numeric,
    'Evidence','Strength','Weakness','Improvement'
  )
  from public.criteria c
  where c.category in ('universal_delivery','structural_flow') or c.track_id='informative';
  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000202',v_request,'Score 80 summary'
  );
  v_submit := public.svc_human_volunteer_submit(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  if v_submit->>'status' <> 'pending_moderation'
     or (v_submit->>'final_score')::int <> 80
     or v_submit->>'moderation_reason' <> 'first_human_in_track' then
    raise exception 'First-in-track moderation rule failed: %',v_submit;
  end if;
  perform public.svc_human_admin_approve(
    '00000000-0000-4000-8000-000000000204',v_request
  );

  -- Most recent Approved Human baseline: 80 -> 70 is within 15, so auto-approve.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000201','informative','human',
    '00000000-0000-4000-8000-000000000201/score-70.mp4',300::numeric,1000::bigint,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000202'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  perform public.svc_human_volunteer_save_criterion(
    '00000000-0000-4000-8000-000000000202',v_request,c.id,'Competent',
    (case when c.max_points=5 then 4 when c.position in (1,2) then 5 else 6 end)::smallint,
    1::numeric,'Evidence','Strength','Weakness','Improvement'
  )
  from public.criteria c
  where c.category in ('universal_delivery','structural_flow') or c.track_id='informative';
  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000202',v_request,'Score 70 summary'
  );
  v_submit := public.svc_human_volunteer_submit(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  if v_submit->>'status' <> 'approved'
     or (v_submit->>'final_score')::int <> 70
     or (v_submit->>'baseline_score')::int <> 80 then
    raise exception 'Within-15 auto-approval failed: %',v_submit;
  end if;

  -- Latest prior baseline is now 70; score 40 differs by 30 and requires moderation.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000201','informative','human',
    '00000000-0000-4000-8000-000000000201/score-40.mp4',300::numeric,1000::bigint,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000202'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  perform public.svc_human_volunteer_save_criterion(
    '00000000-0000-4000-8000-000000000202',v_request,c.id,'Low',
    (case when c.max_points=5 then 2 else 4 end)::smallint,1::numeric,
    'Evidence','Strength','Weakness','Improvement'
  )
  from public.criteria c
  where c.category in ('universal_delivery','structural_flow') or c.track_id='informative';
  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000202',v_request,'Score 40 summary'
  );
  v_submit := public.svc_human_volunteer_submit(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  if v_submit->>'status' <> 'pending_moderation'
     or (v_submit->>'baseline_score')::int <> 70
     or v_submit->>'moderation_reason' <> 'score_anomaly_gt_15' then
    raise exception 'Latest-baseline anomaly rule failed: %',v_submit;
  end if;

  v_open := public.svc_human_admin_reopen(
    '00000000-0000-4000-8000-000000000204',v_request,'Formal re-review requested'
  );
  if v_open->>'status' <> 'reopened' or (v_open->>'version_number')::int <> 2 then
    raise exception 'Formal re-review did not create v2: %',v_open;
  end if;
  perform public.svc_human_admin_reject(
    '00000000-0000-4000-8000-000000000204',v_request,'Re-review terminated'
  );

  -- Direct post-submission reassignment creates a new version and may be rejected during assigned re-review.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000201','informative','human',
    '00000000-0000-4000-8000-000000000201/post-reassign.mp4',300::numeric,1000::bigint,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000202'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000202',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000202',v_request
  );
  perform public.svc_human_volunteer_save_criterion(
    '00000000-0000-4000-8000-000000000202',v_request,c.id,'Low',
    (case when c.max_points=5 then 2 else 4 end)::smallint,1::numeric,
    'Evidence','Strength','Weakness','Improvement'
  )
  from public.criteria c
  where c.category in ('universal_delivery','structural_flow') or c.track_id='informative';
  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000202',v_request,'Post-submit reassign summary'
  );
  perform public.svc_human_volunteer_submit(
    '00000000-0000-4000-8000-000000000202',v_request
  );

  v := public.svc_human_admin_reassign(
    '00000000-0000-4000-8000-000000000204',v_request,
    '00000000-0000-4000-8000-000000000203','Second evaluator requested'
  );
  if (select version_number from public.evaluation_versions where id=(v->>'evaluation_version_id')::uuid) <> 2 then
    raise exception 'Post-submission reassignment did not create v2';
  end if;

  begin
    perform public.svc_human_admin_cancel(
      '00000000-0000-4000-8000-000000000204',v_request,'Incorrect termination path'
    );
    raise exception 'Post-submission re-review was incorrectly cancellable';
  exception when others then
    if sqlerrm='Post-submission re-review was incorrectly cancellable' then raise; end if;
  end;

  perform public.svc_human_admin_reject(
    '00000000-0000-4000-8000-000000000204',v_request,'Re-review rejected'
  );
  if (select status from public.evaluation_requests where id=v_request) <> 'rejected' then
    raise exception 'Re-review rejection failed';
  end if;

  if not exists(
    select 1 from public.audit_log
    where action='human.moderation_decision'
      and metadata->>'baseline_score'='70'
      and metadata->>'reason'='score_anomaly_gt_15'
  ) then
    raise exception 'Moderation audit evidence missing';
  end if;
end $$;

rollback;

select 'PASS' as step_vi_b_human_lifecycle_verification;
