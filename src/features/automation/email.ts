import type { Payload } from 'payload'

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/** Emailurile pleacă doar cu SMTP configurat; altfel nu se încearcă nimic (rezultat „failed”, fără excepții). */
export const emailConfigured = () => Boolean(process.env.SMTP_HOST)

export async function sendEmailSafe(payload: Payload, message: { to: string; subject: string; text: string; html: string; replyTo?: string }): Promise<boolean> {
  if (!emailConfigured()) return false
  try {
    await payload.sendEmail(message)
    return true
  } catch (error) {
    // Fără adresa destinatarului în log (date personale).
    payload.logger.error({ msg: 'automation email failed', subject: message.subject, error: error instanceof Error ? error.message : String(error) })
    return false
  }
}

const paragraphs = (lines: string[]) => lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('')

/** Confirmare către vizitator după un mesaj de contact. Persoana I, în limba formularului; fără conținut de marketing. */
export function contactAutoReply(locale: 'ro' | 'en', name: string, signature: string) {
  const lines =
    locale === 'en'
      ? [`Hi ${name},`, 'Thank you for your message — I received it and will reply personally as soon as I can.', 'This is an automatic confirmation; you do not need to answer it.', signature]
      : [`Bună, ${name}!`, 'Mulțumesc pentru mesaj — l-am primit și îți răspund personal cât pot de repede.', 'Acesta este un email automat de confirmare; nu e nevoie să răspunzi la el.', signature]
  return { subject: locale === 'en' ? 'I received your message' : 'Am primit mesajul tău', text: lines.join('\n\n'), html: paragraphs(lines) }
}

/** Confirmare pentru o părere trimisă (doar dacă sportivul și-a lăsat emailul). */
export function feedbackAutoReply(locale: 'ro' | 'en', name: string, signature: string) {
  const lines =
    locale === 'en'
      ? [`Hi ${name},`, 'Thank you for sharing your experience! I will read it and publish it on the site once approved.', 'You can ask me at any time to remove it by replying to this email.', signature]
      : [`Bună, ${name}!`, 'Mulțumesc că mi-ai scris părerea! O citesc și o public pe site după aprobare.', 'Poți cere oricând retragerea ei, răspunzând la acest email.', signature]
  return { subject: locale === 'en' ? 'Thank you for your feedback' : 'Mulțumesc pentru părere', text: lines.join('\n\n'), html: paragraphs(lines) }
}
