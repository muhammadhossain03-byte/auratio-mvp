-- Auratio Step V — relational/lifecycle integrity

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger submission_videos_set_updated_at before update on public.submission_videos for each row execute function public.set_updated_at();
create trigger evaluation_requests_set_updated_at before update on public.evaluation_requests for each row execute function public.set_updated_at();
create trigger human_assignments_set_updated_at before update on public.human_assignments for each row execute function public.set_updated_at();
create trigger evaluation_criterion_results_set_updated_at before update on public.evaluation_criterion_results for each row execute function public.set_updated_at();
create trigger video_deletion_jobs_set_updated_at before update on public.video_deletion_jobs for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer
set search_path = public, auth
as $$
  select p.role from public.profiles p
  where p.user_id = auth.uid() and p.account_status = 'active'
$$;

create or replace function public.is_admin_or_super()
returns boolean
language sql stable security definer
set search_path = public, auth
as $$
  select coalesce(public.current_app_role() in ('admin','super_admin'), false)
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer
set search_path = public, auth
as $$
  select coalesce(public.current_app_role() = 'super_admin', false)
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.is_admin_or_super() from public;
revoke all on function public.is_super_admin() from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin_or_super() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(coalesce(new.email,''));
  v_name text;
  v_is_root boolean;
begin
  v_is_root := v_email = 'muhammad.hossain03@northsouth.edu';
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', '')), '');
  if v_name is null then
    v_name := coalesce(nullif(split_part(v_email,'@',1),''), 'Auratio User');
  end if;

  insert into public.profiles(user_id, display_name, role, account_status, is_root_super_admin)
  values (new.id, v_name,
          case when v_is_root then 'super_admin'::public.app_role else 'end_user'::public.app_role end,
          'active'::public.account_status,
          v_is_root)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.guard_profile_root()
returns trigger language plpgsql
set search_path = public, auth
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_root_super_admin then
      raise exception 'Root Super Admin cannot be deleted';
    end if;
    return old;
  end if;

  if old.is_root_super_admin and (
    new.user_id <> old.user_id or
    new.role <> 'super_admin'::public.app_role or
    new.account_status <> 'active'::public.account_status or
    not new.is_root_super_admin
  ) then
    raise exception 'Root Super Admin cannot be demoted, disabled, or unprotected';
  end if;

  if not old.is_root_super_admin and new.is_root_super_admin then
    raise exception 'Root Super Admin flag is bootstrap-only';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_root before update or delete on public.profiles for each row execute function public.guard_profile_root();

create or replace function public.validate_anchor_range()
returns trigger language plpgsql
set search_path = public
as $$
declare v_max smallint;
begin
  select max_points into v_max from public.criteria where id = new.criterion_id;
  if v_max is null then raise exception 'Unknown criterion %', new.criterion_id; end if;
  if v_max = 5 then
    if (new.anchor='Low' and (new.min_score,new.max_score)<>(0,2))
       or (new.anchor='Competent' and (new.min_score,new.max_score)<>(3,4))
       or (new.anchor='Excellent' and (new.min_score,new.max_score)<>(5,5)) then
      raise exception 'Invalid 5-point anchor band for %/%', new.criterion_id,new.anchor;
    end if;
  elsif v_max = 10 then
    if (new.anchor='Low' and (new.min_score,new.max_score)<>(0,4))
       or (new.anchor='Competent' and (new.min_score,new.max_score)<>(5,8))
       or (new.anchor='Excellent' and (new.min_score,new.max_score)<>(9,10)) then
      raise exception 'Invalid 10-point anchor band for %/%', new.criterion_id,new.anchor;
    end if;
  else
    raise exception 'Unsupported criterion max %',v_max;
  end if;
  return new;
end;
$$;
create trigger criterion_anchors_validate before insert or update on public.criterion_anchors for each row execute function public.validate_anchor_range();

create or replace function public.validate_video_duration()
returns trigger language plpgsql
set search_path = public
as $$
declare v_min int; v_max int;
begin
  select t.min_duration_seconds,t.max_duration_seconds into v_min,v_max
  from public.submissions s join public.tracks t on t.id=s.track_id
  where s.id=new.submission_id;
  if v_min is null then raise exception 'Unknown submission %',new.submission_id; end if;
  if new.duration_seconds < v_min or new.duration_seconds > v_max then
    raise exception 'Video duration % is outside accepted range %-% seconds',new.duration_seconds,v_min,v_max;
  end if;
  return new;
end;
$$;
create trigger submission_videos_duration_gate before insert or update of duration_seconds,submission_id on public.submission_videos for each row execute function public.validate_video_duration();

