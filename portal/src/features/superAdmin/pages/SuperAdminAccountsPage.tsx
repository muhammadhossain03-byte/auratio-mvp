import { useNavigate } from 'react-router-dom'
import { SuperAdminLayout } from '../components/SuperAdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getAdminAccountsList } from '../data/mockSuperAdminData'

export function SuperAdminAccountsPage() {
  const navigate = useNavigate()
  const accounts = getAdminAccountsList()

  return (
    <SuperAdminLayout
      ariaLabel="Admin Accounts"
      topbarTitle="Admin Accounts"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Admin Accounts
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Super Admin-only directory for ordinary Admin account lifecycle management.
      </p>

      {/* Top right Invite Admin button */}
      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.superAdmin.inviteAdmin)}
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
        Invite Admin
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
        <div style={{ width: '430px', fontSize: '14px', fontWeight: 400, color: '#6B788A' }}>
          Search name / email
        </div>
        <div style={{ fontSize: '14px', fontWeight: 400, color: '#6B788A' }}>
          Role: Admin tier
        </div>
      </div>

      {/* Accounts Directory table */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '204px',
          width: '1076px',
          height: '390px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
          overflowY: 'auto',
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
          <div style={{ width: '190px' }}>Name</div>
          <div style={{ width: '260px' }}>Email</div>
          <div style={{ width: '180px' }}>Account type</div>
          <div style={{ width: '120px' }}>Status</div>
          <div style={{ width: '160px' }}>Protection</div>
          <div style={{ width: '100px' }}>Action</div>
        </div>

        {/* Rows */}
        {accounts.map((acc, idx) => (
          <div key={acc.id}>
            <div
              data-testid={`admin-account-row-${acc.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                marginTop: idx === 0 ? '16px' : '22px',
              }}
            >
              <div style={{ width: '190px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {acc.name}
              </div>
              <div style={{ width: '260px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {acc.email}
              </div>
              <div style={{ width: '180px', fontSize: '14px', fontWeight: 400, color: '#111827' }}>
                {acc.accountType}
              </div>
              <div
                style={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: acc.status === 'Active' ? 600 : 400,
                  color: acc.status === 'Active' ? '#111827' : '#6B788A',
                }}
              >
                {acc.status}
              </div>
              <div
                style={{
                  width: '160px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#111827',
                }}
              >
                {acc.protection}
              </div>
              <div style={{ width: '100px' }}>
                <button
                  type="button"
                  onClick={() => navigate(acc.destinationPath)}
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
                  {acc.actionLabel}
                </button>
              </div>
            </div>

            {idx < accounts.length - 1 && (
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

      {/* Permission boundary card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '628px',
          width: '1076px',
          height: '120px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Permission boundary
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
          This directory is absent from the ordinary Admin shell. Root protection and account-lifecycle permissions are backend-enforced, not merely hidden controls.
        </div>
      </div>
    </SuperAdminLayout>
  )
}
