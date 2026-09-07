-- Auratio Step VI-B — Human evaluation lifecycle, moderation, reassignment, and re-review.

create or replace function public.sync_version_evaluator_from_assignment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('assigned', 'accepted', 'in_evaluation') then
    update public.evaluation_versions
    set evaluator_user_id = new.volunteer_user_id
    where id = new.evaluation_version_id and status = 'draft';
  elsif tg_op = 'UPDATE' and old.status in ('assigned', 'accepted', 'in_evaluation') then
    update public.evaluation_versions
    set evaluator_user_id = null
    where id = new.evaluation_version_id
      and status = 'draft'
      and evaluator_user_id = old.volunteer_user_id;
  end if;
  return new;
end;
$$;
revoke execute on function public.sync_version_evaluator_from_assignment() from public, anon, authenticated;

create or replace function private.reset_human_draft(p_version_id uuid)
returns integer
language plpgsql
set search_path = public, private
as $$
declare
  v_deleted integer;
begin
  delete from public.evaluation_criterion_results
  where evaluation_version_id = p_version_id;
  get diagnostics v_deleted = row_count;

  update public.evaluation_versions
  set overall_summary = null,
      started_at = null,
      universal_score = null,
      structural_score = null,
      track_score = null,
      final_score = null
  where id = p_version_id and status = 'draft';

  return v_deleted;
end;
$$;
revoke execute on function private.reset_human_draft(uuid) from public, anon, authenticated;

create or replace function private.human_moderation_context(
  p_request_id uuid,
  p_final_score smallint
)
returns table(
  moderation_required boolean,
  moderation_reason text,
  baseline_score smallint,
  baseline_version_id uuid
)
language plpgsql
stable
set search_path = public, private
as $$
declare
  v_user_id uuid;
  v_track_id text;
  v_baseline_score smallint;
  v_baseline_version uuid;
begin
  select er.user_id, s.track_id
    into v_user_id, v_track_id
  from public.evaluation_requests er
  join public.submissions s on s.id = er.submission_id
  where er.id = p_request_id and er.mode = 'human';

  if v_user_id is null then
    raise exception 'Human evaluation request not found';
  end if;

  select ev.final_score, ev.id
    into v_baseline_score, v_baseline_version
  from public.evaluation_requests er2
  join public.submissions s2 on s2.id = er2.submission_id
  join public.evaluation_versions ev on ev.request_id = er2.id
  where er2.user_id = v_user_id
    and s2.track_id = v_track_id
    and er2.mode = 'human'
    and er2.status = 'approved'
    and ev.status = 'approved'
    and er2.id <> p_request_id
  order by ev.approved_at desc, s2.submitted_at desc, ev.version_number desc
  limit 1;

  if v_baseline_version is null then
    return query select true, 'first_human_in_track'::text, null::smallint, null::uuid;
  elsif abs(p_final_score::integer - v_baseline_score::integer) > 15 then
    return query select true, 'score_anomaly_gt_15'::text, v_baseline_score, v_baseline_version;
  else
    return query select false, 'baseline_within_15'::text, v_baseline_score, v_baseline_version;
  end if;
end;
$$;
revoke execute on function private.human_moderation_context(uuid, smallint) from public, anon, authenticated;

