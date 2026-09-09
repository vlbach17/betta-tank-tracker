export type ReadingStatus = 'in-range' | 'watch' | 'out-of-range' | 'unknown'

export function getReadingStatus(
  value: number,
  idealMin: number | null,
  idealMax: number | null,
): ReadingStatus {
  if (idealMin == null || idealMax == null) return 'unknown'
  if (value >= idealMin && value <= idealMax) return 'in-range'

  const margin = (idealMax - idealMin) * 0.1
  if (value >= idealMin - margin && value <= idealMax + margin) return 'watch'
  return 'out-of-range'
}

const STATUS_RANK: Record<ReadingStatus, number> = {
  'out-of-range': 0,
  watch: 1,
  unknown: 2,
  'in-range': 3,
}

/** The most severe status among a set — an entry with any out-of-range reading reads as out-of-range. */
export function worstStatus(statuses: ReadingStatus[]): ReadingStatus {
  let worst: ReadingStatus = 'in-range'
  for (const status of statuses) {
    if (STATUS_RANK[status] < STATUS_RANK[worst]) worst = status
  }
  return worst
}

const OVERDUE_DAYS_DEFAULT = 14
const OVERDUE_DAYS_TEMPERATURE = 3

export function getOverdueThresholdDays(parameterName: string): number {
  return parameterName === 'Temperature'
    ? OVERDUE_DAYS_TEMPERATURE
    : OVERDUE_DAYS_DEFAULT
}

export function isOverdue(
  parameterName: string,
  testedAtIso: string | null,
): boolean {
  if (!testedAtIso) return false
  const thresholdDays = getOverdueThresholdDays(parameterName)
  const diffDays =
    (Date.now() - new Date(testedAtIso).getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > thresholdDays
}
