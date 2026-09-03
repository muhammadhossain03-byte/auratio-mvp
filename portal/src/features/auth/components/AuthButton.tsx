import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  presentationOnly?: boolean
  variant?: 'primary' | 'secondary'
}

export function AuthButton({
  children,
  className = '',
  type = 'button',
  presentationOnly = false,
  variant = 'primary',
  style,
  ...props
}: AuthButtonProps) {
  const variantClass = variant === 'secondary' ? 'auratio-auth-btn--secondary' : ''

  if (presentationOnly) {
    return (
      <div
        role="presentation"
        aria-hidden="true"
        className={`auratio-auth-btn ${variantClass} auratio-auth-btn--presentation ${className}`.trim()}
        style={style as CSSProperties}
      >
        {children}
      </div>
    )
  }

  return (
    <button
      type={type}
      className={`auratio-auth-btn ${variantClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
