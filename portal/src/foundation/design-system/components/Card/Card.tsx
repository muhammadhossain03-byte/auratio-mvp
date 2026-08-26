import type { HTMLAttributes, ReactNode } from 'react'

import './Card.css'

type AuratioCardProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode
  title?: string
  body?: string
  tone?: 'default' | 'brand-soft'
  elevation?: 'flat' | 'raised'
}

export function AuratioCard({
  children,
  title,
  body,
  tone = 'default',
  elevation = 'flat',
  className,
  ...props
}: AuratioCardProps) {
  const classes = [
    'auratio-card',
    `auratio-card--${tone}`,
    `auratio-card--${elevation}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={classes} {...props}>
      {children ?? (
        <>
          {title && <h3 className="auratio-card__title">{title}</h3>}
          {body && <p className="auratio-card__body">{body}</p>}
        </>
      )}
    </article>
  )
}
