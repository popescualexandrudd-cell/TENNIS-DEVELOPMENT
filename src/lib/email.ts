import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

/**
 * Email prin SMTP (orice furnizor). Fără SMTP_HOST, Payload doar loghează emailurile în consolă,
 * iar solicitările de contact rămân cu notificarea „în așteptare/eșuată”, retrimisibilă din admin.
 */
export function emailAdapter() {
  if (!process.env.SMTP_HOST) return undefined
  return nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@localhost',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Website',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    },
  })
}
