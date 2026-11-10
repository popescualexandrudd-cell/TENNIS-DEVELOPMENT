import type { Payload } from 'payload'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/** Anunță administratorul că o părere așteaptă aprobare. Nu aruncă excepții: părerea e deja salvată. */
export async function sendTestimonialNotification(payload: Payload, doc: { id: number | string; name: string; quote: string }): Promise<boolean> {
  const to = process.env.CONTACT_NOTIFY_TO
  if (!to || !process.env.SMTP_HOST) return false
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/collections/testimonials/${doc.id}`
  try {
    await payload.sendEmail({
      to,
      subject: `Părere nouă de aprobat — ${doc.name}`,
      text: `${doc.name}\n\n${doc.quote}\n\nAprobă sau respinge: ${adminUrl}`,
      html: `<p><strong>${escapeHtml(doc.name)}</strong></p><p style="white-space:pre-wrap">${escapeHtml(doc.quote)}</p><p><a href="${escapeHtml(adminUrl)}">Aprobă sau respinge în administrare</a></p>`,
    })
    return true
  } catch (error) {
    payload.logger.error({ msg: 'testimonial notification failed', id: doc.id, error: error instanceof Error ? error.message : String(error) })
    return false
  }
}
