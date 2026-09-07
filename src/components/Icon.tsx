const PATHS = {
  chevronLeft: {
    viewBox: '0 0 20 20',
    d: 'M12.5 15L7.5 10L12.5 5',
    strokeWidth: 1.6,
  },
  trash: {
    viewBox: '0 0 18 18',
    d: 'M3.5 5h11M7.25 5V3.5a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1V5M8.5 8v5M6.5 8.5v4M10.5 8.5v4M4.5 5l.6 8.4a1 1 0 0 0 1 .93h5.8a1 1 0 0 0 1-.93L13.5 5',
    strokeWidth: 1.4,
  },
  kebab: {
    viewBox: '0 0 20 20',
    d: 'M10 4.5v.01M10 10v.01M10 15.5v.01',
    strokeWidth: 2.6,
  },
} as const

export type IconName = keyof typeof PATHS

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  className,
}: {
  name: IconName
  size?: number
  color?: string
  className?: string
}) {
  const p = PATHS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox={p.viewBox}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={p.d}
        stroke={color}
        strokeWidth={p.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
