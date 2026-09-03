import { useNavigate } from 'react-router-dom'
import { SuperAdminLayout } from '../components/SuperAdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'

export function SuperAdminProtectedRootPage() {
  const navigate = useNavigate()

  function handleBack() {
    navigate(portalRoutePaths.superAdmin.adminAccounts)
  }

  return (
    <SuperAdminLayout
      ariaLabel="Protected Super Admin Account"
      topbarTitle="Super Admin Account"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Auratio Root
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        Protected root Super Admin account • read-only governance view.
      </p>

      {/* Top right status pill */}
      <div
        style={{
          position: 'absolute',
          left: '940px',
          top: '36px',
          width: '130px',
          height: '34px',
          backgroundColor: '#EAF7F0',
          borderRadius: '17px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1F6B48',
        }}
      >
        Protected
      </div>

      {/* Left Card: Account details (Read-Only) */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '124px',
          width: '620px',
          height: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Account details
        </div>

        {/* Display name */}
        <div
          style={{
            marginTop: '22px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Display name
        </div>
        <div
          style={{
            marginTop: '8px',
            width: '584px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
          }}
        >
          Auratio Root
        </div>

        {/* Email / auth identity */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Email / auth identity
        </div>
        <div
          style={{
            marginTop: '8px',
            width: '584px',
            height: '48px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
          }}
        >
          root@auratio.local
        </div>

        {/* Role */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Role
        </div>
        <div
          style={{
            marginTop: '8px',
            width: '584px',
            height: '48px',
            backgroundColor: '#EEF2F7',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#6B788A',
          }}
        >
          Super Admin
        </div>

        {/* Status */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Status
        </div>
        <div
          style={{
            marginTop: '8px',
            width: '584px',
            height: '48px',
            backgroundColor: '#EEF2F7',
            border: '1px solid #C8D2E0',
            borderRadius: '10px',
            boxSizing: 'border-box',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#6B788A',
          }}
        >
          Active
        </div>

        {/* ONLY Back to Accounts Button - NO Save Changes */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
          <button
            type="button"
            onClick={handleBack}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{
              width: '180px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Back to Accounts
          </button>
        </div>
      </div>

      {/* Right Card: Account lifecycle */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '680px',
          top: '124px',
          width: '426px',
          height: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Account lifecycle
        </div>

        {/* Provisioning */}
        <div
          style={{
            marginTop: '14px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Provisioning
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
          }}
        >
          Manual / system-side root provisioning
        </div>

        {/* Protection */}
        <div
          style={{
            marginTop: '26px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Protection
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#111827',
          }}
        >
          Root account is protected
        </div>

        {/* Protected account Callout - NO Deactivate button */}
        <div
          style={{
            marginTop: '36px',
            width: '390px',
            height: '134px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            padding: '14px 18px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
            Protected account
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: '#925F12',
              width: '350px',
            }}
          >
            Ordinary Admin deactivation and lifecycle controls do not apply to the protected root Super Admin account.
          </div>
        </div>

        {/* Governance note */}
        <div
          style={{
            marginTop: '32px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            letterSpacing: '0.0167em',
            color: '#6B788A',
          }}
        >
          Governance note
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#4E5968',
            width: '370px',
          }}
        >
          Root protection and account-lifecycle authorization are backend-enforced. This screen exposes no root lifecycle mutation.
        </div>
      </div>

      {/* Bottom Card: Root boundary */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '674px',
          width: '620px',
          height: '84px',
          backgroundColor: '#F3F8FE',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '22px 18px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: '#4E5968',
            width: '580px',
          }}
        >
          Root Super Admin provisioning remains manual/system-side. No role, deactivation, or ordinary Admin lifecycle control is exposed here.
        </div>
      </div>
    </SuperAdminLayout>
  )
}
