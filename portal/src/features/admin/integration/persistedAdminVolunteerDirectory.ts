import { getPortalSupabaseClient } from "../../../foundation/integration/supabaseClient";

export type PersistedVolunteerDirectoryRow = {
  id: string;
  kind: "profile" | "invitation";
  displayName: string;
  email: string;
  trackCount: number;
  effectiveAvailability: string | null;
  activeAssignments: number;
  lifecycle: "Active" | "Deactivated" | "Invited";
};

function parseRow(raw: unknown): PersistedVolunteerDirectoryRow {
  if (!raw || typeof raw !== "object")
    throw new Error("Invalid Volunteer directory response.");
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== "string" ||
    (r.kind !== "profile" && r.kind !== "invitation") ||
    typeof r.display_name !== "string" ||
    typeof r.email !== "string" ||
    typeof r.track_count !== "number" ||
    typeof r.active_assignments !== "number" ||
    (r.lifecycle !== "Active" &&
      r.lifecycle !== "Deactivated" &&
      r.lifecycle !== "Invited")
  ) {
    throw new Error("Invalid Volunteer directory response.");
  }
  return {
    id: r.id,
    kind: r.kind,
    displayName: r.display_name,
    email: r.email,
    trackCount: r.track_count,
    effectiveAvailability:
      typeof r.effective_availability === "string"
        ? r.effective_availability
        : null,
    activeAssignments: r.active_assignments,
    lifecycle: r.lifecycle,
  };
}

export async function listPersistedVolunteerDirectory(): Promise<
  PersistedVolunteerDirectoryRow[]
> {
  const client = getPortalSupabaseClient();
  const { data, error } = await client.functions.invoke("staff-admin", {
    body: { action: "list_volunteer_accounts" },
  });
  if (error || !data || typeof data !== "object")
    throw new Error("Volunteer directory service is unavailable.");
  const p = data as Record<string, unknown>;
  if (p.ok !== true || !Array.isArray(p.volunteers))
    throw new Error("Unable to load persisted Volunteer accounts.");
  return p.volunteers.map(parseRow);
}

export type PersistedVolunteerAccount = {
  id: string;
  displayName: string;
  email: string;
  lifecycle: "Active" | "Deactivated";
  tracks: { id: string; name: string }[];
  activeAssignments: number;
};

export async function getPersistedVolunteerAccount(
  volunteerUserId: string,
): Promise<PersistedVolunteerAccount | null> {
  const client = getPortalSupabaseClient();
  const { data, error } = await client.functions.invoke("staff-admin", {
    body: { action: "get_volunteer_account", user_id: volunteerUserId },
  });
  if (error || !data || typeof data !== "object") {
    throw new Error("Volunteer account service is unavailable.");
  }
  const p = data as Record<string, unknown>;
  if (p.ok !== true) {
    if (p.error === "volunteer_not_found") return null;
    throw new Error("Unable to load persisted Volunteer account.");
  }
  const raw = p.volunteer;
  if (!raw || typeof raw !== "object")
    throw new Error("Invalid Volunteer account response.");
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== "string" ||
    typeof r.display_name !== "string" ||
    typeof r.email !== "string" ||
    (r.lifecycle !== "Active" && r.lifecycle !== "Deactivated") ||
    !Array.isArray(r.tracks) ||
    typeof r.active_assignments !== "number"
  )
    throw new Error("Invalid Volunteer account response.");

  const tracks = r.tracks.map((item) => {
    if (!item || typeof item !== "object")
      throw new Error("Invalid Volunteer Track response.");
    const t = item as Record<string, unknown>;
    if (typeof t.id !== "string" || typeof t.name !== "string")
      throw new Error("Invalid Volunteer Track response.");
    return { id: t.id, name: t.name };
  });

  return {
    id: r.id,
    displayName: r.display_name,
    email: r.email,
    lifecycle: r.lifecycle,
    tracks,
    activeAssignments: r.active_assignments,
  };
}
