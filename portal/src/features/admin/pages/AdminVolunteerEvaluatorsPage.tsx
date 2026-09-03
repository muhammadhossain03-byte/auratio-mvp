import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { adminVolunteersList } from '../data/mockAdminData'

export function AdminVolunteerEvaluatorsPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Volunteer Evaluators"
      topbarTitle="Volunteers"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Volunteer Evaluators
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Workload is visible for Admin decision support; no automatic cap is applied.
      </p>

      {/* Top right Invite Volunteer button */}
      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.admin.inviteVolunteer)}
        className="auratio-admin-btn auratio-admin-btn--primary"
        style={{
          position: 'absolute',
          left: '890px',
          top: '36px',
          width: '190px',
          height: '44px',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Invite Volunteer
      </button>

      {/* Filter / Search card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '60px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
        }}
      >
        <div style={{ width: '312px', fontSize: '14px', fontWeight: 400, color: '#6B788A' }}>
          Status: All
        </div>
        <div style={{ width: '410px', fontSize: '14px', fontWeight: 400, color: '#6B788A' }}>
          Search name / email
        </div>
        <div style={{ fontSize: '14px', fontWeight: 400, color: '#6B788A' }}>
          Lifecycle: Active + Archived
        </div>
      </div>

      {/* Directory table */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '204px',
          width: '1076px',
          height: '388px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        {/* Table Headers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B788A',
            letterSpacing: '0.0167em',
          }}
        >
          <div style={{ width: '212px' }}>Name</div>
          <div style={{ width: '250px' }}>Eligibility</div>
          <div style={{ width: '220px' }}>Effective availability</div>
          <div style={{ width: '170px' }}>Active assignments</div>
          <div style={{ width: '120px' }}>Lifecycle</div>
          <div style={{ width: '68px' }}>Action</div>
        </div>

        {/* Rows */}
        {adminVolunteersList.map((vol, idx) => (
          <div key={vol.name}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                marginTop: idx === 0 ? '16px' : '22px',
              }}
            >
              <div style={{ width: '212px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {vol.name}
              </div>
              <div style={{ width: '250px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {vol.tracks}
              </div>
              <div
                style={{
                  width: '220px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: vol.effectiveAvailability === 'Unavailable' ? '#4E5968' : '#111827',
                }}
              >
                {vol.effectiveAvailability}
              </div>
              <div
                style={{
                  width: '170px',
                  fontSize: '14px',
                  fontWeight: vol.activeAssignments !== '—' ? 600 : 400,
                  color: '#111827',
                }}
              >
                {vol.activeAssignments}
              </div>
              <div
                style={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: vol.lifecycle === 'Deactivated' ? '#6B788A' : '#111827',
                }}
              >
                {vol.lifecycle}
              </div>
              <div style={{ width: '68px' }}>
                <button
                  type="button"
                  onClick={() => navigate(vol.destinationPath)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#256EA5',
                    fontFamily: 'inherit',
                  }}
                >
                  {vol.actionLabel}
                </button>
              </div>
            </div>

            {idx < adminVolunteersList.length - 1 && (
              <div
                style={{
                  width: '1040px',
                  height: '1px',
                  backgroundColor: '#DCE3ED',
                  marginTop: '10px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card 3: Workload boundary */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '624px',
          width: '1076px',
          height: '124px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Workload boundary
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#4E5968',
            marginTop: '14px',
            width: '1010px',
          }}
        >
          The active-assignment count is informational. A volunteer with 4 active assignments is not automatically blocked, deprioritized, or marked “overloaded” by MVP business rules.
        </div>
      </div>
    </AdminLayout>
  )
}
