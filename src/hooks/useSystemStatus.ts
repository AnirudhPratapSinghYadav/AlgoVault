import { useCallback, useEffect, useState } from 'react'
import { getGdacsLastFetch } from '../lib/gdacsSyncState'
import { apiUrl } from '../lib/apiBase'

export interface SystemStatus {
  gdacsLive: boolean
  gdacsLabel: string
  alertService: boolean
  telegram: boolean
  contractConfigured: boolean
  contractId: number
  networkBlock: number
  loading: boolean
}

const GDACS_STALE_MS = 20 * 60 * 1000

function minutesAgo(ts: number): string {
  if (!ts) return 'never'
  const min = Math.floor((Date.now() - ts) / 60_000)
  if (min <= 0) return 'just now'
  if (min === 1) return '1 min ago'
  return `${min} min ago`
}

export function useSystemStatus(networkBlock: number): SystemStatus {
  const [alertService, setAlertService] = useState(false)
  const [telegram, setTelegram] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const contractId = Number(import.meta.env.VITE_DISASTER_APP_ID) || 0

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(apiUrl('/api/alert-status'))
      if (r.ok) {
        const d = (await r.json()) as { alertService?: boolean; telegram?: boolean; running?: boolean }
        setAlertService(Boolean(d.alertService ?? d.running))
        setTelegram(Boolean(d.telegram))
      } else {
        setAlertService(false)
        setTelegram(false)
      }
    } catch {
      setAlertService(false)
      setTelegram(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => {
      void refresh()
      setTick((t) => t + 1)
    }, 30_000)
    return () => window.clearInterval(id)
  }, [refresh])

  void tick
  const lastGdacs = getGdacsLastFetch()
  const gdacsLive = lastGdacs > 0 && Date.now() - lastGdacs < GDACS_STALE_MS

  return {
    gdacsLive,
    gdacsLabel: minutesAgo(lastGdacs),
    alertService,
    telegram,
    contractConfigured: contractId > 0,
    contractId,
    networkBlock,
    loading,
  }
}
