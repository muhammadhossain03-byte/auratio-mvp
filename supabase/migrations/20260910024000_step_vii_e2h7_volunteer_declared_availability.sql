create table if not exists public.volunteer_availability (
  volunteer_user_id uuid primary key references public.profiles(user_id) on delete cascade,
  status text not null default 'available' check (status in ('available','unavailable')),
  updated_at timestamptz not null default now()
);

alter table public.volunteer_availability enable row level security;
revoke all on table public.volunteer_availability from public, anon, authenticated;

drop policy if exists volunteer_availability_anon_deny on public.volunteer_availability;
create policy volunteer_availability_anon_deny
on public.volunteer_availability for all to anon using (false) with check (false);

drop policy if exists volunteer_availability_authenticated_deny on public.volunteer_availability;
create policy volunteer_availability_authenticated_deny
on public.volunteer_availability for all to authenticated using (false) with check (false);

create or replace function private.ensure_volunteer_availability_default()
returns trigger
language plpgsql
security definer
set search_path=public,private
as $$
begin
  if new.role='volunteer'::public.app_role then
    insert into public.volunteer_availability(volunteer_user_id,status)
    values(new.user_id,'available')
    on conflict(volunteer_user_id) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_ensure_volunteer_availability on public.profiles;
create trigger trg_profiles_ensure_volunteer_availability
after insert or update of role on public.profiles
for each row execute function private.ensure_volunteer_availability_default();

insert into public.volunteer_availability(volunteer_user_id,status)
select user_id,'available'
from public.profiles
where role='volunteer'::public.app_role
on conflict(volunteer_user_id) do nothing;

create or replace function public.svc_volunteer_get_availability()
returns jsonb
language plpgsql
security definer
set search_path=public,auth,private
as $$
declare
  v_actor uuid:=auth.uid();
  v_status text;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not exists(
    select 1 from public.profiles
    where user_id=v_actor
      and role='volunteer'::public.app_role
      and account_status='active'::public.account_status
  ) then raise exception 'Active Volunteer required'; end if;

  select status into v_status
  from public.volunteer_availability
  where volunteer_user_id=v_actor;

  if v_status is null then raise exception 'Volunteer availability is not provisioned'; end if;

  return jsonb_build_object(
    'ok',true,
    'availability',case when v_status='available' then 'Available' else 'Unavailable' end
  );
end $$;

create or replace function public.svc_volunteer_set_availability(p_status text)
returns jsonb
language plpgsql
security definer
set search_path=public,auth,private
as $$
declare
  v_actor uuid:=auth.uid();
  v_status text:=lower(btrim(p_status));
  v_old text;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if v_status not in ('available','unavailable') then
    raise exception 'Availability must be available or unavailable';
  end if;
  if not exists(
    select 1 from public.profiles
    where user_id=v_actor
      and role='volunteer'::public.app_role
      and account_status='active'::public.account_status
  ) then raise exception 'Active Volunteer required'; end if;

  select status into v_old
  from public.volunteer_availability
  where volunteer_user_id=v_actor
  for update;

  if v_old is null then raise exception 'Volunteer availability is not provisioned'; end if;

  update public.volunteer_availability
  set status=v_status,updated_at=now()
  where volunteer_user_id=v_actor;

  if v_old is distinct from v_status then
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,metadata)
    values(
      v_actor,'volunteer.availability_updated','volunteer',v_actor::text,
      jsonb_build_object('old_status',v_old,'new_status',v_status)
    );
  end if;

  return jsonb_build_object(
    'ok',true,
    'availability',case when v_status='available' then 'Available' else 'Unavailable' end
  );
end $$;

revoke execute on function public.svc_volunteer_get_availability() from public,anon;
grant execute on function public.svc_volunteer_get_availability() to authenticated;
revoke execute on function public.svc_volunteer_set_availability(text) from public,anon;
grant execute on function public.svc_volunteer_set_availability(text) to authenticated;

