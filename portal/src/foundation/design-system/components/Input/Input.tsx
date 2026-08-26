import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

import './Input.css'

type AuratioInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string
  helperText?: string
  errorText?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export function AuratioInput({
  label,
  helperText,
  errorText,
  prefix,
  suffix,
  className,
  id,
  disabled,
  ...props
}: AuratioInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const supportId = `${inputId}-support`
  const classes = [
    'auratio-input',
    errorText ? 'auratio-input--error' : '',
    disabled ? 'auratio-input--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <label className="auratio-input__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="auratio-input__control">
        {prefix && <span className="auratio-input__adornment">{prefix}</span>}
        <input
          {...props}
          aria-describedby={helperText || errorText ? supportId : undefined}
          aria-invalid={Boolean(errorText)}
          className="auratio-input__field"
          disabled={disabled}
          id={inputId}
        />
        {suffix && <span className="auratio-input__adornment">{suffix}</span>}
      </div>
      {(errorText || helperText) && (
        <span className="auratio-input__support" id={supportId}>
          {errorText ?? helperText}
        </span>
      )}
    </div>
  )
}
