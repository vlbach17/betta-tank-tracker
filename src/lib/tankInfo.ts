import { supabase } from './supabase'
import type {
  Equipment,
  Fish,
  FoodSupply,
  Hardscape,
  Plant,
  WaterChange,
  WaterTreatment,
} from '../types/database'

/**
 * Shared CRUD for the 6 Tank Info tables (equipment, food_supplies, plants,
 * fish, hardscape, water_treatments). They're all shaped like `parameters`: a
 * name, some optional detail fields, `sort_order`, and an `active` flag used
 * to archive rather than delete. The generic helpers below do the Supabase
 * calls; each table gets thin typed wrappers so components never touch
 * table-name strings directly.
 */

type TankInfoTable =
  | 'equipment'
  | 'food_supplies'
  | 'plants'
  | 'fish'
  | 'hardscape'
  | 'water_treatments'

interface Sortable {
  id: string
  sort_order: number
}

async function fetchAll<T>(table: TankInfoTable): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []) as T[]
}

async function create<T>(table: TankInfoTable, input: object): Promise<T> {
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  if (existingError) throw existingError

  const nextSortOrder =
    ((existing?.[0]?.sort_order as number | undefined) ?? 0) + 1

  const { data, error } = await supabase
    .from(table)
    .insert({ ...input, sort_order: nextSortOrder, active: true })
    .select('*')
    .single()

  if (error) throw error
  return data as T
}

async function update(
  table: TankInfoTable,
  id: string,
  updates: object,
): Promise<void> {
  const { error } = await supabase.from(table).update(updates).eq('id', id)
  if (error) throw error
}

async function remove(table: TankInfoTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

/** Swaps `sort_order` between two rows so one moves up/down in the list. */
async function swapOrder(
  table: TankInfoTable,
  a: Sortable,
  b: Sortable,
): Promise<void> {
  const { error: e1 } = await supabase
    .from(table)
    .update({ sort_order: b.sort_order })
    .eq('id', a.id)
  if (e1) throw e1

  const { error: e2 } = await supabase
    .from(table)
    .update({ sort_order: a.sort_order })
    .eq('id', b.id)
  if (e2) throw e2
}

// Equipment

export type NewEquipment = Pick<
  Equipment,
  'name' | 'manual_url' | 'purchase_date' | 'notes'
>

export const fetchAllEquipment = () => fetchAll<Equipment>('equipment')
export const createEquipment = (input: NewEquipment) =>
  create<Equipment>('equipment', input)
export const updateEquipment = (
  id: string,
  updates: Partial<Omit<Equipment, 'id'>>,
) => update('equipment', id, updates)
export const swapEquipmentOrder = (a: Sortable, b: Sortable) =>
  swapOrder('equipment', a, b)
export const deleteEquipment = (id: string) => remove('equipment', id)

// Food supplies

export type NewFoodSupply = Pick<
  FoodSupply,
  'name' | 'manual_url' | 'purchase_date' | 'notes'
>

export const fetchAllFoodSupplies = () => fetchAll<FoodSupply>('food_supplies')
export const createFoodSupply = (input: NewFoodSupply) =>
  create<FoodSupply>('food_supplies', input)
export const updateFoodSupply = (
  id: string,
  updates: Partial<Omit<FoodSupply, 'id'>>,
) => update('food_supplies', id, updates)
export const swapFoodSupplyOrder = (a: Sortable, b: Sortable) =>
  swapOrder('food_supplies', a, b)
export const deleteFoodSupply = (id: string) => remove('food_supplies', id)

// Plants

export type NewPlant = Pick<
  Plant,
  'name' | 'quantity' | 'manual_url' | 'planted_date' | 'notes'
>

export const fetchAllPlants = () => fetchAll<Plant>('plants')
export const createPlant = (input: NewPlant) => create<Plant>('plants', input)
export const updatePlant = (id: string, updates: Partial<Omit<Plant, 'id'>>) =>
  update('plants', id, updates)
export const swapPlantOrder = (a: Sortable, b: Sortable) =>
  swapOrder('plants', a, b)
export const deletePlant = (id: string) => remove('plants', id)

// Fish

export type NewFish = Pick<
  Fish,
  'name' | 'species' | 'acquired_date' | 'notes' | 'tank_gallons' | 'tank_setup_date'
>

export const fetchAllFish = () => fetchAll<Fish>('fish')
export const createFish = (input: NewFish) => create<Fish>('fish', input)
export const updateFish = (id: string, updates: Partial<Omit<Fish, 'id'>>) =>
  update('fish', id, updates)
export const swapFishOrder = (a: Sortable, b: Sortable) => swapOrder('fish', a, b)
export const deleteFish = (id: string) => remove('fish', id)

// Hardscape

export type NewHardscape = Pick<
  Hardscape,
  'name' | 'manual_url' | 'purchase_date' | 'notes'
>

export const fetchAllHardscape = () => fetchAll<Hardscape>('hardscape')
export const createHardscape = (input: NewHardscape) =>
  create<Hardscape>('hardscape', input)
export const updateHardscape = (
  id: string,
  updates: Partial<Omit<Hardscape, 'id'>>,
) => update('hardscape', id, updates)
export const swapHardscapeOrder = (a: Sortable, b: Sortable) =>
  swapOrder('hardscape', a, b)
export const deleteHardscape = (id: string) => remove('hardscape', id)

// Water treatments

export type NewWaterTreatment = Pick<
  WaterTreatment,
  'name' | 'manual_url' | 'purchase_date' | 'notes'
>

export const fetchAllWaterTreatments = () =>
  fetchAll<WaterTreatment>('water_treatments')
export const createWaterTreatment = (input: NewWaterTreatment) =>
  create<WaterTreatment>('water_treatments', input)
export const updateWaterTreatment = (
  id: string,
  updates: Partial<Omit<WaterTreatment, 'id'>>,
) => update('water_treatments', id, updates)
export const swapWaterTreatmentOrder = (a: Sortable, b: Sortable) =>
  swapOrder('water_treatments', a, b)
export const deleteWaterTreatment = (id: string) => remove('water_treatments', id)

// Water changes — a chronological log, not a manageable entity list, so it
// skips the `sort_order`/`active` machinery above: newest first, hard delete.

export type NewWaterChange = Pick<
  WaterChange,
  'changed_at' | 'amount_gallons' | 'notes'
>

export async function fetchAllWaterChanges(): Promise<WaterChange[]> {
  const { data, error } = await supabase
    .from('water_changes')
    .select('*')
    .order('changed_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as WaterChange[]
}

export async function createWaterChange(
  input: NewWaterChange,
): Promise<WaterChange> {
  const { data, error } = await supabase
    .from('water_changes')
    .insert(input)
    .select('*')
    .single()

  if (error) throw error
  return data as WaterChange
}

export async function deleteWaterChange(id: string): Promise<void> {
  const { error } = await supabase.from('water_changes').delete().eq('id', id)
  if (error) throw error
}
