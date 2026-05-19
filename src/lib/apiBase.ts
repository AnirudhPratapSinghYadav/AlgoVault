/**
 * API base for production. Leave empty on Vercel (same-origin /api proxy) or set
 * VITE_API_BASE_URL=https://your-api.onrender.com on static hosts.
 */
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${BASE}${p}`
}
