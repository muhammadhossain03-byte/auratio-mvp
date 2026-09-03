import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { SuperAdminLayout } from '../components/SuperAdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getAdminAccountById, updateAdminAccount } from '../data/mockSuperAdminData'

export function SuperAdminAccountPage() {
  const navigate = useNavigate()
  const { adminId } = useParams<{ adminId?: string }>()
  const resolvedId = adminId || 'nadia'
  const isNadia = resolvedId === 'nadia'
  const account = getAdminAccountById(resolvedId)

  const [displayName, setDisplayName] = useState(
    account?.name || (isNadia ? 'Nadia Rahman' : 'Admin User'),
  )
  const [email, setEmail] = useState(
    account?.email || (isNadia ? 'nadia@auratio.org' : 'admin@auratio.org'),
  )

  if (!isNadia && !account) {
    return <Navigate to={portalRoutePaths.superAdmin.adminAccounts} replace />
  }
  const status = account?.status || 'Active'
  const deactivated = status === 'Deactivated'
  const isInvited = status === 'Invited'

  function handleSave() {
    updateAdminAccount(resolvedId, { displayName, email })
    navigate(portalRoutePaths.superAdmin.adminAccounts)
  }

  function handleBack() {
    navigate(portalRoutePaths.superAdmin.adminAccounts)
  }

  function handleDeactivate() {
    if (isNadia) {
      navigate(portalRoutePaths.superAdmin.confirmAdminDeactivation)
    } else {
      navigate(`/super-admin/admin-accounts/${resolvedId}/deactivate`)
    }
  }

  return (
    <SuperAdminLayout
      ariaLabel="Admin Account"
      topbarTitle="Admin Account"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        {account?.name || (isNadia ? 'Nadia Rahman' : 'Admin Account')}
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        View and update an ordinary Admin account.
      </p>

      {/* Top right status pill */}
      <div
        style={{
          position: 'absolute',
          left: '940px',
          top: '36px',
          width: '130px',
          height: '34px',
          backgroundColor: deactivated ? '#EEF2F7' : isInvited ? '#FFF7E8' : '#EAF7F0',
          borderRadius: '17px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: deactivated ? '#6B788A' : isInvited ? '#925F12' : '#1F6B48',
        }}
      >
        {status}
      </div>

      {/* Left Card: Account details */}
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
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          aria-label="Display name"
          style={{
            marginTop: '8px',
            width: '584px',
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
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email / auth identity"
          style={{
            marginTop: '8px',
            width: '584px',
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
          Admin
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
          {status}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '32px', gap: '18px' }}>
          <button
            type="button"
            onClick={handleSave}
            className="auratio-admin-btn auratio-admin-btn--primary"
            style={{
              width: '170px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Save Changes
          </button>
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

        {/* Created / invited */}
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
          Created / invited
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
          24 Aug 2026 • by Root Super Admin
        </div>

        {/* Last lifecycle action */}
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
          Last lifecycle action
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
          {isInvited
            ? 'Invite sent / activation pending'
            : deactivated
              ? 'Account deactivated'
              : 'Invite accepted / account active'}
        </div>

        {/* Deactivate Admin Callout */}
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
            Deactivate Admin
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
            {isInvited
              ? 'Cancels pending portal access. This is not a role-transfer or history-deletion action.'
              : 'Stops active portal access. This is not a role-transfer or history-deletion action.'}
          </div>
          <button
            type="button"
            onClick={handleDeactivate}
            className="auratio-admin-btn auratio-admin-btn--secondary"
            style={{
              marginTop: '10px',
              width: '150px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Deactivate…
          </button>
        </div>

        {/* Audit note */}
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
          Audit note
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
          Updates and lifecycle actions record actor, target, action, timestamp, and reason where applicable.
        </div>
      </div>

      {/* Bottom Card: Profile fields boundary */}
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
          Profile fields are limited to current MVP account-management needs; role and authorization state are not edited from this form.
        </div>
      </div>
    </SuperAdminLayout>
  )
}
