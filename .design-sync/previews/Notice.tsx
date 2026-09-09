import { Notice } from 'betta-tank-tracker'

export const Bad = () => (
  <Notice tone="bad">Value looks too high — double-check the test kit.</Notice>
)
export const Good = () => (
  <Notice tone="good">Saved — 4 readings logged today.</Notice>
)
