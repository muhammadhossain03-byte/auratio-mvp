import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalRoutePaths } from "../../../app/routes/routePaths";
import { VolunteerLayout } from "../components/VolunteerLayout";
import {
  loadPersistedVolunteerAvailability,
  setPersistedVolunteerAvailability,
  type PersistedVolunteerAvailability,
} from "../integration/persistedVolunteerAvailability";

export function PersistedVolunteerAvailabilityPage() {
  const navigate = useNavigate();
  const [availability, setAvailability] =
    useState<PersistedVolunteerAvailability | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void loadPersistedVolunteerAvailability()
      .then((value) => {
        if (active) setAvailability(value);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load Volunteer availability.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateAvailability(next: PersistedVolunteerAvailability) {
    if (saving || availability === next) return;
    setSaving(true);
    setError("");
    try {
      const persisted = await setPersistedVolunteerAvailability(next);
      setAvailability(persisted);
      navigate(
        persisted === "Available"
          ? portalRoutePaths.volunteer.availability
          : portalRoutePaths.volunteer.availabilityUnavailable,
        { replace: true },
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update Volunteer availability.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isAvailable = availability === "Available";
  const statusClass = isAvailable ? "available" : "unavailable";

  return (
    <VolunteerLayout
      ariaLabel="My Availability"
      topbarTitle="Availability"
      activeNav="availability"
    >
      <h2 className="auratio-volunteer-page-title">My Availability</h2>
      <p className="auratio-volunteer-page-subtitle">
        Set whether you are currently available to receive Human Evaluation
        work.
      </p>

      {availability && (
        <div
          data-testid="persisted-volunteer-availability-pill"
          className={`auratio-volunteer-pill auratio-volunteer-pill--${statusClass}`}
          style={{
            position: "absolute",
            left: "930px",
            top: "36px",
            width: "140px",
            height: "34px",
          }}
        >
          {availability}
        </div>
      )}

      <div
        className="auratio-volunteer-panel"
        style={{ left: "30px", top: "124px", width: "620px", height: "300px" }}
      >
        <h3 className="auratio-volunteer-panel-title">
          Volunteer-declared status
        </h3>
        {!availability ? (
          <p style={{ position: "absolute", left: "18px", top: "72px" }}>
            Loading persisted availability…
          </p>
        ) : (
          <>
            <div
              className={`auratio-volunteer-pill auratio-volunteer-pill--${statusClass}`}
              style={{
                position: "absolute",
                left: "18px",
                top: "72px",
                width: "150px",
                height: "34px",
              }}
            >
              {availability}
            </div>
            <p
              style={{
                position: "absolute",
                left: "18px",
                top: "126px",
                width: "550px",
                margin: 0,
              }}
            >
              Only you can change your availability while your Volunteer account
              is active.
            </p>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void updateAvailability(
                  isAvailable ? "Unavailable" : "Available",
                )
              }
              className="auratio-volunteer-btn auratio-volunteer-btn--primary"
              style={{
                position: "absolute",
                left: "18px",
                top: "190px",
                width: "190px",
                height: "44px",
              }}
            >
              {saving
                ? "Saving…"
                : isAvailable
                  ? "Set Unavailable"
                  : "Set Available"}
            </button>
          </>
        )}
        {error && (
          <p
            role="alert"
            data-testid="persisted-volunteer-availability-error"
            style={{
              position: "absolute",
              left: "18px",
              top: "244px",
              color: "#B42318",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{ left: "680px", top: "124px", width: "426px", height: "300px" }}
      >
        <h3 className="auratio-volunteer-panel-title">Who can see this?</h3>
        <p
          style={{
            position: "absolute",
            left: "18px",
            top: "64px",
            width: "380px",
            margin: 0,
          }}
        >
          Admins and Super Admins can see your current availability when making
          Human Evaluation assignment decisions.
        </p>
        <p
          style={{
            position: "absolute",
            left: "18px",
            top: "124px",
            width: "380px",
            margin: 0,
          }}
        >
          They cannot change or override your availability.
        </p>
      </div>

      <div
        className="auratio-volunteer-panel"
        style={{ left: "30px", top: "458px", width: "1076px", height: "150px" }}
      >
        <h3 className="auratio-volunteer-panel-title">What this changes</h3>
        <p
          style={{
            position: "absolute",
            left: "18px",
            top: "58px",
            width: "1010px",
            margin: 0,
          }}
        >
          Your availability is a read-only decision signal for Admins and Super
          Admins. It does not change your authorized Tracks or create a workload
          cap.
        </p>
      </div>
    </VolunteerLayout>
  );
}
