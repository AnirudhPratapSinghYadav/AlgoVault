import { useState } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'algovault_hide_multiwallet_hint'

export default function MultiWalletHelper() {
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  if (hidden) return null

  return (
    <div className="mb-6 flex gap-3 border border-[#3B82F6]/30 border-l-[3px] border-l-[#3B82F6] bg-[rgba(59,130,246,0.08)] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] leading-relaxed text-text-secondary whitespace-pre-line"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {`Approving from one phone:
1. In Pera app → tap your account name → switch to Approver 1
2. Tap Approve on this page — Pera will open to sign
3. After signing, switch Pera back to Approver 2
4. Refresh this page, then tap Approve again
Pera Wallet supports multiple accounts — no second device needed.`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setHidden(true)
        }}
        className="shrink-0 p-1 text-text-tertiary hover:text-text-primary"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  )
}
