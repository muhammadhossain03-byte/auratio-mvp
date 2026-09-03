import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  presentationOnly?: boolean
}

export function AuthButton({
  children,
  className = '',
  type = 'button',
  presentationOnly = false,
  style,
  ...props
}: AuthButtonProps) {
  if (presentationOnly) {
    return (
      <div
        role="presentation"
        aria-hidden="true"
        className={`auratio-auth-btn auratio-auth-btn--presentation ${className}`.trim()}
        style={style as CSSProperties}
      >
        {children}
      </div>
    )
  }

  return (
    <button
      type={type}
      className={`auratio-auth-btn ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}
