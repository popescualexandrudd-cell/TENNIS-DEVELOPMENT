import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated, publishedOrAuthenticated } from '../access'
import { seoGroup } from '../fields/seo'
import { revalidateWholeSite } from '../hooks/revalidate'

const afterChange: CollectionAfterChangeHook = async ({ req, doc }) => {
  await revalidateWholeSite(req)
  return doc
}

type PageKeyData = { key?: string }
const forKeys =
  (...keys: string[]) =>
  (data: PageKeyData) =>
    Boolean(data?.key && keys.includes(data.key))

/**
 * O pagină fixă a site-ului (homepage, despre, antrenamente, contact, confidențialitate).
 * Nu este un page builder: fiecare cheie are câmpuri editoriale clare.
 * O traducere apare public numai dacă `available` este bifat pentru limba respectivă.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Pagină', plural: 'Pagini' },
  admin: { useAsTitle: 'internalTitle', group: 'Conținut', defaultColumns: ['internalTitle', 'key', '_status', 'updatedAt'] },
  access: {
    read: publishedOrAuthenticated,
    readVersions: isAuthenticated,
    create: isAdmin,
    update: isAuthenticated,
    delete: isAdmin,
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 30 },
  hooks: { afterChange: [afterChange] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'key',
          label: 'Pagina',
          type: 'select',
          required: true,
          unique: true,
          options: [
            { label: 'Homepage', value: 'home' },
            { label: 'Despre', value: 'about' },
            { label: 'Antrenamente', value: 'coaching' },
            { label: 'Jurnal (introducere)', value: 'journal' },
            { label: 'Contact', value: 'contact' },
            { label: 'Confidențialitate — note suplimentare (textul principal e generat din Setări site → Date legale)', value: 'privacy' },
          ],
        },
        { name: 'internalTitle', label: 'Titlu intern', type: 'text', required: true },
      ],
    },
    {
      name: 'available',
      label: 'Traducere gata de publicare în această limbă',
      type: 'checkbox',
      localized: true,
      defaultValue: false,
      admin: { description: 'Bifează separat pentru RO și EN. O limbă nebifată nu apare pe site (404).' },
    },
    { name: 'title', label: 'Titlu', type: 'text', localized: true, required: true },
    { name: 'intro', label: 'Introducere', type: 'textarea', localized: true },
    { name: 'image', label: 'Fotografie sau video principal', type: 'upload', relationTo: 'media' },
    {
      name: 'home',
      label: 'Secțiuni homepage',
      type: 'group',
      admin: { condition: forKeys('home') },
      fields: [
        {
          name: 'manifestoHeading',
          label: 'Manifest — o frază scurtă, mare (sub hero)',
          type: 'text',
          localized: true,
          maxLength: 70,
          admin: { description: 'O idee proprie, în 3–7 cuvinte. Gol = secțiunea nu apare.' },
        },
        { name: 'manifestoText', label: 'Manifest — 1–3 fraze', type: 'textarea', localized: true },
        {
          name: 'aboutHeading',
          label: 'Despre — titlu-afirmație (opțional, scurt)',
          type: 'text',
          localized: true,
          maxLength: 60,
          admin: { description: 'Ex. o idee proprie a lui Daniel, în 3–6 cuvinte. Gol = „Despre Daniel”.' },
        },
        { name: 'aboutLead', label: 'Despre — frază de deschidere (îngroșată)', type: 'text', localized: true, maxLength: 120 },
        { name: 'aboutText', label: 'Despre Daniel — 80–120 de cuvinte', type: 'textarea', localized: true },
        { name: 'aboutImage', label: 'Portret sau video', type: 'upload', relationTo: 'media' },
        {
          name: 'approach',
          label: 'Trei idei despre abordare',
          type: 'array',
          localized: true,
          maxRows: 3,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
          ],
        },
        {
          name: 'facts',
          label: 'Cifre verificabile (opțional, max. 4)',
          type: 'array',
          localized: true,
          maxRows: 4,
          admin: { description: 'Doar fapte reale, confirmate de Daniel. Secțiunea nu apare dacă lista e goală.' },
          fields: [
            { name: 'value', label: 'Valoare', type: 'text', required: true, maxLength: 8 },
            { name: 'label', label: 'Ce reprezintă', type: 'text', required: true, maxLength: 60 },
            { name: 'note', label: 'Detaliu / sursă', type: 'text', maxLength: 90 },
          ],
        },
        { name: 'coachingHeading', label: 'Antrenamente — titlu-afirmație (opțional)', type: 'text', localized: true, maxLength: 60 },
        {
          name: 'method',
          label: 'Cum lucrez — pași',
          type: 'array',
          localized: true,
          maxRows: 3,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
            { name: 'media', label: 'Fotografie sau video (opțional)', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          name: 'testimonials',
          label: 'Testimoniale (opțional)',
          type: 'array',
          localized: true,
          maxRows: 6,
          admin: { description: 'Numai citate reale, cu acordul scris al persoanei. Fără acord bifat, testimonialul nu apare.' },
          fields: [
            { name: 'name', label: 'Nume', type: 'text', required: true },
            { name: 'role', label: 'Context (ex. jucător amator, 2 ani de antrenament)', type: 'text' },
            { name: 'quote', label: 'Citat', type: 'textarea', required: true, maxLength: 400 },
            { name: 'image', label: 'Fotografie (cu acord)', type: 'upload', relationTo: 'media' },
            { name: 'consent', label: 'Am acordul scris pentru publicare', type: 'checkbox', defaultValue: false, required: true },
          ],
        },
        { name: 'contactInvite', label: 'Invitație la contact', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'body',
      label: 'Conținut',
      type: 'richText',
      localized: true,
      admin: { condition: forKeys('about', 'coaching', 'journal', 'contact', 'privacy') },
    },
    seoGroup({ localized: true }),
  ],
}
