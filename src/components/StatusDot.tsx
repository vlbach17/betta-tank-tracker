import type { DotItemDotProps } from 'recharts'
import { CHART_COLORS } from '../lib/chartColors'
import { getReadingStatus, type ReadingStatus } from '../lib/status'
import type { Reading } from '../types/database'

export function makeStatusDot(
  idealMin: number | null,
  idealMax: number | null,
  radius = 4,
) {
  return (props: DotItemDotProps) => {
    const { cx, cy, key } = props
    const payload = props.payload as Reading
    if (cx == null || cy == null || !payload) return <g key={key} />

    const status = getReadingStatus(payload.value, idealMin, idealMax)
    const color =
      status === 'out-of-range'
        ? CHART_COLORS.bad
        : status === 'watch'
          ? CHART_COLORS.watch
          : status === 'in-range'
            ? CHART_COLORS.good
            : CHART_COLORS.line

    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    )
  }
}

export type DotStatus = ReadingStatus | 'overdue'

const DOT_CLASSES: Record<DotStatus, string> = {
  'in-range': 'bg-status-good',
  watch: 'bg-status-watch',
  'out-of-range': 'bg-status-bad',
  unknown: 'bg-line-2',
  overdue: 'bg-line-2',
}

export function StatusDot({
  status,
  size = 10,
}: {
  status: DotStatus
  size?: number
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${DOT_CLASSES[status]}`}
      style={{ width: size, height: size }}
    />
  )
}
