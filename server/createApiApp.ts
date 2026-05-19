/**
 * Shared Express API — used locally (npm run start:server) and on Render.
 * Vercel serves the static frontend and proxies /api/* here via vercel.json.
 */
import express, { type Express } from 'express'
import { parseGdacsJson } from '../src/lib/disasterIntelParse'
import { buildEventBrief } from './eventBriefHandler'
import { saveCampaignMeta, loadAllCampaignMeta } from './campaignMetaStore'
import { buildFloodForecast } from './floodHubHandler'

const GDACS_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP'
let disasterCache: { at: number; body: unknown } | null = null
const CACHE_MS = 15 * 60 * 1000

function parseAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const defaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
  ]
  const vercel = process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []
  const publicApp = (process.env.PUBLIC_APP_URL || '').trim()
  const extra = publicApp ? [publicApp] : []
  return [...new Set([...defaults, ...fromEnv, ...vercel, ...extra])]
}

export function createApiApp(): Express {
  const app = express()
  const allowedOrigins = parseAllowedOrigins()

  app.use(express.json({ limit: '256kb' }))

  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else if (!origin) {
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') {
      res.sendStatus(204)
      return
    }
    next()
  })

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'algovault-api' })
  })

  app.get('/api/event-brief', async (req, res) => {
    try {
      const location = String(req.query.location ?? '')
      const type = String(req.query.type ?? 'disaster')
      const severity = String(req.query.severity ?? 'medium')
      if (!location) {
        res.status(400).json({ error: 'brief_unavailable', summary: null, headlines: [] })
        return
      }
      const body = await buildEventBrief({ location, type, severity })
      res.json(body)
    } catch {
      res.status(200).json({
        summary: null,
        headlines: [],
        error: 'brief_unavailable',
        generatedAt: new Date().toISOString(),
      })
    }
  })

  app.get('/api/campaign-meta', (_req, res) => {
    res.json({ campaigns: loadAllCampaignMeta() })
  })

  app.post('/api/campaign-meta', (req, res) => {
    try {
      const saved = saveCampaignMeta(req.body)
      res.json({ campaigns: saved })
    } catch {
      res.status(400).json({ error: 'invalid body' })
    }
  })

  app.get('/api/flood-forecast', (req, res) => {
    try {
      const lat = parseFloat(String(req.query.lat ?? ''))
      const lon = parseFloat(String(req.query.lon ?? ''))
      const severity = String(req.query.severity ?? '')
      const score = parseFloat(String(req.query.alertScore ?? ''))
      const body = buildFloodForecast({
        lat: Number.isFinite(lat) ? lat : undefined,
        lon: Number.isFinite(lon) ? lon : undefined,
        severityHint: severity,
        alertScore: Number.isFinite(score) ? score : undefined,
      })
      res.json(body)
    } catch {
      res.status(200).json({ available: false, days: [], maxProbability: 0, message: 'Unavailable' })
    }
  })

  app.get('/api/alert-status', async (_req, res) => {
    const botPort = process.env.BOT_PORT || '3002'
    const botHost = process.env.BOT_HOST || '127.0.0.1'
    try {
      const r = await fetch(`http://${botHost}:${botPort}/bot/health`, { signal: AbortSignal.timeout(2500) })
      const h = (await r.json()) as { telegram?: boolean; polling?: boolean }
      res.json({
        running: true,
        alertService: Boolean(h.telegram),
        telegram: Boolean(h.polling),
      })
    } catch {
      res.json({ running: false, alertService: false, telegram: false })
    }
  })

  app.get('/api/disaster-intel', async (_req, res) => {
    try {
      if (disasterCache && Date.now() - disasterCache.at < CACHE_MS) {
        res.setHeader('Cache-Control', 'public, max-age=900')
        res.json(disasterCache.body)
        return
      }
      const upstream = await fetch(GDACS_URL, { headers: { Accept: 'application/json' } })
      if (!upstream.ok) {
        res.status(502).json({ error: `GDACS upstream ${upstream.status}` })
        return
      }
      const raw = await upstream.json()
      const events = parseGdacsJson(raw as { features?: unknown[] })
      const body = { events, source: 'gdacs', fetchedAt: new Date().toISOString() }
      disasterCache = { at: Date.now(), body }
      res.setHeader('Cache-Control', 'public, max-age=900')
      res.json(body)
    } catch (e) {
      res.status(500).json({ error: e instanceof Error ? e.message : 'GDACS fetch failed' })
    }
  })

  return app
}
