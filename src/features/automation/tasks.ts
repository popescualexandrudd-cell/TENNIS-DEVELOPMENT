import type { Payload } from 'payload'
import { applyRetention } from '@/features/legal/retention'
import { escapeHtml, sendEmailSafe } from './email'

/**
 * „Ecosistemul automatizat” (decizia 0017): o singură intrare, `runAutomations`, apelată de cron prin `POST /api/cron`.
 * - la fiecare rulare: publică articolele programate (`scheduledAt` ≤ acum);
 * - o dată pe zi: ștergere la termen (retenție) + reminder pentru solicitările fără răspuns;
 * - lunea: rezumat săptămânal către Daniel.
 * Rulează în runtime-ul Next.js, deci publicarea invalidează paginile (hook-urile colecției). Rezultatul conține doar numere.
 */
export type AutomationResult = {
  published: number
  reminders: number
  retention?: { contactRequests: number; testimonials: number }
  digest?: boolean
  daily: boolean
}

const day = (d: Date) => d.toISOString().slice(0, 10)
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? ''

export async function publishScheduledArticles(payload: Payload, now = new Date()): Promise<number> {
  const due = await payload.find({
    collection: 'articles',
    overrideAccess: true,
    draft: true,
    depth: 0,
    limit: 50,
    where: {
      and: [{ scheduledAt: { less_than_equal: now.toISOString() } }, { _status: { equals: 'draft' } }, { workflow: { not_equals: 'archived' } }],
    },
  })
  let count = 0
  for (const draft of due.docs) {
    // Publicăm ultima versiune draft (conținutul editat), nu documentul principal.
    const latest = await payload.findByID({ collection: 'articles', id: draft.id, draft: true, overrideAccess: true, depth: 0 })
    const { id: _id, createdAt: _c, updatedAt: _u, ...data } = latest as typeof latest & { createdAt?: string; updatedAt?: string }
    await payload.update({ collection: 'articles', id: draft.id, overrideAccess: true, data: { ...data, _status: 'published', scheduledAt: null } })
    count++
  }
  return count
}

export async function sendUnansweredReminders(payload: Payload, hours: number, now = new Date()): Promise<number> {
  const to = process.env.CONTACT_NOTIFY_TO
  const since = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
  const pending = await payload.find({
    collection: 'contact-requests',
    overrideAccess: true,
    depth: 0,
    limit: 50,
    where: { and: [{ status: { equals: 'new' } }, { createdAt: { less_than: since } }, { reminderSentAt: { exists: false } }] },
  })
  if (!to || pending.docs.length === 0) return 0
  const items = pending.docs.map((d) => ({ name: d.name, url: `${siteUrl()}/admin/collections/contact-requests/${d.id}` }))
  const ok = await sendEmailSafe(payload, {
    to,
    subject: `${items.length} solicitări fără răspuns de peste ${hours} de ore`,
    text: items.map((i) => `• ${i.name} — ${i.url}`).join('\n'),
    html: `<p>Solicitări cu status „Nouă” de peste ${hours} de ore:</p><ul>${items.map((i) => `<li><a href="${escapeHtml(i.url)}">${escapeHtml(i.name)}</a></li>`).join('')}</ul>`,
  })
  if (!ok) return 0
  for (const d of pending.docs) {
    await payload.update({ collection: 'contact-requests', id: d.id, overrideAccess: true, context: { skipResend: true }, data: { reminderSentAt: now.toISOString() } })
  }
  return items.length
}

export async function weeklyDigest(payload: Payload, now = new Date()) {
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const count = async (collection: 'contact-requests' | 'testimonials' | 'articles', where: Record<string, unknown>) =>
    (await payload.count({ collection, overrideAccess: true, where: where as never })).totalDocs
  const stats = {
    newRequests: await count('contact-requests', { createdAt: { greater_than: weekAgo } }),
    unanswered: await count('contact-requests', { status: { equals: 'new' } }),
    pendingFeedback: await count('testimonials', { status: { equals: 'pending' } }),
    published: await count('articles', { and: [{ _status: { equals: 'published' } }, { publishedAt: { greater_than: weekAgo } }] }),
    scheduled: await count('articles', { scheduledAt: { greater_than: now.toISOString() } }),
  }
  const lines = [
    `Solicitări noi (7 zile): ${stats.newRequests}`,
    `Solicitări încă fără răspuns: ${stats.unanswered}`,
    `Păreri de aprobat: ${stats.pendingFeedback}`,
    `Articole publicate (7 zile): ${stats.published}`,
    `Articole programate: ${stats.scheduled}`,
  ]
  return { stats, message: { subject: 'Rezumatul săptămânii — site', text: `${lines.join('\n')}\n\n${siteUrl()}/admin`, html: `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul><p><a href="${escapeHtml(`${siteUrl()}/admin`)}">Deschide administrarea</a></p>` } }
}

export async function runAutomations(payload: Payload, now = new Date(), { forceDaily = false } = {}): Promise<AutomationResult> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const a = settings.automation ?? {}
  const result: AutomationResult = { published: await publishScheduledArticles(payload, now), reminders: 0, daily: false }
  const today = day(now)

  if (forceDaily || a.lastDailyRunOn !== today) {
    result.daily = true
    result.retention = await applyRetention(payload, now)
    if (a.reminders !== false) result.reminders = await sendUnansweredReminders(payload, a.reminderHours ?? 48, now)
    // Luni (sau la forțare), o singură dată pe zi.
    if (a.weeklyDigest !== false && (now.getUTCDay() === 1 || forceDaily) && a.lastDigestOn !== today && process.env.CONTACT_NOTIFY_TO) {
      const { message } = await weeklyDigest(payload, now)
      result.digest = await sendEmailSafe(payload, { to: process.env.CONTACT_NOTIFY_TO, ...message })
    }
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    context: { disableRevalidate: true },
    data: {
      automation: {
        ...a,
        lastRunAt: now.toISOString(),
        ...(result.daily ? { lastDailyRunOn: today } : {}),
        ...(result.digest ? { lastDigestOn: today } : {}),
        lastResult: JSON.stringify(result),
      },
    },
  })
  return result
}
