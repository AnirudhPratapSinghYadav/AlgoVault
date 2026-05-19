# AlgoVault — Demo Instructions (One Phone, One Laptop)

## Setup (do once, 10 minutes)

**1. Start the stack**
Terminal 1: `npm run dev -- --host`
Terminal 2: `npm run start:server`
Terminal 3: `npm run bot`

**2. Open on laptop browser**
http://localhost:5173

**3. Set up Pera on your phone**
Open Pera Wallet → Add Account → Import:
- Admin account (mnemonic from docs/DEMO_WALLETS.md)
- Approver 1 account
- Approver 2 account

**4. Fund check (run once)**
```bash
npm run fund:humanitarian
npm run optin:usdc
```

---

## The 5-Step Demo

**Step 1 — Landing**
Open http://localhost:5173 on the laptop.
Click "Enter Operations".

**Step 2 — Connect**
Click "Continue with Pera".
On your phone: open Pera → scan the QR code.
Select the Operations Admin account.

**Step 3 — Create Campaign**
Operations → Active Events → click any event (orange or red severity).
Drawer opens → click "Create Campaign" → fill the form.
Phone: Pera opens → sign the transaction.
Campaign appears in Approvals.

**Step 4 — Approve (twice)**
Operations → Approvals.
In Pera on your phone: switch to Approver 1 account.
Refresh the page → click "Approve" → sign in Pera.
In Pera: switch to Approver 2 account.
Refresh the page → click "Approve" → sign in Pera.
Status changes to "Approved — Ready to Disburse".

**Step 5 — Disburse + Proof**
Operations → Release & Proof.
Switch Pera back to Admin account.
Upload CSV file (format: `name,wallet_address,amount_usdc`).
Example CSV content:
```
Ravi Kumar,ALGO_ADDRESS_1,5
Priya Sharma,ALGO_ADDRESS_2,5
Ahmed Khan,ALGO_ADDRESS_3,5
```
Click "Disburse" → sign in Pera.
Proof tab appears with 3 rows.
Each row has a "Verify on blockchain →" link.
Click any link → Lora Explorer opens → real transaction visible.
Click "Download Campaign Report" → PDF downloads with all details.

**Step 6 (optional) — Show Telegram**
Open Telegram → @AlgoVault_Guardian_bot
Send: `/status`
Send: `/campaigns`
Show the automatic alerts already received.

---

## If Something Breaks

| Problem | Fix |
|---------|-----|
| Create Campaign disabled | Switch Pera to Admin account, reconnect |
| Approval button missing | Wrong Pera account — switch to Approver 1 or 2 |
| Disburse fails | Run: `npm run fund:humanitarian` |
| Telegram 409 error | Kill all bot processes, run: `npm run bot` |
| Phone can't connect | Same Wi-Fi, use IP address not localhost |
| PDF doesn't download | Check browser allows downloads, try Chrome |

---

## Lora Explorer Links

Everything is verifiable:
- DisasterVault contract: https://lora.algokit.io/testnet/application/762592323
- Appeals contract: https://lora.algokit.io/testnet/application/762592091

---

# AlgoVault — Humanitarian Ops on Algorand (AlgoHack India 2026)

AlgoVault compresses disaster-to-disbursement time from 14–26 months to under 4 hours using live GDACS alerts, multi-signature Telegram approvals, and smart contract USDC transfers on Algorand.

**Judge story:** Live disaster feed → admin creates USDC campaign → **two distinct approver wallets** sign → CSV disburse → proof tab with real blockchain transaction links.

`VITE_DEMO_STRICT=true` means no fake metrics or seed transaction hashes in the operations UI.

---

## Testnet contracts (do not redeploy for the demo)

| App | ID | Role |
|-----|-----|------|
| DisasterVault | `762592323` | Relief campaigns, approvals, disburse |
| CommunityDonationHub | `762592091` | Community appeals |

Approvers are stored **per campaign** at `create_campaign`. After changing `VITE_DISASTER_APPROVER_*`, always **create a new campaign**.

---

## Quickstart

### 1) Install

```bash
npm install
```

### 2) Environment

```bash
cp .env.example .env
```

Required:

- `VITE_DISASTER_APP_ID=762592323`, `VITE_APPEALS_APP_ID=762592091`
- `VITE_ADMIN_ADDRESS` — operations wallet (Pera #1)
- `VITE_DISASTER_APPROVER_1` and `VITE_DISASTER_APPROVER_2` — **must differ** from admin and each other
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — for proactive alerts (`npm run services`)
- `GEMINI_API_KEY` — situation briefs (server-only; optional but recommended)
- `GNEWS_API_KEY` — news context for briefs (optional)

**Get `TELEGRAM_CHAT_ID`:** message [@userinfobot](https://t.me/userinfobot) on Telegram; paste the numeric id into `.env`.

Generate approver wallets:

```bash
npm run wallets:generate
```

Fund at [https://bank.testnet.algorand.network](https://bank.testnet.algorand.network). See [docs/DEMO_WALLETS.md](docs/DEMO_WALLETS.md).

### 3) Run (two terminals)

**Terminal 1 — web + event brief API:**

```bash
npm run dev:all
```

**Terminal 2 — Telegram alerts + command bot:**

```bash
npm run services
```

This starts `alert:service` (automatic GDACS + on-chain notifications) and `bot` (responds to `/approve`, `/campaigns`, etc.).

### 4) Pre-demo funding

```bash
npm run fund:humanitarian
npm run optin:usdc
```

---

## Judge demo script (5 steps)

**Step 1 —** Open http://localhost:5173/ — story landing loads ($0 / $395B stats). Click **Enter Operations**. Connect admin wallet in Pera at `/access`.

**Step 2 —** **Active Events** — events from live feed, **Last synced: X min ago** in header. Click an event → drawer with situation brief. **Create campaign** → sign in Pera → lands on Approvals.

**Step 3 —** **Approvals** — switch Pera to Approver 1 → sign. Switch to Approver 2 → sign. Status becomes **Approved — Ready to Disburse**.

**Step 4 —** **Release & proof** (admin) — upload CSV `name,delivery_type,identifier,amount_usdc` with real testnet wallets. **Disburse** → sign. Proof tab shows transactions with blockchain verify links.

**Step 5 —** Telegram — show alerts on phone. `/campaigns`, `/status`.

Import all three Pera wallets before going on stage.

## If something breaks

| Issue | Fix |
|-------|-----|
| No events | Click Refresh; confirm `npm run dev` running |
| Brief unavailable | `npm run start:server`; check `GEMINI_API_KEY` |
| Create disabled | Connect admin at `/access` |
| Disburse fails | Campaign approved + USDC in vault (`npm run fund:humanitarian`) |
| Telegram 409 | Kill duplicate bots; run `npm run services` once |

---

## Architecture

- **Event brief:** `server/eventBriefHandler.ts` — Vite dev middleware + `npm run start:server` (port `BRIEF_PORT=3001`)
- **Alerts:** `scripts/bot/alertService.ts` — GDACS every 15 min, chain every 2 min → `TELEGRAM_CHAT_ID`
- **Errors:** `src/lib/contractErrorMap.ts` — plain English for all on-chain failures

Savings sandbox routes redirect to `/operations` when `VITE_SHOW_SANDBOX=false`.

---

## Verification

```bash
npm run verify:lora
npm run verify:deployment
```

Full audit: [docs/PRODUCT_STATUS.md](docs/PRODUCT_STATUS.md)
