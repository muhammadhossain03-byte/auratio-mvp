-- Auratio Step VI-A — identity/staff command surface and privilege hardening

-- One pending staff invitation per email, regardless of target role.
drop index if exists public.staff_invitation_pending_unique_idx;
create unique index staff_invitation_pending_unique_idx
  on public.staff_invitations (lower(email))
  where status = 'pending';

alter table public.staff_invitations drop constraint if exists staff_invitation_accept_shape;
alter table public.staff_invitations
  add constraint staff_invitation_token_hash_shape
    check (token_hash ~ '^[0-9a-f]{64}$'),
  add constraint staff_invitation_time_order
    check (expires_at > created_at),
  add constraint staff_invitation_state_shape
    check (
      (status = 'pending' and accepted_by is null and accepted_at is null and revoked_at is null)
      or (status = 'accepted' and accepted_by is not null and accepted_at is not null and revoked_at is null)
      or (status = 'revoked' and accepted_by is null and accepted_at is null and revoked_at is not null)
      or (status = 'expired' and accepted_by is null and accepted_at is null and revoked_at is null)
    );

-- Direct authenticated profile self-edits may change presentation fields only.
create or replace function public.guard_profile_privilege_fields()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if current_user = 'authenticated' then
    if new.user_id is distinct from old.user_id
       or new.role is distinct from old.role
       or new.account_status is distinct from old.account_status
       or new.is_root_super_admin is distinct from old.is_root_super_admin
       or new.created_at is distinct from old.created_at then
      raise exception 'Authenticated clients cannot modify privileged profile fields';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_profile_privilege_fields() from public, anon, authenticated;

drop trigger if exists profiles_guard_privilege_fields on public.profiles;
create trigger profiles_guard_privilege_fields
before update on public.profiles
for each row execute function public.guard_profile_privilege_fields();

-- Root bootstrap remains email-locked and now records its bootstrap event.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(coalesce(new.email, ''));
  v_name text;
  v_is_root boolean;
begin
  v_is_root := v_email = 'muhammad.hossain03@northsouth.edu';
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', '')), '');
  if v_name is null then
    v_name := coalesce(nullif(split_part(v_email, '@', 1), ''), 'Auratio User');
  end if;

  insert into public.profiles(user_id, display_name, role, account_status, is_root_super_admin)
  values(
    new.id,
    v_name,
    case when v_is_root then 'super_admin'::public.app_role else 'end_user'::public.app_role end,
    'active'::public.account_status,
    v_is_root
  )
  on conflict(user_id) do nothing;

  if v_is_root then
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
    values(new.id, 'staff.root_bootstrap', 'profile', new.id::text, jsonb_build_object('email', v_email));
  end if;

  return new;
end;
$$;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

-- Helper retained in a non-exposed schema for policy/RPC authorization.
create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, private
as $$
select coalesce(private.current_app_role() = 'super_admin'::public.app_role, false)
$$;
revoke execute on function private.is_super_admin() from public, anon, authenticated;

