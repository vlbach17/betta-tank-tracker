export type Range = '30' | '90' | 'all'

export const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: 'all', label: 'All' },
]

export function isWithinRange(testedAtIso: string, range: Range): boolean {
  if (range === 'all') return true
  const days = Number(range)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(testedAtIso).getTime() >= cutoff
}
