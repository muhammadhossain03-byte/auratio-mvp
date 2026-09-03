import { useNavigate } from 'react-router-dom'
import { adminEvaluationRecords } from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminEvaluationRecordsPage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Evaluation Records"
      topbarTitle="Evaluations"
      activeNav="evaluations"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Evaluation Records
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Operational index across existing evaluation records; it does not create new score-edit or moderation powers.
      </p>

      {/* Info Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '60px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          Method, Human work-routing state (where applicable), and Publication Status remain explicitly separate.
        </div>
      </div>

      {/* Table Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '214px',
          width: '1076px',
          height: '322px',
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
          <div style={{ width: '146px' }}>Submission</div>
          <div style={{ width: '170px' }}>Final Method</div>
          <div style={{ width: '210px' }}>Human Assignment Status</div>
          <div style={{ width: '200px' }}>Publication Status</div>
          <div style={{ width: '140px' }}>Score</div>
          <div style={{ width: '92px' }}>Action</div>
        </div>

        {/* Row 1: SUB-8821 */}
        <div style={{ display: 'flex', alignItems: 'center', height: '62px', marginTop: '10px' }}>
          <div style={{ width: '146px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            SUB-8821
          </div>
          <div style={{ width: '170px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Human
          </div>
          <div style={{ width: '210px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Submitted
          </div>
          <div style={{ width: '200px' }}>
            <div
              className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
              style={{ width: '170px', height: '34px' }}
            >
              Pending Moderation
            </div>
          </div>
          <div style={{ width: '140px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            85 / 100
          </div>
          <div style={{ width: '92px' }}>
            <button
              type="button"
              onClick={() => navigate(adminEvaluationRecords[0].destinationPath!)}
              className="auratio-admin-btn auratio-admin-btn--secondary"
              style={{ width: '92px', height: '44px', fontSize: '14px', fontWeight: 600 }}
            >
              Open
            </button>
          </div>
        </div>

        <div style={{ width: '1040px', height: '1px', backgroundColor: '#DCE3ED', marginTop: '6px' }} />

        {/* Row 2: SUB-8834 */}
        <div style={{ display: 'flex', alignItems: 'center', height: '62px', marginTop: '6px' }}>
          <div style={{ width: '146px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            SUB-8834
          </div>
          <div style={{ width: '170px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Human
          </div>
          <div style={{ width: '210px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            In Evaluation
          </div>
          <div style={{ width: '200px' }}>
            <div
              className="auratio-admin-status-pill auratio-admin-status-pill--processing"
              style={{ width: '170px', height: '34px' }}
            >
              Processing
            </div>
          </div>
          <div style={{ width: '140px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            —
          </div>
          <div style={{ width: '92px' }}>
            <button
              type="button"
              onClick={() => navigate(adminEvaluationRecords[1].destinationPath!)}
              className="auratio-admin-btn auratio-admin-btn--secondary"
              style={{ width: '92px', height: '44px', fontSize: '14px', fontWeight: 600 }}
            >
              Open
            </button>
          </div>
        </div>

        <div style={{ width: '1040px', height: '1px', backgroundColor: '#DCE3ED', marginTop: '6px' }} />

        {/* Row 3: SUB-8798 */}
        <div style={{ display: 'flex', alignItems: 'center', height: '62px', marginTop: '6px' }}>
          <div style={{ width: '146px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            SUB-8798
          </div>
          <div style={{ width: '170px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            AI
          </div>
          <div style={{ width: '210px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            Not applicable — AI
          </div>
          <div style={{ width: '200px' }}>
            <div
              className="auratio-admin-status-pill auratio-admin-status-pill--approved"
              style={{ width: '170px', height: '34px' }}
            >
              Approved
            </div>
          </div>
          <div style={{ width: '140px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
            91 / 100
          </div>
          <div style={{ width: '92px' }}>
            <button
              type="button"
              onClick={() => navigate(adminEvaluationRecords[2].destinationPath!)}
              className="auratio-admin-btn auratio-admin-btn--secondary"
              style={{ width: '92px', height: '44px', fontSize: '14px', fontWeight: 600 }}
            >
              Open
            </button>
          </div>
        </div>
      </div>

      {/* Index Boundary Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '578px',
          width: '1076px',
          height: '112px',
          backgroundColor: '#FFF7E8',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '16px 18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
          Index boundary
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#925F12',
            marginTop: '12px',
            width: '1010px',
          }}
        >
          Open routes to the already-authoritative request, moderation, history, or audit context. No direct evaluator-score editor is introduced here.
        </div>
      </div>
    </AdminLayout>
  )
}
