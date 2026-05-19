import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import OpsLayout from '../../components/ops/OpsLayout'
import EventDetailDrawer from '../../components/ops/EventDetailDrawer'
import CreateCampaignModal, { type CreateCampaignOptions } from '../../components/ops/CreateCampaignModal'
import { TRIGGER_LABELS } from '../../domain/campaignOpsMeta'
import { OpsPanel, DataTable, Button } from '../../components/ui'
import type { DataTableColumn } from '../../components/ui'
import type { DisasterEvent } from '../../domain/platform'
import { useOpsData } from '../../store/opsStore'
import { usePlatformStore } from '../../store/platformStore'
import { useGdacsAutoPoll } from '../../hooks/useGdacsAutoPoll'
import { getGdacsLastFetch } from '../../lib/gdacsSyncState'
import algosdk from 'algosdk'
import {
  createCampaign,
  isDisasterVaultConfigured,
  readVaultAdmin,
  uniqueApprovers,
} from '../../services/disasterVault'
import { getNetworkConfig } from '../../services/networkConfig'
import { ROUTES } from '../../config/routes'
import { humanizeContractError } from '../../lib/contractErrorMap'
import { severityDisplayLabel, severityBadgeClass } from '../../lib/severityLabels'

const ADMIN = (): string => (import.meta.env.VITE_ADMIN_ADDRESS || '').trim()

function adminWalletHint(
  activeAddress: string | undefined,
  signTransactions: unknown,
): 'connect' | 'wrong' | 'ready' | 'no-admin-config' {
  const admin = ADMIN()
  if (!admin) return 'no-admin-config'
  if (!activeAddress || !signTransactions) return 'connect'
  if (activeAddress !== admin) return 'wrong'
  return 'ready'
}

function typePill(type: string) {
  return (
    <span className="inline-block rounded border border-border-medium bg-bg-elevated px-2 py-0.5 text-[10px] text-text-secondary">
      {type}
    </span>
  )
}

