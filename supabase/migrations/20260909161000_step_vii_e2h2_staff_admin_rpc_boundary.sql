-- Auratio Step VII-E2H2 — preserve service-role-only staff command architecture
-- while moving configured Super Admin account directory/detail/update reads and
-- writes behind SECURITY DEFINER RPCs. This intentionally avoids widening
-- direct service_role table grants.

create or replace function public.svc_staff_list_admin_accounts(
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_accounts jsonb;
begin
  select p.role into v_actor_role
  from public.profiles p
  where p.user_id = p_actor_user_id
    and p.account_status = 'active';

  if v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Super Admin required';
  end if;

  select coalesce(
    jsonb_agg(x.account order by x.created_at, x.email),
    '[]'::jsonb
  )
  into v_accounts
  from (
    select
      jsonb_build_object(
        'id', p.user_id::text,
        'kind', 'profile',
        'display_name', p.display_name,
        'email', u.email,
        'account_type', case
          when p.is_root_super_admin then 'Super Admin'
          else 'Admin'
        end,
        'status', case
          when p.account_status = 'active'::public.account_status then 'Active'
          else 'Deactivated'
        end,
        'is_root', p.is_root_super_admin,
        'created_at', p.created_at
      ) as account,
      p.created_at,
      coalesce(u.email, '') as email
    from public.profiles p
    join auth.users u on u.id = p.user_id
    where p.role = 'admin'::public.app_role
       or p.is_root_super_admin = true

    union all

    select
      jsonb_build_object(
        'id', 'invite_' || si.id::text,
        'kind', 'invitation',
        'display_name', coalesce(si.display_name, si.email),
        'email', si.email,
        'account_type', 'Admin',
        'status', 'Invited',
        'is_root', false,
        'created_at', si.created_at
      ) as account,
      si.created_at,
      si.email
    from public.staff_invitations si
    where si.target_role = 'admin'::public.app_role
      and si.status = 'pending'::public.invitation_status
      and si.expires_at > now()
  ) x;

  return jsonb_build_object(
    'ok', true,
    'accounts', v_accounts
  );
end;
$$;

revoke execute on function public.svc_staff_list_admin_accounts(uuid)
from public, anon, authenticated;
grant execute on function public.svc_staff_list_admin_accounts(uuid)
to service_role;


create or replace function public.svc_staff_get_admin_account(
  p_actor_user_id uuid,
  p_account_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_account_id text := btrim(coalesce(p_account_id, ''));
  v_uuid uuid;
  v_account jsonb;
begin
  select p.role into v_actor_role
  from public.profiles p
  where p.user_id = p_actor_user_id
    and p.account_status = 'active';

  if v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Super Admin required';
  end if;

  if v_account_id = '' then
    raise exception 'Account ID required';
  end if;

  if v_account_id = 'root' then
    select jsonb_build_object(
      'id', p.user_id::text,
      'kind', 'profile',
      'display_name', p.display_name,
      'email', u.email,
      'account_type', 'Super Admin',
      'status', case
        when p.account_status = 'active'::public.account_status then 'Active'
        else 'Deactivated'
      end,
      'is_root', true,
      'created_at', p.created_at
    )
    into v_account
    from public.profiles p
    join auth.users u on u.id = p.user_id
    where p.is_root_super_admin = true
    order by p.created_at
    limit 1;

    if v_account is null then
      return jsonb_build_object('ok', false, 'error', 'account_not_found');
    end if;

    return jsonb_build_object('ok', true, 'account', v_account);
  end if;

  if left(v_account_id, 7) = 'invite_' then
    if substring(v_account_id from 8)
       !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' then
      return jsonb_build_object('ok', false, 'error', 'account_not_found');
    end if;

    v_uuid := substring(v_account_id from 8)::uuid;

    select jsonb_build_object(
      'id', 'invite_' || si.id::text,
      'kind', 'invitation',
      'display_name', coalesce(si.display_name, si.email),
      'email', si.email,
      'account_type', 'Admin',
      'status', 'Invited',
      'is_root', false,
      'created_at', si.created_at
    )
    into v_account
    from public.staff_invitations si
    where si.id = v_uuid
      and si.target_role = 'admin'::public.app_role
      and si.status = 'pending'::public.invitation_status
      and si.expires_at > now();

    if v_account is null then
      return jsonb_build_object('ok', false, 'error', 'account_not_found');
    end if;

    return jsonb_build_object('ok', true, 'account', v_account);
  end if;

  if v_account_id
     !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' then
    return jsonb_build_object('ok', false, 'error', 'account_not_found');
  end if;

  v_uuid := v_account_id::uuid;

  select jsonb_build_object(
    'id', p.user_id::text,
    'kind', 'profile',
    'display_name', p.display_name,
    'email', u.email,
    'account_type', case
      when p.is_root_super_admin then 'Super Admin'
      else 'Admin'
    end,
    'status', case
      when p.account_status = 'active'::public.account_status then 'Active'
      else 'Deactivated'
    end,
    'is_root', p.is_root_super_admin,
    'created_at', p.created_at
  )
  into v_account
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where p.user_id = v_uuid
    and (
      p.role = 'admin'::public.app_role
      or p.is_root_super_admin = true
    );

  if v_account is null then
    return jsonb_build_object('ok', false, 'error', 'account_not_found');
  end if;

  return jsonb_build_object('ok', true, 'account', v_account);
end;
$$;

revoke execute on function public.svc_staff_get_admin_account(uuid,text)
from public, anon, authenticated;
grant execute on function public.svc_staff_get_admin_account(uuid,text)
to service_role;


create or replace function public.svc_staff_update_admin_display_name(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor_role public.app_role;
  v_target_role public.app_role;
  v_target_root boolean;
  v_display_name text := btrim(coalesce(p_display_name, ''));
begin
  select p.role into v_actor_role
  from public.profiles p
  where p.user_id = p_actor_user_id
    and p.account_status = 'active';

  if v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Super Admin required';
  end if;

  if char_length(v_display_name) < 2 or char_length(v_display_name) > 80 then
    raise exception 'Display name must be between 2 and 80 characters';
  end if;

  select p.role, p.is_root_super_admin
  into v_target_role, v_target_root
  from public.profiles p
  where p.user_id = p_user_id;

  if v_target_role is null then
    raise exception 'Admin profile not found';
  end if;

  if v_target_role <> 'admin'::public.app_role or v_target_root = true then
    raise exception 'Only ordinary Admin display names may be updated';
  end if;

  update public.profiles
  set display_name = v_display_name
  where user_id = p_user_id;

  insert into public.audit_log(
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values(
    p_actor_user_id,
    'staff.admin.display_name.updated',
    'profile',
    p_user_id::text,
    jsonb_build_object('display_name', v_display_name)
  );

  return jsonb_build_object(
    'ok', true,
    'user_id', p_user_id,
    'display_name', v_display_name
  );
end;
$$;

revoke execute on function public.svc_staff_update_admin_display_name(uuid,uuid,text)
from public, anon, authenticated;
grant execute on function public.svc_staff_update_admin_display_name(uuid,uuid,text)
to service_role;
