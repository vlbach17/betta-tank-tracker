import { useEffect, type ReactNode } from 'react'
import { IconButton } from './IconButton'

/**
 * Bottom sheet on mobile (thumb-reachable, matches the app's one-handed-at-
 * the-tank usage), a centered card from `sm:` up. Body scroll is locked and
 * Escape/backdrop both dismiss while open.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        style={{ animation: 'modal-fade-in 180ms var(--ease-out)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-card bg-surface shadow-[0_-8px_40px_rgba(20,20,55,0.25)] sm:max-w-md sm:rounded-card sm:shadow-[0_24px_60px_-16px_rgba(20,20,55,0.35)]"
        style={{
          animation:
            'modal-slide-up 220ms var(--ease-out)',
        }}
      >
        <div
          className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-line-2 sm:hidden"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between gap-2 px-5 pt-3 pb-2 sm:pt-5">
          <h2 id="modal-title" className="text-heading font-sans text-ink">
            {title}
          </h2>
          <IconButton icon="close" label="Close" tone="plain" onClick={onClose} />
        </div>
        <div className="overflow-y-auto px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+20px)] sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
