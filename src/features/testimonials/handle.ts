import type { Payload } from 'payload'
import { readJsonBody } from '@/lib/http'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { clientIp, hashIp, isRateLimited } from '@/features/contact/rate-limit'
import { MAX_TESTIMONIAL_BYTES, TESTIMONIAL_RATE_LIMIT, testimonialFieldErrors, testimonialSchema, type TestimonialField } from './schema'
import { sendTestimonialNotification } from './notify'
import { feedbackAutoReply, sendEmailSafe } from '@/features/automation/email'

export type TestimonialResult =
  | { status: 201; body: { ok: true } }
  | { status: 400; body: { ok: false; error: 'validation'; fields: TestimonialField[] } }
  | { status: 400 | 403 | 404 | 413 | 415; body: { ok: false; error: 'bad_request' | 'forbidden' | 'closed' | 'too_large' | 'unsupported' } }
  | { status: 429; body: { ok: false; error: 'rate_limited' } }
  | { status: 500; body: { ok: false; error: 'server' } }

/**
 * Părere trimisă de un sportiv: validare → antispam → limitare → salvare „în așteptare” → notificare.
 * Nimic nu devine public aici; publicarea e o decizie a administratorului (status „Aprobată”).
 */
export async function handleTestimonialSubmission(payload: Payload, request: Request): Promise<TestimonialResult> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (settings.acceptTestimonials === false) return { status: 404, body: { ok: false, error: 'closed' } }

  const body = await readJsonBody(request, MAX_TESTIMONIAL_BYTES)
  if (!body.ok) return { status: body.status, body: { ok: false, error: body.error } }

  const parsed = testimonialSchema.safeParse(body.data)
  if (!parsed.success) {
    const fields = testimonialFieldErrors(parsed.error)
    if (fields.length === 0) return { status: 400, body: { ok: false, error: 'bad_request' } }
    return { status: 400, body: { ok: false, error: 'validation', fields } }
  }

  const secret = process.env.CONTACT_HASH_SECRET || process.env.PAYLOAD_SECRET || ''
  const ipHash = hashIp(clientIp(request.headers), secret)
  try {
    if (await isRateLimited(payload, ipHash, new Date(), { collection: 'testimonials', ...TESTIMONIAL_RATE_LIMIT })) {
      return { status: 429, body: { ok: false, error: 'rate_limited' } }
    }
    const { name, role, quote, email, locale } = parsed.data
    const doc = await payload.create({
      collection: 'testimonials',
      overrideAccess: true,
      context: { disableRevalidate: true },
      data: {
        name,
        role: role || null,
        quote,
        email: email || null,
        consent: true,
        // Textul acordului se salvează de pe server (nu din cerere), în limba formularului.
        consentText: getDictionary(locale).testimonialForm.consent,
        language: locale,
        status: 'pending',
        ipHash,
      },
    })
    await sendTestimonialNotification(payload, doc)
    if (email && settings.automation?.autoReply !== false) {
      await sendEmailSafe(payload, { to: email, replyTo: process.env.CONTACT_NOTIFY_TO || undefined, ...feedbackAutoReply(locale, name, settings.personName || 'Daniel Popescu') })
    }
    return { status: 201, body: { ok: true } }
  } catch (error) {
    payload.logger.error({ msg: 'testimonial submission failed', error: error instanceof Error ? error.message : String(error) })
    return { status: 500, body: { ok: false, error: 'server' } }
  }
}
