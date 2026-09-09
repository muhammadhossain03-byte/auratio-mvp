-- Auratio Step VII-E2G1 — test-backend security/performance hardening.
--
-- This migration is repository-authoritative and is intended to be proven in
-- the persistent TEST Supabase project before any later production sync.

-- ---------------------------------------------------------------------------
-- 1. Defense in depth for private orchestration tables.
-- These tables are service-boundary state only. Keep client roles without
-- table privileges and enable RLS so a future accidental grant still does not
-- silently expose rows.
-- ---------------------------------------------------------------------------

alter table private.ai_evaluation_attempts enable row level security;
alter table private.ai_provider_jobs enable row level security;
alter table private.report_generation_claims enable row level security;

revoke all privileges on table private.ai_evaluation_attempts from public;
revoke all privileges on table private.ai_evaluation_attempts from anon, authenticated;

revoke all privileges on table private.ai_provider_jobs from public;
revoke all privileges on table private.ai_provider_jobs from anon, authenticated;

revoke all privileges on table private.report_generation_claims from public;
revoke all privileges on table private.report_generation_claims from anon, authenticated;

-- Reassert the exact accepted server-only privileges after the defensive revoke.
grant select, insert, update
on table private.ai_evaluation_attempts
to service_role;

grant select, insert, update
on table private.ai_provider_jobs
to service_role;

grant select, insert, update, delete
on table private.report_generation_claims
to service_role;

-- ---------------------------------------------------------------------------
-- 2. Explicit fail-closed RLS policy for invitation Track rows.
-- The table intentionally has no client table privileges. The explicit false
-- policy also keeps it fail-closed if a client grant is ever added by mistake.
-- ---------------------------------------------------------------------------

drop policy if exists staff_invitation_tracks_no_client_access
on public.staff_invitation_tracks;

create policy staff_invitation_tracks_no_client_access
on public.staff_invitation_tracks
for all
to anon, authenticated
using (false)
with check (false);

-- ---------------------------------------------------------------------------
-- 3. RLS init-plan hardening for Volunteer Track eligibility reads.
-- ---------------------------------------------------------------------------

drop policy if exists volunteer_track_eligibility_read_staff_or_self
on public.volunteer_track_eligibility;

create policy volunteer_track_eligibility_read_staff_or_self
on public.volunteer_track_eligibility
for select
to authenticated
using (
  volunteer_user_id = (select auth.uid())
  or exists (
    select 1
    from public.profiles actor
    where actor.user_id = (select auth.uid())
      and actor.account_status = 'active'
      and actor.role in (
        'admin'::public.app_role,
        'super_admin'::public.app_role
      )
  )
);

-- ---------------------------------------------------------------------------
-- 4. Cover the two FK paths reported by the Supabase performance advisor.
-- ---------------------------------------------------------------------------

create index if not exists staff_invitation_tracks_track_idx
on public.staff_invitation_tracks(track_id, invitation_id);

create index if not exists volunteer_track_eligibility_granted_by_idx
on public.volunteer_track_eligibility(granted_by);
