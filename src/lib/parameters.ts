import { supabase } from './supabase'
import type { Parameter, Reading } from '../types/database'

export interface ParameterWithLatestReading extends Parameter {
  latestReading: Reading | null
}

export async function fetchDashboardParameters(): Promise<
  ParameterWithLatestReading[]
> {
  const { data, error } = await supabase
    .from('parameters')
    .select('*, readings(*)')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('tested_at', { ascending: false, referencedTable: 'readings' })
    .limit(1, { referencedTable: 'readings' })

  if (error) throw error

  return (data ?? []).map((row) => {
    const { readings, ...parameter } = row as Parameter & {
      readings: Reading[]
    }
    return { ...parameter, latestReading: readings[0] ?? null }
  })
}

export async function fetchActiveParameters(): Promise<Parameter[]> {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export interface NewReading {
  parameter_id: string
  value: number
  tested_at: string
  note: string | null
}

export async function saveReadings(readings: NewReading[]): Promise<void> {
  const { error } = await supabase.from('readings').insert(readings)
  if (error) throw error
}

export async function fetchParameter(id: string): Promise<Parameter | null> {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchReadingsForParameter(
  parameterId: string,
): Promise<Reading[]> {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('parameter_id', parameterId)
    .order('tested_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function deleteReading(id: string): Promise<void> {
  const { error } = await supabase.from('readings').delete().eq('id', id)
  if (error) throw error
}

export interface ParameterWithReadings extends Parameter {
  /** Ascending by tested_at (oldest first). */
  readings: Reading[]
}

export async function fetchAllHistories(): Promise<ParameterWithReadings[]> {
  const { data, error } = await supabase
    .from('parameters')
    .select('*, readings(*)')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('tested_at', { ascending: true, referencedTable: 'readings' })

  if (error) throw error

  return (data ?? []).map(
    (row) => row as Parameter & { readings: Reading[] },
  )
}

export async function fetchAllParameters(): Promise<Parameter[]> {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function updateParameter(
  id: string,
  updates: Partial<Pick<Parameter, 'ideal_min' | 'ideal_max' | 'active'>>,
): Promise<void> {
  const { error } = await supabase
    .from('parameters')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export interface NewParameter {
  name: string
  unit: string
  ideal_min: number | null
  ideal_max: number | null
}

export async function createParameter(
  input: NewParameter,
): Promise<Parameter> {
  const { data: existing, error: existingError } = await supabase
    .from('parameters')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  if (existingError) throw existingError

  const nextSortOrder = ((existing?.[0]?.sort_order as number | undefined) ?? 0) + 1

  const { data, error } = await supabase
    .from('parameters')
    .insert({ ...input, sort_order: nextSortOrder, active: true })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export interface ReadingForExport extends Reading {
  parameterName: string
  parameterUnit: string
}

export async function fetchAllReadingsForExport(): Promise<
  ReadingForExport[]
> {
  const { data, error } = await supabase
    .from('readings')
    .select('*, parameters(name, unit)')
    .order('tested_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const { parameters: paramInfo, ...reading } = row as Reading & {
      parameters: { name: string; unit: string } | null
    }
    return {
      ...reading,
      parameterName: paramInfo?.name ?? '',
      parameterUnit: paramInfo?.unit ?? '',
    }
  })
}
