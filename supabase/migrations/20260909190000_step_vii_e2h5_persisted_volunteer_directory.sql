create or replace function public.svc_staff_list_volunteer_accounts(p_actor_user_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth,private as $$
declare v_role public.app_role; v_rows jsonb;
begin
  select role into v_role from public.profiles
  where user_id=p_actor_user_id and account_status='active'::public.account_status;
  if v_role is null or v_role not in ('admin'::public.app_role,'super_admin'::public.app_role)
  then raise exception 'Admin or Super Admin required'; end if;

  select coalesce(jsonb_agg(x.row_value order by x.created_at,x.email),'[]'::jsonb)
  into v_rows
  from (
    select jsonb_build_object(
      'id',p.user_id::text,'kind','profile','display_name',p.display_name,'email',u.email,
      'track_count',(select count(*)::int from public.volunteer_track_eligibility v where v.volunteer_user_id=p.user_id),
      'effective_availability',null,
      'active_assignments',(select count(*)::int from public.human_assignments h where h.volunteer_user_id=p.user_id and h.status::text in ('assigned','accepted','in_evaluation')),
      'lifecycle',case when p.account_status='active'::public.account_status then 'Active' else 'Deactivated' end,
      'created_at',p.created_at
    ) row_value,p.created_at,coalesce(u.email,'') email
    from public.profiles p join auth.users u on u.id=p.user_id
    where p.role='volunteer'::public.app_role
    union all
    select jsonb_build_object(
      'id','invite_'||s.id::text,'kind','invitation','display_name',coalesce(s.display_name,s.email),'email',s.email,
      'track_count',(select count(*)::int from public.staff_invitation_tracks sit where sit.invitation_id=s.id),
      'effective_availability',null,'active_assignments',0,'lifecycle','Invited','created_at',s.created_at
    ),s.created_at,s.email
    from public.staff_invitations s
    where s.target_role='volunteer'::public.app_role
      and s.status='pending'::public.invitation_status and s.expires_at>now()
  ) x;
  return jsonb_build_object('ok',true,'volunteers',v_rows);
end $$;
revoke execute on function public.svc_staff_list_volunteer_accounts(uuid) from public,anon,authenticated;
grant execute on function public.svc_staff_list_volunteer_accounts(uuid) to service_role;
