import { StatusDot } from 'betta-tank-tracker'

const STATUSES = ['in-range', 'watch', 'out-of-range', 'unknown', 'overdue'] as const

export const AllStatuses = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {STATUSES.map((s) => (
      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status={s} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-ink)' }}>
          {s}
        </span>
      </div>
    ))}
  </div>
)

export const Large = () => (
  <div style={{ display: 'flex', gap: 12 }}>
    <StatusDot status="in-range" size={16} />
    <StatusDot status="watch" size={16} />
    <StatusDot status="out-of-range" size={16} />
  </div>
)
