import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { portalRoutePaths } from "../../../app/routes/routePaths";
import {
  getPersistedVolunteerAccount,
  type PersistedVolunteerAccount,
} from "../integration/persistedAdminVolunteerDirectory";

export function PersistedAdminVolunteerAccountPage() {
  const navigate = useNavigate();
  const { volunteerId = "" } = useParams<{ volunteerId?: string }>();
  const [volunteer, setVolunteer] = useState<PersistedVolunteerAccount | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getPersistedVolunteerAccount(volunteerId)
      .then((value) => {
        if (!active) return;
        if (!value) {
          navigate(portalRoutePaths.admin.volunteers, { replace: true });
          return;
        }
        setVolunteer(value);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load Volunteer account.",
          );
      });
    return () => {
      active = false;
    };
  }, [navigate, volunteerId]);

  if (error) {
    return (
      <AdminLayout
        ariaLabel="Volunteer Account"
        topbarTitle="Volunteer Account"
        activeNav="volunteers"
        topbarRightVariant="pill"
      >
        <div
          role="alert"
          data-testid="persisted-volunteer-account-error"
          style={{
            position: "absolute",
            left: "30px",
            top: "64px",
            color: "#B42318",
          }}
        >
          {error}
        </div>
      </AdminLayout>
    );
  }
  if (!volunteer) {
    return (
      <AdminLayout
        ariaLabel="Volunteer Account"
        topbarTitle="Volunteer Account"
        activeNav="volunteers"
        topbarRightVariant="pill"
      >
        <div
          data-testid="persisted-volunteer-account-loading"
          style={{ position: "absolute", left: "30px", top: "64px" }}
        >
          Loading persisted Volunteer account…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      ariaLabel="Volunteer Account"
      topbarTitle="Volunteer Account"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: "34px", fontSize: "32px" }}
      >
        {volunteer.displayName}
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: "78px" }}>
        {volunteer.lifecycle} Volunteer Evaluator account
      </p>
      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "30px",
          top: "124px",
          width: "610px",
          height: "470px",
          padding: "18px",
        }}
      >
        <h3>Account & authorization</h3>
        <p>
          <strong>Display name:</strong> {volunteer.displayName}
        </p>
        <p>
          <strong>Email / auth identity:</strong> {volunteer.email}
        </p>
        <p>
          <strong>Role:</strong> Volunteer Evaluator
        </p>
        <p>
          <strong>Authorized tracks:</strong>{" "}
          {volunteer.tracks.length
            ? volunteer.tracks.map((t) => t.name).join(" • ")
            : "0 tracks"}
        </p>
        <button
          type="button"
          className="auratio-admin-btn auratio-admin-btn--secondary"
          onClick={() => navigate(portalRoutePaths.admin.volunteers)}
        >
          Back
        </button>
      </div>
      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "670px",
          top: "124px",
          width: "436px",
          height: "470px",
          padding: "18px",
        }}
      >
        <h3>Operational state</h3>
        <p>
          <strong>Lifecycle:</strong> {volunteer.lifecycle}
        </p>
        <p>
          <strong>Active assignments:</strong> {volunteer.activeAssignments}
        </p>
        <p>
          <strong>Volunteer-declared availability:</strong> —
        </p>
        <p>
          <strong>Effective availability:</strong> —
        </p>
        <p style={{ color: "#6B788A" }}>
          Availability is not synthesized from prototype data.
        </p>
      </div>
    </AdminLayout>
  );
}
