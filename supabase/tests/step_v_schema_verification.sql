-- Auratio Step V verification. Intended for a migrated disposable/local database.
-- All test rows are rolled back.

-- Static schema/reference checks.
do $$
begin
  if (select count(*) from public.paths) <> 3 then raise exception 'Expected 3 paths'; end if;
  if (select count(*) from public.tracks) <> 13 then raise exception 'Expected 13 tracks'; end if;
  if (select count(*) from public.criteria) <> 64 then raise exception 'Expected 64 criteria'; end if;
  if (select count(*) from public.criterion_anchors) <> 192 then raise exception 'Expected 192 anchors'; end if;
  if (select count(*) from public.criteria where category='universal_delivery') <> 8 then raise exception 'Expected 8 universal criteria'; end if;
  if (select count(*) from public.criteria where category='structural_flow') <> 4 then raise exception 'Expected 4 structural criteria'; end if;
  if exists(select 1 from public.tracks t left join public.criteria c on c.track_id=t.id and c.category='track_specialisation' group by t.id having count(c.id)<>4) then raise exception 'Each track must have 4 specialisation criteria'; end if;
  if (select count(*) from pg_tables where schemaname='public' and rowsecurity) <> 19 then raise exception 'Expected RLS on all 19 Auratio public tables'; end if;
  if not exists(select 1 from storage.buckets where id='evaluation-videos' and public=false) then raise exception 'Private video bucket missing'; end if;
  if not exists(select 1 from storage.buckets where id='evaluation-reports' and public=false) then raise exception 'Private report bucket missing'; end if;
end $$;

begin;
insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000001','user1@test.local'),
('00000000-0000-4000-8000-000000000002','user2@test.local'),
('00000000-0000-4000-8000-000000000003','volunteer@test.local'),
('00000000-0000-4000-8000-000000000004','admin@test.local'),
('00000000-0000-4000-8000-000000000005','muhammad.hossain03@northsouth.edu');
update public.profiles set role='volunteer' where user_id='00000000-0000-4000-8000-000000000003';
update public.profiles set role='admin' where user_id='00000000-0000-4000-8000-000000000004';

do $$ begin
  if not exists(select 1 from public.profiles where user_id='00000000-0000-4000-8000-000000000005' and role='super_admin' and is_root_super_admin and account_status='active') then raise exception 'Root bootstrap failed'; end if;
  begin update public.profiles set role='admin' where user_id='00000000-0000-4000-8000-000000000005'; raise exception 'Root demotion was not blocked';
  exception when others then if sqlerrm='Root demotion was not blocked' then raise; end if; end;
end $$;

insert into public.submissions(id,user_id,track_id) values('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','informative');
insert into public.submission_videos(submission_id,object_path,duration_seconds) values('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001/video.mp4',300);
do $$ begin
  begin update public.submission_videos set duration_seconds=100 where submission_id='10000000-0000-4000-8000-000000000001'; raise exception 'Duration gate was not enforced';
  exception when others then if sqlerrm='Duration gate was not enforced' then raise; end if; end;
end $$;

insert into public.evaluation_requests(id,submission_id,user_id,mode,status) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','human','unassigned');
insert into public.evaluation_versions(id,request_id,version_number,status,overall_summary) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',1,'draft','Solid test summary');
insert into public.human_assignments(id,request_id,evaluation_version_id,volunteer_user_id,status,assigned_by) values('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000003','assigned','00000000-0000-4000-8000-000000000004');
update public.evaluation_requests set status='assigned' where id='20000000-0000-4000-8000-000000000001';
update public.human_assignments set status='accepted',responded_at=now() where id='40000000-0000-4000-8000-000000000001';
update public.evaluation_requests set status='accepted' where id='20000000-0000-4000-8000-000000000001';
update public.human_assignments set status='in_evaluation' where id='40000000-0000-4000-8000-000000000001';
update public.evaluation_requests set status='in_evaluation' where id='20000000-0000-4000-8000-000000000001';

