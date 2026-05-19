# AlgoVault — Hack Submission Copy-Paste Pack

Use this document for the **Google Form** and to export **GTM Plan (1-page PDF)**.

---

## User Persona & Validation (2–3 lines for form)

**Primary user:** District disaster-response coordinators and NGO operations leads who must release verified USDC/ALGO to beneficiaries within hours of a GDACS-class event—not months after paperwork clears.

**Problem solved:** Relief funds sit in coordination layers (14–26 month loss-and-damage cycles) while survivors need cash immediately; AlgoVault binds live hazard signals → multi-signature approval → auditable on-chain disbursement with public proof.

**How demand was validated:** Built against real GDACS feeds and WHO/OCHA-style ops workflows; demo flow tested end-to-end on Algorand testnet with distinct approver wallets, CSV beneficiary disbursement, Lora-verifiable transactions, and operator interviews aligned to Indian state disaster cell + NGO field verification patterns (AlgoBharat / humanitarian ops track).

---

## GTM Plan (1-page PDF — copy into Google Docs → Export PDF)

### AlgoVault — Go-To-Market Plan (AlgoBharat Hack Series 3.0)

**Product:** Humanitarian operations console on Algorand — disaster detection → multi-sig approval → USDC disbursement + community ALGO appeals, with Telegram Guardian automation.

---

### Target users

| Segment | Who | Job to be done |
|---------|-----|----------------|
| **Primary** | State disaster management cells, district collectors’ relief desks, NGO ops leads | Open a funded campaign within hours of a red/orange GDACS alert; prove every payout on-chain |
| **Secondary** | Community fundraisers, local verified appeals | Submit crisis → admin approve → donors fund → beneficiary withdraws ALGO |
| **Buyer** | NGO HQ / CSR foundations | Audit trail, dual control, faster cycle than treasury wire batches |

**Geography (phase 1):** India (monsoon floods, cyclones) + GDACS-global signals; pilots with 2–3 NGO partners.

---

### GTM strategy

1. **Design partners (0–6 months):** 2 Indian NGOs + 1 state disaster cell sandbox on **testnet** → **controlled mainnet pilot** with capped disbursement limits.
2. **Wedge:** “Proof tab in 4 hours” — sell verifiable disbursement speed vs. spreadsheet + bank file cycles.
3. **Channels:** Algorand India / AlgoBharat community, disaster-tech meetups, Telegram ops channels, UN OCHA-style open-data alignment (not claiming official partnership).
4. **Land & expand:** Start with **DisasterVault USDC rail**; add community appeals where NGOs want grassroots intake.
5. **Trust layer:** Every demo links to **Lora Explorer**; PDF campaign reports for donor reporting.

---

### Revenue model

| Stream | Model | Notes |
|--------|--------|------|
| **SaaS ops seat** | $500–2,000 / org / month | Console, GDACS sync, briefs, role-based access |
| **Transaction fee** | 0.3–0.5% on disbursed volume | Only on successful on-chain release (optional, disclosed) |
| **Implementation** | One-time $5k–25k | Wallet onboarding, approver training, CSV templates |
| **Premium alerts** | Add-on | Telegram/WhatsApp Guardian, custom thresholds |

**Year 1 hypothesis:** 3 paid pilots × $12k ARR + $8k setup ≈ **$44k**; scale with multi-state deployments in year 2.

---

### Monetization hypothesis

Operators pay for **speed + auditability**, not blockchain novelty. Willingness-to-pay validated when a pilot NGO replaces at least one manual approval email chain with on-chain dual-sign + exports Lora links to donors. Free tier: read-only GDACS map + 1 campaign/month; paid: unlimited campaigns, PDF reports, Telegram bot.

---

### Why Algorand

| Capability | Why it matters for AlgoVault |
|------------|------------------------------|
| **~3.3s finality** | Field officers see confirmed disbursement before leaving the ops room |
| **Low fees** | Micro-disbursements to hundreds of wallets remain economical on testnet/mainnet |
| **ASA (USDC)** | Stablecoin relief without volatile ALGO exposure on institutional rail |
| **Puya / ARC-4** | Typed smart contracts, box storage per campaign, clear ABI for React clients |
| **Lora / AlgoKit** | Judges and donors verify any tx in one click — critical for humanitarian trust |
| **Wallet ecosystem** | Pera Wallet dominates India mobile UX; one phone, multiple imported approver accounts |

---

### Scalability vision

- **Multi-tenant ops:** One console per NGO; campaigns isolated on-chain by ID.
- **Oracle upgrade path:** GDACS today → Gora / custom oracles for hyper-local triggers.
- **Identity:** ARC-72 / VC stubs for field verifier credentials (Phase 2).
- **Cross-chain:** Out of scope Round 3; Algorand-first until disburse volume justifies bridges.
- **Scale:** Indexer-backed proof tables; serverless APIs on Vercel; background workers on Render for Telegram; horizontal by org, not by rewriting contracts per disaster.

---

## Form field quick reference

| Form field | Suggested value |
|------------|-----------------|
| **GitHub** | https://github.com/AnirudhPratapSinghYadav/AlgoVault |
| **Live demo** | Your Vercel URL |
| **Network** | Algorand Testnet |
| **DisasterVault App ID** | 762592323 |
| **Appeals App ID** | 762592091 |
| **Explorer (contracts)** | https://lora.algokit.io/testnet/application/762592323 |
| | https://lora.algokit.io/testnet/application/762592091 |
| **Telegram bot** | @AlgoVault_Guardian_bot |
| **Video** | Your YouTube/Loom link |

---

## Example transaction links (fill from your last demo)

After running the 5-step demo, paste from **Release & Proof → Verify on blockchain**:

- Approval 1: `https://lora.algokit.io/testnet/transaction/<TXID_1>`
- Approval 2: `https://lora.algokit.io/testnet/transaction/<TXID_2>`
- Disburse: `https://lora.algokit.io/testnet/transaction/<TXID_3>`
- Create campaign: `https://lora.algokit.io/testnet/transaction/<TXID_CREATE>`
