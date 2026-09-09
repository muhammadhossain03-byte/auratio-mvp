import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://auratio.cloud",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://auratio.cloud",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function respond(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function callbackOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  return allowedOrigins.has(origin) ? origin : "https://auratio.cloud";
}

function validTrackIds(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.every((entry) =>
      typeof entry === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry)
    );
}

async function isActiveSuperAdmin(
  service: ReturnType<typeof createClient>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await service
    .from("profiles")
    .select("role,account_status")
    .eq("user_id", userId)
    .maybeSingle();

  return !error &&
    data?.role === "super_admin" &&
    data?.account_status === "active";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return respond(req, 405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return respond(req, 500, { error: "server_configuration_error" });

  const authHeader = req.headers.get("Authorization") ?? "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");
  if (!accessToken) return respond(req, 401, { error: "authentication_required" });

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await service.auth.getUser(accessToken);
  const actor = authData.user;
  if (authError || !actor) return respond(req, 401, { error: "invalid_session" });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return respond(req, 400, { error: "invalid_json" });
  }

  const action = payload.action;
  if (typeof action !== "string") return respond(req, 400, { error: "action_required" });

  try {
    if (
      action === "list_admin_accounts" ||
      action === "get_admin_account" ||
      action === "update_admin_display_name"
    ) {
      if (!(await isActiveSuperAdmin(service, actor.id))) {
        return respond(req, 403, { error: "super_admin_required" });
      }
    }

    if (action === "list_admin_accounts") {
      const { data: profileRows, error: profileError } = await service
        .from("profiles")
        .select("user_id,display_name,role,account_status,is_root_super_admin,created_at")
        .in("role", ["admin", "super_admin"]);

      if (profileError) {
        return respond(req, 500, { error: "staff_profile_list_failed" });
      }

      const { data: authPage, error: authListError } =
        await service.auth.admin.listUsers({ page: 1, perPage: 1000 });

      if (authListError) {
        return respond(req, 500, { error: "staff_auth_list_failed" });
      }

      const emailByUserId = new Map(
        authPage.users.map((user) => [user.id, user.email ?? ""]),
      );

      const profileAccounts = (profileRows ?? [])
        .filter((row) => row.role === "admin" || row.is_root_super_admin === true)
        .map((row) => ({
          id: row.user_id,
          kind: "profile",
          display_name: row.display_name,
          email: emailByUserId.get(row.user_id) ?? "",
          account_type: row.is_root_super_admin ? "Super Admin" : "Admin",
          status: row.account_status === "active" ? "Active" : "Deactivated",
          is_root: row.is_root_super_admin === true,
          created_at: row.created_at,
        }))
        .filter((row) => row.email !== "");

      const { data: invitations, error: invitationError } = await service
        .from("staff_invitations")
        .select("id,email,display_name,status,expires_at,created_at")
        .eq("target_role", "admin")
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString());

      if (invitationError) {
        return respond(req, 500, { error: "staff_invitation_list_failed" });
      }

      const pendingAccounts = (invitations ?? []).map((row) => ({
        id: `invite_${row.id}`,
        kind: "invitation",
        display_name: row.display_name ?? row.email,
        email: row.email,
        account_type: "Admin",
        status: "Invited",
        is_root: false,
        created_at: row.created_at,
      }));

      return respond(req, 200, {
        ok: true,
        accounts: [...profileAccounts, ...pendingAccounts],
      });
    }

    if (action === "get_admin_account") {
      const accountId =
        typeof payload.account_id === "string" ? payload.account_id.trim() : "";

      if (!accountId) {
        return respond(req, 400, { error: "account_id_required" });
      }

      if (accountId === "root") {
        const { data: rootProfile, error: rootError } = await service
          .from("profiles")
          .select("user_id,display_name,role,account_status,is_root_super_admin,created_at")
          .eq("is_root_super_admin", true)
          .maybeSingle();

        if (rootError) {
          return respond(req, 500, { error: "root_profile_lookup_failed" });
        }
        if (!rootProfile) {
          return respond(req, 200, { ok: false, error: "account_not_found" });
        }

        const { data: rootAuth, error: rootAuthError } =
          await service.auth.admin.getUserById(rootProfile.user_id);

        if (rootAuthError || !rootAuth.user?.email) {
          return respond(req, 500, { error: "root_auth_lookup_failed" });
        }

        return respond(req, 200, {
          ok: true,
          account: {
            id: rootProfile.user_id,
            kind: "profile",
            display_name: rootProfile.display_name,
            email: rootAuth.user.email,
            account_type: "Super Admin",
            status:
              rootProfile.account_status === "active" ? "Active" : "Deactivated",
            is_root: true,
            created_at: rootProfile.created_at,
          },
        });
      }

      if (accountId.startsWith("invite_")) {
        const invitationId = accountId.replace(/^invite_/, "");
        if (!isUuid(invitationId)) {
          return respond(req, 400, { error: "valid_invitation_id_required" });
        }

        const { data: invitation, error: invitationError } = await service
          .from("staff_invitations")
          .select("id,email,display_name,status,expires_at,created_at")
          .eq("id", invitationId)
          .eq("target_role", "admin")
          .maybeSingle();

        if (invitationError) {
          return respond(req, 500, { error: "staff_invitation_lookup_failed" });
        }
        if (
          !invitation ||
          invitation.status !== "pending" ||
          new Date(invitation.expires_at).getTime() <= Date.now()
        ) {
          return respond(req, 200, { ok: false, error: "account_not_found" });
        }

        return respond(req, 200, {
          ok: true,
          account: {
            id: `invite_${invitation.id}`,
            kind: "invitation",
            display_name: invitation.display_name ?? invitation.email,
            email: invitation.email,
            account_type: "Admin",
            status: "Invited",
            is_root: false,
            created_at: invitation.created_at,
          },
        });
      }

      if (!isUuid(accountId)) {
        return respond(req, 400, { error: "valid_account_id_required" });
      }

      const { data: profile, error: profileError } = await service
        .from("profiles")
        .select("user_id,display_name,role,account_status,is_root_super_admin,created_at")
        .eq("user_id", accountId)
        .maybeSingle();

      if (profileError) {
        return respond(req, 500, { error: "staff_profile_lookup_failed" });
      }
      if (
        !profile ||
        (profile.role !== "admin" && profile.is_root_super_admin !== true)
      ) {
        return respond(req, 200, { ok: false, error: "account_not_found" });
      }

      const { data: authUser, error: authUserError } =
        await service.auth.admin.getUserById(profile.user_id);

      if (authUserError || !authUser.user?.email) {
        return respond(req, 500, { error: "staff_auth_lookup_failed" });
      }

      return respond(req, 200, {
        ok: true,
        account: {
          id: profile.user_id,
          kind: "profile",
          display_name: profile.display_name,
          email: authUser.user.email,
          account_type: profile.is_root_super_admin ? "Super Admin" : "Admin",
          status: profile.account_status === "active" ? "Active" : "Deactivated",
          is_root: profile.is_root_super_admin === true,
          created_at: profile.created_at,
        },
      });
    }

    if (action === "update_admin_display_name") {
      const accountId =
        typeof payload.account_id === "string" ? payload.account_id.trim() : "";
      const displayName =
        typeof payload.display_name === "string"
          ? payload.display_name.trim()
          : "";

      if (!isUuid(accountId)) {
        return respond(req, 400, { error: "valid_account_id_required" });
      }
      if (displayName.length < 2 || displayName.length > 80) {
        return respond(req, 400, { error: "valid_display_name_required" });
      }

      const { data: target, error: targetError } = await service
        .from("profiles")
        .select("user_id,role,is_root_super_admin")
        .eq("user_id", accountId)
        .maybeSingle();

      if (targetError) {
        return respond(req, 500, { error: "staff_profile_lookup_failed" });
      }
      if (!target || target.role !== "admin" || target.is_root_super_admin === true) {
        return respond(req, 403, { error: "ordinary_admin_required" });
      }

      const { error: updateError } = await service
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", accountId);

      if (updateError) {
        return respond(req, 500, { error: "staff_profile_update_failed" });
      }

      const { error: auditError } = await service.from("audit_log").insert({
        actor_user_id: actor.id,
        action: "staff.admin.display_name.updated",
        entity_type: "profile",
        entity_id: accountId,
        metadata: { display_name: displayName },
      });

      if (auditError) {
        return respond(req, 500, { error: "staff_profile_audit_failed" });
      }

      return respond(req, 200, { ok: true });
    }

    if (action === "create_invitation") {
      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
      const displayName = typeof payload.display_name === "string" ? payload.display_name.trim() : "";
      const targetRole = payload.target_role;
      const trackIds = payload.track_ids ?? [];

      if (!email || !email.includes("@")) return respond(req, 400, { error: "valid_email_required" });
      if (displayName.length < 2 || displayName.length > 80) return respond(req, 400, { error: "valid_display_name_required" });
      if (targetRole !== "admin" && targetRole !== "volunteer") return respond(req, 400, { error: "invalid_target_role" });
      if (!validTrackIds(trackIds)) return respond(req, 400, { error: "invalid_track_ids" });
      if (targetRole === "volunteer" && trackIds.length < 1) return respond(req, 400, { error: "volunteer_tracks_required" });
      if (targetRole === "admin" && trackIds.length !== 0) return respond(req, 400, { error: "admin_tracks_not_allowed" });

      const { data, error } = await service.rpc("svc_staff_create_invitation_v2", {
        p_actor_user_id: actor.id,
        p_email: email,
        p_target_role: targetRole,
        p_display_name: displayName,
        p_track_ids: trackIds,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });

      const row = Array.isArray(data) ? data[0] : data;
      const invitationId = row?.invitation_id;
      const invitationToken = row?.invitation_token;
      const expiresAt = row?.invitation_expires_at;
      if (
        typeof invitationId !== "string" ||
        typeof invitationToken !== "string" ||
        !/^[0-9a-f]{64}$/.test(invitationToken)
      ) return respond(req, 500, { error: "invalid_invitation_result" });

      const redirect = new URL("/auth/staff-invitation", callbackOrigin(req));
      redirect.searchParams.set("token", invitationToken);

      const { error: emailError } = await service.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirect.toString(),
          data: { display_name: displayName },
        },
      });

      if (emailError) {
        await service.rpc("svc_staff_revoke_invitation", {
          p_actor_user_id: actor.id,
          p_invitation_id: invitationId,
        });
        return respond(req, 502, {
          error: "invitation_email_failed",
          message: "The invitation could not be emailed.",
        });
      }

      return respond(req, 200, {
        ok: true,
        invitation_id: invitationId,
        expires_at: expiresAt,
        email_sent: true,
      });
    }

    if (action === "revoke_invitation") {
      if (!isUuid(payload.invitation_id)) return respond(req, 400, { error: "valid_invitation_id_required" });
      const { data, error } = await service.rpc("svc_staff_revoke_invitation", {
        p_actor_user_id: actor.id,
        p_invitation_id: payload.invitation_id,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      return respond(req, 200, data);
    }

    if (action === "expire_invitations") {
      const { data, error } = await service.rpc("svc_staff_expire_invitations", {
        p_actor_user_id: actor.id,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      return respond(req, 200, { ok: true, expired_count: data ?? 0 });
    }

    if (action === "set_account_status") {
      if (!isUuid(payload.user_id)) return respond(req, 400, { error: "valid_user_id_required" });
      if (payload.status !== "active" && payload.status !== "disabled") return respond(req, 400, { error: "invalid_account_status" });
      const { data, error } = await service.rpc("svc_staff_set_account_status", {
        p_actor_user_id: actor.id,
        p_user_id: payload.user_id,
        p_status: payload.status,
      });
      if (error) return respond(req, 403, { error: "staff_operation_rejected", message: error.message });
      return respond(req, 200, data);
    }

    return respond(req, 400, { error: "unsupported_action" });
  } catch {
    return respond(req, 500, { error: "unexpected_server_error" });
  }
});
