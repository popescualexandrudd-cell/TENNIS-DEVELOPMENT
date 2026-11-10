import type { Payload } from 'payload'

/** Scade `months` luni calendaristice din `now`. */
export function monthsAgo(months: number, now = new Date()): Date {
  const d = new Date(now)
  d.setMonth(d.getMonth() - months)
  return d
}

/**
 * Aplică duratele de păstrare promise în politica de confidențialitate (Setări site → Date legale):
 * - solicitările de contact neactualizate de `contactRetentionMonths` luni;
 * - părerile în așteptare sau respinse, neactualizate de `feedbackRetentionMonths` luni.
 * Părerile aprobate rămân (temei: consimțământ, până la retragere). Rulează zilnic: `pnpm retention`.
 */
export async function applyRetention(payload: Payload, now = new Date()) {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const contactMonths = settings.legal?.contactRetentionMonths ?? 12
  const feedbackMonths = settings.legal?.feedbackRetentionMonths ?? 6
  const contacts = await payload.delete({
    collection: 'contact-requests',
    overrideAccess: true,
    where: { updatedAt: { less_than: monthsAgo(contactMonths, now).toISOString() } },
  })
  const feedback = await payload.delete({
    collection: 'testimonials',
    overrideAccess: true,
    context: { disableRevalidate: true },
    where: {
      and: [{ status: { in: ['pending', 'rejected'] } }, { updatedAt: { less_than: monthsAgo(feedbackMonths, now).toISOString() } }],
    },
  })
  return { contactRequests: contacts.docs.length, testimonials: feedback.docs.length, contactMonths, feedbackMonths }
}
