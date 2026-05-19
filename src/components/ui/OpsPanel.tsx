import type { ReactNode } from 'react'

interface OpsPanelProps {
  title: string
  children: ReactNode
  action?: ReactNode
  className?: string
  accent?: 'left' | 'none'
  noPadding?: boolean
}

export default function OpsPanel({
  title,
  children,
  action,
  className = '',
  accent = 'none',
  noPadding = false,
}: OpsPanelProps) {
  return (
    <section
      className={`rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface shadow-[var(--shadow-1)] overflow-hidden ${
        accent === 'left' ? 'border-l-[3px] border-l-accent-primary' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border-subtle bg-bg-surface">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
        {action}
      </div>
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  )
}
