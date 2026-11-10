import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'
import { isAuthenticated, nobody } from '../access'
import { revalidatePaths } from '../hooks/revalidate'
import { pagePath } from '../../lib/i18n/routes'

/**
 * Păreri trimise de sportivi prin formularul public (`POST /api/feedback`, decizia 0012).
 * Intră „în așteptare”; apar pe site numai după ce Daniel le aprobă. Publicul (REST) vede doar părerile aprobate
 * și doar câmpurile publice — emailul și hash-ul IP sunt vizibile exclusiv în administrare.
 */
const publicRead = ({ req }: { req: { user?: unknown } }): boolean | Where => (req.user ? true : { status: { equals: 'approved' } })
const staffOnly = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

const stampApproval: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data.status === 'approved' && originalDoc?.status !== 'approved') data.approvedAt = new Date().toISOString()
  if (data.status && data.status !== 'approved') data.approvedAt = null
  return data
}

const homePaths = (language?: string | null) => (language === 'en' ? [pagePath('en', 'home')] : [pagePath('ro', 'home')])

const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  // Doar ce e (sau a fost) public schimbă homepage-ul.
  if (doc.status === 'approved' || previousDoc?.status === 'approved') await revalidatePaths(homePaths(doc.language), req)
  return doc
}
const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (doc.status === 'approved') await revalidatePaths(homePaths(doc.language), req)
  return doc
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Părere sportiv', plural: 'Păreri sportivi' },
  admin: {
    useAsTitle: 'name',
    group: 'Solicitări',
    defaultColumns: ['name', 'status', 'language', 'createdAt'],
    listSearchableFields: ['name', 'quote'],
    description: 'Părerile trimise de pe site. Citește, eventual corectează greșelile de tastare, apoi schimbă statusul în „Aprobată”.',
  },
  access: { read: publicRead, create: nobody, update: isAuthenticated, delete: isAuthenticated },
  hooks: { beforeChange: [stampApproval], afterChange: [afterChange], afterDelete: [afterDelete] },
  fields: [
    { name: 'name', label: 'Nume (public)', type: 'text', required: true, maxLength: 80 },
    { name: 'role', label: 'Context (public, ex. jucător amator, 2 ani de antrenament)', type: 'text', maxLength: 120 },
    { name: 'quote', label: 'Părere (public)', type: 'textarea', required: true, maxLength: 600 },
    {
      name: 'consent',
      label: 'Acord de publicare dat în formular',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: { readOnly: true, description: 'Bifat de sportiv la trimitere. Fără acord, părerea nu se poate trimite.' },
    },
    {
      name: 'consentText',
      label: 'Textul acordului acceptat',
      type: 'textarea',
      admin: { readOnly: true },
      access: { read: staffOnly, update: () => false },
    },
    {
      name: 'email',
      label: 'Email (opțional, nu se publică)',
      type: 'email',
      admin: { description: 'Doar pentru verificare sau dacă sportivul cere retragerea părerii.' },
      access: { read: staffOnly },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'În așteptare', value: 'pending' },
        { label: 'Aprobată (publică)', value: 'approved' },
        { label: 'Respinsă', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'language',
      label: 'Limba formularului',
      type: 'select',
      defaultValue: 'ro',
      options: [
        { label: 'RO', value: 'ro' },
        { label: 'EN', value: 'en' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'approvedAt', label: 'Aprobată la', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'ipHash',
      type: 'text',
      index: true,
      admin: { hidden: true },
      access: { read: () => false, update: () => false },
    },
  ],
}
