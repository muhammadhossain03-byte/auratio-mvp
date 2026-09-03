import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerAvailabilityUnavailablePage() {
  const navigate = useNavigate()

  function handleSetAvailable() {
    navigate(portalRoutePaths.volunteer.availability)
  }

  return (
    <VolunteerLayout
      ariaLabel="My Availability Unavailable"
      topbarTitle="Availability"
      activeNav="availability"
    >
      <h2 className="auratio-volunteer-page-title">My Availability</h2>
      <p className="auratio-volunteer-page-subtitle">
        Set whether you are currently available to receive Human Evaluation work.
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--unavailable"
        style={{
          position: 'absolute',
          left: '930px',
          top: '36px',
          width: '140px',
          height: '34px',
        }}
      >
        Unavailable
      </div>

      {/* Left Column: Volunteer-declared status */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '124px',
          width: '620px',
          height: '300px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Volunteer-declared status</h3>

        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '60px',
            width: '200px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Current status
        </span>

        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--unavailable"
          style={{
            position: 'absolute',
            left: '18px',
            top: '88px',
            width: '150px',
            height: '34px',
          }}
        >
          Unavailable
        </div>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '144px',
            width: '550px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          You may change your own availability at any time while your volunteer account is active.
        </p>

        <button
          type="button"
          onClick={handleSetAvailable}
          className="auratio-volunteer-btn auratio-volunteer-btn--primary"
          style={{
            position: 'absolute',
            left: '18px',
            top: '198px',
            width: '190px',
            height: '44px',
          }}
        >
          Set Available
        </button>
      </div>

      {/* Right Column: Effective availability */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '680px',
          top: '124px',
          width: '426px',
          height: '300px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Effective availability</h3>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '64px',
            width: '380px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Effective status: Unavailable
        </p>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '104px',
            width: '380px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          No Admin override is currently applied.
        </p>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '144px',
            width: '370px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Track eligibility and active workload are separate operational signals.
        </p>
      </div>

      {/* Bottom Panel: What this changes */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '458px',
          width: '1076px',
          height: '150px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">What this changes</h3>
        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '58px',
            width: '1010px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Your availability is one of the signals Admins use when assigning Human Evaluation requests. This control does not change your authorized tracks or create a workload cap.
        </p>
      </div>
    </VolunteerLayout>
  )
}
