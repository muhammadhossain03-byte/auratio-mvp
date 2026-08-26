import type { ReactNode } from 'react'

import { PortalSidebarItem } from './PortalSidebarItem'
import './portal-navigation.css'

export type PortalNavigationItem = {
  id: string
  label: string
  to: string
  icon: ReactNode
  end?: boolean
}

type PortalShellProps = {
  brand: ReactNode
  navigation: readonly PortalNavigationItem[]
  children: ReactNode
  header?: ReactNode
  roleLabel?: string
  sidebarFooter?: ReactNode
}

export function PortalShell({
  brand,
  navigation,
  children,
  header,
  roleLabel,
  sidebarFooter,
}: PortalShellProps) {
  return (
    <div className="auratio-portal-shell">
      <aside className="auratio-portal-shell__sidebar">
        <div className="auratio-portal-shell__brand">
          {brand}
          {roleLabel && (
            <span className="auratio-portal-shell__role">{roleLabel}</span>
          )}
        </div>
        <nav aria-label="Portal navigation" className="auratio-portal-shell__nav">
          {navigation.map((item) => (
            <PortalSidebarItem
              end={item.end}
              icon={item.icon}
              key={item.id}
              label={item.label}
              to={item.to}
            />
          ))}
        </nav>
        {sidebarFooter && (
          <div className="auratio-portal-shell__sidebar-footer">
            {sidebarFooter}
          </div>
        )}
      </aside>
      <div className="auratio-portal-shell__workspace">
        {header && <header className="auratio-portal-shell__header">{header}</header>}
        <main className="auratio-portal-shell__content">{children}</main>
      </div>
    </div>
  )
}
