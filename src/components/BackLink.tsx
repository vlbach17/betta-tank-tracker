import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="-ml-2 mb-2 flex w-fit items-center gap-2 rounded-full font-sans text-sm font-semibold text-ink"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink">
        <Icon name="chevronLeft" />
      </span>
      {label}
    </Link>
  )
}
