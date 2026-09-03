import { useNavigate } from 'react-router-dom'
import { initialAdminQueueItems } from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminEvaluationRequestQueuePage() {
  const navigate = useNavigate()

  return (
    <AdminLayout
      ariaLabel="Evaluation Request Queue"
      topbarTitle="Evaluation Request Queue"
      activeNav="requests"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        Evaluation requests
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '72px', fontSize: '12px', lineHeight: '18px', fontWeight: 400 }}
      >
        Review requested method, routing state, track, and eligibility before assignment.
      </p>

      {/* Filter Bar */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '112px',
          width: '1076px',
          height: '62px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
        }}
      >
        <div style={{ width: '202px', fontSize: '12px', fontWeight: 500, color: '#4E5968' }}>
          Routing: All
        </div>
        <div style={{ width: '200px', fontSize: '12px', fontWeight: 500, color: '#4E5968' }}>
          Method: All
        </div>
        <div style={{ width: '296px', fontSize: '12px', fontWeight: 500, color: '#4E5968' }}>
          Track: All
        </div>
        <div
          style={{
            width: '328px',
            height: '34px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #DCE3ED',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            boxSizing: 'border-box',
            fontSize: '11px',
            color: '#6B788A',
          }}
        >
          Search request / user
        </div>
      </div>

      {/* Table Panel */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '194px',
          width: '1076px',
          height: '482px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '16px 18px 24px 18px',
        }}
      >
        {/* Table Headers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '28px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#6B788A',
            paddingLeft: '22px',
          }}
        >
          <div style={{ width: '100px' }}>ID</div>
          <div style={{ width: '170px' }}>USER</div>
          <div style={{ width: '240px' }}>TRACK</div>
          <div style={{ width: '165px' }}>REQUESTED METHOD</div>
          <div style={{ width: '145px' }}>ROUTING</div>
          <div style={{ width: '130px' }}>ELIGIBILITY</div>
          <div style={{ width: '88px' }}>ACTION</div>
        </div>

        {/* Table Rows */}
        {initialAdminQueueItems.map((item, index) => (
          <div key={item.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '52px',
                paddingLeft: '22px',
                marginTop: index === 0 ? '16px' : '0',
              }}
            >
              <div style={{ width: '100px', fontSize: '11px', fontWeight: 600, color: '#111827' }}>
                {item.id}
              </div>
              <div style={{ width: '170px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {item.user}
              </div>
              <div style={{ width: '240px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {item.track}
              </div>
              <div style={{ width: '165px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {item.requestedMethod}
              </div>
              <div style={{ width: '145px', fontSize: '11px', fontWeight: 400, color: '#041B3B' }}>
                {item.routing}
              </div>
              <div style={{ width: '130px', fontSize: '11px', fontWeight: 400, color: '#111827' }}>
                {item.eligibility}
              </div>
              <div style={{ width: '88px' }}>
                {item.interactive && item.destinationPath ? (
                  <button
                    type="button"
                    onClick={() => navigate(item.destinationPath!)}
                    className="auratio-admin-btn--table-open"
                    style={{ width: '88px', height: '28px' }}
                  >
                    Open
                  </button>
                ) : (
                  <div
                    role="presentation"
                    aria-hidden="true"
                    className="auratio-admin-btn--table-open auratio-admin-btn--presentation"
                    style={{
                      width: '88px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Open
                  </div>
                )}
              </div>
            </div>

            {index < initialAdminQueueItems.length - 1 && (
              <div
                style={{
                  width: '1040px',
                  height: '1px',
                  backgroundColor: '#DCE3ED',
                  margin: '14px 0 14px 0',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer Callout */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '708px',
          width: '1076px',
          height: '70px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 500, lineHeight: '18px', color: '#041B3B' }}>
          Routing changes must respect explicit end-user consent whenever an alternate evaluation method is proposed.
        </div>
      </div>
    </AdminLayout>
  )
}
