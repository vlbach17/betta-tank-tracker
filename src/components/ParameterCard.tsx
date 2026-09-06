import { Link } from 'react-router-dom'
import {
  formatIdealRange,
  formatReadingValue,
  formatRelativeTime,
} from '../lib/format'
import type { ParameterWithLatestReading } from '../lib/parameters'
import { getReadingStatus, isOverdue } from '../lib/status'
import {
  TEMPERATURE_PARAMETER_NAME,
  convertTempForDisplay,
  tempUnitLabel,
} from '../lib/temperature'
import { useTempUnit } from '../lib/useTempUnit'
import { StatusPill } from './StatusPill'

export function ParameterCard({
  parameter,
}: {
  parameter: ParameterWithLatestReading
}) {
  const { tempUnit } = useTempUnit()
  const { name, unit, ideal_min, ideal_max, latestReading } = parameter
  const overdue = isOverdue(name, latestReading?.tested_at ?? null)
  const status = latestReading
    ? getReadingStatus(latestReading.value, ideal_min, ideal_max)
    : null

  const isTemperature = name === TEMPERATURE_PARAMETER_NAME
  const displayUnit = isTemperature ? tempUnitLabel(tempUnit) : unit
  const displayIdealMin =
    isTemperature && ideal_min != null
      ? convertTempForDisplay(ideal_min, tempUnit)
      : ideal_min
  const displayIdealMax =
    isTemperature && ideal_max != null
      ? convertTempForDisplay(ideal_max, tempUnit)
      : ideal_max
  const displayValue =
    isTemperature && latestReading
      ? convertTempForDisplay(latestReading.value, tempUnit)
      : (latestReading?.value ?? null)
  const rangeText = formatIdealRange(displayIdealMin, displayIdealMax)

  const accentClass =
    !latestReading || overdue
      ? 'bg-status-overdue'
      : status === 'in-range'
        ? 'bg-status-good'
        : status === 'watch'
          ? 'bg-status-watch'
          : status === 'out-of-range'
            ? 'bg-status-bad'
            : 'bg-status-overdue'

  return (
    <Link
      to={`/parameter/${parameter.id}`}
      className={`flex overflow-hidden rounded-xl border border-line active:opacity-80 ${
        overdue ? 'bg-status-overdue-bg/50' : 'bg-surface'
      }`}
    >
      <div className={`w-1.5 shrink-0 ${accentClass}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-base font-medium text-ink">
            {name}
            {displayUnit && (
              <span className="ml-1 font-mono text-sm font-normal text-ink-muted">
                ({displayUnit})
              </span>
            )}
          </h2>
          {status && <StatusPill status={status} />}
        </div>

        <p className="font-mono text-3xl font-medium tabular-nums text-ink">
          {displayValue != null ? formatReadingValue(displayValue) : '–'}
        </p>

        {rangeText && (
          <p className="font-mono text-xs text-ink-muted">{rangeText}</p>
        )}

        <p
          className={`font-mono text-xs ${
            overdue ? 'font-medium text-status-overdue-fg' : 'text-ink-muted'
          }`}
        >
          {latestReading
            ? overdue
              ? `${formatRelativeTime(latestReading.tested_at)} · Test overdue`
              : formatRelativeTime(latestReading.tested_at)
            : 'No readings yet'}
        </p>
      </div>
    </Link>
  )
}
