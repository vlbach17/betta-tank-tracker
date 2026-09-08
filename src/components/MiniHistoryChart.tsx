import { Link } from 'react-router-dom'
import {
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  YAxis,
} from 'recharts'
import { CHART_COLORS } from '../lib/chartColors'
import { getDisplayUnit, toDisplayValue } from '../lib/displayUnit'
import { formatIdealRange, formatReadingValue } from '../lib/format'
import { getParameterIcon } from '../lib/parameterIcons'
import { getReadingStatus, isOverdue } from '../lib/status'
import { useHardnessUnit } from '../lib/useHardnessUnit'
import { useTempUnit } from '../lib/useTempUnit'
import type { Parameter, Reading } from '../types/database'
import { Icon } from './Icon'
import { makeStatusDot } from './StatusDot'
import { StatusPill } from './StatusPill'

export function MiniHistoryChart({
  parameter,
  chartReadings,
  latestReading,
}: {
  parameter: Parameter
  /** Ascending, already filtered to the selected range. */
  chartReadings: Reading[]
  /** Most recent reading overall, independent of the selected range. */
  latestReading: Reading | null
}) {
  const { tempUnit } = useTempUnit()
  const { hardnessUnit } = useHardnessUnit()
  const { name, ideal_min, ideal_max } = parameter
  const overdue = isOverdue(name, latestReading?.tested_at ?? null)
  const status = latestReading
    ? getReadingStatus(latestReading.value, ideal_min, ideal_max)
    : null

  const displayUnit = getDisplayUnit(parameter, tempUnit, hardnessUnit)
  const displayIdealMin =
    ideal_min != null
      ? toDisplayValue(ideal_min, parameter, tempUnit, hardnessUnit)
      : ideal_min
  const displayIdealMax =
    ideal_max != null
      ? toDisplayValue(ideal_max, parameter, tempUnit, hardnessUnit)
      : ideal_max
  const displayChartReadings = chartReadings.map((r) => ({
    ...r,
    value: toDisplayValue(r.value, parameter, tempUnit, hardnessUnit),
  }))
  const displayLatestValue = latestReading
    ? toDisplayValue(latestReading.value, parameter, tempUnit, hardnessUnit)
    : null
  const rangeText = formatIdealRange(displayIdealMin, displayIdealMax)
  const icon = getParameterIcon(name)

  return (
    <Link
      to={`/parameter/${parameter.id}`}
      className={`flex flex-col gap-2 rounded-tile p-4 active:opacity-80 ${
        overdue
          ? 'border border-dashed border-line-2 bg-mist-2'
          : 'border border-line bg-surface shadow-tile'
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-1.5 truncate text-heading font-sans text-ink">
          {icon && <Icon name={icon} size={18} className="shrink-0 text-ink-3" />}
          <span className="truncate">
            {name}
            {displayUnit && (
              <span className="ml-1 text-meta font-mono text-ink-3">
                ({displayUnit})
              </span>
            )}
          </span>
        </h2>
        {status && <StatusPill status={status} />}
      </div>

      {displayChartReadings.length === 0 ? (
        <div className="flex h-28 items-center justify-center text-body-sm font-sans text-ink-3">
          Not enough data in this range
        </div>
      ) : (
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayChartReadings}
              margin={{ top: 4, right: 4, left: -6, bottom: 0 }}
            >
              {displayIdealMin != null && displayIdealMax != null && (
                <ReferenceArea
                  y1={displayIdealMin}
                  y2={displayIdealMax}
                  fill={CHART_COLORS.band}
                  fillOpacity={0.18}
                  stroke="none"
                />
              )}
              <YAxis
                stroke={CHART_COLORS.axis}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={38}
                domain={['auto', 'auto']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.line}
                strokeWidth={2}
                isAnimationActive={false}
                dot={makeStatusDot(displayIdealMin, displayIdealMax, 3)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p
        className={`text-meta font-mono ${
          overdue ? 'font-semibold text-status-overdue-fg' : 'text-ink-3'
        }`}
      >
        {displayLatestValue != null
          ? `${formatReadingValue(displayLatestValue)}${
              displayUnit ? ` ${displayUnit}` : ''
            }${rangeText ? ` · ${rangeText}` : ''}${
              overdue ? ' · Test overdue' : ''
            }`
          : 'No readings yet'}
      </p>
    </Link>
  )
}
