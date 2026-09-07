import type { ReactNode } from 'react'

export function Notice({
  tone = 'bad',
  children,
}: {
  tone?: 'good' | 'bad'
  children: ReactNode
}) {
  return (
    <p
      className={`m-0 rounded-input p-3 text-body-sm font-sans font-semibold ${
        tone === 'good'
          ? 'bg-status-good-bg text-status-good-fg'
          : 'bg-status-bad-bg text-status-bad-fg'
      }`}
    >
      {children}
    </p>
  )
}
