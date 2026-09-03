import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
}

export function AuthInput({
  label,
  id,
  className = '',
  style,
  error,
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
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            display: 'block',
            color: '#B42318',
            fontSize: '11px',
            lineHeight: '16px',
            marginTop: '4px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
