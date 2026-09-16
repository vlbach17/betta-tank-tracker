import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  createEquipment,
  createFish,
  createFoodSupply,
  createPlant,
  fetchAllEquipment,
  fetchAllFish,
  fetchAllFoodSupplies,
  fetchAllPlants,
  swapEquipmentOrder,
  swapFishOrder,
  swapFoodSupplyOrder,
  swapPlantOrder,
  updateEquipment,
  updateFish,
  updateFoodSupply,
  updatePlant,
} from '../lib/tankInfo'
import type { Equipment, Fish, FoodSupply, Plant } from '../types/database'
import { Avatar } from '../components/Avatar'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Notice } from '../components/Notice'
import { TabNav } from '../components/TabNav'

const TABS = ['Equipment', 'Food', 'Plants', 'Fish'] as const
type Tab = (typeof TABS)[number]

type Sortable = { id: string; sort_order: number; active: boolean }

/** Generic optimistic active/inactive toggle, shared by all 4 sections. */
async function toggleActive<T extends Sortable>(
  item: T,
  setItems: Dispatch<SetStateAction<T[] | null>>,
  setRowError: Dispatch<SetStateAction<string | null>>,
  updateFn: (id: string, updates: { active: boolean }) => Promise<void>,
) {
  const nextActive = !item.active
  setItems((items) =>
    (items ?? []).map((i) => (i.id === item.id ? { ...i, active: nextActive } : i)),
  )
  setRowError(null)
  try {
    await updateFn(item.id, { active: nextActive })
  } catch (err) {
    setItems((items) =>
      (items ?? []).map((i) =>
        i.id === item.id ? { ...i, active: !nextActive } : i,
      ),
    )
    setRowError(err instanceof Error ? err.message : 'Failed to save')
  }
}

/** Generic optimistic up/down reorder, shared by all 4 sections. */
async function moveItem<T extends Sortable>(
  item: T,
  direction: 'up' | 'down',
  items: T[],
  setItems: Dispatch<SetStateAction<T[] | null>>,
  setRowError: Dispatch<SetStateAction<string | null>>,
  swapFn: (a: Sortable, b: Sortable) => Promise<void>,
) {
  const idx = items.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || targetIdx < 0 || targetIdx >= items.length) return

  const target = items[targetIdx]
  const prevItems = items
  const swapped = [...items]
  swapped[idx] = { ...target, sort_order: item.sort_order }
  swapped[targetIdx] = { ...item, sort_order: target.sort_order }
  swapped.sort((a, b) => a.sort_order - b.sort_order)

  setItems(swapped)
  setRowError(null)
  try {
    await swapFn(item, target)
  } catch (err) {
    setItems(prevItems)
    setRowError(err instanceof Error ? err.message : 'Failed to save')
  }
}

interface FieldSpec {
  key: string
  label: string
  type: 'text' | 'date' | 'url' | 'number'
  placeholder?: string
}

