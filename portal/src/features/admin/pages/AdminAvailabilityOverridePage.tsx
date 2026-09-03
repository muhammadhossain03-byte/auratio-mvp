import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { applyFarhanaAvailabilityOverride } from '../data/mockAdminData'

export function AdminAvailabilityOverridePage() {
  const navigate = useNavigate()
  const [reason, setReason] = useState('')

  const handleApply = () => {
    applyFarhanaAvailabilityOverride('Unavailable', reason)
    navigate(portalRoutePaths.admin.volunteerAccount)
  }

  return (
    <AdminLayout
      ariaLabel="Availability Override"
      topbarTitle="Availability Override"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Override Farhana Islam’s availability
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Current volunteer-declared status: Available
      </p>

      {/* Center Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '190px',
          top: '124px',
          width: '720px',
          height: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '28px 30px',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: '32px', color: '#111827' }}>
          Set effective availability
        </div>

        <div style={{ marginTop: '22px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em', marginBottom: '8px' }}>
            Override status
          </div>
          <div
            style={{
              width: '660px',
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
            Unavailable
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.0167em' }}>
              Reason
            </span>
            <span style={{ fontSize: '11px', color: '#6B788A', marginLeft: '12px' }}>
              Where applicable for the audited override action
            </span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Operational coverage / scheduling reason…"
            className="auratio-admin-textarea"
            style={{
              width: '660px',
              height: '86px',
            }}
          />
        </div>

        <div
          style={{
            marginTop: '22px',
            width: '660px',
            height: '96px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '14px 18px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#925F12' }}>
            Override effect
          </div>
          <div
            style={{
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
              color: '#925F12',
              marginTop: '8px',
            }}
          >
            Effective availability becomes Unavailable while the recorded volunteer-declared status remains Available.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={handleApply}
            className="auratio-admin-btn auratio-admin-btn--primary"
            style={{ width: '180px', height: '44px', fontSize: '14px', fontWeight: 600 }}
          >
            Apply Override
          </button>
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.volunteerAccount)}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{ width: '120px', height: '44px', fontSize: '14px', fontWeight: 600, marginLeft: '18px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
