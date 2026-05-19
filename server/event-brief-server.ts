/**
 * Production API server — Render Web Service or local: npm run start:server
 */
import * as dotenv from 'dotenv'
import { createApiApp } from './createApiApp'

dotenv.config()

const PORT = Number(process.env.PORT || process.env.BRIEF_PORT || 3001)
const app = createApiApp()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AlgoVault API listening on port ${PORT}`)
})
