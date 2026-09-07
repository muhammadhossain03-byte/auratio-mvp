create schema if not exists private;
revoke all on schema private from public,anon;
grant usage on schema private to authenticated,service_role;

create or replace function private.current_app_role()
returns public.app_role language sql stable security definer set search_path=public,auth,private as $$
select p.role from public.profiles p where p.user_id=auth.uid() and p.account_status='active'
$$;
create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.account_status='active')
$$;
create or replace function private.is_admin_or_super()
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select coalesce(private.current_app_role() in ('admin','super_admin'),false)
$$;
create or replace function private.volunteer_has_request(p_request_id uuid,p_active_only boolean default false)
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select exists(select 1 from public.human_assignments ha join public.profiles p on p.user_id=ha.volunteer_user_id where ha.request_id=p_request_id and ha.volunteer_user_id=auth.uid() and p.account_status='active' and (not p_active_only or ha.status in ('assigned','accepted','in_evaluation')))
$$;
create or replace function private.volunteer_has_submission(p_submission_id uuid,p_active_only boolean default false)
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select exists(select 1 from public.evaluation_requests er join public.human_assignments ha on ha.request_id=er.id join public.profiles p on p.user_id=ha.volunteer_user_id where er.submission_id=p_submission_id and ha.volunteer_user_id=auth.uid() and p.account_status='active' and (not p_active_only or ha.status in ('assigned','accepted','in_evaluation')))
$$;
create or replace function private.volunteer_has_version(p_version_id uuid)
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select exists(select 1 from public.human_assignments ha join public.profiles p on p.user_id=ha.volunteer_user_id where ha.evaluation_version_id=p_version_id and ha.volunteer_user_id=auth.uid() and p.account_status='active')
$$;
create or replace function private.can_read_video_object(p_name text)
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select exists(select 1 from public.submission_videos sv join public.submissions s on s.id=sv.submission_id where sv.object_path=p_name and (s.user_id=auth.uid() or private.is_admin_or_super() or private.volunteer_has_submission(s.id,true)))
$$;
create or replace function private.can_read_report_object(p_name text)
returns boolean language sql stable security definer set search_path=public,auth,private as $$
select exists(select 1 from public.reports r join public.evaluation_requests er on er.id=r.request_id where r.object_path=p_name and er.status='approved' and (er.user_id=auth.uid() or private.is_admin_or_super()))
$$;

revoke all on all functions in schema private from public,anon;
grant execute on function private.current_app_role() to authenticated,service_role;
grant execute on function private.is_active_user() to authenticated,service_role;
grant execute on function private.is_admin_or_super() to authenticated,service_role;
grant execute on function private.volunteer_has_request(uuid,boolean) to authenticated,service_role;
grant execute on function private.volunteer_has_submission(uuid,boolean) to authenticated,service_role;
grant execute on function private.volunteer_has_version(uuid) to authenticated,service_role;
grant execute on function private.can_read_video_object(text) to authenticated,service_role;
grant execute on function private.can_read_report_object(text) to authenticated,service_role;

