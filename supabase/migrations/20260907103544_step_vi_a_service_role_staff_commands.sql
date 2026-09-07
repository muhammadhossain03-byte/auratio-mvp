-- Auratio Step VI-A — atomic staff commands callable only by server-side service role.

create or replace function public.svc_staff_create_invitation(
  p_actor_user_id uuid,
  p_email text,
  p_target_role public.app_role
)
returns table(invitation_id uuid, invitation_token text, invitation_expires_at timestamptz)
language plpgsql
security definer
set search_path = public, auth, private, extensions
as $$
declare
  v_actor_role public.app_role;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_token text;
  v_hash text;
  v_id uuid;
  v_expires timestamptz := now() + interval '72 hours';
begin
  select p.role into v_actor_role
  from public.profiles p
  where p.user_id = p_actor_user_id and p.account_status = 'active';

  if v_actor_role is null then raise exception 'Active staff actor required'; end if;
  if p_target_role not in ('admin'::public.app_role, 'volunteer'::public.app_role) then raise exception 'Only Admin or Volunteer invitations are allowed'; end if;
  if p_target_role = 'admin'::public.app_role and v_actor_role <> 'super_admin'::public.app_role then raise exception 'Only Super Admin may invite Admins'; end if;
  if p_target_role = 'volunteer'::public.app_role and v_actor_role not in ('admin'::public.app_role, 'super_admin'::public.app_role) then raise exception 'Only Admin or Super Admin may invite Volunteers'; end if;
  if v_email = '' or position('@' in v_email) <= 1 then raise exception 'Valid email required'; end if;
  if v_email = 'muhammad.hossain03@northsouth.edu' then raise exception 'Protected root account cannot be invited into another staff role'; end if;

  update public.staff_invitations si
  set status = 'expired'
  where lower(si.email) = v_email and si.status = 'pending' and si.expires_at <= now();

  if exists(select 1 from public.staff_invitations si where lower(si.email) = v_email and si.status = 'pending') then
    raise exception 'A pending staff invitation already exists for this email';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

  insert into public.staff_invitations(email,target_role,status,token_hash,invited_by,expires_at)
  values(v_email,p_target_role,'pending',v_hash,p_actor_user_id,v_expires)
  returning id into v_id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
  values(p_actor_user_id,'staff.invitation.created','staff_invitation',v_id::text,
    jsonb_build_object('email',v_email,'target_role',p_target_role::text,'expires_at',v_expires));

  return query select v_id,v_token,v_expires;
end;
$$;
revoke execute on function public.svc_staff_create_invitation(uuid,text,public.app_role) from public,anon,authenticated;
grant execute on function public.svc_staff_create_invitation(uuid,text,public.app_role) to service_role;

