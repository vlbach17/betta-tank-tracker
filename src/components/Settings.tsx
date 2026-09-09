import { useEffect, useRef, useState } from 'react'
import { buildCsv, parseCsv } from '../lib/csv'
import { getDisplayUnit, toDisplayValue, toStorageValue } from '../lib/displayUnit'
import {
  convertHardnessForDisplay,
  convertHardnessForStorage,
  hardnessUnitLabel,
  isHardnessUnit,
  type HardnessUnit,
} from '../lib/hardness'
import {
  createParameter,
  fetchAllParameters,
  fetchAllReadingsForExport,
  saveReadings,
  updateParameter,
  type NewReading,
} from '../lib/parameters'
import {
  TEMPERATURE_PARAMETER_NAME,
  tempUnitLabel,
  type TempUnit,
} from '../lib/temperature'
import { useHardnessUnit } from '../lib/useHardnessUnit'
import { useTempUnit } from '../lib/useTempUnit'
import type { Parameter } from '../types/database'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Input } from './Input'
import { Notice } from './Notice'
import { RangeField, type RangeFieldValue } from './RangeField'

type RangeEdits = Record<string, RangeFieldValue>

const UNIT_PRESETS = ['ppm', 'dKH', 'dGH'] as const
type UnitPreset = (typeof UNIT_PRESETS)[number] | 'other'

// Tuned slider bounds for the 6 seed parameters + Temperature. Any other
// (custom) parameter falls back to a generic bounds formula below. Hardness
// bounds are in degrees (dKH/dGH), the storage unit — converted for display
// below when the ppm toggle is on.
const KNOWN_BOUNDS: Record<string, { min: number; max: number; step: number }> =
  {
    pH: { min: 5, max: 9, step: 0.1 },
    Ammonia: { min: 0, max: 8, step: 0.25 },
    Nitrite: { min: 0, max: 5, step: 0.25 },
    Nitrate: { min: 0, max: 80, step: 1 },
    'Carbonate hardness (KH)': { min: 0, max: 20, step: 1 },
    'General hardness (GH)': { min: 0, max: 20, step: 1 },
    [TEMPERATURE_PARAMETER_NAME]: { min: 65, max: 90, step: 1 },
  }

function getRangeFieldBounds(
  parameter: Parameter,
  tempUnit: TempUnit,
  hardnessUnit: HardnessUnit,
) {
  const known = KNOWN_BOUNDS[parameter.name]
  if (known) {
    if (
      parameter.name === TEMPERATURE_PARAMETER_NAME ||
      isHardnessUnit(parameter.unit)
    ) {
      return {
        min: toDisplayValue(known.min, parameter, tempUnit, hardnessUnit),
        max: toDisplayValue(known.max, parameter, tempUnit, hardnessUnit),
        step: known.step,
      }
    }
    return known
  }
  if (parameter.ideal_min != null && parameter.ideal_max != null) {
    const span = parameter.ideal_max - parameter.ideal_min
    const padding = Math.max(1, span * 0.5)
    const min = Math.max(0, parameter.ideal_min - padding)
    const max = parameter.ideal_max + padding
    if (isHardnessUnit(parameter.unit)) {
      return {
        min: toDisplayValue(min, parameter, tempUnit, hardnessUnit),
        max: toDisplayValue(max, parameter, tempUnit, hardnessUnit),
        step: 0.1,
      }
    }
    return { min, max, step: 0.1 }
  }
  return { min: 0, max: 100, step: 0.1 }
}

function getNewParameterBounds(unitPreset: UnitPreset, hardnessUnit: HardnessUnit) {
  if (unitPreset === 'dKH' || unitPreset === 'dGH') {
    const degrees = { min: 0, max: 20, step: 1 }
    return hardnessUnit === 'ppm'
      ? {
          min: convertHardnessForDisplay(degrees.min, hardnessUnit),
          max: convertHardnessForDisplay(degrees.max, hardnessUnit),
          step: degrees.step,
        }
      : degrees
  }
  return { min: 0, max: 100, step: 1 }
}

function toEdit(
  parameter: Parameter,
  tempUnit: TempUnit,
  hardnessUnit: HardnessUnit,
): RangeFieldValue {
  const roundToOneDecimal =
    parameter.name === TEMPERATURE_PARAMETER_NAME ||
    isHardnessUnit(parameter.unit)
  const displayValue = (value: number | null) => {
    if (value == null) return null
    const converted = toDisplayValue(value, parameter, tempUnit, hardnessUnit)
    // Allow one decimal place, per spec, instead of a long float tail.
    return roundToOneDecimal ? Math.round(converted * 10) / 10 : converted
  }

  return {
    min: displayValue(parameter.ideal_min),
    max: displayValue(parameter.ideal_max),
  }
}