export default function Events() {
  const navigate = useNavigate()
  const { events } = useOpsData()
  const linkCampaign = usePlatformStore((s) => s.linkEventOnChainCampaign)
  const registerCampaignMeta = usePlatformStore((s) => s.registerCampaignMeta)
  const syncFromChain = usePlatformStore((s) => s.syncEventCampaignFromChain)
  const { activeAddress, signTransactions } = useWallet()
  const { busy: gdacsBusy, lastSyncedLabel, refreshGdacs } = useGdacsAutoPoll()
  const [createBusy, setCreateBusy] = useState<string | null>(null)
  const [modalEvent, setModalEvent] = useState<DisasterEvent | null>(null)
  const [selected, setSelected] = useState<DisasterEvent | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const walletState = adminWalletHint(activeAddress ?? undefined, signTransactions)
  const lastSync = getGdacsLastFetch()
  const syncFresh = lastSync > 0 && Date.now() - lastSync < 5 * 60_000

  useEffect(() => {
    if (walletState === 'ready') setErr(null)
  }, [walletState])

  const runCreateCampaign = async (event: DisasterEvent, options: CreateCampaignOptions) => {
    if (walletState !== 'ready' || !activeAddress || !signTransactions) return
    setErr(null)
    const chainAdmin = await readVaultAdmin()
    if (!chainAdmin) {
      setErr('Relief vault admin is not configured on-chain. Run bootstrap before creating campaigns.')
      return
    }
    const admin = ADMIN()
    if (admin && chainAdmin !== admin) {
      setErr('Connected operations wallet does not match the vault administrator.')
      return
    }
    const approvers = uniqueApprovers()
    if (approvers.length === 0) {
      setErr('Approver wallets are not configured.')
      return
    }
    const threshold = Math.min(2, approvers.length)
    const campaignName = `Relief: ${event.location}`.slice(0, 16)
    setCreateBusy(event.id)
    try {
      const { algod } = getNetworkConfig()
      const client = new algosdk.Algodv2(algod.token, algod.server, algod.port)
      const status = await client.status().do()
      const lastRound = Number(status['last-round'])
      const expiryRounds = Number(import.meta.env.VITE_CAMPAIGN_EXPIRY_ROUNDS || 2_000_000)
      const targetMicroUsdc = Number(import.meta.env.VITE_CAMPAIGN_TARGET_MICRO_USDC || 10_000_000)
      const { campaignId } = await createCampaign(activeAddress, signTransactions, {
        name: campaignName,
        targetMicroUsdc,
        region: event.location.slice(0, 8),
        approvers,
        threshold,
        expiryRound: lastRound + expiryRounds,
      })
      linkCampaign(event.id, campaignId, '')
      registerCampaignMeta({
        eventId: event.id,
        onChainCampaignId: campaignId,
        name: campaignName,
        region: event.location.slice(0, 32),
        kind: options.kind,
        triggerParameter: options.triggerParameter,
        triggerThreshold: options.triggerThreshold,
        currentTriggerValue: 0,
        autoTriggered: false,
        monitoringStatus:
          options.kind === 'anticipatory' && options.triggerParameter && options.triggerThreshold != null
            ? `Monitoring — will auto-disburse if ${TRIGGER_LABELS[options.triggerParameter].toLowerCase()} exceeds ${options.triggerThreshold}`
            : undefined,
        createdAt: new Date().toISOString(),
      })
      await syncFromChain(event.id, campaignId)
      setModalEvent(null)
      navigate(`${ROUTES.operationsVerification}?campaign=${campaignId}`)
    } catch (e) {
      setErr(humanizeContractError(e))
    } finally {
      setCreateBusy(null)
    }
  }

  const columns: DataTableColumn<DisasterEvent>[] = [
    {
      key: 'id',
      header: 'Event ID',
      render: (e) => <span className="font-[JetBrains_Mono] text-[11px] text-text-tertiary">{e.id}</span>,
    },
    {
      key: 'loc',
      header: 'Location',
      render: (e) => <span className="text-[14px] font-medium text-text-primary">{e.location}</span>,
    },
    { key: 'type', header: 'Type', render: (e) => typePill(e.type) },
    {
      key: 'sev',
      header: 'Severity',
      render: (e) => (
        <span className={severityBadgeClass(e.severity)}>{severityDisplayLabel(e.severity)}</span>
      ),
    },
    {
      key: 'time',
      header: 'Updated',
      render: (e) => (
        <span className="font-[JetBrains_Mono] text-[11px] text-text-tertiary">
          {e.detectedAt ? new Date(e.detectedAt).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (e) =>
        e.onChainCampaignId ? (
          <span className="font-[JetBrains_Mono] text-[11px] text-accent-primary">#{e.onChainCampaignId}</span>
        ) : isDisasterVaultConfigured() ? (
          <Button
            variant="outline"
            className="min-h-0 py-1 text-[10px]"
            disabled={createBusy === e.id || walletState !== 'ready'}
            onClick={(ev) => {
              ev.stopPropagation()
              if (walletState === 'ready') setModalEvent(e)
            }}
          >
            {createBusy === e.id ? '…' : 'Create'}
          </Button>
        ) : (
          <span className="text-xs text-text-tertiary">—</span>
        ),
    },
  ]

  const toolbar = (
    <>
      <span className="inline-flex items-center gap-2 font-[JetBrains_Mono] text-[11px] text-text-tertiary">
        <span
          className={`h-2 w-2 rounded-full ${syncFresh ? 'bg-alert-success status-dot-pulse' : 'bg-alert-warning'}`}
          aria-hidden
        />
        Last synced: {lastSyncedLabel}
      </span>
      <Button
        variant="primary"
        disabled={gdacsBusy}
        onClick={() => void refreshGdacs()}
        className="!rounded-none !border-0 !bg-[#FF6B00] !text-black hover:!brightness-110 text-xs font-semibold px-4"
      >
        {gdacsBusy ? 'Refreshing…' : 'Refresh'}
      </Button>
      <span className="rounded-full border border-[rgba(255,107,0,0.3)] bg-[rgba(255,107,0,0.15)] px-2.5 py-1 font-[JetBrains_Mono] text-[11px] text-[#FF6B00]">
        {events.length} signals
      </span>
    </>
  )

  return (
    <OpsLayout
      title="Active Events"
      headerActions={toolbar}
    >
      {walletState === 'wrong' ? (
        <div
          className="mb-4 border border-[#F59E0B]/30 border-l-[3px] border-l-[#F59E0B] bg-[rgba(245,158,11,0.08)] px-4 py-3 text-[13px] text-[#F59E0B]"
          role="status"
        >
          Connect the operations wallet to create campaigns.
        </div>
      ) : walletState === 'connect' ? (
        <p className="mb-4 text-[13px] text-text-secondary surface-inset px-4 py-3">
          Connect the operations wallet in Pera to create relief campaigns.
        </p>
      ) : null}
      {err ? <p className="text-xs text-alert-critical mb-4">{err}</p> : null}

      <OpsPanel title="Incident registry" noPadding>
        <DataTable
          columns={columns}
          data={events}
          rowKey={(e) => e.id}
          selectedRowKey={selected?.id ?? null}
          onRowClick={(e) => setSelected(e)}
          emptyMessage="No active signals — refresh the live disaster feed."
        />
      </OpsPanel>

      {modalEvent ? (
        <CreateCampaignModal
          event={modalEvent}
          open
          busy={createBusy === modalEvent.id}
          onClose={() => setModalEvent(null)}
          onConfirm={(opts) => void runCreateCampaign(modalEvent, opts)}
        />
      ) : null}
      <EventDetailDrawer
        event={selected}
        onClose={() => setSelected(null)}
        onCreateCampaign={(ev) => setModalEvent(ev)}
        createBusy={!!createBusy}
        canCreateCampaign={walletState === 'ready'}
        wrongWallet={walletState === 'wrong'}
      />
    </OpsLayout>
  )
}