alter policy profiles_read on public.profiles using ((user_id=(select auth.uid()) and account_status='active') or private.is_admin_or_super() or (private.current_app_role()='volunteer' and exists(select 1 from public.evaluation_requests er where er.user_id=profiles.user_id and private.volunteer_has_request(er.id,true))));
alter policy staff_invitations_admin_read on public.staff_invitations using(private.is_admin_or_super());
alter policy paths_read on public.paths using(private.is_active_user());
alter policy tracks_read on public.tracks using(private.is_active_user());
alter policy criteria_read on public.criteria using(private.is_active_user());
alter policy criterion_anchors_read on public.criterion_anchors using(private.is_active_user());
alter policy user_paths_read_own on public.user_paths using(user_id=(select auth.uid()) and private.is_active_user());
alter policy user_paths_insert_own on public.user_paths with check(user_id=(select auth.uid()) and private.is_active_user());
alter policy user_paths_delete_own on public.user_paths using(user_id=(select auth.uid()) and private.is_active_user());
alter policy submissions_read on public.submissions using((user_id=(select auth.uid()) and private.is_active_user()) or private.is_admin_or_super() or private.volunteer_has_submission(id,false));
alter policy submissions_insert_own on public.submissions with check(user_id=(select auth.uid()) and private.is_active_user());
alter policy submission_videos_read on public.submission_videos using(exists(select 1 from public.submissions s where s.id=submission_videos.submission_id and ((s.user_id=(select auth.uid()) and private.is_active_user()) or private.is_admin_or_super() or private.volunteer_has_submission(s.id,true))));
alter policy submission_videos_insert_own on public.submission_videos with check(exists(select 1 from public.submissions s where s.id=submission_videos.submission_id and s.user_id=(select auth.uid())) and split_part(object_path,'/',1)=(select auth.uid())::text and private.is_active_user());
alter policy evaluation_requests_read on public.evaluation_requests using((user_id=(select auth.uid()) and private.is_active_user()) or private.is_admin_or_super() or private.volunteer_has_request(id,false));
alter policy evaluation_versions_read on public.evaluation_versions using(private.is_admin_or_super() or private.volunteer_has_version(id) or (status='approved' and exists(select 1 from public.evaluation_requests er where er.id=evaluation_versions.request_id and er.user_id=(select auth.uid()) and er.status='approved')));
alter policy human_assignments_read on public.human_assignments using(private.is_admin_or_super() or (volunteer_user_id=(select auth.uid()) and private.is_active_user()));
alter policy criterion_results_read on public.evaluation_criterion_results using(private.is_admin_or_super() or private.volunteer_has_version(evaluation_version_id) or exists(select 1 from public.evaluation_versions ev join public.evaluation_requests er on er.id=ev.request_id where ev.id=evaluation_criterion_results.evaluation_version_id and ev.status='approved' and er.status='approved' and er.user_id=(select auth.uid())));
alter policy evaluation_admin_actions_admin_read on public.evaluation_admin_actions using(private.is_admin_or_super());
alter policy reports_read on public.reports using(private.is_admin_or_super() or exists(select 1 from public.evaluation_requests er where er.id=reports.request_id and er.user_id=(select auth.uid()) and er.status='approved'));
alter policy video_deletion_jobs_admin_read on public.video_deletion_jobs using(private.is_admin_or_super());
alter policy events_read on public.events using((status='published' and private.is_active_user()) or private.is_admin_or_super());
alter policy events_insert_admin on public.events with check(private.is_admin_or_super() and created_by=(select auth.uid()) and updated_by=(select auth.uid()));
alter policy events_update_admin on public.events using(private.is_admin_or_super()) with check(private.is_admin_or_super() and updated_by=(select auth.uid()));
alter policy events_delete_admin on public.events using(private.is_admin_or_super());
alter policy event_paths_read on public.event_paths using(private.is_admin_or_super() or exists(select 1 from public.events e where e.id=event_paths.event_id and e.status='published' and private.is_active_user()));
alter policy event_paths_insert_admin on public.event_paths with check(private.is_admin_or_super());
alter policy event_paths_delete_admin on public.event_paths using(private.is_admin_or_super());
alter policy audit_log_admin_read on public.audit_log using(private.is_admin_or_super());
alter policy auratio_video_insert_own on storage.objects with check(bucket_id='evaluation-videos' and split_part(name,'/',1)=(select auth.uid())::text and lower(name) like '%.mp4' and private.is_active_user());
alter policy auratio_video_read_authorized on storage.objects using(bucket_id='evaluation-videos' and private.can_read_video_object(name));
alter policy auratio_report_read_authorized on storage.objects using(bucket_id='evaluation-reports' and private.can_read_report_object(name));

drop function public.can_read_report_object(text);
drop function public.can_read_video_object(text);
drop function public.volunteer_has_version(uuid);
drop function public.volunteer_has_submission(uuid,boolean);
drop function public.volunteer_has_request(uuid,boolean);
drop function public.is_active_user();
drop function public.is_super_admin();
drop function public.is_admin_or_super();
drop function public.current_app_role();

alter function public.set_updated_at() set search_path=public;
revoke execute on function public.set_updated_at() from public,anon,authenticated;
revoke execute on function public.handle_new_auth_user() from public,anon,authenticated;
revoke execute on function public.audit_request_change() from public,anon,authenticated;
revoke execute on function public.audit_version_change() from public,anon,authenticated;
revoke execute on function public.audit_assignment_change() from public,anon,authenticated;
revoke execute on function public.guard_profile_root() from public,anon,authenticated;
revoke execute on function public.validate_anchor_range() from public,anon,authenticated;
revoke execute on function public.validate_video_duration() from public,anon,authenticated;
revoke execute on function public.guard_evaluation_request() from public,anon,authenticated;
revoke execute on function public.queue_terminal_video_deletion() from public,anon,authenticated;
revoke execute on function public.prepare_evaluation_version() from public,anon,authenticated;
revoke execute on function public.guard_submitted_version() from public,anon,authenticated;
revoke execute on function public.validate_criterion_result() from public,anon,authenticated;
revoke execute on function public.guard_criterion_result_delete() from public,anon,authenticated;
revoke execute on function public.finalize_version_scores() from public,anon,authenticated;
revoke execute on function public.validate_human_assignment() from public,anon,authenticated;
revoke execute on function public.sync_version_evaluator_from_assignment() from public,anon,authenticated;
revoke execute on function public.validate_report() from public,anon,authenticated;
