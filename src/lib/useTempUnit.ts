import { useContext } from 'react'
import { TempUnitContext } from './tempUnitContext'

export function useTempUnit() {
  const ctx = useContext(TempUnitContext)
  if (!ctx) {
    throw new Error('useTempUnit must be used within a TempUnitProvider')
  }
  return ctx
}
