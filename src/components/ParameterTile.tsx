import { Link } from 'react-router-dom'
import {
  formatIdealRange,
  formatReadingValue,
  formatRelativeTime,
} from '../lib/format'
import { getDisplayUnit, toDisplayValue } from '../lib/displayUnit'
import { useHardnessUnit } from '../lib/useHardnessUnit'
import type { ParameterWithLatestReading } from '../lib/parameters'
import { getParameterIcon } from '../lib/parameterIcons'
import { getReadingStatus, isOverdue } from '../lib/status'
import { TEMPERATURE_PARAMETER_NAME } from '../lib/temperature'
import { useTempUnit } from '../lib/useTempUnit'
import { Icon } from './Icon'
import { StatusDot, type DotStatus } from './StatusDot'
import { StatusPill } from './StatusPill'

export function ParameterTile({
  parameter,
  hero = false,
}: {
  parameter: ParameterWithLatestReading
  hero?: boolean
}) {
  const { tempUnit } = useTempUnit()
  const { hardnessUnit } = useHardnessUnit()
  const { id, name, ideal_min, ideal_max, latestReading } = parameter
  const overdue = isOverdue(name, latestReading?.tested_at ?? null)
  const status = latestReading
    ? getReadingStatus(latestReading.value, ideal_min, ideal_max)
    : null

  const isTemperature = name === TEMPERATURE_PARAMETER_NAME
  const displayUnit = getDisplayUnit(parameter, tempUnit, hardnessUnit)
  const displayIdealMin =
    ideal_min != null
      ? toDisplayValue(ideal_min, parameter, tempUnit, hardnessUnit)
      : ideal_min
  const displayIdealMax =
    ideal_max != null
      ? toDisplayValue(ideal_max, parameter, tempUnit, hardnessUnit)
      : ideal_max
  const displayValue = latestReading
    ? toDisplayValue(latestReading.value, parameter, tempUnit, hardnessUnit)
    : null
  const rangeText = formatIdealRange(displayIdealMin, displayIdealMax)

  const overdueVisual = !latestReading || overdue
  const dotStatus: DotStatus = overdueVisual ? 'overdue' : (status ?? 'unknown')
  const valueColorClass =
    status === 'out-of-range' ? 'text-status-bad' : 'text-ink'
  const agoText = latestReading
    ? overdue
      ? `${formatRelativeTime(latestReading.tested_at)} · Test overdue`
      : formatRelativeTime(latestReading.tested_at)
    : 'No readings yet'

  const nameLabel = isTemperature ? 'Temp' : name
  const icon = getParameterIcon(name)

  if (hero) {
    return (
      <Link
        to={`/parameter/${id}`}
        className="col-span-2 flex items-center justify-between gap-3 rounded-tile border border-line bg-surface p-4 shadow-tile active:opacity-80"
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            {icon && <Icon name={icon} size={18} className="shrink-0 text-ink-3" />}
            <span className="min-w-0 flex-1 truncate text-heading font-sans text-ink">
              {nameLabel}
            </span>
            {status && <StatusPill status={status} size="sm" />}
          </div>
          {rangeText && (
            <p className="text-meta font-mono text-ink-3">{rangeText}</p>
          )}
          <p
            className={`text-meta font-mono ${overdueVisual ? 'font-semibold text-status-overdue-fg' : 'text-ink-3'}`}
          >
            {agoText}
          </p>
        </div>
        <p className={`text-num-xl font-mono tabular-nums ${valueColorClass}`}>
          {displayValue != null ? formatReadingValue(displayValue) : '–'}
          {isTemperature && displayValue != null && '°'}
        </p>
      </Link>
    )
  }

  return (
    <Link
      to={`/parameter/${id}`}
      className={`flex flex-col gap-2 rounded-tile p-4 active:opacity-80 ${
        overdueVisual
          ? 'border border-dashed border-line-2 bg-mist-2'
          : 'border border-line bg-surface shadow-tile'
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {icon && <Icon name={icon} size={18} className="shrink-0 text-ink-3" />}
        <StatusDot status={dotStatus} />
        <span className="min-w-0 flex-1 truncate text-heading font-sans text-ink">
          {nameLabel}
          {displayUnit && (
            <span className="ml-1 text-meta font-mono text-ink-3">
              ({displayUnit})
            </span>
          )}
        </span>
      </div>

      <p className={`text-num-lg font-mono tabular-nums ${valueColorClass}`}>
        {displayValue != null ? formatReadingValue(displayValue) : '–'}
        {isTemperature && displayValue != null && '°'}
      </p>

      {rangeText && <p className="text-meta font-mono text-ink-3">{rangeText}</p>}

      <p
        className={`text-meta font-mono ${overdueVisual ? 'font-semibold text-status-overdue-fg' : 'text-ink-3'}`}
      >
        {agoText}
      </p>
    </Link>
  )
}
