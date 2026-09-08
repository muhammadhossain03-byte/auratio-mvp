-- Step VII-D2 request-state RPC verification.

do $$
begin
  if not has_function_privilege(
    'service_role',
    'public.svc_ai_request_is_active(uuid)',
    'EXECUTE'
  ) then
    raise exception 'TEST_SENTINEL service_role cannot execute svc_ai_request_is_active';
  end if;

  if has_function_privilege(
    'anon',
    'public.svc_ai_request_is_active(uuid)',
    'EXECUTE'
  ) then
    raise exception 'TEST_SENTINEL anon can execute svc_ai_request_is_active';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.svc_ai_request_is_active(uuid)',
    'EXECUTE'
  ) then
    raise exception 'TEST_SENTINEL authenticated can execute svc_ai_request_is_active';
  end if;

  if has_table_privilege(
    'service_role',
    'public.evaluation_requests',
    'SELECT'
  ) then
    raise exception 'TEST_SENTINEL service_role unexpectedly has direct SELECT on evaluation_requests';
  end if;

  if public.svc_ai_request_is_active(gen_random_uuid()) is distinct from false then
    raise exception 'TEST_SENTINEL unknown request did not return false';
  end if;
end;
$$;

select 'VII-D2 request-state RPC verification PASS' as result;
