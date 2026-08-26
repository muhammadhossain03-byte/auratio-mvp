import type { ButtonHTMLAttributes, ReactNode } from 'react'

import './Button.css'

export type AuratioButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost'
export type AuratioButtonSize = 'small' | 'medium'

type AuratioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: AuratioButtonVariant
  auratioSize?: AuratioButtonSize
  leading?: ReactNode
  trailing?: ReactNode
  expand?: boolean
}

export function AuratioButton({
  children,
  variant = 'primary',
  auratioSize = 'medium',
  leading,
  trailing,
  expand = false,
  className,
  type = 'button',
  ...props
}: AuratioButtonProps) {
  const classes = [
    'auratio-button',
    `auratio-button--${variant}`,
    `auratio-button--${auratioSize}`,
    expand ? 'auratio-button--expand' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={type} {...props}>
      <span className="auratio-button__surface">
        {leading && <span className="auratio-button__icon">{leading}</span>}
        <span className="auratio-button__label">{children}</span>
        {trailing && <span className="auratio-button__icon">{trailing}</span>}
      </span>
    </button>
  )
}