export function Settings() {
  const { tempUnit, setTempUnit } = useTempUnit()
  const { hardnessUnit, setHardnessUnit } = useHardnessUnit()
  const [parameters, setParameters] = useState<Parameter[] | null>(null)
  const [edits, setEdits] = useState<RangeEdits>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newUnitPreset, setNewUnitPreset] = useState<UnitPreset>('other')
  const [newUnit, setNewUnit] = useState('')
  const [newRange, setNewRange] = useState<RangeFieldValue>({
    min: null,
    max: null,
  })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [exportError, setExportError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parametersRef = useRef<Parameter[] | null>(null)
  useEffect(() => {
    parametersRef.current = parameters
  }, [parameters])

  useEffect(() => {
    let cancelled = false

    fetchAllParameters()
      .then((data) => {
        if (cancelled) return
        setParameters(data)
        setEdits(
          Object.fromEntries(
            data.map((p) => [p.id, toEdit(p, tempUnit, hardnessUnit)]),
          ),
        )
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })

    return () => {
      cancelled = true
    }
    // Only load once; the units used here are whatever they are at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-derive the edit values (but only these, not the rest of the row
  // state) when a display unit changes, without clobbering edits the user
  // is mid-typing in other rows when `parameters` updates for other reasons.
  useEffect(() => {
    const current = parametersRef.current
    if (!current) return
    setEdits(
      Object.fromEntries(
        current.map((p) => [p.id, toEdit(p, tempUnit, hardnessUnit)]),
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempUnit, hardnessUnit])

  async function commitRange(parameter: Parameter, next: RangeFieldValue) {
    const toStorage = (v: number | null) =>
      v == null ? null : toStorageValue(v, parameter, tempUnit, hardnessUnit)

    const newMin = toStorage(next.min)
    const newMax = toStorage(next.max)
    const patch: Partial<Pick<Parameter, 'ideal_min' | 'ideal_max'>> = {}
    if (newMin !== parameter.ideal_min) patch.ideal_min = newMin
    if (newMax !== parameter.ideal_max) patch.ideal_max = newMax
    if (Object.keys(patch).length === 0) return

    setRowError(null)
    try {
      await updateParameter(parameter.id, patch)
      setParameters((ps) =>
        (ps ?? []).map((p) =>
          p.id === parameter.id ? { ...p, ...patch } : p,
        ),
      )
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to save')
      setEdits((e) => ({
        ...e,
        [parameter.id]: toEdit(parameter, tempUnit, hardnessUnit),
      }))
    }
  }

  async function toggleActive(parameter: Parameter) {
    const nextActive = !parameter.active
    setParameters((ps) =>
      (ps ?? []).map((p) =>
        p.id === parameter.id ? { ...p, active: nextActive } : p,
      ),
    )
    setRowError(null)
    try {
      await updateParameter(parameter.id, { active: nextActive })
    } catch (err) {
      setParameters((ps) =>
        (ps ?? []).map((p) =>
          p.id === parameter.id ? { ...p, active: !nextActive } : p,
        ),
      )
      setRowError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleAddParameter(event: React.FormEvent) {
    event.preventDefault()
    const name = newName.trim()
    if (!name || adding) return

    const unit = newUnit.trim()
    const isHardness = isHardnessUnit(unit)
    const toStorage = (v: number | null) =>
      v == null ? null : isHardness ? convertHardnessForStorage(v, hardnessUnit) : v

    setAdding(true)
    setAddError(null)
    try {
      const created = await createParameter({
        name,
        unit,
        ideal_min: toStorage(newRange.min),
        ideal_max: toStorage(newRange.max),
      })
      setParameters((ps) => [...(ps ?? []), created])
      setEdits((e) => ({
        ...e,
        [created.id]: toEdit(created, tempUnit, hardnessUnit),
      }))
      setNewName('')
      setNewUnitPreset('other')
      setNewUnit('')
      setNewRange({ min: null, max: null })
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : 'Failed to add parameter',
      )
    } finally {
      setAdding(false)
    }
  }

  async function handleExport() {
    setExportError(null)
    try {
      const readings = await fetchAllReadingsForExport()
      const rows: string[][] = [
        ['parameter', 'value', 'unit', 'tested_at', 'note'],
        ...readings.map((r) => [
          r.parameterName,
          String(r.value),
          r.parameterUnit,
          r.tested_at,
          r.note ?? '',
        ]),
      ]
      const csv = buildCsv(rows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `betta-tank-readings-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export')
    }
  }

  async function handleImportFile(file: File) {
    setImportError(null)
    setImportResult(null)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length === 0) {
        setImportError('That file is empty.')
        return
      }

      const [header, ...dataRows] = rows
      const norm = header.map((h) => h.trim().toLowerCase())
      const idx = {
        parameter: norm.indexOf('parameter'),
        value: norm.indexOf('value'),
        tested_at: norm.indexOf('tested_at'),
        note: norm.indexOf('note'),
      }
      if (idx.parameter === -1 || idx.value === -1 || idx.tested_at === -1) {
        setImportError(
          'That file needs "parameter", "value", and "tested_at" columns.',
        )
        return
      }

      const byName = new Map(
        (parameters ?? []).map((p) => [p.name.trim().toLowerCase(), p]),
      )

      const toInsert: NewReading[] = []
      let skipped = 0

      for (const row of dataRows) {
        const name = row[idx.parameter]?.trim().toLowerCase()
        const parameter = name ? byName.get(name) : undefined
        const value = Number(row[idx.value])
        const testedAtRaw = row[idx.tested_at]
        const testedAtMs = testedAtRaw ? new Date(testedAtRaw).getTime() : NaN

        if (!parameter || !Number.isFinite(value) || Number.isNaN(testedAtMs)) {
          skipped++
          continue
        }

        toInsert.push({
          parameter_id: parameter.id,
          value,
          tested_at: new Date(testedAtMs).toISOString(),
          note: idx.note !== -1 ? row[idx.note]?.trim() || null : null,
        })
      }

      if (toInsert.length > 0) {
        await saveReadings(toInsert)
      }

      setImportResult(
        `Imported ${toInsert.length} reading${toInsert.length === 1 ? '' : 's'}${
          skipped > 0 ? `, skipped ${skipped} row${skipped === 1 ? '' : 's'}` : ''
        }.`,
      )
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import')
    }
  }

  const newParamBounds = getNewParameterBounds(newUnitPreset, hardnessUnit)

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-6 px-5 pt-5 pb-28">
      <div className="flex items-center gap-3">
        <Avatar />
        <div className="flex flex-col">
          <h1 className="text-title font-sans text-ink">Settings</h1>
          <p className="text-caption font-sans text-ink-3">
            Ranges, parameters, backup
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-tile border border-line bg-surface p-4 shadow-tile">
        <h2 className="text-heading font-sans text-ink">Display</h2>
        <div className="flex items-center justify-between gap-2">
          <span className="text-body font-sans text-ink">
            Temperature unit
          </span>
          <div className="flex gap-1 rounded-full bg-mist p-1">
            {(['F', 'C'] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setTempUnit(unit)}
                className={`h-9 w-14 rounded-full text-label font-sans ${
                  tempUnit === unit
                    ? 'bg-surface text-ink shadow-segment'
                    : 'text-ink-muted'
                }`}
              >
                {tempUnitLabel(unit)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-body-sm font-sans text-ink-3">
          Temperature is always stored in °F — this only changes how it's
          displayed.
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-body font-sans text-ink">
            Hardness unit (KH/GH)
          </span>
          <div className="flex gap-1 rounded-full bg-mist p-1">
            {(['degrees', 'ppm'] as const).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setHardnessUnit(unit)}
                className={`h-9 rounded-full px-3 text-label font-sans ${
                  hardnessUnit === unit
                    ? 'bg-surface text-ink shadow-segment'
                    : 'text-ink-muted'
                }`}
              >
                {unit === 'ppm' ? 'ppm' : 'dKH / dGH'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-body-sm font-sans text-ink-3">
          KH and GH readings are always stored in degrees — this only
          changes how they're displayed.
        </p>
      </section>

      {loadError && <Notice>Couldn't load parameters: {loadError}</Notice>}

      {!loadError && !parameters && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {parameters && (
        <section className="flex flex-col gap-3">
          <h2 className="text-heading font-sans text-ink">Parameters</h2>

          {rowError && <Notice>{rowError}</Notice>}

          <div className="flex flex-col gap-3">
            {parameters.map((parameter) => {
              const bounds = getRangeFieldBounds(
                parameter,
                tempUnit,
                hardnessUnit,
              )
              const displayUnit = getDisplayUnit(
                parameter,
                tempUnit,
                hardnessUnit,
              )

              return (
                <div
                  key={parameter.id}
                  className={`flex flex-col gap-3 rounded-tile p-4 ${
                    parameter.active
                      ? 'border border-line bg-surface shadow-tile'
                      : 'border border-dashed border-line-2 bg-mist-2'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-heading font-sans text-ink">
                      {parameter.name}
                      {displayUnit && (
                        <span className="ml-1 text-meta font-mono text-ink-3">
                          ({displayUnit})
                        </span>
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleActive(parameter)}
                      className={`h-9 shrink-0 rounded-full px-3 text-label-sm font-sans ${
                        parameter.active
                          ? 'bg-status-good-bg text-status-good-fg'
                          : 'bg-status-overdue-bg text-status-overdue-fg'
                      }`}
                    >
                      {parameter.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <RangeField
                    label="Ideal range"
                    unit={displayUnit || undefined}
                    min={bounds.min}
                    max={bounds.max}
                    step={bounds.step}
                    value={edits[parameter.id] ?? { min: null, max: null }}
                    onChange={(next) =>
                      setEdits((prev) => ({ ...prev, [parameter.id]: next }))
                    }
                    onCommit={(next) => commitRange(parameter, next)}
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {parameters && (
        <section className="flex flex-col gap-3 rounded-tile border border-line bg-surface p-4 shadow-tile">
          <h2 className="text-heading font-sans text-ink">
            Add a custom parameter
          </h2>
          <form onSubmit={handleAddParameter} className="flex flex-col gap-3">
            <Input
              label="Name"
              value={newName}
              onChange={setNewName}
              placeholder="Phosphate"
              required
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-heading font-sans text-ink">
                Unit (optional)
              </span>
              <div className="flex flex-wrap gap-1 rounded-full bg-mist p-1">
                {UNIT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setNewUnitPreset(preset)
                      setNewUnit(preset)
                    }}
                    className={`h-9 rounded-full px-3 text-label font-sans ${
                      newUnitPreset === preset
                        ? 'bg-surface text-ink shadow-segment'
                        : 'text-ink-muted'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setNewUnitPreset('other')
                    setNewUnit('')
                  }}
                  className={`h-9 rounded-full px-3 text-label font-sans ${
                    newUnitPreset === 'other'
                      ? 'bg-surface text-ink shadow-segment'
                      : 'text-ink-muted'
                  }`}
                >
                  Other
                </button>
              </div>
              {newUnitPreset === 'other' && (
                <Input
                  mono
                  value={newUnit}
                  onChange={setNewUnit}
                  placeholder="ppm"
                />
              )}
              {(newUnitPreset === 'dKH' || newUnitPreset === 'dGH') && (
                <p className="text-caption font-sans text-ink-3">
                  Gets the same ppm / dKH-dGH display toggle as KH and GH,
                  above.
                </p>
              )}
            </div>
            <RangeField
              label="Ideal range (optional)"
              unit={
                isHardnessUnit(newUnit)
                  ? hardnessUnitLabel(newUnit, hardnessUnit)
                  : newUnit || undefined
              }
              min={newParamBounds.min}
              max={newParamBounds.max}
              step={newParamBounds.step}
              value={newRange}
              onChange={setNewRange}
            />

            {addError && <Notice>{addError}</Notice>}

            <Button
              type="submit"
              variant="ink"
              size="md"
              disabled={!newName.trim() || adding}
            >
              {adding ? 'Adding…' : 'Add parameter'}
            </Button>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-tile border border-line bg-surface p-4 shadow-tile">
        <h2 className="text-heading font-sans text-ink">Backup</h2>

        <Button variant="outline" size="md" onClick={handleExport}>
          Export all readings to CSV
        </Button>
        {exportError && <Notice>{exportError}</Notice>}

        <Button
          variant="outline"
          size="md"
          onClick={() => fileInputRef.current?.click()}
        >
          Import readings from CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
            e.target.value = ''
          }}
        />
        <p className="text-body-sm font-sans text-ink-3">
          Expects the same columns as the export: parameter, value, unit,
          tested_at, note.
        </p>
        {importResult && <Notice tone="good">{importResult}</Notice>}
        {importError && <Notice>{importError}</Notice>}
      </section>
    </main>
  )
}
