import type { ButtonHTMLAttributes, ReactNode } from 'react'

import './ChipTab.css'

type AuratioChipTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  selected: boolean
  auratioSize?: 'small' | 'medium'
}

export function AuratioChipTab({
  children,
  selected,
  auratioSize = 'small',
  className,
  type = 'button',
  ...props
}: AuratioChipTabProps) {
  const classes = [
    'auratio-chip-tab',
    selected ? 'auratio-chip-tab--selected' : '',
    `auratio-chip-tab--${auratioSize}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-pressed={selected}
      className={classes}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
