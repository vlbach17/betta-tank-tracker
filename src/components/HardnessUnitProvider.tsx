import { useState, type ReactNode } from 'react'
import {
  HARDNESS_STORAGE_KEY,
  HardnessUnitContext,
  readStoredHardnessUnit,
} from '../lib/hardnessUnitContext'
import type { HardnessUnit } from '../lib/hardness'

export function HardnessUnitProvider({ children }: { children: ReactNode }) {
  const [hardnessUnit, setHardnessUnitState] = useState<HardnessUnit>(
    readStoredHardnessUnit,
  )

  function setHardnessUnit(unit: HardnessUnit) {
    setHardnessUnitState(unit)
    try {
      window.localStorage.setItem(HARDNESS_STORAGE_KEY, unit)
    } catch {
      // localStorage unavailable (private browsing, etc.) — unit still works for this session
    }
  }

  return (
    <HardnessUnitContext.Provider value={{ hardnessUnit, setHardnessUnit }}>
      {children}
    </HardnessUnitContext.Provider>
  )
}