create or replace function public.svc_human_admin_assign(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_volunteer_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_vol_role public.app_role;
  v_req public.evaluation_requests%rowtype;
  v_version_id uuid;
  v_assignment_id uuid;
begin
  select role into v_actor_role from public.profiles
  where user_id = p_actor_user_id and account_status = 'active';
  if v_actor_role not in ('admin', 'super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select role into v_vol_role from public.profiles
  where user_id = p_volunteer_user_id and account_status = 'active';
  if v_vol_role <> 'volunteer' then raise exception 'Assignment target must be an active Volunteer'; end if;

  select * into v_req from public.evaluation_requests
  where id = p_request_id for update;
  if v_req.id is null or v_req.mode <> 'human' then raise exception 'Human request not found'; end if;
  if v_req.status not in ('unassigned', 'reopened') then raise exception 'Request is not assignable; use reassignment where applicable'; end if;
  if exists(select 1 from public.human_assignments where request_id=p_request_id and status in ('assigned','accepted','in_evaluation')) then
    raise exception 'Request already has an active Volunteer owner';
  end if;

  select id into v_version_id from public.evaluation_versions
  where request_id = p_request_id and status = 'draft'
  order by version_number desc limit 1 for update;
  if v_version_id is null then raise exception 'Draft evaluator version missing'; end if;

  perform set_config('auratio.actor_user_id', p_actor_user_id::text, true);

  insert into public.human_assignments(
    request_id, evaluation_version_id, volunteer_user_id, status, assigned_by
  )
  values(p_request_id, v_version_id, p_volunteer_user_id, 'assigned', p_actor_user_id)
  returning id into v_assignment_id;

  update public.evaluation_requests set status='assigned' where id=p_request_id;

  insert into public.evaluation_admin_actions(
    request_id, evaluation_version_id, action, actor_user_id, target_volunteer_user_id
  )
  values(p_request_id, v_version_id, 'assign', p_actor_user_id, p_volunteer_user_id);

  return jsonb_build_object(
    'ok', true, 'request_id', p_request_id, 'evaluation_version_id', v_version_id,
    'assignment_id', v_assignment_id, 'status', 'assigned'
  );
end;
$$;
revoke execute on function public.svc_human_admin_assign(uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.svc_human_admin_assign(uuid,uuid,uuid) to service_role;

create or replace function public.svc_human_admin_reassign(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_volunteer_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_vol_role public.app_role;
  v_req public.evaluation_requests%rowtype;
  v_active public.human_assignments%rowtype;
  v_version_id uuid;
  v_old_version_id uuid;
  v_next_version integer;
  v_assignment_id uuid;
  v_reason text := btrim(coalesce(p_reason,''));
  v_discarded integer := 0;
begin
  if v_reason = '' then raise exception 'Reassignment reason is required'; end if;

  select role into v_actor_role from public.profiles
  where user_id=p_actor_user_id and account_status='active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select role into v_vol_role from public.profiles
  where user_id=p_volunteer_user_id and account_status='active';
  if v_vol_role <> 'volunteer' then raise exception 'Reassignment target must be an active Volunteer'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;
  if v_req.status in ('approved','rejected','cancelled','unassigned') then
    raise exception 'Request is not reassignable in its current state';
  end if;

  perform set_config('auratio.actor_user_id', p_actor_user_id::text, true);

  select * into v_active
  from public.human_assignments
  where request_id=p_request_id and status in ('assigned','accepted','in_evaluation')
  order by assigned_at desc
  limit 1 for update;

  if v_active.id is not null and v_active.volunteer_user_id = p_volunteer_user_id then
    raise exception 'Target Volunteer already owns this request';
  end if;

  if v_req.status in ('assigned','accepted','in_evaluation') then
    if v_active.id is null then raise exception 'Active assignment missing'; end if;
    v_version_id := v_active.evaluation_version_id;
    v_discarded := private.reset_human_draft(v_version_id);

    update public.human_assignments
    set status='revoked', reason=v_reason, ended_at=now()
    where id=v_active.id;

    update public.evaluation_requests set status='unassigned' where id=p_request_id;
  elsif v_req.status in ('submitted','pending_moderation') then
    select id into v_old_version_id
    from public.evaluation_versions
    where request_id=p_request_id and status in ('submitted','pending_moderation')
    order by version_number desc limit 1 for update;
    if v_old_version_id is null then raise exception 'Submitted evaluator version missing'; end if;

    update public.evaluation_versions set status='reopened' where id=v_old_version_id;
    update public.evaluation_requests set status='reopened' where id=p_request_id;

    select coalesce(max(version_number),0)+1 into v_next_version
    from public.evaluation_versions where request_id=p_request_id;
    insert into public.evaluation_versions(request_id,version_number,status)
    values(p_request_id,v_next_version,'draft')
    returning id into v_version_id;
  elsif v_req.status='reopened' then
    select id into v_version_id
    from public.evaluation_versions
    where request_id=p_request_id and status='draft'
    order by version_number desc limit 1 for update;
    if v_version_id is null then raise exception 'Re-review draft version missing'; end if;

    if v_active.id is not null then
      v_discarded := private.reset_human_draft(v_version_id);
      update public.human_assignments
      set status='revoked', reason=v_reason, ended_at=now()
      where id=v_active.id;
    end if;
  else
    raise exception 'Unsupported Human reassignment state';
  end if;

  insert into public.human_assignments(
    request_id,evaluation_version_id,volunteer_user_id,status,assigned_by
  )
  values(p_request_id,v_version_id,p_volunteer_user_id,'assigned',p_actor_user_id)
  returning id into v_assignment_id;

  update public.evaluation_requests set status='assigned' where id=p_request_id;

  insert into public.evaluation_admin_actions(
    request_id,evaluation_version_id,action,actor_user_id,target_volunteer_user_id,reason
  )
  values(p_request_id,v_version_id,'reassign',p_actor_user_id,p_volunteer_user_id,v_reason);

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    p_actor_user_id,'human.reassigned','evaluation_request',p_request_id::text,p_request_id,
    jsonb_build_object(
      'new_volunteer_user_id',p_volunteer_user_id,
      'new_version_id',v_version_id,
      'prior_version_id',v_old_version_id,
      'discarded_draft_results',v_discarded,
      'reason',v_reason
    )
  );

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'evaluation_version_id',v_version_id,
    'assignment_id',v_assignment_id,'status','assigned'
  );
end;
$$;
revoke execute on function public.svc_human_admin_reassign(uuid,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.svc_human_admin_reassign(uuid,uuid,uuid,text) to service_role;

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
  v_reason text := btrim(coalesce(p_reason,''));
begin
  if v_reason='' then raise exception 'Rejection reason is required'; end if;
  select role into v_actor_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;
  if v_req.status not in ('submitted','pending_moderation','reopened') then
    raise exception 'Reject Evaluation is allowed only after Human submission/re-review';
  end if;

  select * into v_version from public.evaluation_versions
  where request_id=p_request_id
  order by version_number desc limit 1 for update;
  if v_version.id is null then raise exception 'Evaluator version missing'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

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

create or replace function public.svc_human_admin_approve(
  p_actor_user_id uuid,
  p_request_id uuid
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
begin
  select role into v_actor_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;
  if v_req.status not in ('submitted','pending_moderation') then
    raise exception 'Human request is not awaiting approval';
  end if;

  select * into v_version from public.evaluation_versions
  where request_id=p_request_id and status in ('submitted','pending_moderation')
  order by version_number desc limit 1 for update;
  if v_version.id is null then raise exception 'Submitted evaluator version missing'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  update public.evaluation_versions set status='approved' where id=v_version.id;
  update public.evaluation_requests set status='approved' where id=p_request_id;

  insert into public.evaluation_admin_actions(
    request_id,evaluation_version_id,action,actor_user_id
  )
  values(p_request_id,v_version.id,'approve_evaluation',p_actor_user_id);

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'evaluation_version_id',v_version.id,
    'status','approved','final_score',v_version.final_score
  );
end;
$$;
revoke execute on function public.svc_human_admin_approve(uuid,uuid) from public, anon, authenticated;
grant execute on function public.svc_human_admin_approve(uuid,uuid) to service_role;

create or replace function public.svc_human_admin_reopen(
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
  v_old_version public.evaluation_versions%rowtype;
  v_new_version_id uuid;
  v_next integer;
  v_reason text := btrim(coalesce(p_reason,''));
begin
  if v_reason='' then raise exception 'Re-review reason is required'; end if;
  select role into v_actor_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;
  if v_req.status not in ('submitted','pending_moderation') then
    raise exception 'Only submitted/moderation Human evaluations may be reopened';
  end if;

  select * into v_old_version from public.evaluation_versions
  where request_id=p_request_id and status in ('submitted','pending_moderation')
  order by version_number desc limit 1 for update;
  if v_old_version.id is null then raise exception 'Submitted evaluator version missing'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  update public.evaluation_versions set status='reopened' where id=v_old_version.id;
  update public.evaluation_requests set status='reopened' where id=p_request_id;

  select coalesce(max(version_number),0)+1 into v_next
  from public.evaluation_versions where request_id=p_request_id;

  insert into public.evaluation_versions(request_id,version_number,status)
  values(p_request_id,v_next,'draft')
  returning id into v_new_version_id;

  insert into public.evaluation_admin_actions(
    request_id,evaluation_version_id,action,actor_user_id,reason
  )
  values(p_request_id,v_old_version.id,'reopen_evaluation',p_actor_user_id,v_reason);

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    p_actor_user_id,'human.re_review_opened','evaluation_request',p_request_id::text,p_request_id,
    jsonb_build_object(
      'prior_version_id',v_old_version.id,
      'new_version_id',v_new_version_id,
      'new_version_number',v_next,
      'reason',v_reason
    )
  );

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'prior_version_id',v_old_version.id,
    'evaluation_version_id',v_new_version_id,'version_number',v_next,'status','reopened'
  );
end;
$$;
revoke execute on function public.svc_human_admin_reopen(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.svc_human_admin_reopen(uuid,uuid,text) to service_role;

create or replace function public.svc_human_volunteer_respond(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_action text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_assignment public.human_assignments%rowtype;
  v_req public.evaluation_requests%rowtype;
  v_role public.app_role;
  v_action text := lower(btrim(coalesce(p_action,'')));
  v_reason text := btrim(coalesce(p_reason,''));
  v_discarded integer := 0;
begin
  select role into v_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_role <> 'volunteer' then raise exception 'Active Volunteer account required'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode<>'human' then raise exception 'Human request not found'; end if;

  select * into v_assignment from public.human_assignments
  where request_id=p_request_id
    and volunteer_user_id=p_actor_user_id
    and status in ('assigned','accepted','in_evaluation')
  order by assigned_at desc limit 1 for update;
  if v_assignment.id is null then raise exception 'Active assignment not found for Volunteer'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  if v_action='accept' then
    if v_assignment.status<>'assigned' or v_req.status<>'assigned' then raise exception 'Assignment is not awaiting acceptance'; end if;
    update public.human_assignments set status='accepted',responded_at=coalesce(responded_at,now()) where id=v_assignment.id;
    update public.evaluation_requests set status='accepted' where id=p_request_id;
    return jsonb_build_object('ok',true,'request_id',p_request_id,'assignment_id',v_assignment.id,'status','accepted');

  elsif v_action='decline' then
    if v_assignment.status<>'assigned' or v_req.status<>'assigned' then raise exception 'Only a new assignment may be declined'; end if;
    if v_reason='' then raise exception 'Decline reason is required'; end if;

    update public.human_assignments
    set status='declined',reason=v_reason,responded_at=coalesce(responded_at,now()),ended_at=now()
    where id=v_assignment.id;
    update public.evaluation_requests set status='unassigned' where id=p_request_id;

    return jsonb_build_object('ok',true,'request_id',p_request_id,'assignment_id',v_assignment.id,'status','unassigned');

  elsif v_action='return' then
    if v_assignment.status not in ('accepted','in_evaluation') or v_req.status not in ('accepted','in_evaluation') then
      raise exception 'Only accepted/in-progress work may be returned';
    end if;
    if v_reason='' then raise exception 'Return reason is required'; end if;

    v_discarded := private.reset_human_draft(v_assignment.evaluation_version_id);

    update public.human_assignments
    set status='returned',reason=v_reason,ended_at=now()
    where id=v_assignment.id;
    update public.evaluation_requests set status='unassigned' where id=p_request_id;

    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(
      p_actor_user_id,'human.assignment_returned','human_assignment',v_assignment.id::text,p_request_id,
      jsonb_build_object('reason',v_reason,'discarded_draft_results',v_discarded)
    );

    return jsonb_build_object(
      'ok',true,'request_id',p_request_id,'assignment_id',v_assignment.id,
      'status','unassigned','discarded_draft_results',v_discarded
    );
  else
    raise exception 'Unsupported Volunteer response action';
  end if;
end;
$$;
revoke execute on function public.svc_human_volunteer_respond(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.svc_human_volunteer_respond(uuid,uuid,text,text) to service_role;

create or replace function public.svc_human_volunteer_begin(
  p_actor_user_id uuid,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_assignment public.human_assignments%rowtype;
  v_role public.app_role;
begin
  select role into v_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_role<>'volunteer' then raise exception 'Active Volunteer account required'; end if;

  select ha.* into v_assignment
  from public.human_assignments ha
  join public.evaluation_requests er on er.id=ha.request_id
  where ha.request_id=p_request_id
    and ha.volunteer_user_id=p_actor_user_id
    and ha.status='accepted'
    and er.status='accepted'
  order by ha.assigned_at desc limit 1 for update;
  if v_assignment.id is null then raise exception 'Accepted assignment not found'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  update public.human_assignments set status='in_evaluation' where id=v_assignment.id;
  update public.evaluation_versions
  set started_at=coalesce(started_at,now())
  where id=v_assignment.evaluation_version_id and status='draft';
  update public.evaluation_requests set status='in_evaluation' where id=p_request_id;

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'assignment_id',v_assignment.id,
    'evaluation_version_id',v_assignment.evaluation_version_id,'status','in_evaluation'
  );
end;
$$;
revoke execute on function public.svc_human_volunteer_begin(uuid,uuid) from public, anon, authenticated;
grant execute on function public.svc_human_volunteer_begin(uuid,uuid) to service_role;

create or replace function public.svc_human_volunteer_save_criterion(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_criterion_id text,
  p_anchor public.anchor_level,
  p_score smallint,
  p_primary_timestamp_seconds numeric,
  p_evidence text,
  p_strength text,
  p_weakness text,
  p_actionable_improvement text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_assignment public.human_assignments%rowtype;
  v_role public.app_role;
begin
  select role into v_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_role<>'volunteer' then raise exception 'Active Volunteer account required'; end if;

  select ha.* into v_assignment
  from public.human_assignments ha
  join public.evaluation_requests er on er.id=ha.request_id
  where ha.request_id=p_request_id
    and ha.volunteer_user_id=p_actor_user_id
    and ha.status='in_evaluation'
    and er.status='in_evaluation'
  order by ha.assigned_at desc limit 1;
  if v_assignment.id is null then raise exception 'In-progress assignment not found'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  insert into public.evaluation_criterion_results(
    evaluation_version_id,criterion_id,anchor,score,primary_timestamp_seconds,
    evidence,strength,weakness,actionable_improvement
  )
  values(
    v_assignment.evaluation_version_id,p_criterion_id,p_anchor,p_score,p_primary_timestamp_seconds,
    p_evidence,p_strength,p_weakness,p_actionable_improvement
  )
  on conflict(evaluation_version_id,criterion_id) do update
  set anchor=excluded.anchor,
      score=excluded.score,
      primary_timestamp_seconds=excluded.primary_timestamp_seconds,
      evidence=excluded.evidence,
      strength=excluded.strength,
      weakness=excluded.weakness,
      actionable_improvement=excluded.actionable_improvement;

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'evaluation_version_id',v_assignment.evaluation_version_id,
    'criterion_id',p_criterion_id
  );
end;
$$;
revoke execute on function public.svc_human_volunteer_save_criterion(
  uuid,uuid,text,public.anchor_level,smallint,numeric,text,text,text,text
) from public, anon, authenticated;
grant execute on function public.svc_human_volunteer_save_criterion(
  uuid,uuid,text,public.anchor_level,smallint,numeric,text,text,text,text
) to service_role;

create or replace function public.svc_human_volunteer_save_summary(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_overall_summary text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_assignment public.human_assignments%rowtype;
  v_role public.app_role;
  v_summary text := btrim(coalesce(p_overall_summary,''));
begin
  if v_summary='' then raise exception 'Overall Summary is required'; end if;
  select role into v_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_role<>'volunteer' then raise exception 'Active Volunteer account required'; end if;

  select ha.* into v_assignment
  from public.human_assignments ha
  join public.evaluation_requests er on er.id=ha.request_id
  where ha.request_id=p_request_id
    and ha.volunteer_user_id=p_actor_user_id
    and ha.status='in_evaluation'
    and er.status='in_evaluation'
  order by ha.assigned_at desc limit 1;
  if v_assignment.id is null then raise exception 'In-progress assignment not found'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  update public.evaluation_versions
  set overall_summary=v_summary
  where id=v_assignment.evaluation_version_id and status='draft';

  return jsonb_build_object(
    'ok',true,'request_id',p_request_id,'evaluation_version_id',v_assignment.evaluation_version_id
  );
end;
$$;
revoke execute on function public.svc_human_volunteer_save_summary(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.svc_human_volunteer_save_summary(uuid,uuid,text) to service_role;

create or replace function public.svc_human_volunteer_submit(
  p_actor_user_id uuid,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_assignment public.human_assignments%rowtype;
  v_role public.app_role;
  v_score smallint;
  v_mod_required boolean;
  v_mod_reason text;
  v_baseline_score smallint;
  v_baseline_version uuid;
  v_final_status text;
begin
  select role into v_role from public.profiles where user_id=p_actor_user_id and account_status='active';
  if v_role<>'volunteer' then raise exception 'Active Volunteer account required'; end if;

  select ha.* into v_assignment
  from public.human_assignments ha
  join public.evaluation_requests er on er.id=ha.request_id
  where ha.request_id=p_request_id
    and ha.volunteer_user_id=p_actor_user_id
    and ha.status='in_evaluation'
    and er.status='in_evaluation'
  order by ha.assigned_at desc limit 1 for update;
  if v_assignment.id is null then raise exception 'In-progress assignment not found'; end if;

  perform set_config('auratio.actor_user_id',p_actor_user_id::text,true);

  update public.evaluation_versions
  set status='submitted'
  where id=v_assignment.evaluation_version_id and status='draft'
  returning final_score into v_score;
  if v_score is null then raise exception 'Evaluation submission failed validation'; end if;

  update public.human_assignments
  set status='completed',ended_at=now()
  where id=v_assignment.id;

  update public.evaluation_requests set status='submitted' where id=p_request_id;

  select moderation_required,moderation_reason,baseline_score,baseline_version_id
    into v_mod_required,v_mod_reason,v_baseline_score,v_baseline_version
  from private.human_moderation_context(p_request_id,v_score);

  if v_mod_required then
    update public.evaluation_versions set status='pending_moderation'
    where id=v_assignment.evaluation_version_id;
    update public.evaluation_requests set status='pending_moderation'
    where id=p_request_id;
    v_final_status := 'pending_moderation';
  else
    update public.evaluation_versions set status='approved'
    where id=v_assignment.evaluation_version_id;
    update public.evaluation_requests set status='approved'
    where id=p_request_id;
    v_final_status := 'approved';
  end if;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    p_actor_user_id,'human.moderation_decision','evaluation_version',
    v_assignment.evaluation_version_id::text,p_request_id,
    jsonb_build_object(
      'moderation_required',v_mod_required,
      'reason',v_mod_reason,
      'current_score',v_score,
      'baseline_score',v_baseline_score,
      'baseline_version_id',v_baseline_version
    )
  );

  return jsonb_build_object(
    'ok',true,
    'request_id',p_request_id,
    'evaluation_version_id',v_assignment.evaluation_version_id,
    'final_score',v_score,
    'moderation_required',v_mod_required,
    'moderation_reason',v_mod_reason,
    'baseline_score',v_baseline_score,
    'baseline_version_id',v_baseline_version,
    'status',v_final_status
  );
end;
$$;
revoke execute on function public.svc_human_volunteer_submit(uuid,uuid) from public, anon, authenticated;
grant execute on function public.svc_human_volunteer_submit(uuid,uuid) to service_role;
