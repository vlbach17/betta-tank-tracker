import { Avatar } from 'betta-tank-tracker'

// The app's default avatar image (public/spunk.png) isn't part of the synced
// bundle (design-sync ships components/tokens/fonts, not public/ assets), so
// previews substitute a small inline placeholder instead of a broken image.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#3b5bdb"/><circle cx="48" cy="38" r="18" fill="#fff"/><ellipse cx="48" cy="92" rx="34" ry="28" fill="#fff"/></svg>`
const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`

export const Default = () => <Avatar src={PLACEHOLDER} alt="Spunk the betta" />
export const NoRing = () => (
  <Avatar src={PLACEHOLDER} alt="Spunk the betta" ring={false} />
)
export const Small = () => (
  <Avatar src={PLACEHOLDER} alt="Spunk the betta" size={28} />
)
export const Large = () => (
  <Avatar src={PLACEHOLDER} alt="Spunk the betta" size={72} />
)
