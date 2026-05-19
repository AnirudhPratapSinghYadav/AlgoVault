/**
 * Proactive ops alerts (GDACS + on-chain). Runs headless alongside `npm run bot`.
 * Interactive Telegram commands stay in bot.ts — this process only polls and pushes alerts.
 */
import { config } from './config.js'
import { setTelegramBot } from './services/telegramRichSend.js'
import { startOpsAlertEngine, runOpsAlertStartupPing } from './services/opsAlertEngine.js'
import { opsChannelConfigured } from './services/telegramOpsChannel.js'
import TelegramBot from 'node-telegram-bot-api'

process.env.NTBA_FIX_319 = '1'

async function main() {
  console.log('=== AlgoVault Alert Service (headless) ===')
  if (!config.telegramToken.trim()) {
    console.error('[alert:service] TELEGRAM_BOT_TOKEN missing')
    process.exit(1)
  }
  if (!config.telegramChatId.trim()) {
    console.warn('[alert:service] TELEGRAM_CHAT_ID missing — ops pushes disabled')
  }

  // Send-only client (no command polling — avoids Telegram 409 with bot.ts)
  const sendOnly = new TelegramBot(config.telegramToken, { polling: false })
  setTelegramBot(sendOnly)

  startOpsAlertEngine()

  if (opsChannelConfigured()) {
    setTimeout(() => {
      void runOpsAlertStartupPing().catch((e) =>
        console.error('[alert:service] startup ping', e instanceof Error ? e.message : e),
      )
    }, 1500)
  }

  console.log(
    `[alert:service] GDACS every ${config.gdacsPollMs / 60000}m · chain every ${config.indexerPollMs / 1000}s`,
  )
}

main().catch((e) => {
  console.error('[alert:service] fatal', e)
  process.exit(1)
})
