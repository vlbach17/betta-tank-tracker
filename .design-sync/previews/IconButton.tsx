import { IconButton } from 'betta-tank-tracker'

export const Default = () => <IconButton icon="settings" label="Settings" />
export const Plain = () => (
  <IconButton icon="bell" label="Notifications" tone="plain" />
)
export const Danger = () => (
  <IconButton icon="trash" label="Delete" tone="danger" />
)
