import { createContext } from 'react'
import type { HardnessUnit } from './hardness'

export const HARDNESS_STORAGE_KEY = 'betta-tank-tracker:hardness-unit'

export const HardnessUnitContext = createContext<{
  hardnessUnit: HardnessUnit
  setHardnessUnit: (unit: HardnessUnit) => void
} | null>(null)

export function readStoredHardnessUnit(): HardnessUnit {
  try {
    return window.localStorage.getItem(HARDNESS_STORAGE_KEY) === 'ppm'
      ? 'ppm'
      : 'degrees'
  } catch {
    return 'degrees'
  }
}
