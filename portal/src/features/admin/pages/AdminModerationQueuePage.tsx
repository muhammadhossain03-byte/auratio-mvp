import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { adminModerationQueueItems } from '../data/mockAdminData'

export function AdminModerationQueuePage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Moderation Queue"
      topbarTitle="Moderation"
      activeNav="moderation"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Pending Moderation
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Human evaluations requiring Admin publication review
      </p>

      {/* Top right pill */}
      <div
        className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
        style={{
          position: 'absolute',
          left: '900px',
          top: '36px',
          width: '190px',
          height: '34px',
          borderRadius: '17px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        Pending Moderation
      </div>

      {/* Card 1: Queue boundary */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '1076px',
          height: '78px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '14px 18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Queue boundary
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#4E5968',
            marginTop: '4px',
            width: '1010px',
          }}
        >
          First Human-in-track reviews and later Human anomaly flags appear here. Later Human submissions that pass the defined checks may auto-approve instead.
        </div>
      </div>

      {/* Card 2: Moderation Table */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '222px',
          width: '1076px',
          height: '370px',
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
          <div style={{ width: '152px' }}>Submission</div>
          <div style={{ width: '240px' }}>Track</div>
          <div style={{ width: '170px' }}>Assignment</div>
          <div style={{ width: '195px' }}>Publication</div>
          <div style={{ width: '205px' }}>Moderation trigger</div>
          <div style={{ width: '78px', textAlign: 'center' }}>Action</div>
        </div>

        {/* Rows */}
        {adminModerationQueueItems.map((item, idx) => (
          <div key={item.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '76px',
                marginTop: idx === 0 ? '16px' : '26px',
              }}
            >
              <div style={{ width: '152px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {item.id}
              </div>
              <div style={{ width: '240px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {item.track}
              </div>
              <div style={{ width: '170px' }}>
                <div
                  className="auratio-admin-status-pill auratio-admin-status-pill--submitted"
                  style={{ width: '145px', height: '34px' }}
                >
                  {item.assignmentStatus}
                </div>
              </div>
              <div style={{ width: '195px' }}>
                <div
                  className="auratio-admin-status-pill auratio-admin-status-pill--pending-moderation"
                  style={{ width: '180px', height: '34px' }}
                >
                  {item.publicationStatus}
                </div>
              </div>
              <div
                style={{
                  width: '205px',
                  fontSize: '12px',
                  lineHeight: '18px',
                  fontWeight: 400,
                  color: '#111827',
                }}
              >
                {item.moderationTrigger}
              </div>
              <div style={{ width: '78px' }}>
                <button
                  type="button"
                  onClick={() => navigate(item.destinationPath)}
                  className="auratio-admin-btn auratio-admin-btn--secondary"
                  style={{ width: '80px', height: '44px', fontSize: '14px', fontWeight: 600 }}
                >
                  Open
                </button>
              </div>
            </div>

            {idx < adminModerationQueueItems.length - 1 && (
              <div
                style={{
                  width: '1040px',
                  height: '1px',
                  backgroundColor: '#DCE3ED',
                  marginTop: '16px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card 3: Integrity callout */}
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
          Human-only baseline integrity
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
          The absolute-difference check uses the running average of prior Approved Human scores in the same track. AI scores are never used as the Human moderation baseline.
        </div>
      </div>
    </AdminLayout>
  )
}
