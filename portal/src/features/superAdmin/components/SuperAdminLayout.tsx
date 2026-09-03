import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import compactLockupSvg from '../../../assets/images/auratio_compact_lockup.svg'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import '../../admin/styles/admin.css'

interface SuperAdminLayoutProps {
  children: ReactNode
  topbarTitle: string
  ariaLabel: string
}

export function SuperAdminLayout({
  children,
  topbarTitle,
  ariaLabel,
}: SuperAdminLayoutProps) {
  const navigate = useNavigate()

  return (
    <main
      aria-label={ariaLabel}
      className="auratio-admin-viewport"
      data-testid="admin-viewport"
      style={{ backgroundColor: '#FCFDFE' }}
    >
      {/* Super Admin Sidebar */}
      <aside className="auratio-admin-sidebar" aria-label="Super Admin Portal Navigation">
        <img
          src={compactLockupSvg}
          alt="Auratio"
          className="auratio-admin-logo"
          style={{ top: '24px' }}
        />

        <div
          className="auratio-admin-sidebar-sub"
          style={{ top: '76px' }}
        >
          Admin / Evaluator Portal
        </div>

        <div
          className="auratio-admin-sidebar-role"
          style={{ top: '98px' }}
        >
          Super Admin
        </div>

        {/* Inherited operational navigation */}
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.dashboard)}
          className="auratio-admin-nav-item"
          style={{ top: '124px' }}
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.requests)}
          className="auratio-admin-nav-item"
          style={{ top: '174px' }}
        >
          Requests
        </button>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.evaluations)}
          className="auratio-admin-nav-item"
          style={{ top: '224px' }}
        >
          Evaluations
        </button>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.moderation)}
          className="auratio-admin-nav-item"
          style={{ top: '274px' }}
        >
          Moderation
        </button>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.volunteers)}
          className="auratio-admin-nav-item"
          style={{ top: '324px' }}
        >
          Volunteers
        </button>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.events)}
          className="auratio-admin-nav-item"
          style={{ top: '374px' }}
        >
          Events
        </button>

        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.admin.audit)}
          className="auratio-admin-nav-item"
          style={{ top: '424px' }}
        >
          Audit Log
        </button>

        {/* Admin Accounts Nav Item (Active in Super Admin Journey) */}
        <button
          type="button"
          onClick={() => navigate(portalRoutePaths.superAdmin.adminAccounts)}
          className="auratio-admin-nav-item--active-box"
          style={{
            top: '464px',
            background: '#08274D',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            paddingLeft: '14px',
          }}
        >
          <span className="auratio-admin-nav-item--active">
            Admin Accounts
          </span>
        </button>

        {/* Super Admin Footer */}
        <div className="auratio-admin-sidebar-footer-title">
          Super Admin governance
        </div>
        <div className="auratio-admin-sidebar-footer-sub">
          Backend RBAC is authoritative.
        </div>
      </aside>

      {/* Topbar */}
      <header className="auratio-admin-topbar" aria-label="Portal Header">
        <h1
          className="auratio-admin-topbar-title"
          style={{
            fontSize: '24px',
            lineHeight: '32px',
            top: '20px',
          }}
        >
          {topbarTitle}
        </h1>

        <div className="auratio-admin-topbar-pill">
          Super Admin
        </div>
      </header>

      {/* Content */}
      <section className="auratio-admin-content">
        {children}
      </section>
    </main>
  )
}
