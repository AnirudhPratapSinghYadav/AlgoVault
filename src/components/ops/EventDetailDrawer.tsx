import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import type { DisasterEvent } from '../../domain/platform'
import { ROUTES } from '../../config/routes'
import { Button } from '../ui'
import { getLoraApplicationUrl } from '../../services/humanitarianExplorer'
import { severityDisplayLabel, severityBadgeClass, campaignStatusLabel } from '../../lib/severityLabels'
import { DEMO_CORE_FOCUS } from '../../config/demoFocus'
import { apiUrl } from '../../lib/apiBase'

interface FloodForecast {
  available: boolean
  days: { date: string; probability: number }[]
  maxProbability: number
  message: string
}

export interface EventBrief {
  summary: string | null
  recommendedAction?: string | null
  criticality: 'critical' | 'high' | 'medium'
  headlines: { title: string; url: string; source: string }[]
  affectedArea?: string
  severityPlain?: string
  populationExposure?: string | null
  generatedAt: string
  error?: 'brief_unavailable'
}

interface Props {
  event: DisasterEvent | null
  onClose: () => void
  onCreateCampaign?: (event: DisasterEvent) => void
  createBusy?: boolean
  canCreateCampaign?: boolean
  wrongWallet?: boolean
}

function BriefFallbackPanel({ event }: { event: DisasterEvent }) {
  const sev = severityDisplayLabel(event.severity)
  return (
    <div className="surface-inset overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-bg-elevated">
        <p className="ops-section-label text-accent-primary">Situation brief</p>
      </div>
      <div className="space-y-3 px-4 py-4">
        <p className="text-[14px] text-text-secondary leading-[1.7]">
          {event.location} — {event.type} event detected.
        </p>
        <p className="text-[14px] text-text-secondary leading-[1.7]">
          Risk level: {sev}. Reported by live disaster monitoring feed. Field verification recommended before
          fund activation.
        </p>
        <p className="mt-4 border-t border-border-subtle pt-3 font-mono text-[11px] text-text-tertiary">
          Full AI brief: start the intelligence server with npm run start:server
        </p>
      </div>
    </div>
  )
}

