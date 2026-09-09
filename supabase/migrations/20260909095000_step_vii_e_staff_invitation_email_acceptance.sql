-- Auratio Step VII-E2E — staff invitation email acceptance + Volunteer track eligibility.

alter table public.staff_invitations
  add column display_name text;

alter table public.staff_invitations
  add constraint staff_invitation_display_name_shape
  check (display_name is null or length(btrim(display_name)) between 2 and 80);

create table public.staff_invitation_tracks (
  invitation_id uuid not null references public.staff_invitations(id) on delete cascade,
  track_id text not null references public.tracks(id) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  primary key (invitation_id, track_id)
);

create table public.volunteer_track_eligibility (
  volunteer_user_id uuid not null references public.profiles(user_id) on delete cascade,
  track_id text not null references public.tracks(id) on update cascade on delete restrict,
  granted_by uuid references public.profiles(user_id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (volunteer_user_id, track_id)
);

create index volunteer_track_eligibility_track_idx
  on public.volunteer_track_eligibility(track_id, volunteer_user_id);

alter table public.staff_invitation_tracks enable row level security;
alter table public.volunteer_track_eligibility enable row level security;

revoke all on public.staff_invitation_tracks from anon, authenticated;
revoke all on public.volunteer_track_eligibility from anon, authenticated;
grant select on public.volunteer_track_eligibility to authenticated;

create policy volunteer_track_eligibility_read_staff_or_self
on public.volunteer_track_eligibility
for select
to authenticated
using (
  volunteer_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles actor
    where actor.user_id = auth.uid()
      and actor.account_status = 'active'
      and actor.role in ('admin'::public.app_role, 'super_admin'::public.app_role)
  )
);

insert into public.volunteer_track_eligibility(volunteer_user_id, track_id, granted_by)
select p.user_id, t.id, null
from public.profiles p
cross join public.tracks t
where p.role = 'volunteer'::public.app_role
on conflict (volunteer_user_id, track_id) do nothing;

create or replace function public.svc_staff_create_invitation_v2(
  p_actor_user_id uuid,
  p_email text,
  p_target_role public.app_role,
  p_display_name text,
  p_track_ids text[]
)
returns table(invitation_id uuid, invitation_token text, invitation_expires_at timestamptz)
language plpgsql
security definer
set search_path = public, auth, private, extensions
as $$
declare
  v_actor_role public.app_role;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_display_name, ''));
  v_tracks text[] := coalesce(p_track_ids, array[]::text[]);
  v_token text;
  v_hash text;
  v_id uuid;
  v_expires timestamptz := now() + interval '72 hours';
  v_existing_role public.app_role;
  v_track_count integer;
  v_distinct_track_count integer;
