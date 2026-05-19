import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/routes'

interface Props {
  eventCount: number
  campaignsCreated: number
  approvalsReceived: number
  usdcDisbursed: number
  communityAppeals: number
  pendingAppeals: number
}

function Stage({
  label,
  count,
  sub,
  href,
  active,
}: {
  label: string
  count: number
  sub?: string
  href: string
  active: boolean
}) {
  return (
    <Link to={href} className="flex items-start gap-3 group">
      <span
        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
          active ? 'bg-accent-primary' : 'bg-text-tertiary/40'
        }`}
        aria-hidden
      />
      <div>
        <p className="text-[13px] font-medium text-text-primary group-hover:text-accent-primary transition-colors">
          {label} <span className="font-mono text-text-tertiary">[{count}]</span>
        </p>
        {sub ? <p className="mt-0.5 text-[11px] text-text-tertiary">{sub}</p> : null}
      </div>
    </Link>
  )
}

export default function PipelineSnapshot({
  eventCount,
  campaignsCreated,
  approvalsReceived,
  usdcDisbursed,
  communityAppeals,
  pendingAppeals,
}: Props) {
  return (
    <div className="space-y-1">
      <Stage label="Active Events" count={eventCount} href={ROUTES.operationsEvents} active={eventCount > 0} />
      <div className="ml-[4px] h-4 border-l border-dashed border-border-medium" aria-hidden />
      <Stage
        label="Campaigns Created"
        count={campaignsCreated}
        href={ROUTES.operationsEvents}
        active={campaignsCreated > 0}
      />
      <div className="ml-[4px] h-4 border-l border-dashed border-border-medium" aria-hidden />
      <Stage
        label="Approvals Received"
        count={approvalsReceived}
        href={ROUTES.operationsVerification}
        active={approvalsReceived > 0}
      />
      <div className="ml-[4px] h-4 border-l border-dashed border-border-medium" aria-hidden />
      <Stage
        label="USDC Disbursed"
        count={usdcDisbursed}
        href={`${ROUTES.operationsDisbursements}?tab=proof`}
        active={usdcDisbursed > 0}
      />
      <div className="ml-[4px] h-4 border-l border-dashed border-border-medium" aria-hidden />
      <Stage
        label="Community Appeals"
        count={communityAppeals}
        sub={
          pendingAppeals > 0
            ? `${pendingAppeals} appeal${pendingAppeals === 1 ? '' : 's'} pending review`
            : 'No appeals pending review'
        }
        href={ROUTES.operationsCommunityQueue}
        active={communityAppeals > 0}
      />
    </div>
  )
}