create or replace function public.guard_evaluation_request()
returns trigger language plpgsql
set search_path = public
as $$
declare v_owner uuid; v_mode public.evaluation_mode;
begin
  select user_id into v_owner from public.submissions where id=new.submission_id;
  if v_owner is null or v_owner<>new.user_id then
    raise exception 'Evaluation request user must match submission owner';
  end if;

  if tg_op='INSERT' then
    if new.mode='ai' and new.status<>'processing' then raise exception 'AI request must start Processing'; end if;
    if new.mode='human' and new.status<>'unassigned' then raise exception 'Human request must start Unassigned'; end if;
  else
    if old.status in ('approved','rejected','cancelled') then
      raise exception 'Terminal evaluation request cannot transition';
    end if;
    if new.mode<>old.mode or new.submission_id<>old.submission_id or new.user_id<>old.user_id then
      raise exception 'Evaluation request identity/mode is immutable';
    end if;

    v_mode := old.mode;
    if v_mode='ai' then
      if not (old.status='processing' and new.status in ('processing','approved','rejected','cancelled')) then
        raise exception 'Invalid AI request transition % -> %',old.status,new.status;
      end if;
    else
      if not (
        new.status=old.status or
        (old.status='unassigned' and new.status in ('assigned','cancelled')) or
        (old.status='assigned' and new.status in ('accepted','unassigned','cancelled')) or
        (old.status='accepted' and new.status in ('in_evaluation','unassigned','cancelled')) or
        (old.status='in_evaluation' and new.status in ('submitted','unassigned','cancelled')) or
        (old.status='submitted' and new.status in ('pending_moderation','approved','reopened','rejected')) or
        (old.status='pending_moderation' and new.status in ('approved','reopened','assigned','rejected')) or
        (old.status='reopened' and new.status in ('assigned','rejected'))
      ) then
        raise exception 'Invalid Human request transition % -> %',old.status,new.status;
      end if;
    end if;
  end if;

  if new.status in ('approved','rejected','cancelled') then
    new.terminal_at := coalesce(new.terminal_at,now());
  else
    new.terminal_at := null;
  end if;
  return new;
end;
$$;
create trigger evaluation_requests_guard before insert or update on public.evaluation_requests for each row execute function public.guard_evaluation_request();

create or replace function public.queue_terminal_video_deletion()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.status in ('approved','rejected','cancelled') and old.status not in ('approved','rejected','cancelled') then
    update public.submission_videos set lifecycle_status='deletion_pending' where submission_id=new.submission_id and lifecycle_status<>'deleted';
    insert into public.video_deletion_jobs(submission_id,status,next_attempt_at)
    values(new.submission_id,'pending',now())
    on conflict (submission_id) do update set status='pending',next_attempt_at=now(),last_error=null,completed_at=null;
  end if;
  return new;
end;
$$;
create trigger evaluation_requests_queue_video_delete after update of status on public.evaluation_requests for each row execute function public.queue_terminal_video_deletion();

create or replace function public.prepare_evaluation_version()
returns trigger language plpgsql
set search_path = public
as $$
declare v_mode public.evaluation_mode; v_expected int; v_role public.app_role;
begin
  select mode into v_mode from public.evaluation_requests where id=new.request_id for update;
  if v_mode is null then raise exception 'Unknown evaluation request %',new.request_id; end if;

  if tg_op='INSERT' then
    select coalesce(max(version_number),0)+1 into v_expected from public.evaluation_versions where request_id=new.request_id;
    if new.version_number<>v_expected then raise exception 'Version number must be %, got %',v_expected,new.version_number; end if;
  end if;

  if v_mode='ai' and new.evaluator_user_id is not null then raise exception 'AI evaluation version has no human evaluator'; end if;
  if v_mode='human' and new.evaluator_user_id is not null then
    select role into v_role from public.profiles where user_id=new.evaluator_user_id and account_status='active';
    if v_role<>'volunteer' then raise exception 'Human evaluator must be an active Volunteer'; end if;
  end if;
  return new;
end;
$$;
create trigger evaluation_versions_prepare before insert or update of request_id,evaluator_user_id,version_number on public.evaluation_versions for each row execute function public.prepare_evaluation_version();

create or replace function public.guard_submitted_version()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if tg_op='DELETE' and old.status<>'draft' then raise exception 'Submitted evaluator versions are immutable'; end if;
  if tg_op='UPDATE' and old.status<>'draft' then
    if new.request_id<>old.request_id or new.version_number<>old.version_number or
       new.evaluator_user_id is distinct from old.evaluator_user_id or
       new.overall_summary is distinct from old.overall_summary or
       new.universal_score is distinct from old.universal_score or
       new.structural_score is distinct from old.structural_score or
       new.track_score is distinct from old.track_score or
       new.final_score is distinct from old.final_score or
       new.created_at<>old.created_at or new.started_at is distinct from old.started_at or
       new.submitted_at is distinct from old.submitted_at then
      raise exception 'Submitted evaluator version content is immutable';
    end if;
    if old.status in ('approved','rejected') and new.status<>old.status then raise exception 'Terminal evaluator version status is immutable'; end if;
  end if;
  return case when tg_op='DELETE' then old else new end;
