import type { ReactNode } from 'react'
import logoSvg from '../../../assets/images/auratio_full_lockup.svg'
import '../styles/auth.css'

interface AuthLayoutProps {
  children: ReactNode
  ariaLabel?: string
}

export function AuthLayout({ children, ariaLabel = 'Auratio Portal Authentication' }: AuthLayoutProps) {
  return (
    <div className="auratio-auth-viewport" role="region" aria-label={ariaLabel}>
      <img
        src={logoSvg}
        alt="Auratio - Where Greats Orate"
        className="auratio-auth-logo"
        width={260}
        height={77}
      />
      <main className="auratio-auth-card">
        {children}
      </main>
    </div>
  )
}
