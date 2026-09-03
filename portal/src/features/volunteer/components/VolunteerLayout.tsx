import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import compactLockupSvg from '../../../assets/images/auratio_compact_lockup.svg'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import '../styles/volunteer.css'

interface VolunteerLayoutProps {
  children: ReactNode
  topbarTitle: string
  activeNav?: 'assignments' | 'availability'
  topbarRightVariant?: 'default' | 'scoring'
  ariaLabel: string
}

export function VolunteerLayout({
  children,
  topbarTitle,
  activeNav = 'assignments',
  topbarRightVariant = 'default',
  ariaLabel,
}: VolunteerLayoutProps) {
  const navigate = useNavigate()

  const isScoring = topbarRightVariant === 'scoring'

  return (
    <main
      aria-label={ariaLabel}
      className="auratio-volunteer-viewport"
      data-testid="volunteer-viewport"
    >
      {/* Sidebar */}
      <aside className="auratio-volunteer-sidebar" aria-label="Volunteer Portal Navigation">
        <img
          src={compactLockupSvg}
          alt="Auratio"
          className="auratio-volunteer-logo"
          style={{ top: isScoring ? '28px' : '24px' }}
        />

        <div
          className="auratio-volunteer-sidebar-sub"
          style={{
            top: isScoring ? '77px' : '76px',
            color: isScoring ? 'var(--auratio-neutral-white)' : 'var(--auratio-brand-blue-200)',
          }}
        >
          Admin / Evaluator Portal
        </div>

        {!isScoring && (
          <div className="auratio-volunteer-sidebar-role">
            Volunteer Evaluator
          </div>
        )}

        {/* Dashboard (Presentation-only) */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-volunteer-nav-item auratio-volunteer-nav-item--presentation"
          style={{
            top: isScoring ? '122px' : '124px',
            color: isScoring ? 'var(--auratio-neutral-white)' : 'var(--auratio-brand-blue-200)',
          }}
        >
          Dashboard
        </div>

        {/* Active Assignments */}
        {activeNav === 'assignments' ? (
          <div
            className="auratio-volunteer-nav-item--active-box"
            style={{ top: isScoring ? '162px' : '164px' }}
          >
            <span className="auratio-volunteer-nav-item--active">
              Active Assignments
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.volunteer.assignments)}
            className="auratio-volunteer-nav-item"
            style={{ top: '174px' }}
          >
            Active Assignments
          </button>
        )}

        {/* Completed / History (Presentation-only) */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-volunteer-nav-item auratio-volunteer-nav-item--presentation"
          style={{
            top: isScoring ? '222px' : '224px',
            color: isScoring ? 'var(--auratio-neutral-white)' : 'var(--auratio-brand-blue-200)',
          }}
        >
          Completed / History
        </div>

        {/* Availability */}
        {activeNav === 'availability' ? (
          <div className="auratio-volunteer-nav-item--active-box" style={{ top: '264px' }}>
            <span className="auratio-volunteer-nav-item--active">
              Availability
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.volunteer.availability)}
            className="auratio-volunteer-nav-item"
            style={{
              top: isScoring ? '272px' : '274px',
              color: isScoring ? 'var(--auratio-neutral-white)' : 'var(--auratio-brand-blue-200)',
            }}
          >
            Availability
          </button>
        )}

        {/* Sidebar Footer */}
        {!isScoring && (
          <>
            <div className="auratio-volunteer-sidebar-footer-title">
              Role-scoped navigation
            </div>
            <div className="auratio-volunteer-sidebar-footer-sub">
              Backend RBAC is authoritative.
            </div>
          </>
        )}
      </aside>

      {/* Topbar */}
      <header className="auratio-volunteer-topbar" aria-label="Portal Header">
        <h1 className="auratio-volunteer-topbar-title">{topbarTitle}</h1>

        {isScoring ? (
          <>
            <div className="auratio-volunteer-topbar-avatar" aria-label="Evaluator initials">
              AU
            </div>
            <div className="auratio-volunteer-topbar-user-role">
              Volunteer Evaluator
            </div>
          </>
        ) : (
          <div className="auratio-volunteer-topbar-pill">
            Volunteer Evaluator
          </div>
        )}
      </header>

      {/* Page Content */}
      <section className="auratio-volunteer-content">
        {children}
      </section>
    </main>
  )
}
