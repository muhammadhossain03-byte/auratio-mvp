-- Step VII-D2 signed-URL transport verification.

do $$
declare
  v_def text;
begin
  select pg_get_functiondef(
    'public.svc_ai_provider_begin_interaction(uuid)'::regprocedure
  ) into v_def;

  if position('initializing' in v_def) = 0 then
    raise exception 'TEST_SENTINEL initializing state is not accepted by begin_interaction';
  end if;

  if position('file_ready' in v_def) = 0 then
    raise exception 'TEST_SENTINEL legacy file_ready compatibility is missing';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.svc_ai_provider_begin_interaction(uuid)',
    'EXECUTE'
  ) then
    raise exception 'TEST_SENTINEL service_role cannot execute begin_interaction';
  end if;

  if has_function_privilege(
    'anon',
    'public.svc_ai_provider_begin_interaction(uuid)',
    'EXECUTE'
  ) then
    raise exception 'TEST_SENTINEL anon can execute begin_interaction';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.svc_ai_provider_begin_interaction(uuid)',
    'EXECUTE'
  ) then
    raise exception 'TEST_SENTINEL authenticated can execute begin_interaction';
  end if;
end;
$$;

select 'VII-D2 signed-URL transport verification PASS' as result;
