import { NavLink, useLocation } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

const TAB_FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong rounded-2xl'

export function BottomNav() {
  const { pathname, search } = useLocation()
  const logActive = pathname.startsWith('/log')
  const onOverview = pathname === '/overview'
  const overviewTab = new URLSearchParams(search).get('tab')

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-[0_-2px_12px_rgba(41,49,50,0.06)] sm:border-t-0 sm:bg-transparent sm:pb-6 sm:shadow-none"
    >
      <div className="mx-auto flex max-w-md items-start justify-between px-1 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] sm:rounded-3xl sm:border sm:border-line sm:bg-surface sm:px-4 sm:pt-3 sm:pb-3 sm:shadow-tile">
        <NavTab to="/" label="Now" icon="fishBowl" end />
        <NavTab
          to="/overview?tab=Overview"
          label="Overview"
          icon="wave"
          activeOverride={onOverview && overviewTab !== 'Tank'}
        />

        <NavLink
          to="/log"
          aria-label="Log a test"
          className={`flex flex-1 flex-col items-center ${TAB_FOCUS}`}
        >
          <span
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface shadow-[0_8px_20px_rgba(20,184,196,0.35)] transition-transform active:scale-95"
            style={{
              background: logActive
                ? 'color-mix(in srgb, var(--color-accent) 78%, black)'
                : 'var(--color-accent)',
            }}
          >
            <Icon name="beakerPlus" size={24} className="text-white" />
          </span>
          <span className="mt-1 text-eyebrow font-sans text-ink-muted">
            Log
          </span>
        </NavLink>

        <NavTab
          to="/overview?tab=Tank"
          label="Tank"
          icon="fish"
          activeOverride={onOverview && overviewTab === 'Tank'}
        />

        <NavTab to="/settings" label="Settings" icon="settings" />
      </div>
    </nav>
  )
}

function NavTab({
  to,
  label,
  icon,
  end,
  activeOverride,
}: {
  to: string
  label: string
  icon: IconName
  end?: boolean
  /** Overrides NavLink's own pathname-only match — needed when two nav items share a path and differ only by search params (Overview vs. Tank, both on /overview). */
  activeOverride?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-1 pt-0.5 ${
          (activeOverride ?? isActive) ? 'text-ink' : 'text-ink-muted'
        } ${TAB_FOCUS}`
      }
    >
      <Icon name={icon} size={22} />
      <span className="text-eyebrow font-sans">{label}</span>
    </NavLink>
  )
}
