import { useOpsStore } from '../../store/opsStore'
import { useSystemStatus } from '../../hooks/useSystemStatus'

function StatusDot({ live, pulse }: { live: boolean; pulse?: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
        live ? 'bg-alert-success' : 'bg-alert-warning'
      } ${live && pulse ? 'status-dot-pulse' : ''}`}
      aria-hidden
    />
  )
}

function StatusSegment({
  label,
  detail,
  live,
  pulse,
  liveWord,
}: {
  label: string
  detail: string
  live: boolean
  pulse?: boolean
  liveWord?: string
}) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <StatusDot live={live} pulse={pulse} />
      <span className="text-text-tertiary">{label}</span>
      {liveWord && live ? (
        <span className="font-semibold text-alert-success">{liveWord}</span>
      ) : null}
      <span className={live ? 'text-text-primary' : 'text-alert-warning'}>{detail}</span>
    </span>
  )
}

export default function SystemStatusBar() {
  const networkBlock = useOpsStore((s) => s.networkBlock)
  const s = useSystemStatus(networkBlock)

  const anyOffline =
    !s.loading && (!s.gdacsLive || !s.alertService || !s.telegram || !s.contractConfigured)

  return (
    <div
      className={`system-status-bar mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 ${
        anyOffline ? 'system-status-bar--degraded' : 'system-status-bar--ok'
      }`}
    >
      <StatusSegment
        label="GDACS"
        liveWord={s.gdacsLive ? 'Live' : undefined}
        detail={s.gdacsLive ? `— synced ${s.gdacsLabel}` : `— stale · ${s.gdacsLabel}`}
        live={s.gdacsLive}
        pulse={s.gdacsLive}
      />
      <StatusSegment
        label="Alerts"
        liveWord={s.alertService ? 'Active' : undefined}
        detail={
          s.loading ? '…' : s.alertService ? '— monitoring 15-min intervals' : '— offline'
        }
        live={s.alertService}
        pulse={s.alertService}
      />
      <StatusSegment
        label="Telegram"
        liveWord={s.telegram ? 'Watching' : undefined}
        detail={s.loading ? '…' : s.telegram ? '— @AlgoVault_Guardian_bot' : '— offline'}
        live={s.telegram}
        pulse={s.telegram}
      />
      <StatusSegment
        label="Blockchain"
        detail={
          networkBlock > 0
            ? `Block ${networkBlock.toLocaleString()}`
            : s.contractConfigured
              ? `App #${s.contractId}`
              : '—'
        }
        live={networkBlock > 0 || s.contractConfigured}
        pulse={networkBlock > 0}
      />
      <StatusSegment
        label="Network"
        detail="Algorand Testnet"
        live
        pulse={false}
      />
    </div>
  )
}
