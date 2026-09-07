import { Icon, type IconName } from './Icon'

const TONE_CLASSES = {
  default: 'bg-mist text-ink',
  plain: 'bg-transparent text-ink',
  danger: 'bg-mist text-status-bad',
} as const

export function IconButton({
  icon,
  label,
  onClick,
  tone = 'default',
  className,
}: {
  icon: IconName
  label: string
  onClick?: () => void
  tone?: keyof typeof TONE_CLASSES
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70 ${TONE_CLASSES[tone]} ${className ?? ''}`}
    >
      <Icon name={icon} size={icon === 'trash' ? 18 : 20} />
    </button>
  )
}
