import type { ReactNode } from 'react'

export type MetricTone = 'success' | 'primary' | 'warning' | 'critical' | 'default'

interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  action?: ReactNode
  tone?: MetricTone
  /** @deprecated use tone */
  variant?: MetricTone | 'accent' | 'neutral'
  className?: string
}

function resolveTone(tone?: MetricTone, variant?: MetricCardProps['variant']): MetricTone {
  if (tone) return tone
  if (variant === 'accent') return 'primary'
  if (variant === 'neutral') return 'default'
  if (variant === 'warning' || variant === 'success' || variant === 'critical' || variant === 'primary' || variant === 'default') {
    return variant
  }
  return 'default'
}

const TONE_CLASS: Record<MetricTone, string> = {
  default: 'metric-card-ops',
  success: 'metric-card-ops metric-card-ops--success',
  primary: 'metric-card-ops metric-card-ops--primary',
  warning: 'metric-card-ops metric-card-ops--warning',
  critical: 'metric-card-ops metric-card-ops--critical',
}

const VALUE_COLOR: Record<MetricTone, string> = {
  default: 'text-text-primary',
  success: 'text-accent-success',
  primary: 'text-accent-primary',
  warning: 'text-accent-warning',
  critical: 'text-accent-secondary',
}

export default function MetricCard({
  label,
  value,
  sublabel,
  action,
  tone,
  variant,
  className = '',
}: MetricCardProps) {
  const resolvedTone = resolveTone(tone, variant)
  return (
    <div className={`${TONE_CLASS[resolvedTone]} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="ops-section-label !text-text-tertiary !tracking-[0.12em]">{label}</p>
        {action}
      </div>
      <p className={`font-[Sora] text-[2.625rem] font-bold leading-none mt-3 ${VALUE_COLOR[resolvedTone]}`}>{value}</p>
      {sublabel ? (
        <p className="mt-2 text-[11px] text-text-tertiary" style={{ fontFamily: 'Inter, sans-serif' }}>
          {sublabel}
        </p>
      ) : null}
    </div>
  )
}