-- Create a one-time staff invitation token. Raw token is returned once and never stored.
create or replace function public.staff_create_invitation(
  p_email text,
  p_target_role public.app_role
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, auth, private, extensions
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role public.app_role;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_token text;
  v_token_hash text;
  v_id uuid;
  v_expires timestamptz := now() + interval '72 hours';
  v_existing_role public.app_role;
  v_existing_status public.account_status;
begin
  select p.role into v_actor_role
  from public.profiles p
  where p.user_id = v_actor and p.account_status = 'active';

  if v_actor is null or v_actor_role is null then
    raise exception 'Active authenticated staff account required';
  end if;
  if p_target_role not in ('admin'::public.app_role, 'volunteer'::public.app_role) then
    raise exception 'Only Admin or Volunteer invitations are allowed';
  end if;
  if p_target_role = 'admin'::public.app_role and v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Only Super Admin may invite Admins';
  end if;
  if p_target_role = 'volunteer'::public.app_role and v_actor_role not in ('admin'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Only Admin or Super Admin may invite Volunteers';
  end if;
  if v_email = '' or position('@' in v_email) <= 1 then
    raise exception 'Valid email required';
  end if;
  if v_email = 'muhammad.hossain03@northsouth.edu' then
    raise exception 'Protected root account cannot be invited into another staff role';
  end if;

  -- Lazily expire stale pending invitations for the same email.
  update public.staff_invitations
  set status = 'expired'
  where lower(email) = v_email and status = 'pending' and expires_at <= now();

  if exists(
    select 1 from public.staff_invitations
    where lower(email) = v_email and status = 'pending'
  ) then
    raise exception 'A pending staff invitation already exists for this email';
  end if;

  select p.role, p.account_status
    into v_existing_role, v_existing_status
  from auth.users u
  join public.profiles p on p.user_id = u.id
  where lower(coalesce(u.email, '')) = v_email
  limit 1;

  if v_existing_role in ('admin'::public.app_role, 'volunteer'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Email already belongs to a staff account; use staff account management instead';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

  insert into public.staff_invitations(email, target_role, status, token_hash, invited_by, expires_at)
  values(v_email, p_target_role, 'pending', v_token_hash, v_actor, v_expires)
  returning id into v_id;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
  values(
    v_actor,
    'staff.invitation.created',
    'staff_invitation',
    v_id::text,
    jsonb_build_object('email', v_email, 'target_role', p_target_role::text, 'expires_at', v_expires)
  );

  return query select v_id, v_token, v_expires;
end;
$$;
revoke execute on function public.staff_create_invitation(text, public.app_role) from public, anon;
grant execute on function public.staff_create_invitation(text, public.app_role) to authenticated;

-- Accept a staff invitation after the invitee is authenticated with the invited email.
create or replace function public.staff_accept_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private, extensions
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_hash text;
  v_inv public.staff_invitations%rowtype;
  v_profile public.profiles%rowtype;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid invitation token';
  end if;

  select lower(coalesce(email, '')) into v_email from auth.users where id = v_actor;
  if v_email = '' then
    raise exception 'Authenticated account email required';
  end if;

  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
  select * into v_inv
  from public.staff_invitations
  where token_hash = v_hash
  for update;

  if v_inv.id is null then
    raise exception 'Invalid invitation token';
  end if;

  if v_inv.status = 'accepted' and v_inv.accepted_by = v_actor then
    return jsonb_build_object('ok', true, 'code', 'already_accepted', 'role', v_inv.target_role::text, 'invitation_id', v_inv.id);
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'Invitation is not pending';
  end if;
  if v_inv.expires_at <= now() then
    update public.staff_invitations set status = 'expired' where id = v_inv.id;
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
    values(v_actor, 'staff.invitation.expired_on_accept', 'staff_invitation', v_inv.id::text, jsonb_build_object('email', v_inv.email));
    return jsonb_build_object('ok', false, 'code', 'expired', 'invitation_id', v_inv.id);
  end if;
  if lower(v_inv.email) <> v_email then
    raise exception 'Invitation email does not match authenticated account';
  end if;

  select * into v_profile from public.profiles where user_id = v_actor for update;
  if v_profile.user_id is null then
    raise exception 'Profile missing for authenticated account';
  end if;
  if v_profile.is_root_super_admin then
    raise exception 'Protected root account cannot accept staff invitations';
  end if;
  if v_profile.account_status <> 'active'::public.account_status then
    raise exception 'Disabled account cannot accept staff invitation';
  end if;
  if v_profile.role = 'end_user'::public.app_role then
    update public.profiles set role = v_inv.target_role where user_id = v_actor;
  elsif v_profile.role <> v_inv.target_role then
    raise exception 'Existing staff role conflicts with invitation target role';
  end if;

  update public.staff_invitations
  set status = 'accepted', accepted_by = v_actor, accepted_at = now()
  where id = v_inv.id;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
  values(
    v_actor,
    'staff.invitation.accepted',
    'staff_invitation',
    v_inv.id::text,
    jsonb_build_object('email', v_email, 'target_role', v_inv.target_role::text)
  );

  return jsonb_build_object('ok', true, 'code', 'accepted', 'role', v_inv.target_role::text, 'invitation_id', v_inv.id);
end;
$$;
revoke execute on function public.staff_accept_invitation(text) from public, anon;
grant execute on function public.staff_accept_invitation(text) to authenticated;

-- Revoke a pending invitation under the same role-governance rules as creation.
create or replace function public.staff_revoke_invitation(p_invitation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role public.app_role;
  v_inv public.staff_invitations%rowtype;
begin
  select role into v_actor_role from public.profiles where user_id = v_actor and account_status = 'active';
  if v_actor is null or v_actor_role is null then raise exception 'Active authenticated staff account required'; end if;

  select * into v_inv from public.staff_invitations where id = p_invitation_id for update;
  if v_inv.id is null then raise exception 'Invitation not found'; end if;
  if v_inv.target_role = 'admin'::public.app_role and v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Only Super Admin may revoke Admin invitations';
  end if;
  if v_inv.target_role = 'volunteer'::public.app_role and v_actor_role not in ('admin'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Only Admin or Super Admin may revoke Volunteer invitations';
  end if;

  if v_inv.status = 'pending' and v_inv.expires_at <= now() then
    update public.staff_invitations set status = 'expired' where id = v_inv.id;
    return jsonb_build_object('ok', false, 'code', 'expired', 'invitation_id', v_inv.id);
  end if;
  if v_inv.status <> 'pending' then raise exception 'Only pending invitations may be revoked'; end if;

  update public.staff_invitations set status = 'revoked', revoked_at = now() where id = v_inv.id;
  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
  values(v_actor, 'staff.invitation.revoked', 'staff_invitation', v_inv.id::text, jsonb_build_object('email', v_inv.email, 'target_role', v_inv.target_role::text));

  return jsonb_build_object('ok', true, 'code', 'revoked', 'invitation_id', v_inv.id);
end;
$$;
revoke execute on function public.staff_revoke_invitation(uuid) from public, anon;
grant execute on function public.staff_revoke_invitation(uuid) to authenticated;

-- Expire stale invitations deterministically; useful for admin refreshes and future scheduled execution.
create or replace function public.staff_expire_invitations()
returns integer
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := auth.uid();
  v_role public.app_role;
  v_count integer;
begin
  select role into v_role from public.profiles where user_id = v_actor and account_status = 'active';
  if v_actor is null or v_role not in ('admin'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Admin or Super Admin required';
  end if;

  update public.staff_invitations
  set status = 'expired'
  where status = 'pending' and expires_at <= now();
  get diagnostics v_count = row_count;

  if v_count > 0 then
    insert into public.audit_log(actor_user_id, action, entity_type, metadata)
    values(v_actor, 'staff.invitation.expiry_sweep', 'staff_invitation', jsonb_build_object('expired_count', v_count));
  end if;
  return v_count;
end;
$$;
revoke execute on function public.staff_expire_invitations() from public, anon;
grant execute on function public.staff_expire_invitations() to authenticated;

-- Activate/deactivate existing staff without permitting role escalation or root changes.
create or replace function public.staff_set_account_status(
  p_user_id uuid,
  p_status public.account_status
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := auth.uid();
  v_actor_role public.app_role;
  v_target public.profiles%rowtype;
  v_old public.account_status;
begin
  select role into v_actor_role from public.profiles where user_id = v_actor and account_status = 'active';
  if v_actor is null or v_actor_role is null then raise exception 'Active authenticated staff account required'; end if;

  select * into v_target from public.profiles where user_id = p_user_id for update;
  if v_target.user_id is null then raise exception 'Staff profile not found'; end if;
  if v_target.is_root_super_admin or v_target.role = 'super_admin'::public.app_role then
    raise exception 'Super Admin account cannot be changed through ordinary staff management';
  end if;
  if v_target.role = 'admin'::public.app_role and v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Only Super Admin may manage Admin accounts';
  end if;
  if v_target.role = 'volunteer'::public.app_role and v_actor_role not in ('admin'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Only Admin or Super Admin may manage Volunteer accounts';
  end if;
  if v_target.role = 'end_user'::public.app_role then
    raise exception 'End Users are not managed by the staff account operation';
  end if;

  if p_status = 'disabled'::public.account_status and v_target.role = 'volunteer'::public.app_role and exists(
    select 1 from public.human_assignments
    where volunteer_user_id = p_user_id and status in ('assigned', 'accepted', 'in_evaluation')
  ) then
    raise exception 'Volunteer has active Human assignments; reassign or return them before disabling the account';
  end if;

  v_old := v_target.account_status;
  if v_old = p_status then
    return jsonb_build_object('ok', true, 'code', 'no_change', 'user_id', p_user_id, 'status', p_status::text);
  end if;

  update public.profiles set account_status = p_status where user_id = p_user_id;
  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
  values(
    v_actor,
    'staff.account_status_changed',
    'profile',
    p_user_id::text,
    jsonb_build_object('role', v_target.role::text, 'old_status', v_old::text, 'new_status', p_status::text)
  );

  return jsonb_build_object('ok', true, 'code', 'updated', 'user_id', p_user_id, 'status', p_status::text);
end;
$$;
revoke execute on function public.staff_set_account_status(uuid, public.account_status) from public, anon;
grant execute on function public.staff_set_account_status(uuid, public.account_status) to authenticated;
