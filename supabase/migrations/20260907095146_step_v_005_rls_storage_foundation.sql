create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path=public,auth as $$
select exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.account_status='active')
$$;
create or replace function public.volunteer_has_request(p_request_id uuid,p_active_only boolean default false)
returns boolean language sql stable security definer set search_path=public,auth as $$
select exists(
  select 1 from public.human_assignments ha
  join public.profiles p on p.user_id=ha.volunteer_user_id
  where ha.request_id=p_request_id and ha.volunteer_user_id=auth.uid() and p.account_status='active'
    and (not p_active_only or ha.status in ('assigned','accepted','in_evaluation'))
)
$$;
create or replace function public.volunteer_has_submission(p_submission_id uuid,p_active_only boolean default false)
returns boolean language sql stable security definer set search_path=public,auth as $$
select exists(
  select 1 from public.evaluation_requests er
  join public.human_assignments ha on ha.request_id=er.id
  join public.profiles p on p.user_id=ha.volunteer_user_id
  where er.submission_id=p_submission_id and ha.volunteer_user_id=auth.uid() and p.account_status='active'
    and (not p_active_only or ha.status in ('assigned','accepted','in_evaluation'))
)
$$;
create or replace function public.volunteer_has_version(p_version_id uuid)
returns boolean language sql stable security definer set search_path=public,auth as $$
select exists(
  select 1 from public.human_assignments ha join public.profiles p on p.user_id=ha.volunteer_user_id
  where ha.evaluation_version_id=p_version_id and ha.volunteer_user_id=auth.uid() and p.account_status='active'
)
$$;
create or replace function public.can_read_video_object(p_name text)
returns boolean language sql stable security definer set search_path=public,auth,storage as $$
select exists(
  select 1 from public.submission_videos sv
  join public.submissions s on s.id=sv.submission_id
  where sv.object_path=p_name and (
    s.user_id=auth.uid() or public.is_admin_or_super() or public.volunteer_has_submission(s.id,true)
  )
)
$$;
create or replace function public.can_read_report_object(p_name text)
returns boolean language sql stable security definer set search_path=public,auth,storage as $$
select exists(
  select 1 from public.reports r
  join public.evaluation_requests er on er.id=r.request_id
  where r.object_path=p_name and er.status='approved' and (er.user_id=auth.uid() or public.is_admin_or_super())
)
$$;
revoke all on function public.is_active_user() from public;
revoke all on function public.volunteer_has_request(uuid,boolean) from public;
revoke all on function public.volunteer_has_submission(uuid,boolean) from public;
revoke all on function public.volunteer_has_version(uuid) from public;
revoke all on function public.can_read_video_object(text) from public;
revoke all on function public.can_read_report_object(text) from public;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.volunteer_has_request(uuid,boolean) to authenticated;
grant execute on function public.volunteer_has_submission(uuid,boolean) to authenticated;
grant execute on function public.volunteer_has_version(uuid) to authenticated;
grant execute on function public.can_read_video_object(text) to authenticated;
grant execute on function public.can_read_report_object(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.staff_invitations enable row level security;
alter table public.paths enable row level security;
alter table public.tracks enable row level security;
alter table public.user_paths enable row level security;
alter table public.criteria enable row level security;
alter table public.criterion_anchors enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_videos enable row level security;
alter table public.evaluation_requests enable row level security;
alter table public.evaluation_versions enable row level security;
alter table public.human_assignments enable row level security;
alter table public.evaluation_criterion_results enable row level security;
alter table public.evaluation_admin_actions enable row level security;
alter table public.reports enable row level security;
alter table public.video_deletion_jobs enable row level security;
alter table public.events enable row level security;
alter table public.event_paths enable row level security;
alter table public.audit_log enable row level security;

revoke all on all tables in schema public from anon,authenticated;
revoke all on all sequences in schema public from anon,authenticated;

grant select on public.paths,public.tracks,public.criteria,public.criterion_anchors to authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,avatar_url) on public.profiles to authenticated;
grant select,insert,delete on public.user_paths to authenticated;
grant select,insert on public.submissions to authenticated;
grant select,insert on public.submission_videos to authenticated;
grant select on public.staff_invitations,public.evaluation_requests,public.evaluation_versions,public.human_assignments,public.evaluation_criterion_results,public.evaluation_admin_actions,public.reports,public.video_deletion_jobs,public.audit_log to authenticated;
grant select,insert,update,delete on public.events,public.event_paths to authenticated;

create policy profiles_read on public.profiles for select to authenticated using (
  (user_id=(select auth.uid()) and account_status='active') or public.is_admin_or_super() or
  (public.current_app_role()='volunteer' and exists(
    select 1 from public.evaluation_requests er where er.user_id=profiles.user_id and public.volunteer_has_request(er.id,true)
  ))
);
create policy profiles_update_self on public.profiles for update to authenticated
  using(user_id=(select auth.uid()) and account_status='active')
  with check(user_id=(select auth.uid()) and account_status='active');
