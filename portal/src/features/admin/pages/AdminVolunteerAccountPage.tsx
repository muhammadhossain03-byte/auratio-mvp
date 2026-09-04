import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  getVolunteerAvailabilityState,
  getVolunteerTrackEligibility,
  getAdminVolunteerById,
} from '../data/mockAdminData'

export function AdminVolunteerAccountPage() {
  const navigate = useNavigate()
  const { volunteerId: paramId } = useParams<{ volunteerId?: string }>()
  const resolvedId = (paramId || 'farhana').toLowerCase()
  const volunteer = getAdminVolunteerById(resolvedId)

  if (!volunteer) {
    return <Navigate to={portalRoutePaths.admin.volunteers} replace />
  }

  const isActive = volunteer.lifecycle === 'Active'
  const isDeactivated = volunteer.lifecycle === 'Deactivated'
  const isInvited = volunteer.lifecycle === 'Invited'

  const availabilityState = getVolunteerAvailabilityState(resolvedId)
  const volunteerTracks = getVolunteerTrackEligibility(resolvedId) ?? volunteer.selectedTracks ?? []

  const displayName = volunteer.name
  const lifecycle = volunteer.lifecycle
  const effectiveAvailability = availabilityState ? availabilityState.effectiveAvailability : volunteer.effectiveAvailability
  const declaredAvailability = availabilityState
    ? availabilityState.declaredAvailability
    : (isDeactivated || isInvited ? '—' : 'Available')
  const overrideReason = availabilityState ? availabilityState.overrideReason : 'None'
  const tracksDisplay = volunteerTracks.length > 0
    ? volunteerTracks.join(' • ')
    : (volunteer.tracks || '0 tracks')

  const canManage = isActive
  const trackPath = `/admin/volunteers/${resolvedId}/tracks`
  const availabilityPath = `/admin/volunteers/${resolvedId}/availability`

  const disabledTrackTitle = isDeactivated
    ? 'Track management is unavailable for deactivated accounts.'
    : 'Track management is available once volunteer completes account activation.'
  const disabledOverrideTitle = isDeactivated
    ? 'Availability override is unavailable for deactivated accounts.'
    : 'Availability override is available once volunteer completes account activation.'

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
          disabled={!canManage}
          onClick={canManage ? () => navigate(trackPath) : undefined}
          className={`auratio-admin-btn ${canManage ? 'auratio-admin-btn--primary' : 'auratio-admin-btn--disabled'}`}
          title={canManage ? undefined : disabledTrackTitle}
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
            className={`auratio-admin-status-pill ${
              declaredAvailability === 'Available'
                ? 'auratio-admin-status-pill--active'
                : 'auratio-admin-status-pill--disabled'
            }`}
            style={{ width: '150px', height: '34px' }}
          >
            {declaredAvailability}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Effective availability
          </div>
          <div
            className={`auratio-admin-status-pill ${
              effectiveAvailability === 'Available'
                ? 'auratio-admin-status-pill--active'
                : 'auratio-admin-status-pill--disabled'
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
              {volunteer.activeAssignments}
            </div>
            <div style={{ fontSize: '11px', lineHeight: '16px', color: '#6B788A', marginLeft: '16px' }}>
              Informational workload only — no automatic cap.
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!canManage}
          onClick={canManage ? () => navigate(availabilityPath) : undefined}
          className={`auratio-admin-btn ${canManage ? 'auratio-admin-btn--primary' : 'auratio-admin-btn--disabled'}`}
          title={canManage ? undefined : disabledOverrideTitle}
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
