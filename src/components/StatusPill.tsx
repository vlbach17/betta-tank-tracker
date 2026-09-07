import type { ReadingStatus } from '../lib/status'

const STATUS_LABEL: Record<ReadingStatus, string> = {
  'in-range': 'In range',
  watch: 'Watch',
  'out-of-range': 'Out of range',
  unknown: 'No range set',
}

const STATUS_CLASSES: Record<ReadingStatus, string> = {
  'in-range': 'bg-status-good-bg text-status-good-fg',
  watch: 'bg-status-watch-bg text-status-watch-fg',
  'out-of-range': 'bg-status-bad-bg text-status-bad-fg',
  unknown: 'bg-status-overdue-bg text-status-overdue-fg',
}

export function StatusPill({
  status,
  size = 'md',
}: {
  status: ReadingStatus
  size?: 'md' | 'sm'
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full lowercase ${
        size === 'sm'
          ? 'px-2 py-0.5 text-label-sm font-sans'
          : 'px-2.5 py-1 text-label font-sans'
      } ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
