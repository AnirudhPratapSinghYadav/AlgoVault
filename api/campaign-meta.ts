import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadAllCampaignMeta, saveCampaignMeta } from '../server/campaignMetaStore'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ campaigns: loadAllCampaignMeta() })
    return
  }
  if (req.method === 'POST') {
    try {
      const saved = saveCampaignMeta(req.body)
      res.status(200).json({ campaigns: saved })
    } catch {
      res.status(400).json({ error: 'invalid body' })
    }
    return
  }
  res.status(405).json({ error: 'method not allowed' })
}
