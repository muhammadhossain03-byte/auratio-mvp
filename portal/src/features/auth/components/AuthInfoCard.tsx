import type { CSSProperties } from 'react'

interface AuthInfoCardProps {
  title: string
  body: string
  className?: string
  style?: CSSProperties
}

export function AuthInfoCard({ title, body, className = '', style }: AuthInfoCardProps) {
  return (
    <div className={`auratio-auth-info-card ${className}`.trim()} style={style}>
      <h4 className="auratio-auth-info-title">{title}</h4>
      <p className="auratio-auth-info-body">{body}</p>
    </div>
  )
}
