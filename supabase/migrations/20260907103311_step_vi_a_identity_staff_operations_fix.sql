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

  update public.staff_invitations si
  set status = 'expired'
  where lower(si.email) = v_email and si.status = 'pending' and si.expires_at <= now();

  if exists(
    select 1 from public.staff_invitations si
    where lower(si.email) = v_email and si.status = 'pending'
  ) then
    raise exception 'A pending staff invitation already exists for this email';
  end if;

  select p.role
    into v_existing_role
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
