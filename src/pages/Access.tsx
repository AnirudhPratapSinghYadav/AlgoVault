import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Key } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useOpsSession } from '../context/OpsSessionContext'
import { usePlatformStore } from '../store/platformStore'
import { ROUTES } from '../config/routes'

export default function Access() {
  const navigate = useNavigate()
  const { wallets } = useWallet()
  const { connect, enterDemoMode } = useOpsSession()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const events = usePlatformStore((s) => s.disasterEvents)
  const disbursements = usePlatformStore((s) => s.disbursements)

  const opsSnapshot = useMemo(() => {
    const liveEvents = events.filter((e) => e.dataSource === 'live')
    const active = liveEvents.filter(
      (e) => e.opsStatus === 'detected' || e.opsStatus === 'in_operations' || e.opsStatus === 'verification_pending',
    ).length
    const pendingApprovals = events.filter((e) => e.opsStatus === 'approval_pending').length
    const lastConfirmed = disbursements
      .filter((d) => d.status === 'confirmed' && d.txnHash && !d.txnHash.startsWith('SIMULATED'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    const lastDisbLabel = lastConfirmed
      ? formatDistanceToNow(new Date(lastConfirmed.timestamp), { addSuffix: true }).toUpperCase()
      : '—'
    return { active: liveEvents.length ? String(active) : '—', pendingApprovals: String(pendingApprovals), lastDisbLabel }
  }, [events, disbursements])

  const handleWallet = async (provider: 'pera' | 'defly' | 'wc') => {
    setError(null)
    setLoading(provider)
    try {
      await connect(provider)
      navigate(ROUTES.operations)
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleEnter = () => {
    enterDemoMode()
    navigate(ROUTES.operations)
  }

  const pera = wallets?.find((w) => String(w.id).toLowerCase() === 'pera')
  const defly = wallets?.find((w) => String(w.id).toLowerCase() === 'defly')

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row">
      <div className="relative lg:w-1/2 min-h-[40vh] lg:min-h-screen bg-bg-elevated overflow-hidden">
        <img
          src="/images/disaster/hero-aerial-flood.jpg"
          alt="Flood plains aerial at dawn"
          className="absolute inset-0 w-full h-full object-cover cinema-img"
        />
        <div className="absolute inset-0 bg-overlay-darker" />
        <div className="absolute bottom-6 left-6 right-6 max-w-sm p-5 bg-bg-surface border-l-[3px] border-l-accent-primary">
          <p className="font-mono text-[10px] uppercase tracking-label text-text-tertiary">Operations snapshot</p>
          <ul className="mt-3 space-y-2 text-xs font-mono">
            <li className="flex justify-between">
              <span className="text-text-tertiary">Active signals</span>
              <span className="text-alert-warning">{opsSnapshot.active}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-text-tertiary">Pending approvals</span>
              <span className="text-text-primary">{opsSnapshot.pendingApprovals}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-text-tertiary">Last disbursement</span>
              <span className="text-accent-primary">{opsSnapshot.lastDisbLabel}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-bg-surface border border-border-medium p-8 sm:p-12">
          <p className="font-serif text-2xl text-text-primary">ALGOVAULT</p>
          <h1 className="font-serif text-3xl font-semibold text-text-primary mt-10">Access humanitarian operations</h1>
          <p className="mt-4 text-text-secondary text-sm leading-relaxed">
            Secure access for disaster response authorities, humanitarian partners, and field verification teams.
          </p>
          <hr className="my-8 border-border-subtle" />
          <p className="font-mono text-[10px] uppercase tracking-label text-text-tertiary">Sign in</p>
          <div className="mt-4 space-y-3">
            {[
              { id: 'pera' as const, label: 'Continue with Pera', enabled: !!pera },
              { id: 'defly' as const, label: 'Continue with Defly', enabled: !!defly },
              { id: 'wc' as const, label: 'Continue with WalletConnect', enabled: false },
            ].map(({ id, label, enabled }) => (
              <div key={id}>
                <button
                  type="button"
                  disabled={!enabled || !!loading}
                  onClick={() => handleWallet(id)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-bg-elevated border border-border-medium hover:border-accent-primary transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <span className="text-sm text-text-primary">{label}</span>
                  <ArrowRight size={18} className="text-text-tertiary" />
                </button>
                {id === 'pera' ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-text-tertiary">
                    Using Pera on mobile? Open this page on your computer, click Continue with Pera, then scan the QR
                    with your Pera app.
                  </p>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-between px-5 py-4 bg-bg-elevated border border-border-medium opacity-50 min-h-[44px]"
            >
              <span className="flex items-center gap-2 text-sm text-text-primary">
                <Key size={16} />
                Institutional SSO
              </span>
              <span className="text-xs font-mono text-text-tertiary">Soon</span>
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-alert-critical">{error}</p> : null}
          <button
            type="button"
            onClick={handleEnter}
            className="mt-8 w-full py-4 bg-accent-primary text-text-inverse font-medium hover:bg-accent-hover transition-colors min-h-[44px]"
          >
            Enter Operations
          </button>
          <Link
            to={ROUTES.communityFeed}
            className="mt-4 flex w-full min-h-[44px] items-center justify-center border border-border-medium py-3 text-center text-sm text-text-secondary transition-colors hover:border-accent-primary hover:text-text-primary"
          >
            Community appeals
          </Link>
        </div>
      </div>
    </div>
  )
}
