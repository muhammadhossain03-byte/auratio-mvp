-- Auratio Step VI-A — move privileged staff command surface to authenticated Edge Functions.
-- Database keeps structural hardening; no signed-in client can execute SECURITY DEFINER staff RPCs directly.
drop function if exists public.staff_create_invitation(text, public.app_role);
drop function if exists public.staff_accept_invitation(text);
drop function if exists public.staff_revoke_invitation(uuid);
drop function if exists public.staff_expire_invitations();
drop function if exists public.staff_set_account_status(uuid, public.account_status);
