-- Auratio Step VI-E verification. Intended for a migrated disposable/local database.
-- All fixture rows are rolled back.

do $$
begin
  if has_function_privilege('authenticated','public.svc_prepare_report_generation(uuid,uuid)','EXECUTE') then
    raise exception 'Authenticated role can execute report preparation RPC';
  end if;
  if has_function_privilege('authenticated','public.svc_complete_report_generation(uuid,bigint)','EXECUTE') then
    raise exception 'Authenticated role can execute report completion RPC';
  end if;
  if has_function_privilege('authenticated','public.svc_fail_report_generation(uuid,text)','EXECUTE') then
    raise exception 'Authenticated role can execute report failure RPC';
  end if;
  if not has_function_privilege('service_role','public.svc_prepare_report_generation(uuid,uuid)','EXECUTE') then
    raise exception 'Service role cannot execute report preparation RPC';
  end if;
  if has_table_privilege('authenticated','private.report_generation_claims','SELECT') then
    raise exception 'Authenticated role can read private report-generation claims';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000501','vi-e-user@example.invalid'),
('00000000-0000-4000-8000-000000000502','vi-e-volunteer@example.invalid'),
('00000000-0000-4000-8000-000000000503','vi-e-admin@example.invalid'),
('00000000-0000-4000-8000-000000000504','vi-e-other@example.invalid');

update public.profiles set display_name='VI-E Speaker'
where user_id='00000000-0000-4000-8000-000000000501';
update public.profiles set role='volunteer',display_name='VI-E Volunteer'
where user_id='00000000-0000-4000-8000-000000000502';
update public.profiles set role='admin',display_name='VI-E Admin'
where user_id='00000000-0000-4000-8000-000000000503';

insert into storage.objects(bucket_id,name,owner,metadata) values
('evaluation-videos','00000000-0000-4000-8000-000000000501/report-test.mp4','00000000-0000-4000-8000-000000000501','{"size":1000}'::jsonb),
('evaluation-videos','00000000-0000-4000-8000-000000000501/report-retry.mp4','00000000-0000-4000-8000-000000000501','{"size":1000}'::jsonb);

do $$
declare
  v jsonb;
  v_request uuid;
  v_version uuid;
  v_prepare jsonb;
  v_ready jsonb;
  v_claim uuid;
  v_path text;
  v_generated timestamptz;
  r record;
