import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerDeclineAssignmentPage() {
  const navigate = useNavigate()
  const [reason, setReason] = useState('Scheduling conflict / cannot review in time…')

  function handleConfirmDecline() {
    navigate(portalRoutePaths.volunteer.activeAssignmentsAfterDecline)
  }

  function handleCancel() {
    navigate(portalRoutePaths.volunteer.assignedTask)
  }

  return (
    <VolunteerLayout
      ariaLabel="Decline Assignment"
      topbarTitle="Human Evaluation Assignment"
      activeNav="assignments"
    >
      <h2
        className="auratio-volunteer-page-title"
        style={{ width: '760px' }}
      >
        Decline Human Evaluation assignment
      </h2>
      <p
        className="auratio-volunteer-page-subtitle"
        style={{ width: '650px' }}
      >
        SUB-8821 • short reason required
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
        style={{
          position: 'absolute',
          left: '920px',
          top: '36px',
          width: '150px',
          height: '34px',
        }}
      >
        Assigned
      </div>

      {/* Panel 1: Assignment context */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '124px',
          width: '1076px',
          height: '180px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Assignment context</h3>

        {/* Row 1 */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '68px',
            width: '190px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Submission ID
        </span>
        <span
          style={{
            position: 'absolute',
            left: '224px',
            top: '68px',
            width: '280px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          SUB-8821
        </span>

        <span
          style={{
            position: 'absolute',
            left: '520px',
            top: '68px',
            width: '160px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Selected track
        </span>
        <span
          style={{
            position: 'absolute',
            left: '696px',
            top: '68px',
            width: '340px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Business Pitch / Sales Pitch
        </span>

        {/* Row 2 */}
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '122px',
            width: '170px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Assignment Status
        </span>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--assigned"
          style={{
            position: 'absolute',
            left: '205px',
            top: '114px',
            width: '150px',
            height: '34px',
          }}
        >
          Assigned
        </div>

        <span
          style={{
            position: 'absolute',
            left: '520px',
            top: '122px',
            width: '170px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          Publication Status
        </span>
        <div
          className="auratio-volunteer-pill auratio-volunteer-pill--processing"
          style={{
            position: 'absolute',
            left: '710px',
            top: '114px',
            width: '160px',
            height: '34px',
          }}
        >
          Processing
        </div>
      </div>

      {/* Panel 2: Decline assignment callout */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '336px',
          width: '1076px',
          height: '224px',
          backgroundColor: 'var(--auratio-amber-50)',
          border: '1px solid var(--auratio-neutral-200)',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-amber-700)',
          }}
        >
          Decline assignment
        </div>

        <div
          style={{
            marginTop: '16px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: 'var(--auratio-amber-700)',
          }}
        >
          Short reason
        </div>

        <div
          style={{
            marginTop: '12px',
            width: '1040px',
            height: '62px',
            backgroundColor: 'var(--auratio-surface-default)',
            border: '1px solid var(--auratio-neutral-300)',
            borderRadius: '10px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
          }}
        >
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: '100%',
              border: 0,
              outline: 'none',
              fontFamily: 'var(--auratio-font-family-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: 'var(--auratio-neutral-500)',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        <div
          style={{
            marginTop: '18px',
            width: '1010px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-amber-700)',
          }}
        >
          Effect of Decline: this attempt closes; active ownership is removed; the request returns to Unassigned for Admin action.
        </div>
      </div>

      {/* Action Buttons */}
      <button
        type="button"
        onClick={handleConfirmDecline}
        className="auratio-volunteer-btn auratio-volunteer-btn--primary"
        style={{
          position: 'absolute',
          left: '30px',
          top: '602px',
          width: '190px',
          height: '44px',
        }}
      >
        Confirm Decline
      </button>

      <button
        type="button"
        onClick={handleCancel}
        className="auratio-volunteer-btn auratio-volunteer-btn--secondary"
        style={{
          position: 'absolute',
          left: '238px',
          top: '602px',
          width: '130px',
          height: '44px',
        }}
      >
        Cancel
      </button>

      {/* Footnote */}
      <p
        style={{
          position: 'absolute',
          left: '30px',
          top: '668px',
          width: '980px',
          margin: 0,
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '18px',
          color: 'var(--auratio-neutral-500)',
        }}
      >
        Decline action + reason remain auditable. Decline does not create a publication decision or score.
      </p>
    </VolunteerLayout>
  )
}