create or replace function public.svc_staff_accept_invitation(
  p_actor_user_id uuid,
  p_actor_email text,
  p_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private, extensions
as $$
declare
  v_email text := lower(btrim(coalesce(p_actor_email,'')));
  v_hash text;
  v_inv public.staff_invitations%rowtype;
  v_profile public.profiles%rowtype;
begin
  if p_actor_user_id is null or v_email = '' then raise exception 'Authenticated user identity required'; end if;
  if coalesce(p_token,'') !~ '^[0-9a-f]{64}$' then raise exception 'Invalid invitation token'; end if;

  v_hash := encode(extensions.digest(p_token,'sha256'),'hex');
  select * into v_inv from public.staff_invitations si where si.token_hash=v_hash for update;
  if v_inv.id is null then raise exception 'Invalid invitation token'; end if;

  if v_inv.status='accepted' and v_inv.accepted_by=p_actor_user_id then
    return jsonb_build_object('ok',true,'code','already_accepted','role',v_inv.target_role::text,'invitation_id',v_inv.id);
  end if;
  if v_inv.status<>'pending' then raise exception 'Invitation is not pending'; end if;
  if v_inv.expires_at<=now() then
    update public.staff_invitations set status='expired' where id=v_inv.id;
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
    values(p_actor_user_id,'staff.invitation.expired_on_accept','staff_invitation',v_inv.id::text,jsonb_build_object('email',v_inv.email));
    return jsonb_build_object('ok',false,'code','expired','invitation_id',v_inv.id);
  end if;
  if lower(v_inv.email)<>v_email then raise exception 'Invitation email does not match authenticated account'; end if;

  select * into v_profile from public.profiles p where p.user_id=p_actor_user_id for update;
  if v_profile.user_id is null then raise exception 'Profile missing for authenticated account'; end if;
  if v_profile.is_root_super_admin then raise exception 'Protected root account cannot accept staff invitations'; end if;
  if v_profile.account_status<>'active'::public.account_status then raise exception 'Disabled account cannot accept staff invitation'; end if;

  if v_profile.role='end_user'::public.app_role then
    update public.profiles set role=v_inv.target_role where user_id=p_actor_user_id;
  elsif v_profile.role<>v_inv.target_role then
    raise exception 'Existing staff role conflicts with invitation target role';
  end if;

  update public.staff_invitations
  set status='accepted',accepted_by=p_actor_user_id,accepted_at=now()
  where id=v_inv.id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
  values(p_actor_user_id,'staff.invitation.accepted','staff_invitation',v_inv.id::text,
    jsonb_build_object('email',v_email,'target_role',v_inv.target_role::text));

  return jsonb_build_object('ok',true,'code','accepted','role',v_inv.target_role::text,'invitation_id',v_inv.id);
end;
$$;
revoke execute on function public.svc_staff_accept_invitation(uuid,text,text) from public,anon,authenticated;
grant execute on function public.svc_staff_accept_invitation(uuid,text,text) to service_role;

create or replace function public.svc_staff_revoke_invitation(
  p_actor_user_id uuid,
  p_invitation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_inv public.staff_invitations%rowtype;
begin
  select p.role into v_actor_role from public.profiles p where p.user_id=p_actor_user_id and p.account_status='active';
  if v_actor_role is null then raise exception 'Active staff actor required'; end if;

  select * into v_inv from public.staff_invitations si where si.id=p_invitation_id for update;
  if v_inv.id is null then raise exception 'Invitation not found'; end if;
  if v_inv.target_role='admin'::public.app_role and v_actor_role<>'super_admin'::public.app_role then raise exception 'Only Super Admin may revoke Admin invitations'; end if;
  if v_inv.target_role='volunteer'::public.app_role and v_actor_role not in ('admin'::public.app_role,'super_admin'::public.app_role) then raise exception 'Only Admin or Super Admin may revoke Volunteer invitations'; end if;

  if v_inv.status='pending' and v_inv.expires_at<=now() then
    update public.staff_invitations set status='expired' where id=v_inv.id;
    return jsonb_build_object('ok',false,'code','expired','invitation_id',v_inv.id);
  end if;
  if v_inv.status<>'pending' then raise exception 'Only pending invitations may be revoked'; end if;

  update public.staff_invitations set status='revoked',revoked_at=now() where id=v_inv.id;
  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
  values(p_actor_user_id,'staff.invitation.revoked','staff_invitation',v_inv.id::text,
    jsonb_build_object('email',v_inv.email,'target_role',v_inv.target_role::text));

  return jsonb_build_object('ok',true,'code','revoked','invitation_id',v_inv.id);
end;
$$;
revoke execute on function public.svc_staff_revoke_invitation(uuid,uuid) from public,anon,authenticated;
grant execute on function public.svc_staff_revoke_invitation(uuid,uuid) to service_role;

create or replace function public.svc_staff_expire_invitations(p_actor_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_role public.app_role;
  v_count integer;
begin
  select p.role into v_role from public.profiles p where p.user_id=p_actor_user_id and p.account_status='active';
  if v_role not in ('admin'::public.app_role,'super_admin'::public.app_role) then raise exception 'Admin or Super Admin required'; end if;

  update public.staff_invitations si set status='expired' where si.status='pending' and si.expires_at<=now();
  get diagnostics v_count = row_count;
  if v_count>0 then
    insert into public.audit_log(actor_user_id,action,entity_type,metadata)
    values(p_actor_user_id,'staff.invitation.expiry_sweep','staff_invitation',jsonb_build_object('expired_count',v_count));
  end if;
  return v_count;
end;
$$;
revoke execute on function public.svc_staff_expire_invitations(uuid) from public,anon,authenticated;
grant execute on function public.svc_staff_expire_invitations(uuid) to service_role;

create or replace function public.svc_staff_set_account_status(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_status public.account_status
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_target public.profiles%rowtype;
  v_old public.account_status;
begin
  select p.role into v_actor_role from public.profiles p where p.user_id=p_actor_user_id and p.account_status='active';
  if v_actor_role is null then raise exception 'Active staff actor required'; end if;

  select * into v_target from public.profiles p where p.user_id=p_user_id for update;
  if v_target.user_id is null then raise exception 'Staff profile not found'; end if;
  if v_target.is_root_super_admin or v_target.role='super_admin'::public.app_role then raise exception 'Super Admin account cannot be changed through ordinary staff management'; end if;
  if v_target.role='admin'::public.app_role and v_actor_role<>'super_admin'::public.app_role then raise exception 'Only Super Admin may manage Admin accounts'; end if;
  if v_target.role='volunteer'::public.app_role and v_actor_role not in ('admin'::public.app_role,'super_admin'::public.app_role) then raise exception 'Only Admin or Super Admin may manage Volunteer accounts'; end if;
  if v_target.role='end_user'::public.app_role then raise exception 'End Users are not managed by the staff account operation'; end if;

  if p_status='disabled'::public.account_status and v_target.role='volunteer'::public.app_role and exists(
    select 1 from public.human_assignments ha where ha.volunteer_user_id=p_user_id and ha.status in ('assigned','accepted','in_evaluation')
  ) then
    raise exception 'Volunteer has active Human assignments; reassign or return them before disabling the account';
  end if;

  v_old:=v_target.account_status;
  if v_old=p_status then return jsonb_build_object('ok',true,'code','no_change','user_id',p_user_id,'status',p_status::text); end if;

  update public.profiles set account_status=p_status where user_id=p_user_id;
  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
  values(p_actor_user_id,'staff.account_status_changed','profile',p_user_id::text,
    jsonb_build_object('role',v_target.role::text,'old_status',v_old::text,'new_status',p_status::text));

  return jsonb_build_object('ok',true,'code','updated','user_id',p_user_id,'status',p_status::text);
end;
$$;
revoke execute on function public.svc_staff_set_account_status(uuid,uuid,public.account_status) from public,anon,authenticated;
grant execute on function public.svc_staff_set_account_status(uuid,uuid,public.account_status) to service_role;
