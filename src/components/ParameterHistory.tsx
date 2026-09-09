import { useEffect, useId, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
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
import { getDisplayUnit, toDisplayValue } from '../lib/displayUnit'
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
import { getParameterIcon } from '../lib/parameterIcons'
import { getReadingStatus } from '../lib/status'
import { isWithinRange, type Range } from '../lib/range'
import { TEMPERATURE_PARAMETER_NAME, convertTempDeltaForDisplay } from '../lib/temperature'
import { useHardnessUnit } from '../lib/useHardnessUnit'
import { useTempUnit } from '../lib/useTempUnit'
import type { Parameter, Reading } from '../types/database'
import { BackLink } from './BackLink'
import { Button } from './Button'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import { Notice } from './Notice'
import { RangeToggle } from './RangeToggle'
import { StatusDot } from './StatusDot'
import { StatusPill } from './StatusPill'
import { makeStatusDot } from './StatusDot'

export function ParameterHistory() {
  const { parameterId } = useParams<{ parameterId: string }>()
  const { tempUnit } = useTempUnit()
  const { hardnessUnit } = useHardnessUnit()
  const gradientId = useId()

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
  const icon = parameter ? getParameterIcon(parameter.name) : undefined
  const displayUnit = parameter
    ? getDisplayUnit(parameter, tempUnit, hardnessUnit)
    : undefined
  const displayIdealMin =
    parameter && parameter.ideal_min != null
      ? toDisplayValue(parameter.ideal_min, parameter, tempUnit, hardnessUnit)
      : (parameter?.ideal_min ?? null)
  const displayIdealMax =
    parameter && parameter.ideal_max != null
      ? toDisplayValue(parameter.ideal_max, parameter, tempUnit, hardnessUnit)
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
      parameter
        ? readingsDesc.map((r) => ({
            ...r,
            value: toDisplayValue(r.value, parameter, tempUnit, hardnessUnit),
          }))
        : readingsDesc,
    [readingsDesc, parameter, tempUnit, hardnessUnit],
  )
  const displayReadingsAsc = useMemo(
    () => [...displayReadingsDesc].reverse(),
    [displayReadingsDesc],
  )
  const rowStatusesDesc = useMemo(
    () =>
      readingsDesc.map((r) =>
        getReadingStatus(
          r.value,
          parameter?.ideal_min ?? null,
          parameter?.ideal_max ?? null,
        ),
      ),
    [readingsDesc, parameter],
  )

  const latest = readings?.[0] ?? null
  const latestDisplayValue =
    latest && parameter
      ? toDisplayValue(latest.value, parameter, tempUnit, hardnessUnit)
      : (latest?.value ?? null)
  const latestStatus = latest
    ? getReadingStatus(latest.value, parameter?.ideal_min ?? null, parameter?.ideal_max ?? null)
    : null

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
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-28">
      <BackLink to="/" label="Dashboard" />

      {loadError && <Notice>Couldn't load history: {loadError}</Notice>}

      {!loadError && !parameter && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {parameter && (
        <>
          <div
            className="flex flex-col gap-3 rounded-card p-5"
            style={{ backgroundImage: 'var(--gradient-hero-wash)' }}
          >
            <div className="flex min-w-0 items-center gap-2">
              {icon && <Icon name={icon} size={24} className="shrink-0 text-ink-3" />}
              <h1 className="min-w-0 truncate text-title font-name text-ink">
                {parameter.name}
              </h1>
              {latestStatus && <StatusPill status={latestStatus} size="sm" />}
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-display-xl font-mono tabular-nums tracking-[-0.03em] text-ink">
                {latestDisplayValue != null
                  ? formatReadingValue(latestDisplayValue)
                  : '–'}
              </p>
              {displayUnit && (
                <span className="text-meta font-mono text-ink-3">
                  {displayUnit}
                </span>
              )}
            </div>
            {formatIdealRange(displayIdealMin, displayIdealMax) && (
              <p className="text-meta font-mono text-ink-3">
                {formatIdealRange(displayIdealMin, displayIdealMax)}
              </p>
            )}

            {displayReadingsAsc.length === 0 && (
              <p className="text-body-sm font-sans text-ink-3">
                Not enough data in this range.
              </p>
            )}

            {displayReadingsAsc.length > 0 && (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displayReadingsAsc}
                    margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#14b8c4" />
                        <stop offset="50%" stopColor="#3b5bdb" />
                        <stop offset="75%" stopColor="#8b3fd6" />
                        <stop offset="100%" stopColor="#d63a8f" />
                      </linearGradient>
                    </defs>
                    {displayIdealMin != null && displayIdealMax != null && (
                      <ReferenceArea
                        y1={displayIdealMin}
                        y2={displayIdealMax}
                        fill={CHART_COLORS.band}
                        fillOpacity={0.18}
                        stroke="none"
                      />
                    )}
                    <XAxis
                      dataKey="tested_at"
                      tickFormatter={formatShortDate}
                      stroke={CHART_COLORS.axis}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
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
                        borderRadius: 12,
                        border: '1px solid var(--color-line)',
                        boxShadow: 'var(--shadow-tile)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={`url(#${gradientId})`}
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      isAnimationActive={false}
                      dot={makeStatusDot(displayIdealMin, displayIdealMax, 5)}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {displayReadingsAsc.length > 0 && (
              <div className="flex justify-between text-meta font-mono text-ink-3">
                <span>{formatShortDate(displayReadingsAsc[0].tested_at)}</span>
                <span>
                  {formatShortDate(
                    displayReadingsAsc[displayReadingsAsc.length - 1]
                      .tested_at,
                  )}
                </span>
              </div>
            )}
          </div>

          <RangeToggle value={range} onChange={setRange} />

          {swing && (
            <p className="text-meta font-mono text-ink-3">
              Largest swing in this range:{' '}
              <span className="font-semibold text-ink">
                {formatReadingValue(displaySwingDelta ?? swing.delta)}
                {displayUnit}
              </span>{' '}
              ({formatShortDate(swing.from.tested_at)} to{' '}
              {formatShortDate(swing.to.tested_at)})
            </p>
          )}

          {deleteError && <Notice>{deleteError}</Notice>}

          <div className="flex flex-col gap-2">
            {displayReadingsDesc.length === 0 && (
              <p className="text-body font-sans text-ink-3">
                No readings logged yet.
              </p>
            )}
            {displayReadingsDesc.map((reading, i) => {
              const rowStatus = rowStatusesDesc[i]
              return (
                <div
                  key={reading.id}
                  className="flex flex-col gap-1 rounded-row border border-line bg-surface p-4"
                >
                  {confirmingId === reading.id ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-body font-sans text-ink">
                        Delete this reading?
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(reading.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <StatusDot status={rowStatus} />
                        <div>
                          <p className="text-num-sm font-mono tabular-nums text-ink">
                            {formatReadingValue(reading.value)}
                            {displayUnit && (
                              <span className="ml-1 text-meta font-mono text-ink-3">
                                {displayUnit}
                              </span>
                            )}
                          </p>
                          <p className="text-meta font-mono text-ink-3">
                            {formatFullDate(reading.tested_at)}
                          </p>
                          {reading.note && (
                            <p className="mt-1 text-body-sm font-sans text-ink">
                              {reading.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <IconButton
                        icon="trash"
                        label="Delete reading"
                        tone="danger"
                        onClick={() => setConfirmingId(reading.id)}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
