import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SuperAdminLayout } from '../components/SuperAdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { deactivateNadia, getNadiaAdminAccount } from '../data/mockSuperAdminData'

export function SuperAdminConfirmDeactivationPage() {
  const navigate = useNavigate()
  const nadiaAccount = getNadiaAdminAccount()
  const [reason, setReason] = useState('')

  function handleConfirm() {
    deactivateNadia()
    navigate(portalRoutePaths.superAdmin.adminAccounts)
  }

  function handleCancel() {
    navigate(portalRoutePaths.superAdmin.adminAccount)
  }

  return (
    <SuperAdminLayout
      ariaLabel="Confirm Admin Deactivation"
      topbarTitle="Deactivate Admin"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Confirm Admin deactivation
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        This removes active Admin portal authorization for the selected ordinary Admin account.
      </p>

      {/* Confirmation Modal / Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '190px',
          top: '118px',
          width: '720px',
          height: '540px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '30px',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: '32px', color: '#111827' }}>
          Deactivate {nadiaAccount.displayName}?
        </div>
        <div
          style={{
            marginTop: '10px',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#4E5968',
          }}
        >
          {nadiaAccount.email} • Admin
        </div>

        {/* Impact Box */}
        <div
          style={{
            marginTop: '26px',
            width: '660px',
            height: '164px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
            Impact
          </div>
          <div
            style={{
              marginTop: '12px',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: '#925F12',
            }}
          >
            <div>• Active Admin portal access is removed.</div>
            <div>• The account is not promoted/demoted into another role.</div>
            <div>• Previous operational/audit records remain attributable.</div>
            <div>• This lifecycle action is auditable.</div>
          </div>
        </div>

        {/* Reason (where applicable) */}
        <div
          style={{
            marginTop: '36px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Reason (where applicable)
        </div>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter short reason if applicable"
          aria-label="Reason (where applicable)"
          style={{
            marginTop: '10px',
            width: '660px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
            outline: 'none',
          }}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '34px', gap: '18px' }}>
          <button
            type="button"
            onClick={handleConfirm}
            className="auratio-admin-btn auratio-admin-btn--primary"
            style={{
              width: '210px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Confirm Deactivation
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{
              width: '130px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>

        {/* Footnote */}
        <div
          style={{
            marginTop: '18px',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#6B788A',
          }}
        >
          This confirmation applies to ordinary Admin accounts, not the protected root-account controls.
        </div>
      </div>
    </SuperAdminLayout>
  )
}
