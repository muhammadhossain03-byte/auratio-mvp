import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function AuthButton({
  children,
  className = '',
  type = 'button',
  ...props
}: AuthButtonProps) {
  return (
    <button
      type={type}
      className={`auratio-auth-btn ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
