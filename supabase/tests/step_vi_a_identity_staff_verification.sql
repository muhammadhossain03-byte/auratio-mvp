-- Auratio Step VI-A verification. Intended for a migrated disposable/local database.
-- All test rows are rolled back.

do $$
begin
  if to_regprocedure('public.staff_create_invitation(text,public.app_role)') is not null then
    raise exception 'Authenticated client staff RPC should be removed';
  end if;
  if not has_function_privilege('service_role','public.svc_staff_create_invitation(uuid,text,public.app_role)','EXECUTE') then
    raise exception 'service_role missing create-invitation execute';
  end if;
  if has_function_privilege('authenticated','public.svc_staff_create_invitation(uuid,text,public.app_role)','EXECUTE') then
    raise exception 'authenticated can execute service staff RPC';
  end if;
  if has_function_privilege('anon','public.svc_staff_create_invitation(uuid,text,public.app_role)','EXECUTE') then
    raise exception 'anon can execute service staff RPC';
  end if;
  if not exists(select 1 from pg_trigger where tgname='profiles_guard_privilege_fields' and not tgisinternal) then
    raise exception 'Profile privilege guard trigger missing';
  end if;
end $$;

begin;
insert into auth.users(id,email) values
('71000000-0000-4000-8000-000000000001','user-a@test.local'),
('71000000-0000-4000-8000-000000000002','admin-a@test.local'),
('71000000-0000-4000-8000-000000000003','invitee-a@test.local'),
('71000000-0000-4000-8000-000000000004','volunteer-a@test.local');

update public.profiles set role='admin' where user_id='71000000-0000-4000-8000-000000000002';
update public.profiles set role='volunteer' where user_id='71000000-0000-4000-8000-000000000004';

set local role authenticated;
select set_config('request.jwt.claim.sub','71000000-0000-4000-8000-000000000001',true);
do $$
begin
  begin
    update public.profiles set role='admin' where user_id='71000000-0000-4000-8000-000000000001';
    raise exception 'Direct role escalation was not blocked';
  exception when others then
    if sqlerrm='Direct role escalation was not blocked' then raise; end if;
  end;
  update public.profiles set display_name='Allowed Self Edit' where user_id='71000000-0000-4000-8000-000000000001';
end $$;
reset role;

set local role service_role;
do $$
declare
  v_token text;
  v_invite uuid;
begin
  select invitation_token,invitation_id into v_token,v_invite
  from public.svc_staff_create_invitation(
    '71000000-0000-4000-8000-000000000002',
    'invitee-a@test.local',
    'volunteer'
  );
  perform public.svc_staff_accept_invitation(
    '71000000-0000-4000-8000-000000000003',
    'invitee-a@test.local',
    v_token
  );
  if not exists(select 1 from public.profiles where user_id='71000000-0000-4000-8000-000000000003' and role='volunteer') then
    raise exception 'Invitation acceptance did not promote invitee';
  end if;

  select invitation_id into v_invite
  from public.svc_staff_create_invitation(
    '71000000-0000-4000-8000-000000000002',
    'revoke-a@test.local',
    'volunteer'
  );
  perform public.svc_staff_revoke_invitation('71000000-0000-4000-8000-000000000002',v_invite);
  if not exists(select 1 from public.staff_invitations where id=v_invite and status='revoked') then
    raise exception 'Invitation revoke failed';
  end if;

  perform public.svc_staff_set_account_status(
    '71000000-0000-4000-8000-000000000002',
    '71000000-0000-4000-8000-000000000004',
    'disabled'
  );
  if not exists(select 1 from public.profiles where user_id='71000000-0000-4000-8000-000000000004' and account_status='disabled') then
    raise exception 'Volunteer disable failed';
  end if;
end $$;
reset role;

-- Force a valid-but-expired pending invitation and sweep it.
set local role service_role;
do $$ begin perform * from public.svc_staff_create_invitation('71000000-0000-4000-8000-000000000002','expire-a@test.local','volunteer'); end $$;
reset role;
update public.staff_invitations
set created_at=now()-interval '2 days', expires_at=now()-interval '1 day'
where email='expire-a@test.local' and status='pending';
set local role service_role;
select public.svc_staff_expire_invitations('71000000-0000-4000-8000-000000000002');
reset role;

do $$
begin
  if not exists(select 1 from public.staff_invitations where email='expire-a@test.local' and status='expired') then
    raise exception 'Invitation expiry sweep failed';
  end if;
  if (select count(*) from public.audit_log where action like 'staff.%') < 4 then
    raise exception 'Expected staff audit records missing';
  end if;
end $$;
rollback;

select 'PASS' as step_vi_a_identity_staff_verification;
