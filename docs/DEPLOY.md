# Deploy AlgoVault (Vercel + Render)

## Recommended layout

| Service | Platform | Command |
|---------|----------|---------|
| Frontend | **Vercel** | `npm run build` → `dist/` |
| API | **Render Web** | `npm run start:server` |
| Telegram bot | **Render Worker** (optional) | `npm run services` |

---

## 1. Deploy API on Render

1. [render.com](https://render.com) → **New Web Service** → connect GitHub repo.
2. **Build:** `npm install`  
3. **Start:** `npm run start:server`  
4. **Health check path:** `/health`
5. Environment variables:

| Variable | Notes |
|----------|--------|
| `GEMINI_API_KEY` | Event briefs |
| `GNEWS_API_KEY` | Optional headlines |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `PUBLIC_APP_URL` | Same Vercel URL (for bot links) |

Note the URL, e.g. `https://algovault-api.onrender.com`.

---

## 2. Deploy frontend on Vercel

1. [vercel.com](https://vercel.com) → import repo.
2. Framework: **Vite** — Build: `npm run build`, Output: `dist`.
3. Add all **`VITE_*`** vars from `.env.example` (no secrets).
4. Edit **`vercel.json`**: replace `REPLACE_WITH_YOUR_RENDER_API` with your Render API host (no trailing slash).
5. Deploy.

`/api/*` on Vercel is proxied to Render. Wallet + on-chain ops run in the browser.

---

## 3. Render-only (single platform)

Use **`render.yaml`** in the repo root → **New Blueprint** on Render.  
Sets API + static site + optional Telegram worker. Set secrets in the dashboard after sync.

For the static site, set `VITE_API_BASE_URL` to the API service URL if not auto-linked.

---

## 4. Telegram worker (optional)

Render → **Background Worker** → `npm run services`  
Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PUBLIC_APP_URL`, Algorand vars.

Run **one** worker only (409 if duplicated).

---

## Verify

- `https://YOUR-API.onrender.com/health` → `{ "ok": true }`
- `https://YOUR-APP.vercel.app` → landing loads
- `https://YOUR-APP.vercel.app/api/disaster-intel` → GDACS JSON (via proxy)
- `/access` → Pera connect on HTTPS
