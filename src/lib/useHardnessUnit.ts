import { useContext } from 'react'
import { HardnessUnitContext } from './hardnessUnitContext'

export function useHardnessUnit() {
  const ctx = useContext(HardnessUnitContext)
  if (!ctx) {
    throw new Error('useHardnessUnit must be used within a HardnessUnitProvider')
  }
  return ctx
}
