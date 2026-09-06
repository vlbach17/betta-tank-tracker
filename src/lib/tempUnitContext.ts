import { createContext } from 'react'
import type { TempUnit } from './temperature'

export const STORAGE_KEY = 'betta-tank-tracker:temp-unit'

export const TempUnitContext = createContext<{
  tempUnit: TempUnit
  setTempUnit: (unit: TempUnit) => void
} | null>(null)

export function readStoredTempUnit(): TempUnit {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'C' ? 'C' : 'F'
  } catch {
    return 'F'
  }
}
