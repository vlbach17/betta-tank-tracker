import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getLargestSwing } from '../lib/analysis'
import { CHART_COLORS } from '../lib/chartColors'
import {
  formatFullDate,
  formatIdealRange,
  formatReadingValue,
  formatShortDate,
} from '../lib/format'
import {
  deleteReading,
  fetchParameter,
  fetchReadingsForParameter,
} from '../lib/parameters'
import { isWithinRange, type Range } from '../lib/range'
import {
  TEMPERATURE_PARAMETER_NAME,
  convertTempDeltaForDisplay,
  convertTempForDisplay,
  tempUnitLabel,
} from '../lib/temperature'
import { useTempUnit } from '../lib/useTempUnit'
import type { Parameter, Reading } from '../types/database'
import { BackLink } from './BackLink'
import { RangeToggle } from './RangeToggle'
import { makeStatusDot } from './StatusDot'

export function ParameterHistory() {
  const { parameterId } = useParams<{ parameterId: string }>()
  const { tempUnit } = useTempUnit()

  const [parameter, setParameter] = useState<Parameter | null>(null)
  const [readings, setReadings] = useState<Reading[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('30')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!parameterId) return
    let cancelled = false

    Promise.all([
      fetchParameter(parameterId),
      fetchReadingsForParameter(parameterId),
    ])
      .then(([parameterData, readingsData]) => {
        if (cancelled) return
        setParameter(parameterData)
        setReadings(readingsData)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })

    return () => {
      cancelled = true
    }
  }, [parameterId])

  const isTemperature = parameter?.name === TEMPERATURE_PARAMETER_NAME
  const displayUnit = isTemperature ? tempUnitLabel(tempUnit) : parameter?.unit
  const displayIdealMin =
    isTemperature && parameter?.ideal_min != null
      ? convertTempForDisplay(parameter.ideal_min, tempUnit)
      : (parameter?.ideal_min ?? null)
  const displayIdealMax =
    isTemperature && parameter?.ideal_max != null
      ? convertTempForDisplay(parameter.ideal_max, tempUnit)
      : (parameter?.ideal_max ?? null)

  const readingsDesc = useMemo(
    () => (readings ?? []).filter((r) => isWithinRange(r.tested_at, range)),
    [readings, range],
  )
  const readingsAsc = useMemo(
    () => [...readingsDesc].reverse(),
    [readingsDesc],
  )
  const displayReadingsDesc = useMemo(
    () =>
      isTemperature
        ? readingsDesc.map((r) => ({
            ...r,
            value: convertTempForDisplay(r.value, tempUnit),
          }))
        : readingsDesc,
    [readingsDesc, isTemperature, tempUnit],
  )
  const displayReadingsAsc = useMemo(
    () => [...displayReadingsDesc].reverse(),
    [displayReadingsDesc],
  )

  const swing = isTemperature ? getLargestSwing(readingsAsc) : null
  const displaySwingDelta =
    swing && isTemperature
      ? convertTempDeltaForDisplay(swing.delta, tempUnit)
      : swing?.delta

  async function handleDelete(id: string) {
    setDeleteError(null)
    const previous = readings
    setReadings((rs) => (rs ?? []).filter((r) => r.id !== id))
    setConfirmingId(null)
    try {
      await deleteReading(id)
    } catch (err) {
      setReadings(previous ?? null)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col px-4 pt-4 pb-8">
      <BackLink to="/" label="Dashboard" />

      {loadError && (
        <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
          Couldn't load history: {loadError}
        </p>
      )}

      {!loadError && !parameter && (
        <p className="text-sm text-ink-muted">Loading…</p>
      )}

      {parameter && (
        <>
          <h1 className="font-heading text-xl font-semibold text-ink">
            {parameter.name}
            {displayUnit && (
              <span className="ml-1 font-mono text-base font-normal text-ink-muted">
                ({displayUnit})
              </span>
            )}
          </h1>
          {formatIdealRange(displayIdealMin, displayIdealMax) && (
            <p className="mb-4 font-mono text-xs text-ink-muted">
              {formatIdealRange(displayIdealMin, displayIdealMax)}
            </p>
          )}

          <div className="mb-4">
            <RangeToggle value={range} onChange={setRange} />
          </div>

          {displayReadingsAsc.length === 0 && (
            <p className="mb-4 text-sm text-ink-muted">
              No readings in this range.
            </p>
          )}

          {displayReadingsAsc.length > 0 && (
            <div className="mb-2 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={displayReadingsAsc}
                  margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
                >
                  <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                  {displayIdealMin != null && displayIdealMax != null && (
                    <ReferenceArea
                      y1={displayIdealMin}
                      y2={displayIdealMax}
                      fill={CHART_COLORS.band}
                      fillOpacity={0.12}
                      stroke="none"
                    />
                  )}
                  <XAxis
                    dataKey="tested_at"
                    tickFormatter={formatShortDate}
                    stroke={CHART_COLORS.axis}
                    fontSize={11}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    stroke={CHART_COLORS.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(value) => formatReadingValue(Number(value))}
                    labelFormatter={(label) => formatFullDate(String(label))}
                    contentStyle={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      borderRadius: 8,
                      borderColor: CHART_COLORS.grid,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.line}
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={makeStatusDot(
                      displayIdealMin,
                      displayIdealMax,
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {swing && (
            <p className="mb-4 font-mono text-xs text-ink-muted">
              Largest swing in this range:{' '}
              <span className="font-medium text-ink">
                {formatReadingValue(displaySwingDelta ?? swing.delta)}
                {displayUnit}
              </span>{' '}
              ({formatShortDate(swing.from.tested_at)} to{' '}
              {formatShortDate(swing.to.tested_at)})
            </p>
          )}

          {deleteError && (
            <p className="mb-4 rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
              {deleteError}
            </p>
          )}

          <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
            {displayReadingsDesc.length === 0 && (
              <p className="p-4 text-sm text-ink-muted">
                No readings logged yet.
              </p>
            )}
            {displayReadingsDesc.map((reading) => (
              <div key={reading.id} className="flex flex-col gap-1 p-4">
                {confirmingId === reading.id ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink">
                      Delete this reading?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="h-9 rounded-lg border border-line px-3 font-heading text-sm font-medium text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(reading.id)}
                        className="h-9 rounded-lg bg-status-bad px-3 font-heading text-sm font-medium text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-lg tabular-nums text-ink">
                        {formatReadingValue(reading.value)}
                        {displayUnit && (
                          <span className="ml-1 text-xs text-ink-muted">
                            {displayUnit}
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-xs text-ink-muted">
                        {formatFullDate(reading.tested_at)}
                      </p>
                      {reading.note && (
                        <p className="mt-1 text-sm text-ink">
                          {reading.note}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(reading.id)}
                      aria-label="Delete reading"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-status-bad-fg"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 5h11M7.25 5V3.5a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1V5M8.5 8v5M6.5 8.5v4M10.5 8.5v4M4.5 5l.6 8.4a1 1 0 0 0 1 .93h5.8a1 1 0 0 0 1-.93L13.5 5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
