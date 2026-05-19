import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-primary text-text-inverse hover:bg-accent-hover border-transparent shadow-[var(--shadow-1)]',
  outline:
    'bg-bg-elevated text-text-primary border-border-medium hover:border-accent-primary hover:bg-bg-surface-high',
  ghost: 'bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-elevated',
  danger: 'bg-alert-critical/15 text-alert-critical border-alert-critical/35 hover:bg-alert-critical/25',
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-medium border transition-colors min-h-[40px] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