function EntityManager<T extends Sortable & { name: string; notes: string | null }>({
  addLabel,
  items,
  loadError,
  rowError,
  fields,
  displayField,
  onToggleActive,
  onMove,
  onCreate,
}: {
  addLabel: string
  items: T[] | null
  loadError: string | null
  rowError: string | null
  fields: FieldSpec[]
  displayField: (item: T, field: FieldSpec) => string | null
  onToggleActive: (item: T) => void
  onMove: (item: T, direction: 'up' | 'down') => void
  onCreate: (values: Record<string, string>) => Promise<string | null>
}) {
  const allFields: FieldSpec[] = [
    { key: 'name', label: 'Name', type: 'text' },
    ...fields,
    { key: 'notes', label: 'Notes', type: 'text' },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setAddError(null)
    const error = await onCreate(values)
    setAdding(false)
    if (error) {
      setAddError(error)
      return
    }
    setValues({})
  }

  return (
    <div className="flex flex-col gap-6">
      {loadError && <Notice>Couldn't load: {loadError}</Notice>}
      {!loadError && !items && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {items && (
        <section className="flex flex-col gap-3">
          {rowError && <Notice>{rowError}</Notice>}

          {items.length === 0 && (
            <p className="text-body-sm font-sans text-ink-3">
              Nothing added yet.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex flex-col gap-2 rounded-tile p-4 ${
                  item.active
                    ? 'border border-line bg-surface shadow-tile'
                    : 'border border-dashed border-line-2 bg-mist-2'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.name === 'Spunk' && <Avatar size={32} />}
                    <h3 className="text-heading font-sans text-ink">
                      {item.name}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => onMove(item, 'up')}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={idx === items.length - 1}
                      onClick={() => onMove(item, 'down')}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(item)}
                      className={`h-9 shrink-0 rounded-full px-3 text-label-sm font-sans ${
                        item.active
                          ? 'bg-status-good-bg text-status-good-fg'
                          : 'bg-status-overdue-bg text-status-overdue-fg'
                      }`}
                    >
                      {item.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {fields.map((f) => {
                  const value = displayField(item, f)
                  if (!value) return null
                  if (f.type === 'url') {
                    return (
                      <a
                        key={f.key}
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-body-sm font-sans text-accent-strong underline underline-offset-2"
                      >
                        {f.label} ↗
                      </a>
                    )
                  }
                  return (
                    <p key={f.key} className="text-body-sm font-sans text-ink-3">
                      {f.label}: {value}
                    </p>
                  )
                })}

                {item.notes && (
                  <p className="text-body-sm font-sans text-ink-3">
                    {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3 rounded-tile border border-line bg-surface p-4 shadow-tile">
        <h2 className="text-heading font-sans text-ink">{addLabel}</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          {allFields.map((f) => (
            <Input
              key={f.key}
              id={f.key}
              label={f.label}
              type={
                f.type === 'number'
                  ? 'number'
                  : f.type === 'date'
                    ? 'date'
                    : f.type === 'url'
                      ? 'url'
                      : 'text'
              }
              inputMode={f.type === 'number' ? 'numeric' : undefined}
              value={values[f.key] ?? ''}
              onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
              placeholder={f.placeholder}
              required={f.key === 'name'}
            />
          ))}
          {addError && <Notice>{addError}</Notice>}
          <Button type="submit" size="md" disabled={adding}>
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </form>
      </section>
    </div>
  )
}

export function TankInfo() {
  const [tab, setTab] = useState<Tab>('Equipment')

  const [equipment, setEquipment] = useState<Equipment[] | null>(null)
  const [equipmentLoadError, setEquipmentLoadError] = useState<string | null>(null)
  const [equipmentRowError, setEquipmentRowError] = useState<string | null>(null)

  const [food, setFood] = useState<FoodSupply[] | null>(null)
  const [foodLoadError, setFoodLoadError] = useState<string | null>(null)
  const [foodRowError, setFoodRowError] = useState<string | null>(null)

  const [plants, setPlants] = useState<Plant[] | null>(null)
  const [plantsLoadError, setPlantsLoadError] = useState<string | null>(null)
  const [plantsRowError, setPlantsRowError] = useState<string | null>(null)

  const [fish, setFish] = useState<Fish[] | null>(null)
  const [fishLoadError, setFishLoadError] = useState<string | null>(null)
  const [fishRowError, setFishRowError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllEquipment()
      .then((data) => !cancelled && setEquipment(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setEquipmentLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllFoodSupplies()
      .then((data) => !cancelled && setFood(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setFoodLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllPlants()
      .then((data) => !cancelled && setPlants(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setPlantsLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllFish()
      .then((data) => !cancelled && setFish(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setFishLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-6 px-5 pt-5 pb-28 sm:min-h-0 sm:my-12 sm:rounded-card sm:border sm:border-line sm:bg-surface sm:px-6 sm:pt-6 sm:pb-10 sm:shadow-[0_24px_60px_-16px_rgba(20,20,55,0.35)]">
      <div>
        <BackLink to="/settings" label="Settings" />
        <h1 className="text-title font-sans text-ink">Tank Info</h1>
        <p className="text-caption font-sans text-ink-3">
          Equipment, food, plants, and residents
        </p>
      </div>

      <TabNav tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'Equipment' && (
        <EntityManager<Equipment>
          addLabel="Add equipment"
          items={equipment}
          loadError={equipmentLoadError}
          rowError={equipmentRowError}
          fields={[
            { key: 'manual_url', label: 'Manual link', type: 'url', placeholder: 'https://…' },
            { key: 'purchase_date', label: 'Purchased', type: 'date' },
          ]}
          displayField={(item, f) =>
            f.key === 'manual_url'
              ? item.manual_url
              : f.key === 'purchase_date'
                ? item.purchase_date
                : null
          }
          onToggleActive={(item) =>
            toggleActive(item, setEquipment, setEquipmentRowError, updateEquipment)
          }
          onMove={(item, direction) =>
            moveItem(
              item,
              direction,
              equipment ?? [],
              setEquipment,
              setEquipmentRowError,
              swapEquipmentOrder,
            )
          }
          onCreate={async (values) => {
            if (!values.name?.trim()) return 'Name is required'
            try {
              const created = await createEquipment({
                name: values.name.trim(),
                manual_url: values.manual_url?.trim() || null,
                purchase_date: values.purchase_date || null,
                notes: values.notes?.trim() || null,
              })
              setEquipment((items) => [...(items ?? []), created])
              return null
            } catch (err) {
              return err instanceof Error ? err.message : 'Failed to add'
            }
          }}
        />
      )}

      {tab === 'Food' && (
        <EntityManager<FoodSupply>
          addLabel="Add food"
          items={food}
          loadError={foodLoadError}
          rowError={foodRowError}
          fields={[]}
          displayField={() => null}
          onToggleActive={(item) => toggleActive(item, setFood, setFoodRowError, updateFoodSupply)}
          onMove={(item, direction) =>
            moveItem(item, direction, food ?? [], setFood, setFoodRowError, swapFoodSupplyOrder)
          }
          onCreate={async (values) => {
            if (!values.name?.trim()) return 'Name is required'
            try {
              const created = await createFoodSupply({
                name: values.name.trim(),
                notes: values.notes?.trim() || null,
              })
              setFood((items) => [...(items ?? []), created])
              return null
            } catch (err) {
              return err instanceof Error ? err.message : 'Failed to add'
            }
          }}
        />
      )}

      {tab === 'Plants' && (
        <EntityManager<Plant>
          addLabel="Add plant"
          items={plants}
          loadError={plantsLoadError}
          rowError={plantsRowError}
          fields={[
            { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
            { key: 'planted_date', label: 'Planted', type: 'date' },
          ]}
          displayField={(item, f) =>
            f.key === 'quantity'
              ? String(item.quantity)
              : f.key === 'planted_date'
                ? item.planted_date
                : null
          }
          onToggleActive={(item) => toggleActive(item, setPlants, setPlantsRowError, updatePlant)}
          onMove={(item, direction) =>
            moveItem(item, direction, plants ?? [], setPlants, setPlantsRowError, swapPlantOrder)
          }
          onCreate={async (values) => {
            if (!values.name?.trim()) return 'Name is required'
            const quantity = values.quantity ? Number(values.quantity) : 1
            if (!Number.isFinite(quantity) || quantity < 1) {
              return 'Quantity must be a positive number'
            }
            try {
              const created = await createPlant({
                name: values.name.trim(),
                quantity,
                planted_date: values.planted_date || null,
                notes: values.notes?.trim() || null,
              })
              setPlants((items) => [...(items ?? []), created])
              return null
            } catch (err) {
              return err instanceof Error ? err.message : 'Failed to add'
            }
          }}
        />
      )}

      {tab === 'Fish' && (
        <EntityManager<Fish>
          addLabel="Add fish"
          items={fish}
          loadError={fishLoadError}
          rowError={fishRowError}
          fields={[
            { key: 'species', label: 'Species', type: 'text', placeholder: 'Betta splendens' },
            { key: 'acquired_date', label: 'Acquired', type: 'date' },
            { key: 'tank_gallons', label: 'Tank size (gal)', type: 'number', placeholder: '15' },
            { key: 'tank_setup_date', label: 'Tank set up', type: 'date' },
          ]}
          displayField={(item, f) =>
            f.key === 'species'
              ? item.species
              : f.key === 'acquired_date'
                ? item.acquired_date
                : f.key === 'tank_gallons'
                  ? item.tank_gallons != null ? `${item.tank_gallons} gal` : null
                  : f.key === 'tank_setup_date'
                    ? item.tank_setup_date
                    : null
          }
          onToggleActive={(item) => toggleActive(item, setFish, setFishRowError, updateFish)}
          onMove={(item, direction) =>
            moveItem(item, direction, fish ?? [], setFish, setFishRowError, swapFishOrder)
          }
          onCreate={async (values) => {
            if (!values.name?.trim()) return 'Name is required'
            const tankGallons = values.tank_gallons ? Number(values.tank_gallons) : null
            if (values.tank_gallons && !Number.isFinite(tankGallons)) {
              return 'Tank size must be a number'
            }
            try {
              const created = await createFish({
                name: values.name.trim(),
                species: values.species?.trim() || null,
                acquired_date: values.acquired_date || null,
                notes: values.notes?.trim() || null,
                tank_gallons: tankGallons,
                tank_setup_date: values.tank_setup_date || null,
              })
              setFish((items) => [...(items ?? []), created])
              return null
            } catch (err) {
              return err instanceof Error ? err.message : 'Failed to add'
            }
          }}
        />
      )}
    </main>
  )
}
