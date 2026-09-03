import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { adminAuditLogsList } from '../data/mockAdminData'

export function AdminAuditLogPage() {
  const [activeFilter, setActiveFilter] = useState('All events')

  const filterOptions = [
    'All events',
    'Governance',
    'Volunteer',
    'Assignment',
    'Evaluation',
    'Moderation',
  ]

  return (
    <AdminLayout
      ariaLabel="Audit Log"
      topbarTitle="Audit Log"
      activeNav="audit"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Operational Audit Log
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Read-only history across covered portal operations.
      </p>

      {/* View aids / filters bar */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '116px',
          width: '1076px',
          height: '78px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '12px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '90px', fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
            View aids
          </div>

          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setActiveFilter(opt)}
              className="auratio-admin-status-pill auratio-admin-status-pill--submitted"
              style={{
                width: '136px',
                height: '34px',
                marginRight: '12px',
                cursor: 'pointer',
                border: 'none',
                opacity: activeFilter === opt ? 1 : 0.75,
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div
          style={{
            fontSize: '11px',
            fontWeight: 500,
            lineHeight: '16px',
            color: '#6B788A',
            marginTop: '8px',
          }}
        >
          These filters organize visibility only; they do not define new audit semantics.
        </div>
      </div>

      {/* Audit Log Table */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '214px',
          width: '1076px',
          height: '446px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        {/* Headers */}
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
          <div style={{ width: '160px' }}>Timestamp</div>
          <div style={{ width: '180px' }}>Actor</div>
          <div style={{ width: '260px' }}>Action</div>
          <div style={{ width: '190px' }}>Target</div>
          <div style={{ width: '220px' }}>Reason</div>
        </div>

        {/* Rows */}
        {adminAuditLogsList.map((log, idx) => (
          <div key={`${log.timestamp}-${log.action}`}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                marginTop: idx === 0 ? '16px' : '22px',
              }}
            >
              <div style={{ width: '160px', fontSize: '12px', fontWeight: 400, color: '#111827' }}>
                {log.timestamp}
              </div>
              <div style={{ width: '180px', fontSize: '12px', fontWeight: 400, color: '#111827' }}>
                {log.actor}
              </div>
              <div
                style={{
                  width: '260px',
                  fontSize: '12px',
                  fontWeight: log.action.includes('Reassigned') ? 600 : 400,
                  color: '#111827',
                }}
              >
                {log.action}
              </div>
              <div style={{ width: '190px', fontSize: '12px', fontWeight: 400, color: '#111827' }}>
                {log.target}
              </div>
              <div
                style={{
                  width: '220px',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: log.reason === '—' ? '#6B788A' : '#111827',
                }}
              >
                {log.reason}
              </div>
            </div>

            {idx < adminAuditLogsList.length - 1 && (
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

      {/* Bottom note */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '684px',
          width: '1076px',
          height: '72px',
          backgroundColor: '#FFF7E8',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#925F12', letterSpacing: '0.0167em' }}>
          Audit entries are read-only. Operational changes are made in their authoritative management/workflow screens.
        </div>
      </div>
    </AdminLayout>
  )
}
