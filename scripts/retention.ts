/**
 * Ștergere automată la termen (politica de confidențialitate). Programare recomandată: zilnic, din cron-ul serverului:
 *   15 3 * * *  cd /srv/daniel-popescu-web && pnpm retention >> /var/log/dp-retention.log 2>&1
 * Afișează doar numere (fără date personale).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { applyRetention } from '../src/features/legal/retention'

const payload = await getPayload({ config })
const result = await applyRetention(payload)
console.log(
  `[retention] ${new Date().toISOString()} șterse: ${result.contactRequests} solicitări (> ${result.contactMonths} luni), ${result.testimonials} păreri neaprobate (> ${result.feedbackMonths} luni)`,
)
process.exit(0)
