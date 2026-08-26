import './StatusBadge.css'

export type AuratioStatus = 'processing' | 'pending' | 'approved' | 'rejected'

const labels: Record<AuratioStatus, string> = {
  processing: 'Processing',
  pending: 'Pending Moderation',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function AuratioStatusBadge({ status }: { status: AuratioStatus }) {
  return (
    <span
      aria-label={`Status: ${labels[status]}`}
      className={`auratio-status auratio-status--${status}`}
    >
      {labels[status]}
    </span>
  )
}
