import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import compactLockupSvg from '../../../assets/images/auratio_compact_lockup.svg'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import '../styles/admin.css'

interface AdminLayoutProps {
  children: ReactNode
  topbarTitle: string
  activeNav?: 'dashboard' | 'requests' | 'evaluations'
  topbarRightVariant?: 'avatar' | 'pill'
  ariaLabel: string
}

export function AdminLayout({
  children,
  topbarTitle,
  activeNav = 'dashboard',
  topbarRightVariant = 'avatar',
  ariaLabel,
}: AdminLayoutProps) {
  const navigate = useNavigate()

  const isDetailed = topbarRightVariant === 'pill'

  return (
    <main
      aria-label={ariaLabel}
      className="auratio-admin-viewport"
      data-testid="admin-viewport"
    >
      {/* Admin Sidebar */}
      <aside className="auratio-admin-sidebar" aria-label="Admin Portal Navigation">
        <img
          src={compactLockupSvg}
          alt="Auratio"
          className="auratio-admin-logo"
          style={{ top: isDetailed ? '24px' : '29px' }}
        />

        <div
          className="auratio-admin-sidebar-sub"
          style={{ top: isDetailed ? '76px' : '77px' }}
        >
          Admin / Evaluator Portal
        </div>

        {isDetailed && (
          <div className="auratio-admin-sidebar-role">
            Admin
          </div>
        )}

        {/* Dashboard Nav Item */}
        {activeNav === 'dashboard' ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: isDetailed ? '114px' : '112px' }}
          >
            <span className="auratio-admin-nav-item--active">
              Dashboard
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.dashboard)}
            className="auratio-admin-nav-item"
            style={{ top: isDetailed ? '124px' : '122px' }}
          >
            Dashboard
          </button>
        )}

        {/* Requests Nav Item */}
        {activeNav === 'requests' ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: isDetailed ? '164px' : '162px' }}
          >
            <span className="auratio-admin-nav-item--active">
              Requests
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.requests)}
            className="auratio-admin-nav-item"
            style={{ top: isDetailed ? '174px' : '172px' }}
          >
            Requests
          </button>
        )}

        {/* Evaluations Nav Item */}
        {activeNav === 'evaluations' ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: '214px' }}
          >
            <span className="auratio-admin-nav-item--active">
              Evaluations
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.evaluations)}
            className="auratio-admin-nav-item"
            style={{ top: isDetailed ? '224px' : '222px' }}
          >
            Evaluations
          </button>
        )}

        {/* Moderation (Presentation-only) */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-nav-item auratio-admin-nav-item--presentation"
          style={{ top: isDetailed ? '274px' : '272px' }}
        >
          Moderation
        </div>

        {/* Volunteers (Presentation-only) */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-nav-item auratio-admin-nav-item--presentation"
          style={{ top: isDetailed ? '324px' : '322px' }}
        >
          Volunteers
        </div>

        {/* Events (Presentation-only) */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-nav-item auratio-admin-nav-item--presentation"
          style={{ top: isDetailed ? '374px' : '372px' }}
        >
          Events
        </div>

        {/* Audit Log (Presentation-only) */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-nav-item auratio-admin-nav-item--presentation"
          style={{ top: isDetailed ? '424px' : '422px' }}
        >
          Audit Log
        </div>

        {/* Sidebar Footer (Present on detailed variant) */}
        {isDetailed && (
          <>
            <div className="auratio-admin-sidebar-footer-title">
              Role-scoped navigation
            </div>
            <div className="auratio-admin-sidebar-footer-sub">
              Backend RBAC is authoritative.
            </div>
          </>
        )}
      </aside>

      {/* Topbar */}
      <header className="auratio-admin-topbar" aria-label="Portal Header">
        <h1
          className="auratio-admin-topbar-title"
          style={{
            fontSize: isDetailed ? '24px' : '22px',
            lineHeight: isDetailed ? '32px' : '30px',
            top: isDetailed ? '20px' : '22px',
          }}
        >
          {topbarTitle}
        </h1>

        {isDetailed ? (
          <div className="auratio-admin-topbar-pill">
            Admin
          </div>
        ) : (
          <>
            <div className="auratio-admin-topbar-avatar" aria-label="Admin initials">
              AU
            </div>
            <div className="auratio-admin-topbar-user-role">
              Admin
            </div>
          </>
        )}
      </header>

      {/* Content */}
      <section className="auratio-admin-content">
        {children}
      </section>
    </main>
  )
}
