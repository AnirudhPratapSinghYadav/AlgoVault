import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { OPS_NAV_ITEMS } from '../../config/opsNav'
import { ROUTES } from '../../config/routes'
import { useOpsSession } from '../../context/OpsSessionContext'
import { useOpsStore } from '../../store/opsStore'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { disconnect } = useOpsSession()
  const networkBlock = useOpsStore((s) => s.networkBlock)

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path)

  const body = (
    <>
      <div className="px-4 py-5 border-b border-border-subtle">
        <Link
          to={ROUTES.home}
          onClick={onClose}
          className="font-[Sora] text-sm font-bold tracking-tight text-accent-primary hover:brightness-110"
        >
          ALGOVAULT
        </Link>
        <p
          className="mt-2 font-[JetBrains_Mono] text-[9px] uppercase tracking-[0.12em] leading-relaxed"
          style={{ color: 'rgba(255, 107, 0, 0.4)' }}
        >
          Humanitarian operations
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2" aria-label="Operations navigation">
        {OPS_NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
          const active = isActive(path, exact)
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex h-10 items-center gap-3 px-4 text-[13px] transition-colors border-l-[3px] ${
                active
                  ? 'border-accent-primary bg-[rgba(255,107,0,0.10)] text-text-primary'
                  : 'border-transparent text-text-tertiary hover:bg-white/[0.03] hover:text-text-secondary'
              }`}
            >
              <Icon size={17} strokeWidth={1.5} className={`shrink-0 ${active ? 'text-accent-primary' : ''}`} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border-subtle px-4 py-4 bg-bg-surface-secondary">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-alert-success status-dot-pulse" aria-hidden />
          <span className="font-[JetBrains_Mono] text-[9px] uppercase tracking-wider text-text-secondary">
            Algorand testnet
          </span>
        </div>
        <p className="mt-1.5 font-[JetBrains_Mono] text-[9px] text-text-tertiary">
          Block {networkBlock > 0 ? networkBlock.toLocaleString() : '—'}
        </p>
        <button
          type="button"
          onClick={() => {
            disconnect()
            navigate(ROUTES.access)
          }}
          className="mt-4 text-[11px] text-text-tertiary hover:text-alert-critical transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-[220px] flex-col border-r border-border-subtle bg-[#0a0c0b]">
        {body}
      </aside>
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-overlay-darker"
            aria-label="Close navigation"
            onClick={onClose}
          />
          <aside className="relative flex h-full w-[220px] max-w-[85vw] flex-col border-r border-border-subtle bg-[#0a0c0b]">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1 text-text-tertiary hover:text-text-primary"
              aria-label="Close menu"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            {body}
          </aside>
        </div>
      ) : null}
    </>
  )
}
