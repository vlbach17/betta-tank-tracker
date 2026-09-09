import { BackLink } from 'betta-tank-tracker'

export const Default = () => <BackLink to="/" label="Dashboard" />
export const LongLabel = () => (
  <BackLink to="/settings" label="Back to tank settings" />
)
