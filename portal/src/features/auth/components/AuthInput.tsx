import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export function AuthInput({
  label,
  id,
  className = '',
  style,
  ...props
}: AuthInputProps) {
  return (
    <div className="auratio-auth-field" style={style}>
      <label htmlFor={id} className="auratio-auth-label">
        {label}
      </label>
      <input
        id={id}
        className={`auratio-auth-input ${className}`.trim()}
        {...props}
      />
    </div>
  )
}
