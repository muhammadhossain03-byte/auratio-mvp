-- Auratio Step VI-B — distinguish pre-submission cancellation from post-submission re-review rejection.

create or replace function public.guard_evaluation_request()
returns trigger
language plpgsql
set search_path = public
as $$
declare v_owner uuid; v_mode public.evaluation_mode;
begin
  select user_id into v_owner from public.submissions where id=new.submission_id;
  if v_owner is null or v_owner<>new.user_id then raise exception 'Evaluation request user must match submission owner'; end if;
  if tg_op='INSERT' then
    if new.mode='ai' and new.status<>'processing' then raise exception 'AI request must start Processing'; end if;
    if new.mode='human' and new.status<>'unassigned' then raise exception 'Human request must start Unassigned'; end if;
  else
    if old.status in ('approved','rejected','cancelled') then raise exception 'Terminal evaluation request cannot transition'; end if;
    if new.mode<>old.mode or new.submission_id<>old.submission_id or new.user_id<>old.user_id then raise exception 'Evaluation request identity/mode is immutable'; end if;
    v_mode:=old.mode;
    if v_mode='ai' then
      if not(old.status='processing' and new.status in ('processing','approved','rejected','cancelled')) then raise exception 'Invalid AI request transition % -> %',old.status,new.status; end if;
    else
      if not(new.status=old.status or
        (old.status='unassigned' and new.status in ('assigned','cancelled')) or
        (old.status='assigned' and new.status in ('accepted','unassigned','cancelled','rejected')) or
        (old.status='accepted' and new.status in ('in_evaluation','unassigned','cancelled','rejected')) or
        (old.status='in_evaluation' and new.status in ('submitted','unassigned','cancelled','rejected')) or
        (old.status='submitted' and new.status in ('pending_moderation','approved','reopened','rejected')) or
        (old.status='pending_moderation' and new.status in ('approved','reopened','assigned','rejected')) or
        (old.status='reopened' and new.status in ('assigned','rejected'))) then raise exception 'Invalid Human request transition % -> %',old.status,new.status; end if;
    end if;
  end if;
  if new.status in ('approved','rejected','cancelled') then new.terminal_at:=coalesce(new.terminal_at,now()); else new.terminal_at:=null; end if;
  return new;
end;
$$;
revoke execute on function public.guard_evaluation_request() from public, anon, authenticated;

create or replace function public.svc_human_admin_cancel(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_req public.evaluation_requests%rowtype;
  v_active public.human_assignments%rowtype;
  v_version_id uuid;
  v_reason text := btrim(coalesce(p_reason,''));
begin
  if v_reason='' then raise exception 'Cancellation reason is required'; end if;
  select role into v_actor_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;
  if v_req.status not in ('unassigned','assigned','accepted','in_evaluation') then
    raise exception 'Cancel Request is allowed only before Human submission';
  end if;
  if exists(select 1 from public.evaluation_versions where request_id=p_request_id and submitted_at is not null) then
    raise exception 'Post-submission re-review must use Reject Evaluation, not Cancel Request';
  end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  select * into v_active from public.human_assignments
  where request_id=p_request_id and status in ('assigned','accepted','in_evaluation')
  order by assigned_at desc limit 1 for update;

  if v_active.id is not null then
    v_version_id := v_active.evaluation_version_id;
    update public.human_assignments
    set status='revoked',reason=v_reason,ended_at=now()
    where id=v_active.id;
  else
    select id into v_version_id from public.evaluation_versions
    where request_id=p_request_id and status='draft'
    order by version_number desc limit 1;
  end if;

  update public.evaluation_requests set status='cancelled' where id=p_request_id;

  insert into public.evaluation_admin_actions(
    request_id,evaluation_version_id,action,actor_user_id,reason
  )
  values(p_request_id,v_version_id,'cancel_request',p_actor_user_id,v_reason);

  return jsonb_build_object('ok',true,'request_id',p_request_id,'status','cancelled');
end;
$$;
revoke execute on function public.svc_human_admin_cancel(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.svc_human_admin_cancel(uuid,uuid,text) to service_role;

create or replace function public.svc_human_admin_reject(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_req public.evaluation_requests%rowtype;
  v_version public.evaluation_versions%rowtype;
  v_active public.human_assignments%rowtype;
  v_reason text := btrim(coalesce(p_reason,''));
  v_has_prior_submission boolean;
begin
  if v_reason='' then raise exception 'Rejection reason is required'; end if;
  select role into v_actor_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;

  select exists(select 1 from public.evaluation_versions where request_id=p_request_id and submitted_at is not null)
    into v_has_prior_submission;

  if v_req.status not in ('submitted','pending_moderation','reopened')
     and not (v_req.status in ('assigned','accepted','in_evaluation') and v_has_prior_submission) then
    raise exception 'Reject Evaluation is allowed only after Human submission or during re-review';
  end if;

  select * into v_version from public.evaluation_versions
  where request_id=p_request_id
  order by version_number desc limit 1 for update;
  if v_version.id is null then raise exception 'Evaluator version missing'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  select * into v_active from public.human_assignments
  where request_id=p_request_id and status in ('assigned','accepted','in_evaluation')
  order by assigned_at desc limit 1 for update;
  if v_active.id is not null then
    update public.human_assignments
    set status='revoked',reason=v_reason,ended_at=now()
    where id=v_active.id;
  end if;

  update public.evaluation_versions set status='rejected' where id=v_version.id;
  update public.evaluation_requests set status='rejected' where id=p_request_id;

  insert into public.evaluation_admin_actions(
    request_id,evaluation_version_id,action,actor_user_id,reason
  )
  values(p_request_id,v_version.id,'reject_evaluation',p_actor_user_id,v_reason);

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'evaluation_version_id',v_version.id,'status','rejected'
  );
end;
$$;
revoke execute on function public.svc_human_admin_reject(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.svc_human_admin_reject(uuid,uuid,text) to service_role;
