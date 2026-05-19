import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import OpsLayout from '../../components/ops/OpsLayout'
import MultiWalletHelper from '../../components/ops/MultiWalletHelper'
import { Button } from '../../components/ui'
import { usePlatformStore } from '../../store/platformStore'
import {
  isDisasterVaultConfigured,
  readCampaignState,
  uniqueApprovers,
} from '../../services/disasterVault'
import { getLoraApplicationUrl, getLoraTransactionUrl } from '../../services/humanitarianExplorer'
import { humanizeContractError } from '../../lib/contractErrorMap'
import {
  campaignStatusLabel,
  approvalProgressLabel,
  campaignCardBorderClass,
} from '../../lib/severityLabels'

interface CampaignRow {
  eventId: string
  location: string
  type: string
  campaignId: number
  chain: Awaited<ReturnType<typeof readCampaignState>> | null
}

export default function Verification() {
  const [searchParams] = useSearchParams()
  const highlightCampaign = searchParams.get('campaign')
  const syncFromChain = usePlatformStore((s) => s.syncEventCampaignFromChain)
  const approveCampaignOnChain = usePlatformStore((s) => s.approveCampaignOnChain)
  const { activeAddress, signTransactions } = useWallet()
  const [rows, setRows] = useState<CampaignRow[]>([])
  const [txByEvent, setTxByEvent] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const approverSet = new Set(uniqueApprovers().map((a) => a.toLowerCase()))
  const walletIsApprover =
    !!activeAddress && (approverSet.size === 0 || approverSet.has(activeAddress.toLowerCase()))

  const load = useCallback(async () => {
    if (!isDisasterVaultConfigured()) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const currentEvents = usePlatformStore.getState().disasterEvents
    const loaded: CampaignRow[] = []
    for (const e of currentEvents.filter((ev) => ev.onChainCampaignId != null)) {
      try {
        const chain = await readCampaignState(e.onChainCampaignId!)
        if (chain.status === 1) {
          loaded.push({
            eventId: e.id,
            location: e.location,
            type: e.type,
            campaignId: e.onChainCampaignId!,
            chain,
          })
        }
      } catch {
        /* skip */
      }
    }
    setRows(loaded)
    setLoading(false)
  }, [])

  const linkedCampaignCount = usePlatformStore(
    (s) => s.disasterEvents.filter((e) => e.onChainCampaignId != null).length,
  )

  useEffect(() => {
    void load()
  }, [load, linkedCampaignCount])

  const handleApprove = async (row: CampaignRow) => {
    if (!activeAddress || !signTransactions) {
      setErr('Connect your Pera wallet to sign this approval.')
      return
    }
    if (!walletIsApprover) {
      setErr('This wallet is not listed as an approver. Import an approver account in Pera (see banner above).')
      return
    }
    setBusy(row.eventId)
    setErr(null)
    try {
      const txId = await approveCampaignOnChain(activeAddress, signTransactions, row.campaignId)
      setTxByEvent((m) => ({ ...m, [row.eventId]: txId }))
      await syncFromChain(row.eventId, row.campaignId)
      await load()
    } catch (e) {
      setErr(humanizeContractError(e))
    } finally {
      setBusy(null)
    }
  }

  const progressPct = (count: number, threshold: number) =>
    Math.min(100, Math.round((count / Math.max(1, threshold)) * 100))

  const progressColor = (count: number, threshold: number) => {
    if (count >= threshold) return 'bg-alert-success'
    if (count >= 1) return 'bg-alert-warning'
    return 'bg-transparent'
  }

  return (
    <OpsLayout
      title="Approvals"
      description="Each listed approver signs once in Pera. When both signatures are collected, release USDC from Release & Proof."
    >
      <MultiWalletHelper />

      {!isDisasterVaultConfigured() ? (
        <p className="text-sm text-text-secondary">Relief contract is not configured. Check Settings.</p>
      ) : loading ? (
        <p className="text-sm text-text-tertiary">Loading campaigns awaiting signatures…</p>
      ) : rows.length === 0 ? (
        <div className="surface-card p-6">
          <p className="text-sm text-text-tertiary">No campaigns awaiting signatures.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {rows.map((row) => {
            const chain = row.chain
            const pct = chain ? progressPct(chain.approvalCount, chain.threshold) : 0
            const ready = chain ? chain.approvalCount >= chain.threshold : false
            return (
              <article
                key={row.eventId}
                className={`${campaignCardBorderClass(chain?.status ?? 1)} p-5`}
              >
                <h3 className="font-[Sora] text-[15px] font-semibold text-text-primary">{row.location}</h3>
                <p className="mt-1 text-[12px] text-text-tertiary">
                  {row.type} · Campaign #{row.campaignId}
                </p>
                {Number(import.meta.env.VITE_DISASTER_APP_ID) ? (
                  <a
                    href={getLoraApplicationUrl(Number(import.meta.env.VITE_DISASTER_APP_ID))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[11px] text-accent-primary hover:underline"
                  >
                    View contract →
                  </a>
                ) : null}
                {highlightCampaign === String(row.campaignId) ? (
                  <p className="mt-2 text-xs text-text-secondary">
                    Campaign created — #{row.campaignId}
                    {Number(import.meta.env.VITE_DISASTER_APP_ID) ? (
                      <>
                        {' '}
                        ·{' '}
                        <a
                          href={getLoraApplicationUrl(Number(import.meta.env.VITE_DISASTER_APP_ID))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-primary hover:underline"
                        >
                          View application on blockchain →
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}

                {chain ? (
                  <div className="mt-5">
                    <p className="ops-section-label !text-text-tertiary mb-2">Approval progress</p>
                    <div className="h-1.5 bg-bg-elevated overflow-hidden">
                      <div
                        className={`h-full transition-all ${progressColor(chain.approvalCount, chain.threshold)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-text-secondary">
                      {approvalProgressLabel(chain.approvalCount, chain.threshold)}
                    </p>
                    <p className="mt-3 text-[12px] text-text-tertiary">
                      Status: <span className="text-text-primary">{campaignStatusLabel(chain.status)}</span>
                      {' · '}
                      Raised {(chain.raised / 1_000_000).toFixed(2)} / {(chain.target / 1_000_000).toFixed(2)} USDC
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3 pt-4 border-t border-border-subtle">
                  <Button
                    variant="primary"
                    disabled={busy === row.eventId || !activeAddress || ready}
                    onClick={() => void handleApprove(row)}
                  >
                    {busy === row.eventId ? 'Signing…' : 'Approve'}
                  </Button>
                </div>
                {txByEvent[row.eventId] ? (
                  <p className="mt-3 text-xs text-alert-success font-mono">
                    Approval recorded — txn: {txByEvent[row.eventId].slice(0, 8)}…{' '}
                    <a
                      href={getLoraTransactionUrl(txByEvent[row.eventId])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline"
                    >
                      Verify →
                    </a>
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      {err ? <p className="mt-4 text-xs text-alert-critical">{err}</p> : null}
      {!activeAddress ? (
        <p className="mt-4 text-xs text-text-tertiary">Connect Pera wallet to sign approvals.</p>
      ) : null}
    </OpsLayout>
  )
}
