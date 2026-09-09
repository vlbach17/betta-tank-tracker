import { Icon } from 'betta-tank-tracker'

export const Glyphs = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Icon name="fish" title="Fish" />
    <Icon name="thermometer" title="Thermometer" />
    <Icon name="beaker" title="Beaker" />
    <Icon name="bubbles" title="Bubbles" />
    <Icon name="settings" title="Settings" />
    <Icon name="bell" title="Bell" />
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Icon name="fish" size={18} />
    <Icon name="fish" size={20} />
    <Icon name="fish" size={24} />
    <Icon name="fish" size={32} />
  </div>
)
