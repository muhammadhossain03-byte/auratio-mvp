import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { adminCandidates } from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminAssignmentPickerPage() {
  const navigate = useNavigate()

  function handleSelectCandidate(name: string) {
    if (name === 'Farhana Islam') {
      // In the mock journey, selecting Farhana assigns her and routes back to request details
      navigate(portalRoutePaths.admin.requestDetailsRouting)
    } else {
      // Selecting another candidate or testing reassignment flow
      navigate(portalRoutePaths.admin.confirmReassignment)
    }
  }

  return (
    <AdminLayout
      ariaLabel="Assign Human Evaluation"
      topbarTitle="Assign Human Evaluation"
      activeNav="requests"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Choose evaluator for HE-0142
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Request track: Business Pitch / Sales Pitch • Assignment state: Unassigned • Active evaluator owner: None
      </p>

      {/* Filter Banner */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '62px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
        }}
      >
        <div style={{ width: '222px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          Normal candidate filter
        </div>
        <div style={{ width: '345px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
          Track eligible: Business Pitch / Sales Pitch
        </div>
        <div style={{ width: '285px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
          Effective availability: Available
        </div>
        <div style={{ fontSize: '12px', fontWeight: 400, color: '#6B788A' }}>
          Workload: shown, not capped
        </div>
      </div>

      {/* Candidates Table */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '208px',
          width: '1076px',
          height: '380px',
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
            height: '24px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B788A',
            letterSpacing: '0.0167em',
          }}
        >
          <div style={{ width: '242px' }}>Evaluator</div>
          <div style={{ width: '190px' }}>Track eligible</div>
          <div style={{ width: '235px' }}>Effective availability</div>
          <div style={{ width: '230px' }}>Active assignments</div>
          <div style={{ width: '120px' }}>Action</div>
        </div>

        {/* Candidate Rows */}
        {adminCandidates.map((c, index) => (
          <div key={c.name}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '64px',
                marginTop: index === 0 ? '16px' : '10px',
              }}
            >
              <div style={{ width: '242px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {c.name}
              </div>
              <div style={{ width: '190px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                Yes
              </div>
              <div style={{ width: '235px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {c.effectiveAvailability}
              </div>
              <div style={{ width: '230px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                {c.activeAssignments}
              </div>
              <div style={{ width: '120px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectCandidate(c.name)}
                  className="auratio-admin-btn auratio-admin-btn--secondary"
                  style={{
                    width: '120px',
                    height: '44px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Select
                </button>
              </div>
            </div>

            {index < adminCandidates.length - 1 && (
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

      {/* Candidate Boundary Panel */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '618px',
          width: '1076px',
          height: '130px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Candidate boundary
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
          This normal picker does not display ineligible or effectively Unavailable volunteers as assignable candidates. Admin availability override is managed in the volunteer workspace, not silently inside this picker.
        </div>
      </div>
    </AdminLayout>
  )
}
