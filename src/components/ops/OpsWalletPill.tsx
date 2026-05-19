import { useOpsSession } from '../../context/OpsSessionContext'

function truncate(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`
}

export default function OpsWalletPill() {
  const { address, isDemoMode } = useOpsSession()

  if (isDemoMode || !address) {
    return (
      <span className="wallet-pill">
        <span className="h-2 w-2 rounded-full bg-alert-success status-dot-pulse" aria-hidden />
        <span className="text-text-secondary">Connected</span>
      </span>
    )
  }

  return (
    <span className="wallet-pill" title={address}>
      <span className="h-2 w-2 rounded-full bg-alert-success status-dot-pulse" aria-hidden />
      <span className="font-[JetBrains_Mono] text-[10px] text-text-primary">{truncate(address)}</span>
    </span>
  )
}
