import type { Payload } from 'payload'
import { contactSchema, fieldErrors, MAX_BODY_BYTES, type ContactField } from './schema'
import { normalizePhone } from './phone'
import { clientIp, hashIp, isRateLimited } from './rate-limit'
import { sendContactNotification } from './notify'
import { readJsonBody } from '@/lib/http'

export type ContactResult =
  | { status: 201; body: { ok: true; id: string | number; notification: 'sent' | 'failed' } }
  | { status: 400; body: { ok: false; error: 'validation'; fields: ContactField[] } }
  | { status: 400 | 403 | 413 | 415; body: { ok: false; error: 'bad_request' | 'forbidden' | 'too_large' | 'unsupported' } }
  | { status: 429; body: { ok: false; error: 'rate_limited' } }
  | { status: 500; body: { ok: false; error: 'server' } }

/** Fluxul complet: validare → antispam → limitare → salvare → notificare. Succes = solicitare salvată. */
export async function handleContactRequest(payload: Payload, request: Request): Promise<ContactResult> {
  const body = await readJsonBody(request, MAX_BODY_BYTES)
  if (!body.ok) return { status: body.status, body: { ok: false, error: body.error } }
  const raw = body.data

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error)
    // Honeypot completat sau câmpuri necunoscute: răspuns generic, fără salvare.
    if (fields.length === 0) return { status: 400, body: { ok: false, error: 'bad_request' } }
    return { status: 400, body: { ok: false, error: 'validation', fields } }
  }

  const secret = process.env.CONTACT_HASH_SECRET || process.env.PAYLOAD_SECRET || ''
  const ipHash = hashIp(clientIp(request.headers), secret)

  try {
    if (await isRateLimited(payload, ipHash)) return { status: 429, body: { ok: false, error: 'rate_limited' } }

    const { website: _honeypot, phone, phoneCountry, ...data } = parsed.data
    const doc = await payload.create({
      collection: 'contact-requests',
      overrideAccess: true,
      data: { ...data, phone: normalizePhone(phoneCountry, phone), ipHash, status: 'new', notificationStatus: 'pending' },
    })

    // Solicitarea este salvată: de aici înainte răspunsul este succes, chiar dacă emailul eșuează.
    let notification: 'sent' | 'failed' = 'failed'
    try {
      const result = await sendContactNotification(payload, doc)
      notification = result.ok ? 'sent' : 'failed'
      await payload.update({
        collection: 'contact-requests',
        id: doc.id,
        overrideAccess: true,
        context: { skipResend: true },
        data: { notificationStatus: notification, notificationError: result.ok ? null : result.error },
      })
    } catch (error) {
      payload.logger.error({ msg: 'contact notification bookkeeping failed', requestId: doc.id, error: String(error) })
    }
    return { status: 201, body: { ok: true, id: doc.id, notification } }
  } catch (error) {
    payload.logger.error({ msg: 'contact request failed', error: error instanceof Error ? error.message : String(error) })
    return { status: 500, body: { ok: false, error: 'server' } }
  }
}