do $$ begin
  begin insert into public.evaluation_criterion_results(evaluation_version_id,criterion_id,anchor,score,primary_timestamp_seconds,evidence,strength,weakness,actionable_improvement) values('30000000-0000-4000-8000-000000000001','ud-pacing','Low',3,1,'e','s','w','a'); raise exception 'Anchor-score band was not enforced';
  exception when others then if sqlerrm='Anchor-score band was not enforced' then raise; end if; end;
  begin insert into public.evaluation_criterion_results(evaluation_version_id,criterion_id,anchor,score,primary_timestamp_seconds,evidence,strength,weakness,actionable_improvement) values('30000000-0000-4000-8000-000000000001','bp-problem','Low',0,1,'e','s','w','a'); raise exception 'Track criterion scope was not enforced';
  exception when others then if sqlerrm='Track criterion scope was not enforced' then raise; end if; end;
end $$;

insert into public.evaluation_criterion_results(evaluation_version_id,criterion_id,anchor,score,primary_timestamp_seconds,evidence,strength,weakness,actionable_improvement)
select '30000000-0000-4000-8000-000000000001',c.id,'Low',0,1,'Evidence','Strength','Weakness','Improvement' from public.criteria c where c.category in ('universal_delivery','structural_flow') or c.track_id='informative';
update public.evaluation_versions set status='submitted' where id='30000000-0000-4000-8000-000000000001';
update public.human_assignments set status='completed',ended_at=now() where id='40000000-0000-4000-8000-000000000001';
update public.evaluation_requests set status='submitted' where id='20000000-0000-4000-8000-000000000001';
update public.evaluation_versions set status='pending_moderation' where id='30000000-0000-4000-8000-000000000001';
update public.evaluation_requests set status='pending_moderation' where id='20000000-0000-4000-8000-000000000001';
update public.evaluation_versions set status='approved' where id='30000000-0000-4000-8000-000000000001';
update public.evaluation_requests set status='approved' where id='20000000-0000-4000-8000-000000000001';
insert into public.reports(request_id,evaluation_version_id,object_path,filename) values('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001/report.docx','Auratio_informative_Human_Submission-test_v1.docx');

do $$ begin
  if (select final_score from public.evaluation_versions where id='30000000-0000-4000-8000-000000000001')<>0 then raise exception 'Score derivation failed'; end if;
  if not exists(select 1 from public.video_deletion_jobs where submission_id='10000000-0000-4000-8000-000000000001' and status='pending') then raise exception 'Video deletion queue failed'; end if;
  begin update public.evaluation_requests set status='rejected' where id='20000000-0000-4000-8000-000000000001'; raise exception 'Approved finality was not enforced'; exception when others then if sqlerrm='Approved finality was not enforced' then raise; end if; end;
  begin update public.evaluation_criterion_results set score=1 where evaluation_version_id='30000000-0000-4000-8000-000000000001' and criterion_id='ud-pacing'; raise exception 'Submitted result immutability was not enforced'; exception when others then if sqlerrm='Submitted result immutability was not enforced' then raise; end if; end;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
do $$ begin if (select count(*) from public.submissions)<>1 then raise exception 'Owner RLS read failed'; end if; if (select count(*) from public.evaluation_admin_actions)<>0 then raise exception 'End user saw internal admin actions'; end if; end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
do $$ begin if (select count(*) from public.submissions)<>0 then raise exception 'Cross-user submission isolation failed'; end if; if (select count(*) from public.reports)<>0 then raise exception 'Cross-user report isolation failed'; end if; end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
do $$ begin if (select count(*) from public.human_assignments)<>1 then raise exception 'Volunteer assignment read failed'; end if; if (select count(*) from public.evaluation_admin_actions)<>0 then raise exception 'Volunteer saw internal admin actions'; end if; end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
do $$ begin if (select count(*) from public.audit_log)=0 then raise exception 'Admin audit visibility failed'; end if; end $$;
reset role;
rollback;

select 'PASS' as step_v_schema_verification;
