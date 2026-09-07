import type { ButtonHTMLAttributes, ReactNode } from 'react'

const SIZE_CLASSES = {
  lg: 'h-14 px-6 text-base',
  md: 'h-11 px-[18px] text-label',
  sm: 'h-9 px-[18px] text-label-sm',
} as const

const VARIANT_CLASSES = {
  primary:
    'text-white bg-[image:var(--gradient-cta-track)] bg-[length:200%_100%] bg-[position:0%_0%] hover:bg-[position:100%_0%] shadow-cta hover:shadow-[0_8px_24px_rgba(184,37,111,0.28)]',
  ink: 'bg-ink text-white',
  secondary: 'bg-mist text-ink',
  outline: 'bg-surface text-ink border border-line',
  danger: 'bg-status-bad-bg text-white',
} as const

export function Button({
  variant = 'primary',
  size = 'lg',
  disabled,
  children,
  onClick,
  type = 'button',
  form,
  className,
}: {
  variant?: keyof typeof VARIANT_CLASSES
  size?: keyof typeof SIZE_CLASSES
  disabled?: boolean
  children: ReactNode
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  form?: string
  className?: string
}) {
  return (
    <button
      type={type}
      form={form}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-semibold transition-[transform,opacity,background-position,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.98] active:opacity-90 focus-visible:outline-2 focus-visible:outline-accent-strong disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className ?? ''}`}
    >
      {children}
    </button>
  )
}
