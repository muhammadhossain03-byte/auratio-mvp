-- Auratio Step VII-D4 — move the active Gemini runtime to 3.6 Flash.
--
-- Controlled TEST-provider verification established that the exact Auratio
-- multimodal evaluation workload succeeds on gemini-3.6-flash while the
-- same workload repeatedly receives provider-capacity 503 responses on
-- gemini-3.8-flash and gemini-3.7-flash.
--
-- Historical provider jobs are intentionally not rewritten. Their recorded
-- model identifiers remain truthful historical evidence.

alter table private.ai_provider_jobs
  alter column model_identifier
  set default 'gemini-3.6-flash';

create or replace function private.create_ai_provider_job_for_attempt()
returns trigger
language plpgsql
security definer
set search_path = public, private, auth
as $$
begin
  insert into private.ai_provider_jobs(
    attempt_id,
    request_id,
    evaluation_version_id,
    model_identifier
  )
  values(
    new.id,
    new.request_id,
    new.evaluation_version_id,
    'gemini-3.6-flash'
  )
  on conflict (attempt_id) do nothing;

  return new;
end;
$$;

revoke execute on function private.create_ai_provider_job_for_attempt()
  from public, anon, authenticated;
