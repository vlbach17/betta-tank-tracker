import { Input } from 'betta-tank-tracker'

export const Default = () => (
  <Input
    id="ph"
    label="pH"
    mono
    value="7.2"
    onChange={() => {}}
    placeholder="7.0–7.5"
  />
)
export const WithHint = () => (
  <Input
    id="note"
    label="Note"
    hint="Optional — visible on the reading detail page"
    value=""
    onChange={() => {}}
    placeholder="Add a note"
  />
)
export const WithError = () => (
  <Input
    id="ammonia"
    label="Ammonia"
    mono
    value="1.2"
    onChange={() => {}}
    error="Value looks too high — double-check the test kit"
  />
)
