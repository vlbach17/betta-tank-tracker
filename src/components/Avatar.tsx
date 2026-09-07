export function Avatar({
  src = '/spunk.png',
  alt = 'Spunk',
  size = 48,
  ring = true,
}: {
  src?: string
  alt?: string
  size?: number
  ring?: boolean
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={
        ring
          ? {
              width: size,
              height: size,
              padding: 2.5,
              backgroundImage: 'var(--gradient-avatar-ring)',
            }
          : { width: size, height: size }
      }
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full rounded-full border-2 border-bg object-cover"
      />
    </span>
  )
}
