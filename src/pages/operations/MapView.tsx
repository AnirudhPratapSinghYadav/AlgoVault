import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet'
import OpsLayout from '../../components/ops/OpsLayout'
import { Button } from '../../components/ui'
import { ROUTES } from '../../config/routes'
import { usePlatformStore } from '../../store/platformStore'
import { eventMapPosition, isActiveDisruptiveEvent } from '../../lib/geo'
import { severityDisplayLabel } from '../../lib/severityLabels'
import { fetchGdacsEvents, gdacsDtoToDisasterEvent } from '../../services/gdacsIntel'
import { markGdacsFetched, getGdacsLastFetch } from '../../lib/gdacsSyncState'

const worldCenter: [number, number] = [20, 0]

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  map.flyTo(center, zoom)
  return null
}

function severityPin(severity: string): { color: string; pulse: boolean } {
  const s = severity.toLowerCase()
  if (s === 'critical' || s === 'red') return { color: '#E63946', pulse: true }
  if (s === 'high' || s === 'orange') return { color: '#FF6B00', pulse: true }
  if (s === 'medium') return { color: '#F59E0B', pulse: false }
  return { color: '#888888', pulse: false }
}

export default function MapView() {
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('focus')
  const disasterEvents = usePlatformStore((s) => s.disasterEvents)
  const [fly, setFly] = useState<{ center: [number, number]; zoom: number } | null>(null)
  const flyKeyRef = useRef<string>('')
  const [gdacsBusy, setGdacsBusy] = useState(false)

  const refreshGdacs = useCallback(async () => {
    setGdacsBusy(true)
    try {
      const dtos = await fetchGdacsEvents()
      usePlatformStore.getState().replaceGdacsDisasterEvents(dtos.map((d) => gdacsDtoToDisasterEvent(d)))
      markGdacsFetched()
    } finally {
      setGdacsBusy(false)
    }
  }, [])

  const activeEvents = useMemo(
    () => disasterEvents.filter(isActiveDisruptiveEvent),
    [disasterEvents],
  )

  const severityCounts = useMemo(() => {
    let emergency = 0
    let elevated = 0
    let monitoring = 0
    for (const e of activeEvents) {
      const s = e.severity.toLowerCase()
      if (s === 'critical' || s === 'red' || s === 'high') emergency++
      else if (s === 'orange' || s === 'medium') elevated++
      else monitoring++
    }
    return { emergency, elevated, monitoring, total: activeEvents.length }
  }, [activeEvents])

  const lastSync = getGdacsLastFetch()
  const syncLabel =
    lastSync > 0
      ? `${Math.max(0, Math.floor((Date.now() - lastSync) / 60_000))} min ago`
      : 'never'

  useEffect(() => {
    if (!focusId) return
    const event = disasterEvents.find((e) => e.id === focusId)
    if (!event) return
    const pos = eventMapPosition(event)
    const key = `focus:${focusId}`
    if (flyKeyRef.current === key) return
    flyKeyRef.current = key
    setFly({ center: pos, zoom: 6 })
  }, [focusId, disasterEvents])

  return (
    <OpsLayout
      title="Incident Map"
      description="Operational map of active disaster signals — severity-coded pins from the live feed."
    >
      <div className="map-ops-container relative overflow-hidden border border-border-subtle">
        <MapContainer
          center={worldCenter}
          zoom={3}
          className="h-[560px] w-full z-0"
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {fly ? <FlyTo center={fly.center} zoom={fly.zoom} /> : null}
          {activeEvents.map((event) => {
            const pos = eventMapPosition(event)
            const pin = severityPin(event.severity)
            return (
              <CircleMarker
                key={event.id}
                center={pos}
                radius={pin.pulse ? 10 : 8}
                pathOptions={{
                  color: pin.color,
                  fillColor: pin.color,
                  fillOpacity: 0.85,
                  weight: 2,
                  className: pin.pulse ? 'map-pin-pulse' : undefined,
                }}
              >
                <Popup>
                  <strong>{event.location}</strong>
                  <br />
                  {event.type} · {severityDisplayLabel(event.severity)}
                  <br />
                  <Link to={`${ROUTES.operationsEvents}?focus=${event.id}`} className="text-accent-primary text-xs">
                    Open in Active Events →
                  </Link>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        <div className="absolute bottom-0 left-0 right-0 z-[1000] border-t border-border-medium bg-bg-overlay/95 backdrop-blur-sm px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 font-[JetBrains_Mono] text-[10px] text-text-secondary">
              <span>
                <span className="text-alert-critical">●</span> Emergency: {severityCounts.emergency}
              </span>
              <span>
                <span className="text-accent-primary">●</span> Elevated: {severityCounts.elevated}
              </span>
              <span>
                <span className="text-text-tertiary">●</span> Monitoring: {severityCounts.monitoring}
              </span>
              <span className="text-text-primary">{severityCounts.total} active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[JetBrains_Mono] text-[10px] text-text-tertiary">Last sync: {syncLabel}</span>
              <Button variant="outline" className="text-[10px] min-h-0 py-1" disabled={gdacsBusy} onClick={() => void refreshGdacs()}>
                {gdacsBusy ? '…' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OpsLayout>
  )
}
