import { NavChips } from 'betta-tank-tracker'

const ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/log', label: 'Log' },
  { to: '/overview', label: 'Overview' },
  { to: '/settings', label: 'Settings' },
]

export const Default = () => <NavChips items={ITEMS} />
