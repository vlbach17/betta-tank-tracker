import type { ReactNode } from 'react'

/**
 * Shared max-width, so the floating tablet/desktop card and the fixed
 * BottomNav/action bars that sit outside it always line up.
 */
export const SCREEN_WIDTH = 'max-w-md md:max-w-2xl lg:max-w-3xl'

export function Screen({
  children,
  gap = 'gap-4',
  paddingBottom = 'pb-28',
  className = '',
}: {
  children: ReactNode
  gap?: string
  paddingBottom?: string
  className?: string
}) {
  return (
    <main
      className={`mx-auto flex min-h-svh ${SCREEN_WIDTH} flex-col ${gap} px-5 pt-5 ${paddingBottom} sm:min-h-0 sm:my-12 sm:rounded-card sm:border sm:border-line sm:bg-surface sm:px-6 sm:pt-6 sm:pb-10 md:px-8 sm:shadow-[0_24px_60px_-16px_rgba(20,20,55,0.35)] ${className}`.trim()}
    >
      {children}
    </main>
  )
}
