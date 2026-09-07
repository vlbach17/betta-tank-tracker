import { RANGE_OPTIONS, type Range } from '../lib/range'

export function RangeToggle({
  value,
  onChange,
}: {
  value: Range
  onChange: (range: Range) => void
}) {
  return (
    <div role="tablist" className="flex gap-1 rounded-full bg-mist p-1">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`h-9 flex-1 rounded-full text-label font-sans transition-colors ${
            value === opt.value
              ? 'bg-surface text-ink shadow-segment'
              : 'text-ink-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
