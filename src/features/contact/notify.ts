import type { Payload } from 'payload'

type ContactDoc = { id: number | string; name: string; email: string; requestType: string; message: string; createdAt?: string }

const typeLabels: Record<string, string> = { coaching: 'Antrenamente', collaboration: 'Colaborare', other: 'Altceva' }

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/**
 * Trimite notificarea către administrator. Nu aruncă excepții: rezultatul se salvează pe solicitare,
 * iar o notificare eșuată se poate retrimite din admin.
 */
export async function sendContactNotification(payload: Payload, doc: ContactDoc): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = process.env.CONTACT_NOTIFY_TO
  if (!to) return { ok: false, error: 'CONTACT_NOTIFY_TO nu este configurat' }
  if (!process.env.SMTP_HOST) return { ok: false, error: 'SMTP nu este configurat' }
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/collections/contact-requests/${doc.id}`
  try {
    await payload.sendEmail({
      to,
      replyTo: doc.email,
      subject: `Solicitare nouă (${typeLabels[doc.requestType] ?? doc.requestType}) — ${doc.name}`,
      text: `${doc.name} <${doc.email}>\nTip: ${typeLabels[doc.requestType] ?? doc.requestType}\n\n${doc.message}\n\n${adminUrl}`,
      html: `<p><strong>${escapeHtml(doc.name)}</strong> &lt;${escapeHtml(doc.email)}&gt;<br>Tip: ${escapeHtml(
        typeLabels[doc.requestType] ?? doc.requestType,
      )}</p><p style="white-space:pre-wrap">${escapeHtml(doc.message)}</p><p><a href="${escapeHtml(adminUrl)}">Deschide în administrare</a></p>`,
    })
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'eroare necunoscută'
    payload.logger.error({ msg: 'contact notification failed', requestId: doc.id, error: message })
    return { ok: false, error: message.slice(0, 200) }
  }
}
