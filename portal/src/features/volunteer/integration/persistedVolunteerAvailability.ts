import { getPortalSupabaseClient } from "../../../foundation/integration/supabaseClient";

export type PersistedVolunteerAvailability = "Available" | "Unavailable";

function parseAvailability(data: unknown): PersistedVolunteerAvailability {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid Volunteer availability response.");
  }
  const payload = data as Record<string, unknown>;
  if (
    payload.ok !== true ||
    (payload.availability !== "Available" &&
      payload.availability !== "Unavailable")
  ) {
    throw new Error("Invalid Volunteer availability response.");
  }
  return payload.availability;
}

export async function loadPersistedVolunteerAvailability(): Promise<PersistedVolunteerAvailability> {
  const client = getPortalSupabaseClient();
  const { data, error } = await client.rpc("svc_volunteer_get_availability");
  if (error)
    throw new Error(error.message || "Unable to load Volunteer availability.");
  return parseAvailability(data);
}

export async function setPersistedVolunteerAvailability(
  availability: PersistedVolunteerAvailability,
): Promise<PersistedVolunteerAvailability> {
  const client = getPortalSupabaseClient();
  const { data, error } = await client.rpc("svc_volunteer_set_availability", {
    p_status: availability.toLowerCase(),
  });
  if (error)
    throw new Error(
      error.message || "Unable to update Volunteer availability.",
    );
  return parseAvailability(data);
}
