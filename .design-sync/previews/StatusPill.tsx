import { StatusPill } from 'betta-tank-tracker'

const STATUSES = ['in-range', 'watch', 'out-of-range', 'unknown'] as const

export const AllStatuses = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {STATUSES.map((s) => (
      <StatusPill key={s} status={s} />
    ))}
  </div>
)

export const Small = () => (
  <div style={{ display: 'flex', gap: 8 }}>
    <StatusPill status="in-range" size="sm" />
    <StatusPill status="watch" size="sm" />
  </div>
)
