import { useEffect, useRef, useState } from 'react'
import { buildCsv, parseCsv } from '../lib/csv'
import {
  createParameter,
  fetchAllParameters,
  fetchAllReadingsForExport,
  saveReadings,
  updateParameter,
  type NewReading,
} from '../lib/parameters'
import type { Parameter } from '../types/database'
import { BackLink } from './BackLink'

type RangeEdits = Record<string, { min: string; max: string }>

function toEdit(parameter: Parameter) {
  return {
    min: parameter.ideal_min?.toString() ?? '',
    max: parameter.ideal_max?.toString() ?? '',
  }
}

export function Settings() {
  const [parameters, setParameters] = useState<Parameter[] | null>(null)
  const [edits, setEdits] = useState<RangeEdits>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newMin, setNewMin] = useState('')
  const [newMax, setNewMax] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [exportError, setExportError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    fetchAllParameters()
      .then((data) => {
        if (cancelled) return
        setParameters(data)
        setEdits(Object.fromEntries(data.map((p) => [p.id, toEdit(p)])))
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

  async function saveRange(parameter: Parameter, field: 'ideal_min' | 'ideal_max') {
    const key = field === 'ideal_min' ? 'min' : 'max'
    const raw = (edits[parameter.id]?.[key] ?? '').trim()
    const newValue = raw === '' ? null : Number(raw)

    if (raw !== '' && !Number.isFinite(newValue)) {
      setEdits((e) => ({
        ...e,
        [parameter.id]: { ...e[parameter.id], [key]: toEdit(parameter)[key] },
      }))
      return
    }
    if (newValue === parameter[field]) return

    setRowError(null)
    try {
      await updateParameter(parameter.id, { [field]: newValue })
      setParameters((ps) =>
        (ps ?? []).map((p) =>
          p.id === parameter.id ? { ...p, [field]: newValue } : p,
        ),
      )
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Failed to save')
      setEdits((e) => ({
        ...e,
        [parameter.id]: { ...e[parameter.id], [key]: toEdit(parameter)[key] },
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

    setAdding(true)
    setAddError(null)
    try {
      const created = await createParameter({
        name,
        unit: newUnit.trim(),
        ideal_min: newMin.trim() === '' ? null : Number(newMin),
        ideal_max: newMax.trim() === '' ? null : Number(newMax),
      })
      setParameters((ps) => [...(ps ?? []), created])
      setEdits((e) => ({ ...e, [created.id]: toEdit(created) }))
      setNewName('')
      setNewUnit('')
      setNewMin('')
      setNewMax('')
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

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-6 px-4 pt-4 pb-8">
      <BackLink to="/" label="Dashboard" />

      <h1 className="font-heading text-xl font-semibold text-ink">
        Settings
      </h1>

      {loadError && (
        <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
          Couldn't load parameters: {loadError}
        </p>
      )}

      {!loadError && !parameters && (
        <p className="text-sm text-ink-muted">Loading…</p>
      )}

      {parameters && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-base font-medium text-ink">
            Parameters
          </h2>

          {rowError && (
            <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
              {rowError}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {parameters.map((parameter) => (
              <div
                key={parameter.id}
                className={`flex flex-col gap-3 rounded-xl border border-line p-4 ${
                  parameter.active ? 'bg-surface' : 'bg-status-overdue-bg/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-base font-medium text-ink">
                    {parameter.name}
                    {parameter.unit && (
                      <span className="ml-1 font-mono text-sm font-normal text-ink-muted">
                        ({parameter.unit})
                      </span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => toggleActive(parameter)}
                    className={`h-9 shrink-0 rounded-full px-3 font-heading text-xs font-medium ${
                      parameter.active
                        ? 'bg-status-good-bg text-status-good-fg'
                        : 'bg-status-overdue-bg text-status-overdue-fg'
                    }`}
                  >
                    {parameter.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="flex gap-3">
                  <label className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-xs text-ink-muted">Ideal min</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={edits[parameter.id]?.min ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [parameter.id]: {
                            ...prev[parameter.id],
                            min: e.target.value,
                          },
                        }))
                      }
                      onBlur={() => saveRange(parameter, 'ideal_min')}
                      className="h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 font-mono text-ink"
                    />
                  </label>
                  <label className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-xs text-ink-muted">Ideal max</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={edits[parameter.id]?.max ?? ''}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [parameter.id]: {
                            ...prev[parameter.id],
                            max: e.target.value,
                          },
                        }))
                      }
                      onBlur={() => saveRange(parameter, 'ideal_max')}
                      className="h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 font-mono text-ink"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {parameters && (
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <h2 className="font-heading text-base font-medium text-ink">
            Add a custom parameter
          </h2>
          <form onSubmit={handleAddParameter} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Name</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Phosphate"
                required
                className="h-11 rounded-lg border border-line bg-bg px-3 text-ink placeholder:text-ink-muted"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">
                Unit (optional)
              </span>
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="ppm"
                className="h-11 rounded-lg border border-line bg-bg px-3 font-mono text-ink placeholder:font-sans placeholder:text-ink-muted"
              />
            </label>
            <div className="flex gap-3">
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-medium text-ink">
                  Ideal min (optional)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={newMin}
                  onChange={(e) => setNewMin(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 font-mono text-ink"
                />
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-medium text-ink">
                  Ideal max (optional)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={newMax}
                  onChange={(e) => setNewMax(e.target.value)}
                  className="h-11 w-full min-w-0 rounded-lg border border-line bg-bg px-3 font-mono text-ink"
                />
              </label>
            </div>

            {addError && (
              <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
                {addError}
              </p>
            )}

            <button
              type="submit"
              disabled={!newName.trim() || adding}
              className="h-11 rounded-xl bg-accent font-heading text-sm font-semibold text-white disabled:opacity-40"
            >
              {adding ? 'Adding…' : 'Add parameter'}
            </button>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <h2 className="font-heading text-base font-medium text-ink">
          Backup
        </h2>

        <button
          type="button"
          onClick={handleExport}
          className="h-11 rounded-lg border border-line font-heading text-sm font-medium text-ink"
        >
          Export all readings to CSV
        </button>
        {exportError && (
          <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
            {exportError}
          </p>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-11 rounded-lg border border-line font-heading text-sm font-medium text-ink"
        >
          Import readings from CSV
        </button>
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
        <p className="text-xs text-ink-muted">
          Expects the same columns as the export: parameter, value, unit,
          tested_at, note.
        </p>
        {importResult && (
          <p className="rounded-lg bg-status-good-bg p-3 text-sm text-status-good-fg">
            {importResult}
          </p>
        )}
        {importError && (
          <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
            {importError}
          </p>
        )}
      </section>
    </main>
  )
}
