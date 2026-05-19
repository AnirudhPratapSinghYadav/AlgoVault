import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildFloodForecast } from '../server/floodHubHandler'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
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
    res.status(200).json(body)
  } catch {
    res.status(200).json({ available: false, days: [], maxProbability: 0, message: 'Unavailable' })
  }
}
