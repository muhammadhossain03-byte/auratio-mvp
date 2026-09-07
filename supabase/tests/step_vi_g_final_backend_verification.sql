-- Auratio Step VI-G final backend closeout verification.
-- Static/reproducibility invariants for the accepted Step-VI backend state.

do $$
declare
  v_bad integer;
  v_count integer;
  v_latest text;
begin
  select count(*) into v_count from supabase_migrations.schema_migrations;
  if v_count <> 24 then
    raise exception 'Expected 24 production migrations through Step VI-F, found %', v_count;
  end if;

  select max(version) into v_latest from supabase_migrations.schema_migrations;
  if v_latest <> '20260907133302' then
    raise exception 'Unexpected latest migration version: %', v_latest;
  end if;

  select count(*) into v_bad
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname like 'svc_%'
    and (
      has_function_privilege('authenticated',p.oid,'EXECUTE')
      or not has_function_privilege('service_role',p.oid,'EXECUTE')
    );
  if v_bad <> 0 then
    raise exception 'Privileged svc_ RPC execute boundary violated for % functions', v_bad;
  end if;

  select count(*) into v_count
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'svc_%';
  if v_count <> 28 then
    raise exception 'Expected 28 Step-VI service RPCs, found %', v_count;
  end if;

  select count(*) into v_bad
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.prosecdef
    and has_function_privilege('authenticated',p.oid,'EXECUTE');
  if v_bad <> 0 then
    raise exception 'Authenticated role can execute % public SECURITY DEFINER functions', v_bad;
  end if;

  select count(*) into v_count
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' and c.relrowsecurity;
  if v_count <> 19 then
    raise exception 'Expected 19 RLS-enabled public tables, found %', v_count;
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

  if (select count(*) from public.paths) <> 3 then
    raise exception 'Canonical path registry drifted';
  end if;
  if (select count(*) from public.tracks) <> 13 then
    raise exception 'Canonical track registry drifted';
  end if;
  if (select count(*) from public.criteria) <> 64 then
    raise exception 'Canonical criterion registry drifted';
  end if;
  if (select count(*) from public.criterion_anchors) <> 192 then
    raise exception 'Canonical anchor registry drifted';
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
    raise exception 'One-Approved-version invariant index missing';
  end if;

  if (select count(*) from storage.buckets where id in ('evaluation-videos','evaluation-reports')) <> 2 then
    raise exception 'Expected both Auratio Storage buckets';
  end if;
  if exists(
    select 1 from storage.buckets
    where id in ('evaluation-videos','evaluation-reports') and public
  ) then
    raise exception 'Auratio Storage bucket became public';
  end if;
  if not exists(
    select 1 from storage.buckets
    where id='evaluation-videos'
      and allowed_mime_types = array['video/mp4']::text[]
  ) then
    raise exception 'Video bucket MIME contract drifted';
  end if;
  if not exists(
    select 1 from storage.buckets
    where id='evaluation-reports'
      and allowed_mime_types = array['application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
  ) then
    raise exception 'Report bucket MIME contract drifted';
  end if;

  if has_table_privilege('authenticated','private.ai_evaluation_attempts','SELECT') then
    raise exception 'Authenticated role can read private AI provenance';
  end if;
  if has_table_privilege('authenticated','private.report_generation_claims','SELECT') then
    raise exception 'Authenticated role can read private report orchestration';
  end if;

  if not exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='video_deletion_jobs' and column_name='claim_token'
  ) or not exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='video_deletion_jobs' and column_name='claimed_at'
  ) then
    raise exception 'Video deletion claim/retry columns missing';
  end if;

  if exists(
    select 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname in ('get_my_progress','get_my_approved_history')
      and p.prosecdef
  ) then
    raise exception 'Private progress/history read unexpectedly uses SECURITY DEFINER';
  end if;
end $$;

select 'VI-G final backend verification PASS' as result;