create or replace function public.svc_staff_list_volunteer_accounts(p_actor_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,auth,private
as $$
declare v_role public.app_role; v_rows jsonb;
begin
  select role into v_role
  from public.profiles
  where user_id=p_actor_user_id
    and account_status='active'::public.account_status;

  if v_role is null
     or v_role not in ('admin'::public.app_role,'super_admin'::public.app_role)
  then raise exception 'Admin or Super Admin required'; end if;

  select coalesce(jsonb_agg(x.row_value order by x.created_at,x.email),'[]'::jsonb)
  into v_rows
  from (
    select jsonb_build_object(
      'id',p.user_id::text,
      'kind','profile',
      'display_name',p.display_name,
      'email',u.email,
      'track_count',(select count(*)::int from public.volunteer_track_eligibility v where v.volunteer_user_id=p.user_id),
      'availability',case va.status when 'available' then 'Available' when 'unavailable' then 'Unavailable' else null end,
      'active_assignments',(select count(*)::int from public.human_assignments h where h.volunteer_user_id=p.user_id and h.status::text in ('assigned','accepted','in_evaluation')),
      'lifecycle',case when p.account_status='active'::public.account_status then 'Active' else 'Deactivated' end,
      'created_at',p.created_at
    ) row_value,p.created_at,coalesce(u.email,'') email
    from public.profiles p
    join auth.users u on u.id=p.user_id
    left join public.volunteer_availability va on va.volunteer_user_id=p.user_id
    where p.role='volunteer'::public.app_role

    union all

    select jsonb_build_object(
      'id','invite_'||s.id::text,
      'kind','invitation',
      'display_name',coalesce(s.display_name,s.email),
      'email',s.email,
      'track_count',(select count(*)::int from public.staff_invitation_tracks sit where sit.invitation_id=s.id),
      'availability',null,
      'active_assignments',0,
      'lifecycle','Invited',
      'created_at',s.created_at
    ),s.created_at,s.email
    from public.staff_invitations s
    where s.target_role='volunteer'::public.app_role
      and s.status='pending'::public.invitation_status
      and s.expires_at>now()
  ) x;

  return jsonb_build_object('ok',true,'volunteers',v_rows);
end $$;

revoke execute on function public.svc_staff_list_volunteer_accounts(uuid)
from public,anon,authenticated;
grant execute on function public.svc_staff_list_volunteer_accounts(uuid)
to service_role;

create or replace function public.svc_staff_get_volunteer_account(
  p_actor_user_id uuid,p_volunteer_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path=public,auth,private
as $$
declare
  v_role public.app_role;
  v_name text; v_status public.account_status; v_email text; v_availability text;
  v_tracks jsonb; v_active integer;
begin
  select role into v_role
  from public.profiles
  where user_id=p_actor_user_id
    and account_status='active'::public.account_status;

  if v_role is null
     or v_role not in ('admin'::public.app_role,'super_admin'::public.app_role)
  then raise exception 'Admin or Super Admin required'; end if;

  select p.display_name,p.account_status,u.email,va.status
  into v_name,v_status,v_email,v_availability
  from public.profiles p
  join auth.users u on u.id=p.user_id
  left join public.volunteer_availability va on va.volunteer_user_id=p.user_id
  where p.user_id=p_volunteer_user_id
    and p.role='volunteer'::public.app_role;

  if not found then
    return jsonb_build_object('ok',false,'error','volunteer_not_found');
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object('id',t.id,'name',t.name) order by t.sort_order),
    '[]'::jsonb
  )
  into v_tracks
  from public.volunteer_track_eligibility vte
  join public.tracks t on t.id=vte.track_id
  where vte.volunteer_user_id=p_volunteer_user_id;

  select count(*)::int into v_active
  from public.human_assignments h
  where h.volunteer_user_id=p_volunteer_user_id
    and h.status::text in ('assigned','accepted','in_evaluation');

  return jsonb_build_object('ok',true,'volunteer',jsonb_build_object(
    'id',p_volunteer_user_id::text,
    'display_name',v_name,
    'email',v_email,
    'lifecycle',case when v_status='active'::public.account_status then 'Active' else 'Deactivated' end,
    'availability',case v_availability when 'available' then 'Available' when 'unavailable' then 'Unavailable' else null end,
    'tracks',v_tracks,
    'active_assignments',v_active
  ));
end $$;

revoke execute on function public.svc_staff_get_volunteer_account(uuid,uuid)
from public,anon,authenticated;
grant execute on function public.svc_staff_get_volunteer_account(uuid,uuid)
to service_role;
