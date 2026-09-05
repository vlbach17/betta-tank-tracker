export function formatRelativeTime(dateIso: string): string {
  const diffMs = Date.now() - new Date(dateIso).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return plural(diffMin, 'minute') + ' ago'
  if (diffHour < 24) return plural(diffHour, 'hour') + ' ago'
  if (diffDay < 7) return plural(diffDay, 'day') + ' ago'
  if (diffDay < 30) return plural(Math.floor(diffDay / 7), 'week') + ' ago'
  if (diffDay < 365) return plural(Math.floor(diffDay / 30), 'month') + ' ago'
  return plural(Math.floor(diffDay / 365), 'year') + ' ago'
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`
}

export function formatReadingValue(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function formatIdealRange(
  min: number | null,
  max: number | null,
): string | null {
  if (min == null && max == null) return null
  if (min == null) return `ideal up to ${formatReadingValue(max as number)}`
  if (max == null) return `ideal ${formatReadingValue(min)}+`
  if (min === max) return `ideal ${formatReadingValue(min)}`
  return `ideal ${formatReadingValue(min)}–${formatReadingValue(max)}`
}

export function formatShortDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function formatFullDate(dateIso: string): string {
  return new Date(dateIso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