end;
$$;
create trigger evaluation_versions_immutable before update or delete on public.evaluation_versions for each row execute function public.guard_submitted_version();

create or replace function public.validate_criterion_result()
returns trigger language plpgsql
set search_path = public
as $$
declare
  v_status public.evaluation_version_status;
  v_track text;
  v_cat public.criterion_category;
  v_criterion_track text;
  v_min smallint; v_max smallint;
  v_duration numeric;
begin
  select ev.status,s.track_id,sv.duration_seconds into v_status,v_track,v_duration
  from public.evaluation_versions ev
  join public.evaluation_requests er on er.id=ev.request_id
  join public.submissions s on s.id=er.submission_id
  join public.submission_videos sv on sv.submission_id=s.id
  where ev.id=new.evaluation_version_id;
  if v_status is null then raise exception 'Unknown evaluation version %',new.evaluation_version_id; end if;
  if v_status<>'draft' then raise exception 'Criterion results are editable only on Draft evaluator versions'; end if;

  select c.category,c.track_id,a.min_score,a.max_score into v_cat,v_criterion_track,v_min,v_max
  from public.criteria c join public.criterion_anchors a on a.criterion_id=c.id and a.anchor=new.anchor
  where c.id=new.criterion_id;
  if v_cat is null then raise exception 'Unknown criterion/anchor'; end if;
  if v_cat='track_specialisation' and v_criterion_track<>v_track then raise exception 'Criterion % is not valid for selected track %',new.criterion_id,v_track; end if;
  if new.score<v_min or new.score>v_max then raise exception 'Score % incompatible with % anchor band %-%',new.score,new.anchor,v_min,v_max; end if;
  if new.primary_timestamp_seconds>v_duration then raise exception 'Primary timestamp exceeds video duration'; end if;
  return new;
end;
$$;
create trigger evaluation_criterion_results_validate before insert or update on public.evaluation_criterion_results for each row execute function public.validate_criterion_result();

create or replace function public.guard_criterion_result_delete()
returns trigger language plpgsql
set search_path = public
as $$
declare v_status public.evaluation_version_status;
begin
  select status into v_status from public.evaluation_versions where id=old.evaluation_version_id;
  if v_status<>'draft' then raise exception 'Submitted criterion results are immutable'; end if;
  return old;
end;
$$;
create trigger evaluation_criterion_results_guard_delete before delete on public.evaluation_criterion_results for each row execute function public.guard_criterion_result_delete();

create or replace function public.finalize_version_scores()
returns trigger language plpgsql
set search_path = public
as $$
declare
  v_track text;
  v_count int;
  v_ud_count int; v_sf_count int; v_ts_count int;
  v_ud int; v_sf int; v_ts int;
begin
  if old.status='draft' and new.status in ('submitted','pending_moderation','approved') then
    if new.overall_summary is null or length(btrim(new.overall_summary))=0 then raise exception 'Overall Summary is required'; end if;
    select s.track_id into v_track from public.evaluation_requests er join public.submissions s on s.id=er.submission_id where er.id=new.request_id;
    select count(*),
           count(*) filter(where c.category='universal_delivery'),
           count(*) filter(where c.category='structural_flow'),
           count(*) filter(where c.category='track_specialisation' and c.track_id=v_track),
           coalesce(sum(r.score) filter(where c.category='universal_delivery'),0),
           coalesce(sum(r.score) filter(where c.category='structural_flow'),0),
           coalesce(sum(r.score) filter(where c.category='track_specialisation' and c.track_id=v_track),0)
    into v_count,v_ud_count,v_sf_count,v_ts_count,v_ud,v_sf,v_ts
    from public.evaluation_criterion_results r join public.criteria c on c.id=r.criterion_id
    where r.evaluation_version_id=new.id;
    if v_count<>16 or v_ud_count<>8 or v_sf_count<>4 or v_ts_count<>4 then
      raise exception 'Evaluation must contain exactly 8 universal + 4 structural + 4 selected-track criteria';
    end if;
    new.universal_score:=v_ud; new.structural_score:=v_sf; new.track_score:=v_ts; new.final_score:=v_ud+v_sf+v_ts;
    new.submitted_at:=coalesce(new.submitted_at,now());
    if new.status='approved' then new.approved_at:=coalesce(new.approved_at,now()); end if;
  elsif new.status='approved' and old.status<>'approved' then
    new.approved_at:=coalesce(new.approved_at,now()); new.moderated_at:=coalesce(new.moderated_at,now());
  elsif new.status='rejected' and old.status<>'rejected' then
    new.rejected_at:=coalesce(new.rejected_at,now()); new.moderated_at:=coalesce(new.moderated_at,now());
  elsif new.status='pending_moderation' and old.status<>new.status then
    new.moderated_at:=null;
  end if;
  return new;
