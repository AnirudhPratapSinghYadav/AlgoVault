import { useEffect, useMemo, useState } from 'react'
import OpsLayout from '../../components/ops/OpsLayout'
import { OpsPanel } from '../../components/ui'
import MetricCard from '../../components/ui/MetricCard'
import { getLoraTransactionUrl } from '../../services/humanitarianExplorer'
import { fetchLedgerProofRecords } from '../../services/platform/indexerBridge'
import PipelineSnapshot from '../../components/ops/PipelineSnapshot'
import { useCommunityStore } from '../../store/communityStore'
import { useOpsData } from '../../store/opsStore'
import { isValidTxnId } from '../../services/txPipeline'

const STRICT = import.meta.env.VITE_DEMO_STRICT === 'true'

interface ActivityRow {
  id: string
  time: string
  message: string
  tone: 'success' | 'warn' | 'info'
}

export default function CommandCenter() {
  const { events, disbursements, campaigns } = useOpsData()
  const crises = useCommunityStore((s) => s.crises)
  const pendingAppeals = crises.filter(
    (c) => c.status === 'pending' || c.status === 'under_review' || c.chainStatus === 'pending',
  ).length
  const [activity, setActivity] = useState<ActivityRow[]>([])

  const totalDisbursed = disbursements
    .filter((d) => d.status === 'confirmed' && (!STRICT || isValidTxnId(d.txnHash)))
    .reduce((s, d) => s + d.amount, 0)
  const pendingGdacs = events.filter((e) => e.opsStatus === 'detected').length
  const onChainCampaigns = events.filter((e) => e.onChainCampaignId).length
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const pendingApprovals = events.filter((e) => e.opsStatus === 'approval_pending').length
  const approvalCount = events.filter((e) => e.onChainStatus != null && e.onChainStatus >= 2).length

  useEffect(() => {
    void fetchLedgerProofRecords(12).then(({ records }) => {
      setActivity(
        records.map((t) => ({
          id: t.id,
          time: new Date(t.timestamp).toISOString().slice(11, 19),
          message: `${t.appLabel} · ${t.action}`,
          tone: t.action.toLowerCase().includes('disburse')
            ? 'success'
            : t.action.toLowerCase().includes('campaign')
              ? 'warn'
              : 'info',
        })),
      )
    })
  }, [])

  const activityToneClass = useMemo(
    () => ({
      success: 'text-alert-success',
      warn: 'text-accent-primary',
      info: 'text-text-tertiary',
    }),
    [],
  )

  return (
    <OpsLayout title="Overview">
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="USDC disbursed" value={`${totalDisbursed.toLocaleString()} USDC`} tone="success" />
        <MetricCard label="Active campaigns" value={String(activeCampaigns)} tone="primary" />
        <MetricCard
          label="Signals awaiting campaign"
          value={String(pendingGdacs)}
          tone="warning"
          sublabel={pendingGdacs > 0 ? 'From live disaster monitoring' : undefined}
        />
        <MetricCard label="Awaiting signatures" value={String(pendingApprovals)} tone="critical" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <OpsPanel title="Recent on-chain activity" className="lg:col-span-3">
          {activity.length === 0 ? (
            <p className="py-6 text-sm text-text-tertiary">No activity</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {activity.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 border-b border-border-subtle py-2 last:border-0"
                >
                  <span className="shrink-0 font-[JetBrains_Mono] text-[11px] text-text-tertiary">{row.time}</span>
                  <span className={`flex-1 text-right text-[13px] ${activityToneClass[row.tone]}`}>{row.message}</span>
                </li>
              ))}
            </ul>
          )}
          {activity[0]?.id ? (
            <a
              href={getLoraTransactionUrl(activity[0].id)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xs text-accent-primary"
            >
              View on blockchain →
            </a>
          ) : null}
        </OpsPanel>

        <OpsPanel title="Pipeline" className="lg:col-span-2">
          <PipelineSnapshot
            eventCount={events.length}
            campaignsCreated={onChainCampaigns}
            approvalsReceived={approvalCount}
            usdcDisbursed={disbursements.filter((d) => d.status === 'confirmed').length}
            communityAppeals={crises.length}
            pendingAppeals={pendingAppeals}
          />
        </OpsPanel>
      </div>
    </OpsLayout>
  )
}