function BriefLivePanel({ brief, event }: { brief: EventBrief; event: DisasterEvent }) {
  const sev = brief.severityPlain ?? severityDisplayLabel(event.severity)
  return (
    <div className="surface-inset overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-bg-elevated flex items-center justify-between gap-2">
        <p className="ops-section-label">Situation brief</p>
        <span className="text-[10px] font-mono text-accent-primary">Live feed</span>
      </div>
      <div className="px-4 py-4 space-y-5">
        {brief.summary ? (
          <p className="text-[14px] text-text-secondary leading-[1.7] whitespace-pre-wrap">{brief.summary}</p>
        ) : null}
        <div>
          <p className="ops-section-label mb-2">Key signals</p>
          <ul className="space-y-2 text-sm">
            <li className="brief-signal-card">
              <span className="text-text-tertiary text-xs">Affected area</span>
              <span className="text-text-primary mt-1 block">{brief.affectedArea ?? event.location}</span>
            </li>
            <li className="brief-signal-card">
              <span className="text-text-tertiary text-xs">Severity</span>
              <span className="text-text-primary mt-1 block">{sev}</span>
            </li>
            {brief.populationExposure ? (
              <li className="flex flex-col gap-0.5">
                <span className="text-text-tertiary text-xs">Population exposure</span>
                <span className="text-text-primary">{brief.populationExposure}</span>
              </li>
            ) : null}
            <li className="flex flex-col gap-0.5">
              <span className="text-text-tertiary text-xs">Last updated</span>
              <span className="text-text-primary">
                {new Date(brief.generatedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </li>
          </ul>
        </div>
        {brief.recommendedAction ? (
          <div className="brief-action-card">
            <p className="ops-section-label mb-1.5">Recommended action</p>
            <p className="text-[14px] text-text-primary leading-relaxed">{brief.recommendedAction}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function EventDetailDrawer({
  event,
  onClose,
  onCreateCampaign,
  createBusy,
  canCreateCampaign = true,
  wrongWallet = false,
}: Props) {
  const [briefText, setBriefText] = useState<string | null>(null)
  const [briefMeta, setBriefMeta] = useState<EventBrief | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [flood, setFlood] = useState<FloodForecast | null>(null)

  useEffect(() => {
    if (!event) {
      setBriefText(null)
      setBriefMeta(null)
      return
    }
    const cached = event.situationBrief
    if (cached?.summary && event.situationBriefAt) {
      const age = Date.now() - new Date(event.situationBriefAt).getTime()
      if (age < 30 * 60 * 1000) {
        setBriefText(cached.summary)
        setBriefMeta(cached as EventBrief)
        return
      }
    }
    const controller = new AbortController()
    setBriefLoading(true)
    setBriefText(null)
    setBriefMeta(null)

    const params = new URLSearchParams({
      location: event.location,
      type: event.type,
      severity: event.severity,
    })
    if (event.evidenceUrl) params.set('evidenceUrl', event.evidenceUrl)

    fetch(`${apiUrl('/api/event-brief')}?${params}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((data: EventBrief) => {
        if (data?.error === 'brief_unavailable' || !data?.summary) {
          setBriefText(null)
          setBriefMeta(null)
        } else {
          setBriefText(data.summary)
          setBriefMeta(data)
        }
      })
      .catch(() => {
        setBriefText(null)
        setBriefMeta(null)
      })
      .finally(() => setBriefLoading(false))

    return () => controller.abort()
  }, [event?.id])

  useEffect(() => {
    if (!event) {
      setFlood(null)
      return
    }
    const params = new URLSearchParams()
    if (event.latitude != null) params.set('lat', String(event.latitude))
    if (event.longitude != null) params.set('lon', String(event.longitude))
    params.set('severity', event.severity)
    if (event.alertScore != null) params.set('alertScore', String(event.alertScore))
    void fetch(`${apiUrl('/api/flood-forecast')}?${params}`)
      .then((r) => r.json() as Promise<FloodForecast>)
      .then(setFlood)
      .catch(() => setFlood(null))
  }, [event?.id, event?.latitude, event?.longitude, event?.severity, event?.alertScore])

  if (!event) return null

  const severityIcon =
    event.severity === 'Critical' || event.severity === 'High' ? (
      <AlertTriangle className="w-5 h-5 text-alert-critical shrink-0" aria-hidden />
    ) : (
      <AlertTriangle className="w-5 h-5 text-text-tertiary shrink-0" aria-hidden />
    )

  const disasterAppId = Number(import.meta.env.VITE_DISASTER_APP_ID)
  const mapUrl = `${ROUTES.operationsMap}?focus=${encodeURIComponent(event.id)}`
  const verificationUrl = ROUTES.operationsVerification
  const hasLiveBrief = Boolean(briefText)
  const brief = briefMeta

  const createDisabled = createBusy || !canCreateCampaign
  const createTitle = wrongWallet
    ? 'Switch to operations wallet to create a campaign'
    : !canCreateCampaign
      ? 'Connect the operations wallet to create a campaign'
      : undefined

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label={`Event: ${event.location}`}>
      <button type="button" className="overlay-scrim" onClick={onClose} aria-label="Close panel" />
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <header className="drawer-header flex items-start justify-between gap-4">
          <div className="flex gap-3 min-w-0">
            {severityIcon}
            <div className="min-w-0">
              <h2 className="font-[Sora] text-[18px] font-semibold text-text-primary truncate">{event.location}</h2>
              <p className="text-sm text-text-secondary mt-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded border border-border-medium px-2 py-0.5 text-[10px]">{event.type}</span>
                <span className={severityBadgeClass(event.severity)}>{severityDisplayLabel(event.severity)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-elevated shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="drawer-body space-y-5">
          {briefLoading ? (
            <p className="animate-pulse text-[13px] text-text-tertiary">Generating intelligence summary...</p>
          ) : hasLiveBrief && brief ? (
            <BriefLivePanel brief={brief} event={event} />
          ) : (
            <BriefFallbackPanel event={event} />
          )}

          {!DEMO_CORE_FOCUS ? (
            <section>
              <p className="ops-section-label mb-2">7-day flood forecast</p>
              {!flood ? (
                <p className="text-sm text-text-tertiary">Loading forecast…</p>
              ) : !flood.available ? (
                <p className="text-sm text-text-secondary">{flood.message}</p>
              ) : (
                <div className="surface-inset p-3 space-y-2">
                  <p
                    className={`text-sm font-medium ${
                      flood.maxProbability > 80
                        ? 'text-alert-critical'
                        : flood.maxProbability > 60
                          ? 'text-alert-warning'
                          : 'text-text-primary'
                    }`}
                  >
                    {flood.message}
                  </p>
                  <ul className="grid grid-cols-7 gap-1 text-[10px] font-mono">
                    {flood.days.map((d) => (
                      <li key={d.date} className="text-center">
                        <div
                          className={`rounded py-1 ${
                            d.probability > 80
                              ? 'bg-alert-critical/25 text-alert-critical'
                              : d.probability > 60
                                ? 'bg-alert-warning/20 text-alert-warning'
                                : 'bg-bg-primary text-text-tertiary'
                          }`}
                        >
                          {d.probability}%
                        </div>
                        <span className="text-text-tertiary block mt-0.5">{d.date.slice(5)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ) : null}

          {brief && brief.headlines.length > 0 ? (
            <section>
              <p className="ops-section-label mb-2">Related news</p>
              <ul className="space-y-2">
                {brief.headlines.map((h) => (
                  <li key={h.url} className="text-sm">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline"
                    >
                      {h.title}
                    </a>
                    <span className="text-text-tertiary ml-2 text-xs">{h.source}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {event.onChainCampaignId ? (
            <p className="text-xs text-text-tertiary font-mono">
              Campaign #{event.onChainCampaignId}
              {event.onChainStatus != null ? ` · ${campaignStatusLabel(event.onChainStatus)}` : ''}
            </p>
          ) : null}
        </div>

        <footer className="drawer-footer flex flex-wrap gap-2">
          <Link to={mapUrl}>
            <Button variant="outline">View on map</Button>
          </Link>
          {!event.onChainCampaignId && onCreateCampaign ? (
            <Button
              variant="primary"
              disabled={createDisabled}
              title={createTitle}
              onClick={() => onCreateCampaign(event)}
            >
              {createBusy ? 'Creating…' : 'Create campaign'}
            </Button>
          ) : null}
          {event.onChainCampaignId && event.opsStatus === 'approval_pending' ? (
            <Link to={verificationUrl}>
              <Button variant="primary">Open approvals</Button>
            </Link>
          ) : null}
          {disasterAppId ? (
            <a
              href={getLoraApplicationUrl(disasterAppId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[40px] px-3 text-sm text-accent-primary hover:underline"
            >
              Verify on blockchain
            </a>
          ) : null}
        </footer>
      </aside>
    </div>
  )
}
