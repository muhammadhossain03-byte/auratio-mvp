-- Auratio Step VII-D3 — autonomous durable AI worker wake scheduling.
-- This does not retry a Gemini evaluation/model call.
-- It only ensures unfinished durable provider jobs receive another worker invocation.

create or replace function public.svc_ai_provider_next_wake_seconds()
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_due_at timestamptz;
  v_seconds numeric;
begin
  select min(
    case
      when j.claim_token is null then j.next_action_at
      else greatest(
        j.next_action_at,
        j.claimed_at + interval '10 minutes'
      )
    end
  )
  into v_due_at
  from private.ai_provider_jobs j
  where j.state in (
    'queued',
    'initializing',
    'file_ready',
    'interaction_creating',
    'interaction_pending',
    'cleanup_pending'
  );

  if v_due_at is null then
    return null;
  end if;

  v_seconds := ceil(extract(epoch from (v_due_at - now())));

  return least(
    greatest(v_seconds::integer, 1),
    60
  );
end;
$$;

revoke execute on function public.svc_ai_provider_next_wake_seconds()
  from public, anon, authenticated;

grant execute on function public.svc_ai_provider_next_wake_seconds()
  to service_role;
