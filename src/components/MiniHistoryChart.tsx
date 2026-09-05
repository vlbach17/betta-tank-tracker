import { Link } from 'react-router-dom'
import {
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  YAxis,
} from 'recharts'
import { CHART_COLORS } from '../lib/chartColors'
import { formatIdealRange, formatReadingValue } from '../lib/format'
import { getReadingStatus, isOverdue } from '../lib/status'
import type { Parameter, Reading } from '../types/database'
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
  const { name, unit, ideal_min, ideal_max } = parameter
  const overdue = isOverdue(name, latestReading?.tested_at ?? null)
  const status = latestReading
    ? getReadingStatus(latestReading.value, ideal_min, ideal_max)
    : null
  const rangeText = formatIdealRange(ideal_min, ideal_max)

  return (
    <Link
      to={`/parameter/${parameter.id}`}
      className={`flex flex-col gap-2 rounded-xl border border-line p-4 active:opacity-80 ${
        overdue ? 'bg-status-overdue-bg/50' : 'bg-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-medium text-ink">
          {name}
          {unit && (
            <span className="ml-1 font-mono text-sm font-normal text-ink-muted">
              ({unit})
            </span>
          )}
        </h2>
        {status && <StatusPill status={status} />}
      </div>

      {chartReadings.length === 0 ? (
        <div className="flex h-28 items-center justify-center text-sm text-ink-muted">
          Not enough data in this range
        </div>
      ) : (
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartReadings}
              margin={{ top: 4, right: 4, left: -6, bottom: 0 }}
            >
              {ideal_min != null && ideal_max != null && (
                <ReferenceArea
                  y1={ideal_min}
                  y2={ideal_max}
                  fill={CHART_COLORS.band}
                  fillOpacity={0.12}
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
                dot={makeStatusDot(ideal_min, ideal_max, 3)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p
        className={`font-mono text-xs ${
          overdue ? 'font-medium text-status-overdue-fg' : 'text-ink-muted'
        }`}
      >
        {latestReading
          ? `${formatReadingValue(latestReading.value)}${unit ? ` ${unit}` : ''}${
              rangeText ? ` · ${rangeText}` : ''
            }${overdue ? ' · Test overdue' : ''}`
          : 'No readings yet'}
      </p>
    </Link>
  )
}
