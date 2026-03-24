interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusStyles: Record<string, string> = {
  final: 'badge-success',
  draft: 'badge-warning',
  superseded: 'badge-neutral',
  ok: 'badge-success',
  stale: 'badge-warning',
  error: 'badge-error',
  normal: 'badge-success',
  warning: 'badge-warning',
  alert: 'badge-error',
  critical: 'badge-error',
  idle: 'badge-neutral',
  running: 'badge-success',
  HIGH: 'badge-success',
  MEDIUM: 'badge-warning',
  LOW: 'badge-error',
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = statusStyles[status] || 'badge-neutral'
  const sizeClass = size === 'md' ? 'text-sm px-2.5 py-1' : ''

  return (
    <span className={`${style} ${sizeClass}`}>
      {status}
    </span>
  )
}
