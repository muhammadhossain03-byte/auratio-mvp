import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import './portal-navigation.css'

type PortalSidebarItemProps = {
  label: string
  to: string
  icon: ReactNode
  end?: boolean
}

export function PortalSidebarItem({
  label,
  to,
  icon,
  end,
}: PortalSidebarItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `auratio-sidebar-item${isActive ? ' auratio-sidebar-item--active' : ''}`
      }
      end={end}
      to={to}
    >
      <span aria-hidden="true" className="auratio-sidebar-item__icon">
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}
