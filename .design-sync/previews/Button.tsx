import { Button } from 'betta-tank-tracker'

export const Primary = () => <Button variant="primary">Log a reading</Button>
export const Ink = () => <Button variant="ink">Save changes</Button>
export const Secondary = () => <Button variant="secondary">Cancel</Button>
export const Outline = () => <Button variant="outline">View history</Button>
export const Danger = () => <Button variant="danger">Delete tank</Button>
export const Disabled = () => (
  <Button variant="primary" disabled>
    Log a reading
  </Button>
)
