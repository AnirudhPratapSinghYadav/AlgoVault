import { type ReactNode, useState } from 'react'
import { Sidebar } from '../ui'
import OpsWalletPill from './OpsWalletPill'
import { useAlgodStatus } from '../../hooks/useAlgodStatus'

interface Props {
  children: ReactNode
  title: string
  description?: string
  headerActions?: ReactNode
}

export default function OpsLayout({ children, title, description, headerActions }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useAlgodStatus()

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="ops-main-shell flex min-h-screen flex-col">
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface px-4 py-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="min-h-[44px] min-w-[44px] border border-border-medium px-2 font-[JetBrains_Mono] text-[10px] text-text-primary"
          >
            MENU
          </button>
          <span className="font-[Sora] text-sm font-semibold text-text-primary">{title}</span>
          <OpsWalletPill />
        </div>

        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between gap-4 border-b border-[rgba(255,107,0,0.2)] bg-bg-primary/95 backdrop-blur-sm px-8 py-4">
          <h1 className="ops-page-title text-[1.25rem]">{title}</h1>
          <div className="flex items-center gap-3">
            {headerActions}
            <OpsWalletPill />
          </div>
        </header>

        <main className="flex-1 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">
            {description ? <p className="ops-body mb-8 -mt-2 max-w-3xl hidden lg:block">{description}</p> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
