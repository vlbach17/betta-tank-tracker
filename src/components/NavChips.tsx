import { NavLink } from 'react-router-dom'

export function NavChips({
  items,
}: {
  items: { to: string; label: string }[]
}) {
  return (
    <nav aria-label="Primary" className="flex gap-1.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-full px-3.5 py-2 font-sans text-sm ${
              isActive
                ? 'bg-ink font-bold text-white'
                : 'bg-mist font-medium text-ink-muted'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
