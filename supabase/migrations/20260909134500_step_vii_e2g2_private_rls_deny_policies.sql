-- Auratio Step VII-E2G2 — explicit fail-closed policies for private service tables.
--
-- RLS is already enabled on these private orchestration tables. This migration
-- adds explicit deny policies for client roles so the Supabase security advisor
-- no longer reports "RLS enabled with no policy", while service_role retains
-- the accepted server-only table privileges and bypass-RLS behavior.

drop policy if exists ai_evaluation_attempts_no_client_access
on private.ai_evaluation_attempts;

create policy ai_evaluation_attempts_no_client_access
on private.ai_evaluation_attempts
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists ai_provider_jobs_no_client_access
on private.ai_provider_jobs;

create policy ai_provider_jobs_no_client_access
on private.ai_provider_jobs
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists report_generation_claims_no_client_access
on private.report_generation_claims;

create policy report_generation_claims_no_client_access
on private.report_generation_claims
for all
to anon, authenticated
using (false)
with check (false);
