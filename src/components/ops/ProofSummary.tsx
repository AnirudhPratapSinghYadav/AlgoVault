import { Link2 } from 'lucide-react'
import { getLoraTransactionUrl } from '../../services/humanitarianExplorer'

export interface ProofLine {
  txnHash: string
  name: string
  amountUsdc: number
}

interface Props {
  totalUsdc: number
  beneficiaryCount: number
  lines: ProofLine[]
  headerAction?: React.ReactNode
}

export default function ProofSummary({ totalUsdc, beneficiaryCount, lines, headerAction }: Props) {
  if (lines.length === 0 && totalUsdc === 0) {
    return (
      <div className="mb-6 surface-card p-6">
        <p className="text-sm text-text-secondary">
          No disbursements yet. Complete the approval workflow to disburse funds and see proof here.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-4">
      {headerAction ? <div className="flex justify-end mb-2">{headerAction}</div> : null}
      <div className="border border-alert-success/30 bg-[rgba(45,198,83,0.08)] px-5 py-4">
        <p className="font-[Sora] text-lg font-semibold text-alert-success">
          {totalUsdc.toLocaleString()} USDC disbursed to {beneficiaryCount} beneficiary
          {beneficiaryCount === 1 ? '' : 'ies'}
        </p>
        <p className="mt-1 text-[13px] text-text-secondary">All transactions confirmed on Algorand</p>
        <p className="mt-1 font-[JetBrains_Mono] text-[11px] text-text-tertiary">Block finality: ~2.78 seconds</p>
      </div>
      <ul className="space-y-3">
        {lines.map((line) => (
          <li
            key={`${line.txnHash}-${line.name}`}
            className="flex flex-wrap items-center gap-3 border-b border-border-subtle pb-3 last:border-0"
          >
            <Link2 className="w-4 h-4 text-text-tertiary shrink-0" aria-hidden />
            <span className="font-[JetBrains_Mono] text-[11px] text-text-tertiary">
              {line.txnHash.slice(0, 8)}…{line.txnHash.slice(-6)}
            </span>
            <span className="flex-1 text-[13px] text-text-primary min-w-[120px]">
              {line.amountUsdc} USDC → {line.name}
            </span>
            <a
              href={getLoraTransactionUrl(line.txnHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-accent-primary hover:underline shrink-0"
            >
              Verify on blockchain →
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
