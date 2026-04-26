import { AlertTriangle, Ban, CheckCircle2, Clock3, LoaderCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  ACTIVE: { tone: 'success', icon: CheckCircle2, label: 'Active' },
  APPROVED: { tone: 'success', icon: CheckCircle2, label: 'Approved' },
  RESOLVED: { tone: 'success', icon: CheckCircle2, label: 'Resolved' },
  OPEN: { tone: 'info', icon: AlertTriangle, label: 'Open' },
  IN_PROGRESS: { tone: 'info', icon: LoaderCircle, label: 'In Progress' },
  PENDING: { tone: 'warning', icon: Clock3, label: 'Pending' },
  OUT_OF_SERVICE: { tone: 'danger', icon: XCircle, label: 'Out Of Service' },
  REJECTED: { tone: 'danger', icon: XCircle, label: 'Rejected' },
  CANCELLED: { tone: 'neutral', icon: Ban, label: 'Cancelled' },
  CLOSED: { tone: 'neutral', icon: Ban, label: 'Closed' },
}

const humanize = (value) =>
  value
    ?.toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Unknown'

const StatusBadge = ({ status, label, icon: IconOverride, className = '' }) => {
  const config = STATUS_CONFIG[status] || { tone: 'neutral', icon: AlertTriangle, label: humanize(status) }
  const Icon = IconOverride || config.icon
  const classes = ['ui-status-badge', `ui-status-badge--${config.tone}`, className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {Icon ? <Icon size={14} /> : null}
      <span>{label || config.label}</span>
    </span>
  )
}

export default StatusBadge
