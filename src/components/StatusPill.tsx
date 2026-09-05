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

export function StatusPill({ status }: { status: ReadingStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-heading text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
