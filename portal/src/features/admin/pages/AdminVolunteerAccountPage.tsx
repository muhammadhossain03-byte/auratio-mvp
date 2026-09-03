import { useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getFarhanaAvailabilityState, getFarhanaTrackEligibility, getAdminVolunteerById } from '../data/mockAdminData'

export function AdminVolunteerAccountPage() {
  const navigate = useNavigate()
  const { volunteerId } = useParams<{ volunteerId?: string }>()
  const volunteer = getAdminVolunteerById(volunteerId || 'farhana')
  const isFarhana = !volunteerId || volunteerId === 'farhana'
  const farhanaState = getFarhanaAvailabilityState()
  const farhanaTracks = getFarhanaTrackEligibility()

  const displayName = isFarhana ? 'Farhana Islam' : (volunteer?.name || 'Volunteer Evaluator')
  const lifecycle = isFarhana ? 'Active' : (volunteer?.lifecycle || 'Invited')
  const effectiveAvailability = isFarhana ? farhanaState.effectiveAvailability : (volunteer?.effectiveAvailability || 'Available')
  const overrideReason = isFarhana ? farhanaState.overrideReason : 'None'
  const tracksDisplay = isFarhana ? farhanaTracks.join(' • ') : (volunteer?.tracks || '0 tracks')

  return (
    <AdminLayout
      ariaLabel="Volunteer Account"
      topbarTitle="Volunteer Account"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        {displayName}
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        {`${lifecycle} Volunteer Evaluator account`}
      </p>

      {/* Top right pill */}
      <div
        className={`auratio-admin-status-pill auratio-admin-status-pill--${lifecycle.toLowerCase()}`}
        style={{
          position: 'absolute',
          left: '940px',
          top: '36px',
          width: '130px',
          height: '34px',
          borderRadius: '17px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        {lifecycle}
      </div>

      {/* Left Card: Account & authorization */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '124px',
          width: '610px',
          height: '470px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Account & authorization
        </div>

        <div style={{ marginTop: '22px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Display name
          </div>
          <div
            style={{
              width: '574px',
              height: '48px',
              border: '1px solid #C8D2E0',
              borderRadius: '10px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              fontSize: '14px',
              color: '#111827',
            }}
          >
            {displayName}
          </div>
        </div>

        <div style={{ marginTop: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Role
          </div>
          <div
            style={{
              width: '574px',
              height: '48px',
              backgroundColor: '#EEF2F7',
              border: '1px solid #C8D2E0',
              borderRadius: '10px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              fontSize: '14px',
              color: '#6B788A',
            }}
          >
            Volunteer Evaluator
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Authorized tracks
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            {tracksDisplay}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.volunteerTrackEligibility)}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '230px', height: '44px', fontSize: '14px', fontWeight: 600, marginTop: '30px' }}
        >
          Manage Track Eligibility
        </button>
      </div>

      {/* Right Card: Operational state */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '670px',
          top: '124px',
          width: '436px',
          height: '470px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Operational state
        </div>

        <div style={{ marginTop: '22px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Volunteer-declared availability
          </div>
          <div
            className="auratio-admin-status-pill auratio-admin-status-pill--active"
            style={{ width: '150px', height: '34px' }}
          >
            Available
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Effective availability
          </div>
          <div
            className={`auratio-admin-status-pill ${
              effectiveAvailability === 'Unavailable'
                ? 'auratio-admin-status-pill--disabled'
                : 'auratio-admin-status-pill--active'
            }`}
            style={{ width: '150px', height: '34px' }}
          >
            {effectiveAvailability}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ width: '160px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            Admin override
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            {overrideReason}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Active assignments
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: '32px', color: '#111827' }}>
              {isFarhana ? '2' : (volunteer?.activeAssignments || '0')}
            </div>
            <div style={{ fontSize: '11px', lineHeight: '16px', color: '#6B788A', marginLeft: '16px' }}>
              Informational workload only — no automatic cap.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.availabilityOverride)}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '210px', height: '44px', fontSize: '14px', fontWeight: 600, marginTop: '28px' }}
        >
          Override Availability
        </button>
      </div>

      {/* Bottom Card: Decision-support boundary */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '628px',
          width: '1076px',
          height: '120px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Decision-support boundary
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#4E5968',
            marginTop: '12px',
            width: '1010px',
          }}
        >
          Track eligibility, effective availability, and active-assignment count are separate fields. The count provides workload context without creating an automatic assignment prohibition.
        </div>
      </div>
    </AdminLayout>
  )
}