begin
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000501','informative','human',
    '00000000-0000-4000-8000-000000000501/report-test.mp4',300,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  v_version := (v->>'evaluation_version_id')::uuid;

  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000503',v_request,
    '00000000-0000-4000-8000-000000000502'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000502',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000502',v_request
  );

  for r in
    select c.id,c.max_points
    from public.criteria c
    where c.category in ('universal_delivery','structural_flow')
       or (c.category='track_specialisation' and c.track_id='informative')
    order by c.category,c.position
  loop
    perform public.svc_human_volunteer_save_criterion(
      '00000000-0000-4000-8000-000000000502',v_request,r.id,
      'Excellent',r.max_points::smallint,1,
      'Observed evidence','Clear strength','Specific weakness','Actionable improvement'
    );
  end loop;

  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000502',v_request,
    'A complete approved evaluation summary.'
  );
  v := public.svc_human_volunteer_submit(
    '00000000-0000-4000-8000-000000000502',v_request
  );
  if v->>'status'<>'pending_moderation' then
    raise exception 'First Human result did not enter moderation';
  end if;
  perform public.svc_human_admin_approve(
    '00000000-0000-4000-8000-000000000503',v_request
  );

  if not exists(
    select 1 from private.report_generation_claims
    where request_id=v_request and evaluation_version_id=v_version and status='queued'
  ) then raise exception 'Approved result did not queue report generation'; end if;

  begin
    perform public.svc_prepare_report_generation(
      '00000000-0000-4000-8000-000000000504',v_request
    );
    raise exception 'Cross-account report generation was allowed';
  exception when others then
    if sqlerrm='Cross-account report generation was allowed' then raise; end if;
  end;

  v_prepare := public.svc_prepare_report_generation(
    '00000000-0000-4000-8000-000000000501',v_request
  );
  if v_prepare->>'state'<>'generate' then raise exception 'Expected generate state'; end if;
  if jsonb_array_length(v_prepare#>'{payload,criteria}')<>16 then
    raise exception 'Official report payload must contain exactly 16 criteria';
  end if;
  if v_prepare#>>'{payload,speaker_display_name}'<>'VI-E Speaker' then
    raise exception 'Speaker display name missing from report payload';
  end if;
  if v_prepare#>>'{payload,mode_label}'<>'Human Evaluation' then
    raise exception 'Human mode label incorrect';
  end if;
  if (v_prepare#>>'{payload,universal_score}')::int<>40
     or (v_prepare#>>'{payload,structural_score}')::int<>20
     or (v_prepare#>>'{payload,track_score}')::int<>40
     or (v_prepare#>>'{payload,final_score}')::int<>100 then
    raise exception 'Report score payload is not authoritative';
  end if;
  if (v_prepare->>'filename') !~ '^Auratio_informative_Human_Submission-[0-9a-f-]+_v1[.]docx$' then
    raise exception 'Report filename violates the locked contract';
  end if;
  if (v_prepare#>'{payload}') ?| array[
    'email','evaluator_user_id','version_number','model','prompt_version',
    'rubric_version','schema_version','leaderboard','mastery','moderation_reason'
  ] then raise exception 'Forbidden internal field leaked into report payload'; end if;

  v_claim := (v_prepare->>'claim_token')::uuid;
  v_path := v_prepare->>'object_path';
  v_generated := (v_prepare#>>'{payload,report_generation_date}')::timestamptz;

  insert into storage.objects(bucket_id,name,owner,metadata)
  values('evaluation-reports',v_path,'00000000-0000-4000-8000-000000000501','{"size":12345}'::jsonb);

  v_ready := public.svc_complete_report_generation(v_claim,null);
  if v_ready->>'state'<>'ready' then raise exception 'Report completion failed'; end if;
  if (v_ready#>>'{report,size_bytes}')::bigint<>12345 then
    raise exception 'Report size was not persisted from Storage metadata';
  end if;
  if (v_ready#>>'{report,generated_at}')::timestamptz<>v_generated then
    raise exception 'Reserved report generation timestamp changed';
  end if;
  if (select count(*) from public.reports where evaluation_version_id=v_version)<>1 then
    raise exception 'Exactly one immutable report row is required';
  end if;

  v_ready := public.svc_prepare_report_generation(
    '00000000-0000-4000-8000-000000000501',v_request
  );
  if v_ready->>'state'<>'ready' or v_ready#>>'{report,object_path}'<>v_path then
    raise exception 'Repeated report request did not resolve to the same stored file';
  end if;
end $$;

do $$
declare
  v jsonb;
  v_request uuid;
  v_prepare jsonb;
  v_retry jsonb;
  v_claim uuid;
  v_generated timestamptz;
  r record;
begin
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000501','informative','human',
    '00000000-0000-4000-8000-000000000501/report-retry.mp4',300,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  perform public.svc_human_admin_assign(
    '00000000-0000-4000-8000-000000000503',v_request,
    '00000000-0000-4000-8000-000000000502'
  );
  perform public.svc_human_volunteer_respond(
    '00000000-0000-4000-8000-000000000502',v_request,'accept',null
  );
  perform public.svc_human_volunteer_begin(
    '00000000-0000-4000-8000-000000000502',v_request
  );
  for r in
    select c.id,c.max_points from public.criteria c
    where c.category in ('universal_delivery','structural_flow')
       or (c.category='track_specialisation' and c.track_id='informative')
  loop
    perform public.svc_human_volunteer_save_criterion(
      '00000000-0000-4000-8000-000000000502',v_request,r.id,
      'Excellent',r.max_points::smallint,1,'Evidence','Strength','Weakness','Improve'
    );
  end loop;
  perform public.svc_human_volunteer_save_summary(
    '00000000-0000-4000-8000-000000000502',v_request,'Summary'
  );
  perform public.svc_human_volunteer_submit(
    '00000000-0000-4000-8000-000000000502',v_request
  );
  perform public.svc_human_admin_approve(
    '00000000-0000-4000-8000-000000000503',v_request
  );

  v_prepare := public.svc_prepare_report_generation(null,v_request);
  v_claim := (v_prepare->>'claim_token')::uuid;
  v_generated := (v_prepare#>>'{payload,report_generation_date}')::timestamptz;
  perform public.svc_fail_report_generation(v_claim,'synthetic render failure');

  if (select status from private.report_generation_claims where request_id=v_request)<>'failed' then
    raise exception 'Failed renderer did not persist retryable failure state';
  end if;

  v_retry := public.svc_prepare_report_generation(null,v_request);
  if v_retry->>'state'<>'generate' then raise exception 'Failed report is not retryable'; end if;
  if (v_retry#>>'{payload,report_generation_date}')::timestamptz<>v_generated then
    raise exception 'Retry changed the reserved report generation date';
  end if;
  if (v_retry->>'claim_token')::uuid=v_claim then
    raise exception 'Retry reused the stale claim token';
  end if;
end $$;

rollback;
