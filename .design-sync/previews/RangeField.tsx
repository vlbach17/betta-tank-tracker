import { RangeField } from 'betta-tank-tracker'

export const Default = () => (
  <RangeField
    label="Ideal pH range"
    unit="pH"
    min={5}
    max={9}
    step={0.1}
    value={{ min: 6.8, max: 7.6 }}
    onChange={() => {}}
    hint="6.8–7.6"
  />
)

export const Empty = () => (
  <RangeField
    label="Ideal ammonia range"
    unit="ppm"
    min={0}
    max={5}
    step={0.05}
    value={{ min: null, max: null }}
    onChange={() => {}}
  />
)
