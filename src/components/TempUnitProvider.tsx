import { useState, type ReactNode } from 'react'
import {
  STORAGE_KEY,
  TempUnitContext,
  readStoredTempUnit,
} from '../lib/tempUnitContext'
import type { TempUnit } from '../lib/temperature'

export function TempUnitProvider({ children }: { children: ReactNode }) {
  const [tempUnit, setTempUnitState] = useState<TempUnit>(readStoredTempUnit)

  function setTempUnit(unit: TempUnit) {
    setTempUnitState(unit)
    try {
      window.localStorage.setItem(STORAGE_KEY, unit)
    } catch {
      // localStorage unavailable (private browsing, etc.) — unit still works for this session
    }
  }

  return (
    <TempUnitContext.Provider value={{ tempUnit, setTempUnit }}>
      {children}
    </TempUnitContext.Provider>
  )
}