begin
  select p.role into v_actor_role
  from public.profiles p
  where p.user_id = p_actor_user_id and p.account_status = 'active';

  if v_actor_role is null then raise exception 'Active staff actor required'; end if;
  if p_target_role not in ('admin'::public.app_role, 'volunteer'::public.app_role) then
    raise exception 'Only Admin or Volunteer invitations are allowed';
  end if;
  if p_target_role = 'admin'::public.app_role and v_actor_role <> 'super_admin'::public.app_role then
    raise exception 'Only Super Admin may invite Admins';
  end if;
  if p_target_role = 'volunteer'::public.app_role
     and v_actor_role not in ('admin'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Only Admin or Super Admin may invite Volunteers';
  end if;
  if v_email = '' or position('@' in v_email) <= 1 then raise exception 'Valid email required'; end if;
  if v_email = 'muhammad.hossain03@northsouth.edu' then
    raise exception 'Protected root account cannot be invited into another staff role';
  end if;
  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'Display name must be between 2 and 80 characters';
  end if;

  select count(*), count(distinct track_id)
  into v_track_count, v_distinct_track_count
  from unnest(v_tracks) as selected(track_id);

  if p_target_role = 'volunteer'::public.app_role then
    if v_track_count < 1 then raise exception 'Volunteer invitation requires at least one Track'; end if;
    if v_track_count <> v_distinct_track_count then raise exception 'Volunteer invitation contains duplicate Tracks'; end if;
    if exists (
      select 1
      from unnest(v_tracks) as selected(track_id)
      left join public.tracks t on t.id = selected.track_id
      where t.id is null
    ) then raise exception 'Volunteer invitation contains an unknown Track'; end if;
  elsif v_track_count <> 0 then
    raise exception 'Admin invitation cannot include Volunteer Track eligibility';
  end if;

  update public.staff_invitations si
  set status = 'expired'
  where lower(si.email) = v_email and si.status = 'pending' and si.expires_at <= now();

  if exists (
    select 1 from public.staff_invitations si
    where lower(si.email) = v_email and si.status = 'pending'
  ) then raise exception 'A pending staff invitation already exists for this email'; end if;

  select p.role into v_existing_role
  from auth.users u
  join public.profiles p on p.user_id = u.id
  where lower(coalesce(u.email, '')) = v_email
  limit 1;

  if v_existing_role in ('volunteer'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role) then
    raise exception 'Email already belongs to a staff account; use staff account management instead';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

  insert into public.staff_invitations(
    email, display_name, target_role, status, token_hash, invited_by, expires_at
  )
  values(v_email, v_name, p_target_role, 'pending', v_hash, p_actor_user_id, v_expires)
  returning id into v_id;

  if p_target_role = 'volunteer'::public.app_role then
    insert into public.staff_invitation_tracks(invitation_id, track_id)
    select v_id, selected.track_id from unnest(v_tracks) as selected(track_id);
  end if;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
  values(
    p_actor_user_id,
    'staff.invitation.created',
    'staff_invitation',
    v_id::text,
    jsonb_build_object(
      'email', v_email,
      'display_name', v_name,
      'target_role', p_target_role::text,
      'track_ids', to_jsonb(v_tracks),
      'expires_at', v_expires
    )
  );

  return query select v_id, v_token, v_expires;
end;
$$;

revoke execute on function public.svc_staff_create_invitation_v2(
  uuid, text, public.app_role, text, text[]
) from public, anon, authenticated;
grant execute on function public.svc_staff_create_invitation_v2(
  uuid, text, public.app_role, text, text[]
) to service_role;

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
  v_email text := lower(btrim(coalesce(p_actor_email, '')));
  v_hash text;
  v_inv public.staff_invitations%rowtype;
  v_profile public.profiles%rowtype;
  v_track_count integer := 0;
begin
  if p_actor_user_id is null or v_email = '' then raise exception 'Authenticated user identity required'; end if;
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then raise exception 'Invalid invitation token'; end if;

  v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
  select * into v_inv
  from public.staff_invitations si
  where si.token_hash = v_hash
  for update;

  if v_inv.id is null then raise exception 'Invalid invitation token'; end if;
  if v_inv.status = 'accepted' and v_inv.accepted_by = p_actor_user_id then
    return jsonb_build_object('ok', true, 'code', 'already_accepted', 'role', v_inv.target_role::text, 'invitation_id', v_inv.id);
  end if;
  if v_inv.status <> 'pending' then raise exception 'Invitation is not pending'; end if;
  if v_inv.expires_at <= now() then
    update public.staff_invitations set status = 'expired' where id = v_inv.id;
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
    values(p_actor_user_id, 'staff.invitation.expired_on_accept', 'staff_invitation', v_inv.id::text, jsonb_build_object('email', v_inv.email));
    return jsonb_build_object('ok', false, 'code', 'expired', 'invitation_id', v_inv.id);
  end if;
  if lower(v_inv.email) <> v_email then raise exception 'Invitation email does not match authenticated account'; end if;

  select * into v_profile from public.profiles p where p.user_id = p_actor_user_id for update;
  if v_profile.user_id is null then raise exception 'Profile missing for authenticated account'; end if;
  if v_profile.is_root_super_admin then raise exception 'Protected root account cannot accept staff invitations'; end if;
  if v_profile.account_status <> 'active'::public.account_status then raise exception 'Disabled account cannot accept staff invitation'; end if;

  if v_profile.role = 'end_user'::public.app_role then
    update public.profiles
    set role = v_inv.target_role,
        display_name = coalesce(nullif(btrim(v_inv.display_name), ''), display_name)
    where user_id = p_actor_user_id;
  elsif v_profile.role <> v_inv.target_role then
    raise exception 'Existing staff role conflicts with invitation target role';
  end if;

  if v_inv.target_role = 'volunteer'::public.app_role then
    select count(*) into v_track_count
    from public.staff_invitation_tracks sit
    where sit.invitation_id = v_inv.id;

    if v_track_count < 1 then raise exception 'Volunteer invitation is missing Track eligibility'; end if;

    insert into public.volunteer_track_eligibility(volunteer_user_id, track_id, granted_by)
    select p_actor_user_id, sit.track_id, v_inv.invited_by
    from public.staff_invitation_tracks sit
    where sit.invitation_id = v_inv.id
    on conflict (volunteer_user_id, track_id) do nothing;
  end if;

  update public.staff_invitations
  set status = 'accepted', accepted_by = p_actor_user_id, accepted_at = now()
  where id = v_inv.id;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, metadata)
  values(
    p_actor_user_id,
    'staff.invitation.accepted',
    'staff_invitation',
    v_inv.id::text,
    jsonb_build_object('email', v_email, 'target_role', v_inv.target_role::text, 'track_count', v_track_count)
  );

  return jsonb_build_object('ok', true, 'code', 'accepted', 'role', v_inv.target_role::text, 'invitation_id', v_inv.id);
end;
$$;

revoke execute on function public.svc_staff_accept_invitation(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.svc_staff_accept_invitation(uuid, text, text)
to service_role;

create or replace function private.guard_human_assignment_track_eligibility()
returns trigger
language plpgsql
set search_path = public, private
as $$
declare
  v_track_id text;
begin
  if new.status not in ('assigned', 'accepted', 'in_evaluation') then return new; end if;

  select s.track_id into v_track_id
  from public.evaluation_requests er
  join public.submissions s on s.id = er.submission_id
  where er.id = new.request_id;

  if v_track_id is null then raise exception 'Human assignment request Track is unavailable'; end if;

  if not exists (
    select 1
    from public.volunteer_track_eligibility vte
    where vte.volunteer_user_id = new.volunteer_user_id
      and vte.track_id = v_track_id
  ) then raise exception 'Volunteer is not eligible for the requested Track'; end if;

  return new;
end;
$$;

revoke execute on function private.guard_human_assignment_track_eligibility()
from public, anon, authenticated;

drop trigger if exists human_assignments_track_eligibility on public.human_assignments;

create trigger human_assignments_track_eligibility
before insert or update of volunteer_user_id, request_id, status
on public.human_assignments
for each row execute function private.guard_human_assignment_track_eligibility();
