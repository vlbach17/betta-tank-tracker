import React from 'react'

/**
 * Iridescent icon set v1 — Spunk's Bettabase
 *
 * Monoline, single-color. Every glyph is authored on a 24x24 grid and rendered
 * with \`currentColor\`, so color comes from the surrounding text color.
 *
 * Optical sizing: stroke weight is NOT scaled with the icon. It is chosen per
 * size tier so the glyph holds its weight at small sizes. Some glyphs also swap
 * to a simplified geometry at 18px (detail is REMOVED, never thinned).
 */

export type IconName =
  | 'fish'
  | 'bubbles'
  | 'fishBowl'
  | 'wave'
  | 'thermometer'
  | 'beaker'
  | 'beakerPlus'
  | 'hamburger'
  | 'settings'
  | 'calendar'
  | 'alert'
  | 'warning'
  | 'user'
  | 'trash'
  | 'envelope'
  | 'bell'

export type IconSize = 18 | 20 | 24 | 32

/** Stroke weight per size tier. Intentionally non-linear. */
const STROKE: Record<IconSize, number> = {
  32: 1.6,
  24: 1.6,
  20: 1.8,
  18: 2.0,
}

/** Primitive shapes. All coordinates are in the 24x24 authoring grid. */
type Prim =
  | { t: 'path'; d: string; join?: boolean; w?: number }
  | { t: 'circle'; cx: number; cy: number; r: number; fill?: boolean }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx: number }

type Glyph = {
  /** Default geometry, used at 20 / 24 / 32. */
  base: Prim[]
  /** Optional simplified geometry used at 18. Falls back to \`base\`. */
  sm?: Prim[]
}

