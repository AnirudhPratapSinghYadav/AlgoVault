/** Plain-English severity labels for ops UI */

export function severityDisplayLabel(severity: string): string {
  const s = severity.trim().toLowerCase()
  if (s === 'critical') return 'Critical — Act Now'
  if (s === 'red') return 'Emergency'
  if (s === 'high') return 'High Risk'
  if (s === 'medium') return 'Moderate Risk'
  if (s === 'low' || s === 'green') return 'Monitoring'
  if (s === 'orange') return 'Elevated Risk'
  return severity
}

export function severityBadgeClass(severity: string): string {
  const s = severity?.toLowerCase() ?? ''
  const base = 'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border'
  if (s === 'critical') return `${base} severity-badge-critical-blink bg-[#2a0505] text-[#E63946] border-[#E63946]/30`
  if (s === 'red') return `${base} severity-badge-emergency bg-[#2a0505] text-[#E63946] border-[#E63946]/30 font-bold`
  if (s === 'orange' || s === 'high') return `${base} bg-[#2a1200] text-[#FF6B00] border-[#FF6B00]/30`
  if (s === 'yellow' || s === 'medium') return `${base} bg-[#2a1f00] text-[#F59E0B] border-[#F59E0B]/30`
  return `${base} bg-[#1a1a1a] text-[#888] border-[#333]`
}

export function severityRiskSentence(severity: string): string {
  const s = severity.trim().toLowerCase()
  if (s === 'critical' || s === 'red') return 'Severe impact — immediate relief coordination recommended.'
  if (s === 'high' || s === 'orange') return 'High risk — pre-position relief funds and monitor closely.'
  if (s === 'medium') return 'Moderate risk — monitoring recommended; prepare contingency plans.'
  return 'Situation is being monitored; escalation possible.'
}

export function campaignStatusLabel(code: number): string {
  if (code === 1) return 'Awaiting Approvals'
  if (code === 2) return 'Approved — Ready to Disburse'
  if (code === 3) return 'Funds Disbursed'
  if (code === 4) return 'Expired'
  return 'Unknown'
}

export function approvalProgressLabel(count: number, threshold: number): string {
  if (threshold <= 0) return 'Awaiting approver signatures'
  if (count >= threshold) return `${threshold} of ${threshold} approvals received`
  return `${count} of ${threshold} approvals received`
}

export function campaignCardBorderClass(status: number): string {
  if (status === 1) return 'approval-card approval-card--pending'
  if (status === 2) return 'approval-card approval-card--ready'
  if (status === 3) return 'approval-card approval-card--done'
  if (status === 4) return 'approval-card approval-card--expired'
  return 'approval-card'
}
