import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
  formatRelativeTime,
  formatShortDate,
} from '../lib/format'
import {
  deleteReading,
  fetchAllHistories,
  fetchEntries,
  type Entry,
  type ParameterWithReadings,
} from '../lib/parameters'
import { getParameterIcon } from '../lib/parameterIcons'
import { isWithinRange, type Range } from '../lib/range'
import { getReadingStatus, worstStatus } from '../lib/status'
import {
  fetchAllEquipment,
  fetchAllFish,
  fetchAllFoodSupplies,
  fetchAllPlants,
} from '../lib/tankInfo'
import {
  TEMPERATURE_PARAMETER_NAME,
  convertTempDeltaForDisplay,
} from '../lib/temperature'
import { useTempUnit } from '../lib/useTempUnit'
import type { Equipment, Fish, FoodSupply, Plant } from '../types/database'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { Notice } from '../components/Notice'
import { ParameterPicker, type ParameterPickerRow } from '../components/ParameterPicker'
import { RangeToggle } from '../components/RangeToggle'
import { StatusDot, makeStatusDot } from '../components/StatusDot'
import { StatusPill } from '../components/StatusPill'
import { TabNav } from '../components/TabNav'

const TABS = ['Overview', 'History', 'Tank'] as const
type Tab = (typeof TABS)[number]

export function Overview() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: Tab =
    tabParam === 'History' || tabParam === 'Tank' ? tabParam : 'Overview'

  function setTab(next: Tab) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.set('tab', next)
        return params
      },
      { replace: true },
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-28 sm:min-h-0 sm:my-12 sm:rounded-card sm:border sm:border-line sm:bg-surface sm:px-6 sm:pt-6 sm:pb-10 sm:shadow-[0_24px_60px_-16px_rgba(20,20,55,0.35)]">
      <div className="flex items-center gap-3">
        <Avatar />
        <h1 className="text-title font-sans text-ink">Overview</h1>
      </div>

      <TabNav tabs={TABS} value={tab} onChange={setTab} />

      <div className={tab === 'Overview' ? undefined : 'hidden'}>
        <OverviewTabBody preselectedParameterId={searchParams.get('parameter')} />
      </div>
      <div className={tab === 'History' ? undefined : 'hidden'}>
        <HistoryTabBody />
      </div>
      <div className={tab === 'Tank' ? undefined : 'hidden'}>
        <TankTabBody />
      </div>
    </main>
  )
}

