import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { portalRoutePaths } from "../../../app/routes/routePaths";
import { portalSupabaseRuntimeMode } from "../../../foundation/integration/supabaseConfig";
import { getAdminVolunteersList } from "../data/mockAdminData";
import {
  listPersistedVolunteerDirectory,
  type PersistedVolunteerDirectoryRow,
} from "../integration/persistedAdminVolunteerDirectory";

type Row = {
  id: string;
  name: string;
  eligibility: string;
  effectiveAvailability: string;
  activeAssignments: string;
  lifecycle: string;
  destinationPath: string | null;
  actionLabel: string;
};
const persisted = (v: PersistedVolunteerDirectoryRow): Row => ({
  id: v.id,
  name: v.displayName,
  eligibility: `${v.trackCount} ${v.trackCount === 1 ? "track" : "tracks"}`,
  effectiveAvailability: v.effectiveAvailability ?? "—",
  activeAssignments: v.kind === "profile" ? String(v.activeAssignments) : "—",
  lifecycle: v.lifecycle,
  destinationPath: v.kind === "profile" ? `/admin/volunteers/${v.id}` : null,
  actionLabel:
    v.kind === "invitation"
      ? "Pending"
      : v.lifecycle === "Deactivated"
        ? "View"
        : "Open",
});
const prototype = (): Row[] =>
  getAdminVolunteersList().map((v, i) => ({
    id: `prototype-${i}-${v.name}`,
    name: v.name,
    eligibility: v.tracks,
    effectiveAvailability: v.effectiveAvailability,
    activeAssignments: v.activeAssignments,
    lifecycle: v.lifecycle,
    destinationPath: v.destinationPath,
    actionLabel: v.actionLabel,
  }));

export function AdminVolunteerEvaluatorsPage() {
  const navigate = useNavigate();
  const runtimeMode = portalSupabaseRuntimeMode();
  const [rows, setRows] = useState<Row[]>(
    runtimeMode === "prototype" ? prototype() : [],
  );
  const [loading, setLoading] = useState(runtimeMode === "configured");
  const [error, setError] = useState("");
  useEffect(() => {
    if (runtimeMode !== "configured") return;
    let active = true;
    setLoading(true);
    setError("");
    void listPersistedVolunteerDirectory()
      .then((v) => {
        if (active) setRows(v.map(persisted));
      })
      .catch((e) => {
        if (active) {
          setRows([]);
          setError(
            e instanceof Error
              ? e.message
              : "Unable to load Volunteer directory.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [runtimeMode]);

  return (
    <AdminLayout
      ariaLabel="Volunteer Evaluators"
      topbarTitle="Volunteers"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: "34px", fontSize: "32px" }}
      >
        Volunteer Evaluators
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: "78px" }}>
        Workload is visible for Admin decision support; no automatic cap is
        applied.
      </p>
      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.admin.inviteVolunteer)}
        className="auratio-admin-btn auratio-admin-btn--primary"
        style={{
          position: "absolute",
          left: "890px",
          top: "36px",
          width: "190px",
          height: "44px",
        }}
      >
        Invite Volunteer
      </button>

      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "30px",
          top: "122px",
          width: "1076px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
        }}
      >
        <div style={{ width: "312px", color: "#6B788A" }}>Status: All</div>
        <div style={{ width: "410px", color: "#6B788A" }}>
          Search name / email
        </div>
        <div style={{ color: "#6B788A" }}>
          Lifecycle: Active + Invited + Deactivated
        </div>
      </div>

      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "30px",
          top: "204px",
          width: "1076px",
          height: "388px",
          padding: "18px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "12px",
            fontWeight: 600,
            color: "#6B788A",
          }}
        >
          <div style={{ width: "212px" }}>Name</div>
          <div style={{ width: "250px" }}>Eligibility</div>
          <div style={{ width: "220px" }}>Effective availability</div>
          <div style={{ width: "170px" }}>Active assignments</div>
          <div style={{ width: "120px" }}>Lifecycle</div>
          <div style={{ width: "68px" }}>Action</div>
        </div>
        {loading ? (
          <div
            data-testid="persisted-volunteer-directory-loading"
            style={{ marginTop: "30px" }}
          >
            Loading persisted Volunteer directory…
          </div>
        ) : error ? (
          <div
            role="alert"
            data-testid="persisted-volunteer-directory-error"
            style={{ marginTop: "30px", color: "#B42318" }}
          >
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div
            data-testid="persisted-volunteer-directory-empty"
            style={{ marginTop: "30px" }}
          >
            No persisted Volunteer account or pending Volunteer invitation
            exists yet.
          </div>
        ) : (
          rows.map((v, i) => (
            <div
              key={v.id}
              data-testid={`volunteer-directory-row-${v.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                height: "48px",
                marginTop: "12px",
                borderTop: i ? "1px solid #DCE3ED" : "none",
                paddingTop: i ? "10px" : 0,
              }}
            >
              <div style={{ width: "212px" }}>{v.name}</div>
              <div style={{ width: "250px" }}>{v.eligibility}</div>
              <div style={{ width: "220px" }}>{v.effectiveAvailability}</div>
              <div style={{ width: "170px", fontWeight: 600 }}>
                {v.activeAssignments}
              </div>
              <div style={{ width: "120px" }}>{v.lifecycle}</div>
              <div style={{ width: "68px" }}>
                {v.destinationPath ? (
                  <button
                    type="button"
                    onClick={() => navigate(v.destinationPath!)}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      color: "#256EA5",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {v.actionLabel}
                  </button>
                ) : (
                  <span style={{ color: "#6B788A" }}>{v.actionLabel}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "30px",
          top: "624px",
          width: "1076px",
          height: "124px",
          padding: "18px",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 600 }}>
          Workload boundary
        </div>
        <div style={{ marginTop: "14px", color: "#4E5968" }}>
          Configured runtime shows persisted accounts, Track eligibility, and
          assignment counts. Availability is “—” until a persisted availability
          state exists.
        </div>
      </div>
    </AdminLayout>
  );
}
