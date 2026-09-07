import type { InputHTMLAttributes } from 'react'

export function Input({
  id,
  label,
  hint,
  error,
  mono,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  step,
  required,
  className,
}: {
  id?: string
  label?: string
  hint?: string
  error?: string
  mono?: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  step?: InputHTMLAttributes<HTMLInputElement>['step']
  required?: boolean
  className?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-heading font-sans text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        step={step}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`h-11 rounded-input border bg-mist px-3 text-ink placeholder:text-ink-3 focus-visible:border-accent-strong focus-visible:outline-none ${
          mono
            ? 'text-num-sm font-mono placeholder:text-body-sm placeholder:font-mono'
            : 'text-body font-sans'
        } ${error ? 'border-status-bad' : 'border-transparent'} ${className ?? ''}`}
      />
      {(hint || error) && (
        <p
          className={`text-caption font-sans ${error ? 'text-status-bad' : 'text-ink-3'}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