const GLYPHS: Record<IconName, Glyph> = {
  fish: {
    base: [
      { t: 'path', join: true, d: 'M7.4 12C9.3 8.3 12.2 6.6 14.7 6.6C17.6 6.6 19.7 9 20.7 12C19.7 15 17.6 17.4 14.7 17.4C12.2 17.4 9.3 15.7 7.4 12Z' },
      { t: 'path', join: true, d: 'M7.4 12L2.6 7.4V16.6Z' },
      { t: 'circle', cx: 17, cy: 10.7, r: 1, fill: true },
    ],
  },
  bubbles: {
    base: [
      { t: 'circle', cx: 8.8, cy: 15.2, r: 4.4 },
      { t: 'circle', cx: 16.2, cy: 8.8, r: 2.6 },
      { t: 'circle', cx: 7.4, cy: 13.8, r: 0.9, fill: true },
    ],
  },
  fishBowl: {
    base: [
      { t: 'path', join: true, d: 'M6.6 6.4A8.2 8.2 0 1 0 17.4 6.4' },
      { t: 'path', d: 'M5.2 6.4h13.6' },
    ],
  },
  wave: {
    base: [
      { t: 'path', join: true, d: 'M2.6 10.2C4.95 10.2 4.95 7.6 7.3 7.6C9.65 7.6 9.65 10.2 12 10.2C14.35 10.2 14.35 7.6 16.7 7.6C19.05 7.6 19.05 10.2 21.4 10.2' },
      { t: 'path', join: true, d: 'M2.6 16.2C4.95 16.2 4.95 13.6 7.3 13.6C9.65 13.6 9.65 16.2 12 16.2C14.35 16.2 14.35 13.6 16.7 13.6C19.05 13.6 19.05 16.2 21.4 16.2' },
    ],
  },
  thermometer: {
    base: [
      { t: 'path', join: true, d: 'M9.2 14.9V5.2a2.8 2.8 0 0 1 5.6 0v9.7a3.9 3.9 0 1 1-5.6 0Z' },
      { t: 'circle', cx: 12, cy: 17.6, r: 2, fill: true },
      // Center mercury line is deliberately lighter than the body stroke.
      { t: 'path', w: 1.3, d: 'M11.6 11.1V17.6M12.4 11.1V17.6' },
    ],
  },
  beaker: {
    base: [
      { t: 'path', d: 'M8.4 3.2h7.2' },
      { t: 'path', join: true, d: 'M10 3.2V9.7L6.2 18.6Q5.4 20.6 7.4 20.6h9.2Q18.6 20.6 17.8 18.6L14 9.7V3.2' },
      { t: 'path', d: 'M8.2 14h7.6' },
    ],
  },
  beakerPlus: {
    base: [
      { t: 'path', d: 'M6.4 3.2h7.2' },
      { t: 'path', join: true, d: 'M8 3.2V9.7L4.2 18.6Q3.4 20.6 5.4 20.6h9.2Q16.6 20.6 15.8 18.6L12 9.7V3.2' },
      { t: 'path', d: 'M6.2 14h7.6' },
      { t: 'path', d: 'M18.6 4.6v4.4M16.4 6.8h4.4' },
    ],
    // 18px: drop the fill line and push the plus clear of the beaker neck.
    sm: [
      { t: 'path', d: 'M6.4 3.2h7.2' },
      { t: 'path', join: true, d: 'M8 3.2V9.7L4.2 18.6Q3.4 20.6 5.4 20.6h9.2Q16.6 20.6 15.8 18.6L12 9.7V3.2' },
      { t: 'path', d: 'M19.4 3.2v5.2M16.8 5.8h5.2' },
    ],
  },
  hamburger: {
    base: [{ t: 'path', d: 'M4 7h16M4 12h16M4 17h16' }],
  },
  settings: {
    base: [
      { t: 'path', join: true, d: 'M18.3 10.1L21.1 10.4L21.1 13.6L18.3 13.9L16.8 16.5L17.9 19.1L15.2 20.6L13.5 18.4L10.5 18.4L8.9 20.6L6.1 19.1L7.2 16.5L5.7 13.9L2.9 13.6L2.9 10.4L5.7 10.1L7.2 7.5L6.1 4.9L8.9 3.4L10.5 5.6L13.5 5.6L15.2 3.4L17.9 4.9L16.8 7.5Z' },
      { t: 'circle', cx: 12, cy: 12, r: 2.8 },
    ],
    // 18px: the cog teeth close up, so the toothed outline becomes a ring
    // plus eight radial ticks with real gaps between them.
    sm: [
      { t: 'circle', cx: 12, cy: 12, r: 7 },
      { t: 'circle', cx: 12, cy: 12, r: 2.6 },
      { t: 'path', d: 'M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.35 5.35l1.7 1.7M16.95 16.95l1.7 1.7M18.65 5.35l-1.7 1.7M7.05 16.95l-1.7 1.7' },
    ],
  },
  calendar: {
    base: [
      { t: 'rect', x: 4, y: 5, w: 16, h: 15, rx: 3 },
      { t: 'path', d: 'M4 10h16' },
      { t: 'path', d: 'M8 3v4M16 3v4' },
    ],
  },
  alert: {
    base: [
      { t: 'circle', cx: 12, cy: 12, r: 9 },
      { t: 'path', d: 'M12 7.4v5.4' },
      { t: 'circle', cx: 12, cy: 16.4, r: 1, fill: true },
    ],
  },
  warning: {
    base: [
      { t: 'path', join: true, d: 'M12 3.8L21 19.6H3Z' },
      { t: 'path', d: 'M12 9.6v4.2' },
      { t: 'circle', cx: 12, cy: 16.6, r: 1, fill: true },
    ],
  },
  user: {
    base: [
      { t: 'circle', cx: 12, cy: 7.6, r: 3.3 },
      { t: 'path', d: 'M4.6 20.4a7.4 7.4 0 0 1 14.8 0' },
    ],
  },
  trash: {
    base: [
      { t: 'path', d: 'M4 6.5h16' },
      { t: 'path', join: true, d: 'M9.5 6.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5' },
      { t: 'path', join: true, d: 'M5.5 6.5l.9 12.4A1.6 1.6 0 0 0 8 20.4h8a1.6 1.6 0 0 0 1.6-1.5L18.5 6.5' },
    ],
    // 18px: the lid handle's counter fills in, so the handle is dropped.
    sm: [
      { t: 'path', d: 'M4 6.5h16' },
      { t: 'path', join: true, d: 'M5.5 6.5l.9 12.4A1.6 1.6 0 0 0 8 20.4h8a1.6 1.6 0 0 0 1.6-1.5L18.5 6.5' },
    ],
  },
  envelope: {
    base: [
      { t: 'rect', x: 3, y: 5.5, w: 18, h: 13, rx: 2.6 },
      { t: 'path', join: true, d: 'M3.6 7.5L12 13.5L20.4 7.5' },
    ],
  },
  bell: {
    base: [
      { t: 'path', join: true, d: 'M6.2 16.6V11a5.8 5.8 0 0 1 11.6 0v5.6' },
      { t: 'path', d: 'M4.4 16.6h15.2' },
      { t: 'path', d: 'M10.3 19.2a1.7 1.7 0 0 0 3.4 0' },
    ],
    // 18px: the clapper arc becomes a blob, so it is dropped.
    sm: [
      { t: 'path', join: true, d: 'M6.2 16.6V11a5.8 5.8 0 0 1 11.6 0v5.6' },
      { t: 'path', d: 'M4.4 16.6h15.2' },
    ],
  },
}

function nearestTier(size: number): IconSize {
  const tiers: IconSize[] = [18, 20, 24, 32]
  return tiers.reduce((best, t) =>
    Math.abs(t - size) < Math.abs(best - size) ? t : best,
  )
}

export type IconProps = {
  name: IconName
  /** Rendered px size. Any number works; stroke snaps to the nearest tier. */
  size?: number
  /** Defaults to currentColor — prefer setting text color on the parent. */
  color?: string
  /** Accessible label. Omit for decorative icons (renders aria-hidden). */
  title?: string
  className?: string
  style?: React.CSSProperties
}

export function Icon({
  name,
  size = 24,
  color = 'currentColor',
  title,
  className,
  style,
}: IconProps) {
  const tier = nearestTier(size)
  const glyph = GLYPHS[name]
  const prims = tier === 18 && glyph.sm ? glyph.sm : glyph.base
  const sw = STROKE[tier]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {prims.map((p, i) => {
        if (p.t === 'circle') {
          return p.fill ? (
            <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={color} />
          ) : (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              stroke={color}
              strokeWidth={sw}
            />
          )
        }
        if (p.t === 'rect') {
          return (
            <rect
              key={i}
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              rx={p.rx}
              stroke={color}
              strokeWidth={sw}
            />
          )
        }
        return (
          <path
            key={i}
            d={p.d}
            stroke={color}
            strokeWidth={p.w ?? sw}
            strokeLinecap="round"
            strokeLinejoin={p.join ? 'round' : undefined}
          />
        )
      })}
    </svg>
  )
}

export const ICON_NAMES = Object.keys(GLYPHS) as IconName[]
export default Icon
