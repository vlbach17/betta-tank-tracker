import { RANGE_OPTIONS, type Range } from '../lib/range'

export function RangeToggle({
  value,
  onChange,
}: {
  value: Range
  onChange: (range: Range) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-line bg-surface p-1">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`h-9 flex-1 rounded-md font-heading text-sm font-medium ${
            value === opt.value ? 'bg-accent text-white' : 'text-ink-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
