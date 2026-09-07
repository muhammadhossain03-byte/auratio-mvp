-- Auratio Step VI-F backend adversarial guard suite.
-- Static invariants complement the accepted batch-specific transactional suites.

do $$
declare
  v_bad integer;
begin
  select count(*) into v_bad
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname like 'svc_%'
    and (
      has_function_privilege('authenticated',p.oid,'EXECUTE')
      or not has_function_privilege('service_role',p.oid,'EXECUTE')
    );
  if v_bad<>0 then
    raise exception 'Privileged svc_ RPC execute boundary violated for % functions',v_bad;
  end if;

  select count(*) into v_bad
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.prosecdef
    and has_function_privilege('authenticated',p.oid,'EXECUTE');
  if v_bad<>0 then
    raise exception 'Authenticated role can execute % public SECURITY DEFINER functions',v_bad;
  end if;

  select count(*) into v_bad
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' and c.relrowsecurity;
  if v_bad<>19 then
    raise exception 'Expected 19 RLS-enabled public tables, found %',v_bad;
  end if;

  if exists(
    select 1
    from pg_policies
    where schemaname='public'
      and tablename in (
        'evaluation_requests',
        'evaluation_versions',
        'human_assignments',
        'evaluation_criterion_results',
        'evaluation_admin_actions',
        'reports',
        'video_deletion_jobs',
        'staff_invitations',
        'audit_log'
      )
      and cmd in ('INSERT','UPDATE','DELETE','ALL')
      and 'authenticated'=any(roles)
  ) then
    raise exception 'Authenticated direct mutation policy exists on a privileged lifecycle table';
  end if;

  if not exists(
    select 1 from pg_indexes
    where schemaname='public' and indexname='evaluation_requests_one_active_per_user_idx'
  ) then
    raise exception 'One-active-request invariant index missing';
  end if;
  if not exists(
    select 1 from pg_indexes
    where schemaname='public' and indexname='human_assignments_one_active_request_idx'
  ) then
    raise exception 'One-active-Human-owner invariant index missing';
  end if;
  if not exists(
    select 1 from pg_indexes
    where schemaname='public' and indexname='evaluation_versions_one_approved_per_request_idx'
  ) then
    raise exception 'One-approved-version invariant index missing';
  end if;

  if exists(
    select 1 from storage.buckets
    where id in ('evaluation-videos','evaluation-reports') and public
  ) then
    raise exception 'Auratio private Storage bucket became public';
  end if;

  if has_table_privilege('authenticated','private.ai_evaluation_attempts','SELECT')
     or has_table_privilege('authenticated','private.report_generation_claims','SELECT') then
    raise exception 'Authenticated role can read private orchestration tables';
  end if;

  if (select count(*) from public.paths)<>3 then
    raise exception 'Canonical path registry drifted';
  end if;
  if (select count(*) from public.tracks)<>13 then
    raise exception 'Canonical track registry drifted';
  end if;
  if (select count(*) from public.criteria)<>64 then
    raise exception 'Canonical criterion registry drifted';
  end if;
  if (select count(*) from public.criterion_anchors)<>192 then
    raise exception 'Canonical anchor registry drifted';
  end if;
end $$;

select 'VI-F backend adversarial guards PASS' as result;