end;
$$;
create trigger evaluation_versions_finalize before update of status on public.evaluation_versions for each row execute function public.finalize_version_scores();

create or replace function public.validate_human_assignment()
returns trigger language plpgsql
set search_path = public
as $$
declare v_mode public.evaluation_mode; v_req uuid; v_ver_status public.evaluation_version_status; v_vol_role public.app_role; v_admin_role public.app_role;
begin
  select er.mode,ev.request_id,ev.status into v_mode,v_req,v_ver_status
  from public.evaluation_versions ev join public.evaluation_requests er on er.id=ev.request_id
  where ev.id=new.evaluation_version_id;
  if v_mode<>'human' or v_req<>new.request_id then raise exception 'Assignment must reference a Human request and its evaluator version'; end if;
  if v_ver_status<>'draft' then raise exception 'Active Human assignment requires a Draft evaluator version'; end if;
  select role into v_vol_role from public.profiles where user_id=new.volunteer_user_id and account_status='active';
  if v_vol_role<>'volunteer' then raise exception 'Assignment target must be an active Volunteer'; end if;
  select role into v_admin_role from public.profiles where user_id=new.assigned_by and account_status='active';
  if v_admin_role not in ('admin','super_admin') then raise exception 'Assignment actor must be an active Admin/Super Admin'; end if;
  return new;
end;
$$;
create trigger human_assignments_validate before insert or update of request_id,evaluation_version_id,volunteer_user_id,assigned_by on public.human_assignments for each row execute function public.validate_human_assignment();

create or replace function public.sync_version_evaluator_from_assignment()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.status in ('assigned','accepted','in_evaluation') then
    update public.evaluation_versions set evaluator_user_id=new.volunteer_user_id where id=new.evaluation_version_id and status='draft';
  end if;
  return new;
end;
$$;
create trigger human_assignments_sync_evaluator after insert or update of status,volunteer_user_id on public.human_assignments for each row execute function public.sync_version_evaluator_from_assignment();

create or replace function public.validate_report()
returns trigger language plpgsql
set search_path = public
as $$
declare v_request uuid; v_vstatus public.evaluation_version_status; v_rstatus public.evaluation_request_status;
begin
  select ev.request_id,ev.status,er.status into v_request,v_vstatus,v_rstatus
  from public.evaluation_versions ev join public.evaluation_requests er on er.id=ev.request_id
  where ev.id=new.evaluation_version_id;
  if v_request is null or v_request<>new.request_id or v_vstatus<>'approved' or v_rstatus<>'approved' then
    raise exception 'Official report requires matching Approved request/version';
  end if;
  return new;
end;
$$;
create trigger reports_validate before insert or update on public.reports for each row execute function public.validate_report();

create or replace function public.audit_request_change()
returns trigger language plpgsql security definer
set search_path = public, auth
as $$
begin
  if tg_op='INSERT' then
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(auth.uid(),'evaluation_request.created','evaluation_request',new.id::text,new.id,jsonb_build_object('mode',new.mode,'status',new.status));
  elsif new.status<>old.status then
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(auth.uid(),'evaluation_request.status_changed','evaluation_request',new.id::text,new.id,jsonb_build_object('from',old.status,'to',new.status));
  end if;
  return new;
end;
$$;
create trigger evaluation_requests_audit after insert or update on public.evaluation_requests for each row execute function public.audit_request_change();

create or replace function public.audit_version_change()
returns trigger language plpgsql security definer
set search_path = public, auth
as $$
begin
  if tg_op='INSERT' then
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(auth.uid(),'evaluation_version.created','evaluation_version',new.id::text,new.request_id,jsonb_build_object('version',new.version_number,'status',new.status));
  elsif new.status<>old.status then
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(auth.uid(),'evaluation_version.status_changed','evaluation_version',new.id::text,new.request_id,jsonb_build_object('version',new.version_number,'from',old.status,'to',new.status));
  end if;
  return new;
end;
$$;
create trigger evaluation_versions_audit after insert or update on public.evaluation_versions for each row execute function public.audit_version_change();

create or replace function public.audit_assignment_change()
returns trigger language plpgsql security definer
set search_path = public, auth
as $$
begin
  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(auth.uid(),case when tg_op='INSERT' then 'human_assignment.created' else 'human_assignment.updated' end,
         'human_assignment',new.id::text,new.request_id,
         jsonb_build_object('volunteer_user_id',new.volunteer_user_id,'status',new.status));
  return new;
end;
$$;
create trigger human_assignments_audit after insert or update on public.human_assignments for each row execute function public.audit_assignment_change();