function OverviewTabBody({
  preselectedParameterId,
}: {
  preselectedParameterId: string | null
}) {
  const { tempUnit } = useTempUnit()
  const gradientId = useId()

  const [parameters, setParameters] = useState<ParameterWithReadings[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('30')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllHistories()
      .then((data) => {
        if (!cancelled) setParameters(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedId || !parameters || parameters.length === 0) return
    const valid =
      preselectedParameterId &&
      parameters.some((p) => p.id === preselectedParameterId)
    setSelectedId(valid ? preselectedParameterId : parameters[0].id)
    // Only runs once, when parameters first load and nothing is selected yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters])

  const parameter = parameters?.find((p) => p.id === selectedId) ?? null
  const isTemperature = parameter?.name === TEMPERATURE_PARAMETER_NAME
  const icon = parameter ? getParameterIcon(parameter.name) : undefined
  const displayUnit = parameter ? getDisplayUnit(parameter, tempUnit) : undefined
  const displayIdealMin =
    parameter && parameter.ideal_min != null
      ? toDisplayValue(parameter.ideal_min, parameter, tempUnit)
      : (parameter?.ideal_min ?? null)
  const displayIdealMax =
    parameter && parameter.ideal_max != null
      ? toDisplayValue(parameter.ideal_max, parameter, tempUnit)
      : (parameter?.ideal_max ?? null)

  const readingsAsc = useMemo(
    () =>
      parameter
        ? parameter.readings.filter((r) => isWithinRange(r.tested_at, range))
        : [],
    [parameter, range],
  )
  const readingsDesc = useMemo(() => [...readingsAsc].reverse(), [readingsAsc])
  const displayReadingsAsc = useMemo(
    () =>
      parameter
        ? readingsAsc.map((r) => ({
            ...r,
            value: toDisplayValue(r.value, parameter, tempUnit),
          }))
        : readingsAsc,
    [readingsAsc, parameter, tempUnit],
  )
  const displayReadingsDesc = useMemo(
    () => [...displayReadingsAsc].reverse(),
    [displayReadingsAsc],
  )
  const rowStatusesDesc = useMemo(
    () =>
      readingsDesc.map((r) =>
        getReadingStatus(r.value, parameter?.ideal_min ?? null, parameter?.ideal_max ?? null),
      ),
    [readingsDesc, parameter],
  )

  const latest = parameter?.readings.at(-1) ?? null
  const latestDisplayValue =
    latest && parameter ? toDisplayValue(latest.value, parameter, tempUnit) : (latest?.value ?? null)
  const latestStatus =
    latest && parameter
      ? getReadingStatus(latest.value, parameter.ideal_min, parameter.ideal_max)
      : null

  const swing = getLargestSwing(readingsAsc)
  const displaySwingDelta =
    swing && isTemperature ? convertTempDeltaForDisplay(swing.delta, tempUnit) : swing?.delta

  const pickerRows: ParameterPickerRow[] = useMemo(
    () =>
      (parameters ?? []).map((p) => {
        const pLatest = p.readings.at(-1) ?? null
        return {
          id: p.id,
          name: p.name,
          unit: getDisplayUnit(p, tempUnit),
          icon: getParameterIcon(p.name),
          latestValue: pLatest ? toDisplayValue(pLatest.value, p, tempUnit) : null,
          status: pLatest
            ? getReadingStatus(pLatest.value, p.ideal_min, p.ideal_max)
            : 'unknown',
        }
      }),
    [parameters, tempUnit],
  )

  async function handleDelete(id: string) {
    if (!parameter) return
    setDeleteError(null)
    const previous = parameters
    setParameters((ps) =>
      (ps ?? []).map((p) =>
        p.id === parameter.id
          ? { ...p, readings: p.readings.filter((r) => r.id !== id) }
          : p,
      ),
    )
    setConfirmingId(null)
    try {
      await deleteReading(id)
    } catch (err) {
      setParameters(previous ?? null)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loadError) return <Notice>Couldn't load your tank data: {loadError}</Notice>
  if (!parameters) return <p className="text-body font-sans text-ink-3">Loading…</p>
  if (parameters.length === 0) {
    return (
      <p className="text-body font-sans text-ink-3">
        No active parameters yet. Add one in Settings.
      </p>
    )
  }
  if (!parameter) return null

  return (
    <div className="flex flex-col gap-4">
      <ParameterPicker
        rows={pickerRows}
        selectedId={parameter.id}
        onSelect={(id) => {
          setSelectedId(id)
          setConfirmingId(null)
        }}
      />

      <div
        className="flex flex-col gap-3 rounded-card p-5"
        style={{ backgroundImage: 'var(--gradient-hero-wash)' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon && <Icon name={icon} size={24} className="shrink-0 text-ink-3" />}
          <h2 className="min-w-0 truncate text-title font-name text-ink">
            {parameter.name}
          </h2>
          {latestStatus && <StatusPill status={latestStatus} size="sm" />}
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-display-xl font-mono tabular-nums tracking-[-0.03em] text-ink">
            {latestDisplayValue != null ? formatReadingValue(latestDisplayValue) : '–'}
          </p>
          {displayUnit && <span className="text-meta font-mono text-ink-3">{displayUnit}</span>}
        </div>
        {formatIdealRange(displayIdealMin, displayIdealMax) && (
          <p className="text-meta font-mono text-ink-3">
            {formatIdealRange(displayIdealMin, displayIdealMax)}
          </p>
        )}

        {displayReadingsAsc.length === 0 && (
          <p className="text-body-sm font-sans text-ink-3">Not enough data in this range.</p>
        )}

        {displayReadingsAsc.length > 0 && (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayReadingsAsc} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
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
              {formatShortDate(displayReadingsAsc[displayReadingsAsc.length - 1].tested_at)}
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
          ({formatShortDate(swing.from.tested_at)} to {formatShortDate(swing.to.tested_at)})
        </p>
      )}

      {deleteError && <Notice>{deleteError}</Notice>}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-label-sm font-sans uppercase tracking-[.08em] text-ink-3">
            Readings
          </h3>
          <span className="text-meta font-mono text-ink-3">
            {displayReadingsDesc.length} in this range
          </span>
        </div>

        {displayReadingsDesc.length === 0 && (
          <p className="text-body font-sans text-ink-3">No readings logged yet.</p>
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
                  <span className="text-body font-sans text-ink">Delete this reading?</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(reading.id)}>
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
                        <p className="mt-1 text-body-sm font-sans text-ink">{reading.note}</p>
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
    </div>
  )
}

function HistoryTabBody() {
  const { tempUnit } = useTempUnit()
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchEntries()
      .then((data) => {
        if (!cancelled) setEntries(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(entry: Entry, id: string) {
    setDeleteError(null)
    const remaining = entry.readings.filter((r) => r.id !== id)
    setConfirmingId(null)
    const previous = entries

    if (remaining.length === 0) {
      setEntries((es) => (es ?? []).filter((e) => e.testedAt !== entry.testedAt))
      setExpandedEntry((cur) => (cur === entry.testedAt ? null : cur))
    } else {
      setEntries((es) =>
        (es ?? []).map((e) =>
          e.testedAt === entry.testedAt ? { ...e, readings: remaining } : e,
        ),
      )
    }

    try {
      await deleteReading(id)
    } catch (err) {
      setEntries(previous ?? null)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loadError) return <Notice>Couldn't load your test history: {loadError}</Notice>
  if (!entries) return <p className="text-body font-sans text-ink-3">Loading…</p>
  if (entries.length === 0) {
    return (
      <p className="text-body font-sans text-ink-3">
        No tests logged yet. Log one to start your history.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {deleteError && <Notice>{deleteError}</Notice>}

      {entries.map((entry) => {
        const isOpen = expandedEntry === entry.testedAt
        const status = worstStatus(
          entry.readings.map((r) =>
            getReadingStatus(r.value, r.parameterIdealMin, r.parameterIdealMax),
          ),
        )

        return (
          <div
            key={entry.testedAt}
            className="overflow-hidden rounded-row border border-line bg-surface shadow-tile"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setExpandedEntry(isOpen ? null : entry.testedAt)}
              className="flex w-full items-center justify-between gap-3 p-4"
            >
              <div className="flex min-w-0 flex-col gap-0.5 text-left">
                <span className="text-heading font-sans text-ink">
                  {formatFullDate(entry.testedAt)}
                </span>
                <span className="text-meta font-mono text-ink-3">
                  {formatRelativeTime(entry.testedAt)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusPill status={status} size="sm" />
                <Icon
                  name="chevronLeft"
                  size={20}
                  className="text-ink-muted transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                  style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(-90deg)' }}
                />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-line">
                {entry.note && (
                  <p className="px-4 pt-3 text-body font-sans text-ink">{entry.note}</p>
                )}
                {entry.readings.map((reading) => {
                  const status = getReadingStatus(
                    reading.value,
                    reading.parameterIdealMin,
                    reading.parameterIdealMax,
                  )
                  const displayParameter = {
                    name: reading.parameterName,
                    unit: reading.parameterUnit,
                  }
                  const displayValue = toDisplayValue(reading.value, displayParameter, tempUnit)
                  const displayUnit = getDisplayUnit(displayParameter, tempUnit)
                  const icon = getParameterIcon(reading.parameterName)

                  return (
                    <div
                      key={reading.id}
                      className="flex items-center justify-between gap-2 py-2 pr-3 pl-4"
                    >
                      {confirmingId === reading.id ? (
                        <div className="flex w-full items-center justify-between gap-2">
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
                              onClick={() => handleDelete(entry, reading.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex min-w-0 items-center gap-2.5">
                            <StatusDot status={status} />
                            {icon && (
                              <Icon name={icon} size={18} className="shrink-0 text-ink-3" />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-body font-sans text-ink">
                                {reading.parameterName === TEMPERATURE_PARAMETER_NAME
                                  ? 'Temp'
                                  : reading.parameterName}
                              </p>
                              <p className="text-num-sm font-mono tabular-nums text-ink">
                                {formatReadingValue(displayValue)}
                                {displayUnit && (
                                  <span className="ml-1 text-meta font-mono text-ink-3">
                                    {displayUnit}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <IconButton
                            icon="trash"
                            label={`Delete ${reading.parameterName} reading`}
                            tone="danger"
                            onClick={() => setConfirmingId(reading.id)}
                          />
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TankTabBody() {
  const [fish, setFish] = useState<Fish[] | null>(null)
  const [equipment, setEquipment] = useState<Equipment[] | null>(null)
  const [food, setFood] = useState<FoodSupply[] | null>(null)
  const [plants, setPlants] = useState<Plant[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAllFish(), fetchAllEquipment(), fetchAllFoodSupplies(), fetchAllPlants()])
      .then(([fishData, equipmentData, foodData, plantsData]) => {
        if (cancelled) return
        setFish(fishData)
        setEquipment(equipmentData)
        setFood(foodData)
        setPlants(plantsData)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loadError) return <Notice>Couldn't load tank info: {loadError}</Notice>
  if (!fish || !equipment || !food || !plants) {
    return <p className="text-body font-sans text-ink-3">Loading…</p>
  }

  const activePlants = plants.filter((p) => p.active)
  const primaryFish = fish.find((f) => f.active) ?? null

  const summaryParts: string[] = []
  if (primaryFish?.tank_gallons != null) {
    summaryParts.push(`${primaryFish.tank_gallons} gal${activePlants.length > 0 ? ' planted' : ''}`)
  }
  if (primaryFish?.tank_setup_date) {
    summaryParts.push(`set up ${formatShortDate(primaryFish.tank_setup_date)}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-sm font-sans text-ink-3">
          {summaryParts.length > 0 ? summaryParts.join(' · ') : ' '}
        </p>
        <Link
          to="/tank-info"
          className="shrink-0 text-label-sm font-sans text-accent-strong"
        >
          Edit in Tank Info ↗
        </Link>
      </div>

      {primaryFish && (
        <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-tile">
          <Avatar size={124} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 className="text-title font-name text-ink">{primaryFish.name}</h2>
            <div className="flex flex-col gap-0.5 text-body-sm font-sans text-ink-3">
              {primaryFish.species && (
                <p>
                  <span className="font-bold text-ink">Species:</span> {primaryFish.species}
                </p>
              )}
              {primaryFish.acquired_date && (
                <p>
                  <span className="font-bold text-ink">Acquired:</span>{' '}
                  {formatShortDate(primaryFish.acquired_date)}
                </p>
              )}
            </div>
            {primaryFish.notes && (
              <p className="text-body-sm font-sans text-ink-3">{primaryFish.notes}</p>
            )}
          </div>
        </div>
      )}

      <ReferenceList
        title="Equipment"
        items={equipment.filter((e) => e.active)}
        fact={(e) => (e.purchase_date ? formatShortDate(e.purchase_date) : null)}
      />
      <ReferenceList title="Food" items={food.filter((f) => f.active)} fact={() => null} />
      <ReferenceList
        title="Plants"
        items={activePlants}
        fact={(p) => `×${p.quantity}`}
      />
    </div>
  )
}

function ReferenceList<T extends { id: string; name: string }>({
  title,
  items,
  fact,
}: {
  title: string
  items: T[]
  fact: (item: T) => string | null
}) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5 px-4">
      <h3 className="text-label-sm font-sans uppercase tracking-[.08em] text-ink-3">{title}</h3>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex min-h-10 items-center justify-between gap-3 border-t border-line py-2"
        >
          <span className="truncate text-body font-sans text-ink">{item.name}</span>
          {fact(item) && (
            <span className="shrink-0 whitespace-nowrap text-meta font-mono text-ink-3">
              {fact(item)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