create policy staff_invitations_admin_read on public.staff_invitations for select to authenticated using(public.is_admin_or_super());
create policy paths_read on public.paths for select to authenticated using(public.is_active_user());
create policy tracks_read on public.tracks for select to authenticated using(public.is_active_user());
create policy criteria_read on public.criteria for select to authenticated using(public.is_active_user());
create policy criterion_anchors_read on public.criterion_anchors for select to authenticated using(public.is_active_user());
create policy user_paths_read_own on public.user_paths for select to authenticated using(user_id=(select auth.uid()) and public.is_active_user());
create policy user_paths_insert_own on public.user_paths for insert to authenticated with check(user_id=(select auth.uid()) and public.is_active_user());
create policy user_paths_delete_own on public.user_paths for delete to authenticated using(user_id=(select auth.uid()) and public.is_active_user());
create policy submissions_read on public.submissions for select to authenticated using(
  (user_id=(select auth.uid()) and public.is_active_user()) or public.is_admin_or_super() or public.volunteer_has_submission(id,false)
);
create policy submissions_insert_own on public.submissions for insert to authenticated with check(user_id=(select auth.uid()) and public.is_active_user());
create policy submission_videos_read on public.submission_videos for select to authenticated using(
  exists(select 1 from public.submissions s where s.id=submission_videos.submission_id and ((s.user_id=(select auth.uid()) and public.is_active_user()) or public.is_admin_or_super() or public.volunteer_has_submission(s.id,true)))
);
create policy submission_videos_insert_own on public.submission_videos for insert to authenticated with check(
  exists(select 1 from public.submissions s where s.id=submission_videos.submission_id and s.user_id=(select auth.uid()))
  and split_part(object_path,'/',1)=(select auth.uid())::text and public.is_active_user()
);
create policy evaluation_requests_read on public.evaluation_requests for select to authenticated using(
  (user_id=(select auth.uid()) and public.is_active_user()) or public.is_admin_or_super() or public.volunteer_has_request(id,false)
);
create policy evaluation_versions_read on public.evaluation_versions for select to authenticated using(
  public.is_admin_or_super() or public.volunteer_has_version(id) or
  (status='approved' and exists(select 1 from public.evaluation_requests er where er.id=evaluation_versions.request_id and er.user_id=(select auth.uid()) and er.status='approved'))
);
create policy human_assignments_read on public.human_assignments for select to authenticated using(
  public.is_admin_or_super() or (volunteer_user_id=(select auth.uid()) and public.is_active_user())
);
create policy criterion_results_read on public.evaluation_criterion_results for select to authenticated using(
  public.is_admin_or_super() or public.volunteer_has_version(evaluation_version_id) or
  exists(select 1 from public.evaluation_versions ev join public.evaluation_requests er on er.id=ev.request_id where ev.id=evaluation_criterion_results.evaluation_version_id and ev.status='approved' and er.status='approved' and er.user_id=(select auth.uid()))
);
create policy evaluation_admin_actions_admin_read on public.evaluation_admin_actions for select to authenticated using(public.is_admin_or_super());
create policy reports_read on public.reports for select to authenticated using(
  public.is_admin_or_super() or exists(select 1 from public.evaluation_requests er where er.id=reports.request_id and er.user_id=(select auth.uid()) and er.status='approved')
);
create policy video_deletion_jobs_admin_read on public.video_deletion_jobs for select to authenticated using(public.is_admin_or_super());
create policy events_read on public.events for select to authenticated using((status='published' and public.is_active_user()) or public.is_admin_or_super());
create policy events_insert_admin on public.events for insert to authenticated with check(public.is_admin_or_super() and created_by=(select auth.uid()) and updated_by=(select auth.uid()));
create policy events_update_admin on public.events for update to authenticated using(public.is_admin_or_super()) with check(public.is_admin_or_super() and updated_by=(select auth.uid()));
create policy events_delete_admin on public.events for delete to authenticated using(public.is_admin_or_super());
create policy event_paths_read on public.event_paths for select to authenticated using(
  public.is_admin_or_super() or exists(select 1 from public.events e where e.id=event_paths.event_id and e.status='published' and public.is_active_user())
);
create policy event_paths_insert_admin on public.event_paths for insert to authenticated with check(public.is_admin_or_super());
create policy event_paths_delete_admin on public.event_paths for delete to authenticated using(public.is_admin_or_super());
create policy audit_log_admin_read on public.audit_log for select to authenticated using(public.is_admin_or_super());

insert into storage.buckets(id,name,public,allowed_mime_types)
values('evaluation-videos','evaluation-videos',false,array['video/mp4']::text[]),
      ('evaluation-reports','evaluation-reports',false,array['application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[])
on conflict(id) do update set public=excluded.public,allowed_mime_types=excluded.allowed_mime_types;

create policy auratio_video_insert_own on storage.objects for insert to authenticated with check(
  bucket_id='evaluation-videos' and split_part(name,'/',1)=(select auth.uid())::text and lower(name) like '%.mp4' and public.is_active_user()
);
create policy auratio_video_read_authorized on storage.objects for select to authenticated using(
  bucket_id='evaluation-videos' and public.can_read_video_object(name)
);
create policy auratio_report_read_authorized on storage.objects for select to authenticated using(
  bucket_id='evaluation-reports' and public.can_read_report_object(name)
);
