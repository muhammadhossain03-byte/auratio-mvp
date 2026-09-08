-- Step VII-D2: least-privilege request-state read boundary for ai-worker.
--
-- The worker must not SELECT public.evaluation_requests directly. Step V
-- intentionally did not grant service_role direct table access. This
-- SECURITY DEFINER RPC exposes only the single boolean required by the worker.

create or replace function public.svc_ai_request_is_active(
  p_request_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, private, auth
as $$
  select exists (
    select 1
    from public.evaluation_requests er
    where er.id = p_request_id
      and er.mode = 'ai'
      and er.status = 'processing'
  );
$$;

revoke execute on function public.svc_ai_request_is_active(uuid)
from public, anon, authenticated;

grant execute on function public.svc_ai_request_is_active(uuid)
to service_role;
