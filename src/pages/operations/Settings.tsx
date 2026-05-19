import { useState } from 'react'
import { Link } from 'react-router-dom'
import OpsLayout from '../../components/ops/OpsLayout'
import AppsExplainer from '../../components/ops/AppsExplainer'
import AlertChannelsPanel from '../../components/ops/AlertChannelsPanel'
import HumanitarianStandardsPanel from '../../components/ops/HumanitarianStandardsPanel'
import { OpsPanel, Button } from '../../components/ui'
import { ROUTES } from '../../config/routes'
import { getAppealsHubLoraUrls, getDisasterVaultLoraUrls, getLoraApplicationUrl } from '../../services/humanitarianExplorer'
import { truncateAddress } from '../../lib/format'
import { useOpsStore } from '../../store/opsStore'
import { useWallet } from '@txnlab/use-wallet-react'

const ADMIN_ADDR = (import.meta.env.VITE_ADMIN_ADDRESS || '').trim()
const APPROVER_1 = (import.meta.env.VITE_DISASTER_APPROVER_1 || '').trim()
const APPROVER_2 = (import.meta.env.VITE_DISASTER_APPROVER_2 || '').trim()
const DISASTER_APP_ID = Number(import.meta.env.VITE_DISASTER_APP_ID || 0)
const APPEALS_APP_ID = Number(import.meta.env.VITE_APPEALS_APP_ID || 0)

function AddressField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <div className="py-3 border-b border-border-subtle last:border-0">
      <label className="block text-xs text-text-tertiary mb-1">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={value}
          className="flex-1 min-w-[200px] font-mono text-xs text-text-primary bg-bg-elevated border border-border-medium px-3 py-2"
        />
        <Button
          variant="outline"
          className="text-[10px] min-h-0 py-1 px-2"
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(value).then(() => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            })
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}

export default function Settings() {
  const { activeAddress } = useWallet()
  const networkBlock = useOpsStore((s) => s.networkBlock)
  const disaster = getDisasterVaultLoraUrls()
  const appeals = getAppealsHubLoraUrls()

  return (
    <OpsLayout title="Settings" description="Wallet, contracts, funding addresses, and field alerts.">
      <div className="space-y-6 max-w-2xl">
        <OpsPanel title="Multi-wallet on one device">
          <AddressField label="Operations admin" value={ADMIN_ADDR} />
          <AddressField label="Approver 1" value={APPROVER_1} />
          <AddressField label="Approver 2" value={APPROVER_2} />
          <p className="mt-4 text-[12px] text-text-tertiary leading-relaxed">
            Import each account in Pera: Add Account → Import with passphrase. Use the mnemonics from{' '}
            <span className="font-mono text-text-secondary">docs/DEMO_WALLETS.md</span>
          </p>
        </OpsPanel>

        <OpsPanel title="Wallet & network">
          <dl className="text-sm space-y-4">
            <div>
              <dt className="text-xs text-text-tertiary">Network</dt>
              <dd className="text-text-primary mt-1">Connected</dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Block height</dt>
              <dd className="font-mono text-text-primary mt-1">
                {networkBlock > 0 ? networkBlock.toLocaleString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Connected wallet (Pera)</dt>
              <dd className="font-mono text-xs text-text-primary mt-1">
                {activeAddress ? truncateAddress(activeAddress, 8, 8) : 'Not connected'}
              </dd>
            </div>
          </dl>
        </OpsPanel>

        <OpsPanel title="Verify on blockchain">
          <div className="flex flex-wrap gap-6">
            {DISASTER_APP_ID ? (
              <a
                href={getLoraApplicationUrl(DISASTER_APP_ID)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-primary hover:underline"
              >
                DisasterVault contract →
              </a>
            ) : null}
            {APPEALS_APP_ID ? (
              <a
                href={getLoraApplicationUrl(APPEALS_APP_ID)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-primary hover:underline"
              >
                Community appeals contract →
              </a>
            ) : null}
          </div>
          {!DISASTER_APP_ID && !APPEALS_APP_ID ? (
            <p className="text-xs text-text-tertiary">Configure VITE_DISASTER_APP_ID and VITE_APPEALS_APP_ID.</p>
          ) : null}
        </OpsPanel>

        <OpsPanel title="Fund app accounts (ALGO)">
          <p className="text-xs text-text-secondary mb-4">
            Operational fees only. Donors use in-app Fund; relief uses Disbursements.
          </p>
          {appeals ? (
            <div className="py-2">
              <p className="text-xs text-text-tertiary">Community appeals hub</p>
              <p className="font-mono text-xs text-text-primary break-all">{appeals.appAddress}</p>
            </div>
          ) : null}
          {disaster ? (
            <div className="py-2">
              <p className="text-xs text-text-tertiary">DisasterVault</p>
              <p className="font-mono text-xs text-text-primary break-all">{disaster.appAddress}</p>
            </div>
          ) : null}
        </OpsPanel>

        <OpsPanel title="Field alerts">
          <AlertChannelsPanel variant="ops" />
        </OpsPanel>

        <HumanitarianStandardsPanel />

        <AppsExplainer />

        <details className="border border-border-subtle bg-bg-surface p-4 rounded">
          <summary className="text-sm font-medium text-text-primary cursor-pointer">Legal & compliance</summary>
          <div className="mt-4 text-xs text-text-secondary space-y-3 leading-relaxed">
            <p>
              Informed by public WHO and UN OCHA frameworks — not an official partnership unless agreed in writing.
              Operators handle sanctions screening and beneficiary due diligence.
            </p>
            <p>
              <Link to={ROUTES.terms} className="text-accent-primary">
                Terms
              </Link>
              {' · '}
              <Link to={ROUTES.privacy} className="text-accent-primary">
                Privacy
              </Link>
              {' · '}
              <Link to={ROUTES.disclaimers} className="text-accent-primary">
                Disclaimers
              </Link>
            </p>
          </div>
        </details>
      </div>
    </OpsLayout>
  )
}
