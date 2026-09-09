create or replace function public.svc_staff_get_volunteer_account(
  p_actor_user_id uuid, p_volunteer_user_id uuid
) returns jsonb
language plpgsql security definer
set search_path=public,auth,private
as $$
declare
  v_role public.app_role;
  v_name text; v_status public.account_status; v_email text;
  v_tracks jsonb; v_active integer;
begin
  select role into v_role from public.profiles
  where user_id=p_actor_user_id and account_status='active'::public.account_status;
  if v_role is null or v_role not in ('admin'::public.app_role,'super_admin'::public.app_role)
  then raise exception 'Admin or Super Admin required'; end if;

  select p.display_name,p.account_status,u.email
  into v_name,v_status,v_email
  from public.profiles p join auth.users u on u.id=p.user_id
  where p.user_id=p_volunteer_user_id and p.role='volunteer'::public.app_role;

  if not found then
    return jsonb_build_object('ok',false,'error','volunteer_not_found');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'name',t.name) order by t.sort_order),'[]'::jsonb)
  into v_tracks
  from public.volunteer_track_eligibility vte
  join public.tracks t on t.id=vte.track_id
  where vte.volunteer_user_id=p_volunteer_user_id;

  select count(*)::int into v_active
  from public.human_assignments h
  where h.volunteer_user_id=p_volunteer_user_id
    and h.status::text in ('assigned','accepted','in_evaluation');

  return jsonb_build_object('ok',true,'volunteer',jsonb_build_object(
    'id',p_volunteer_user_id::text,'display_name',v_name,'email',v_email,
    'lifecycle',case when v_status='active'::public.account_status then 'Active' else 'Deactivated' end,
    'tracks',v_tracks,'active_assignments',v_active
  ));
end $$;

revoke execute on function public.svc_staff_get_volunteer_account(uuid,uuid)
from public,anon,authenticated;
grant execute on function public.svc_staff_get_volunteer_account(uuid,uuid)
to service_role;
