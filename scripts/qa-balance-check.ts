/** One-off QA balance probe — testnet ALGO + USDC (asset 10458941). */
import algosdk from 'algosdk'
import dotenv from 'dotenv'

dotenv.config()

const ASA = Number(process.env.VITE_STABLECOIN_ASSET_ID || 10458941)
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443)

async function probe(label: string, addr: string) {
  const ai = await algod.accountInformation(addr).do()
  const algo = Number(ai.amount) / 1e6
  const asset = (ai.assets || []).find((a) => Number(a['asset-id']) === ASA)
  const usdc = asset ? Number(asset.amount) / 1e6 : 0
  const opted = Boolean(asset)
  console.log(JSON.stringify({ label, algo: +algo.toFixed(4), usdc: +usdc.toFixed(4), optedInUsdc: opted }))
}

async function main() {
  const admin = process.env.VITE_ADMIN_ADDRESS!
  const a1 = process.env.VITE_DISASTER_APPROVER_1!
  const a2 = process.env.VITE_DISASTER_APPROVER_2!
  const dv = algosdk.getApplicationAddress(Number(process.env.VITE_DISASTER_APP_ID)).toString()
  const ap = algosdk.getApplicationAddress(Number(process.env.VITE_APPEALS_APP_ID)).toString()
  for (const [l, a] of [
    ['Admin', admin],
    ['Approver1', a1],
    ['Approver2', a2],
    ['DisasterVault', dv],
    ['Appeals', ap],
  ] as const) {
    if (a) await probe(l, a)
  }
  const mn = process.env.AGENT_MNEMONIC?.trim()
  if (mn) {
    const derived = algosdk.mnemonicToSecretKey(mn).addr
    console.log(JSON.stringify({ mnemonicMatchesAdmin: derived === admin, derivedPrefix: derived.slice(0, 8) }))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
