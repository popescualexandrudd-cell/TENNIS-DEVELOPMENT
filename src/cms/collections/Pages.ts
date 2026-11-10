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
            { label: 'Confidențialitate', value: 'privacy' },
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
    { name: 'image', label: 'Fotografie principală', type: 'upload', relationTo: 'media' },
    {
      name: 'home',
      label: 'Secțiuni homepage',
      type: 'group',
      admin: { condition: forKeys('home') },
      fields: [
        { name: 'aboutText', label: 'Despre Daniel — 80–120 de cuvinte', type: 'textarea', localized: true },
        { name: 'aboutImage', label: 'Portret', type: 'upload', relationTo: 'media' },
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
          name: 'method',
          label: 'Cum lucrez — pași',
          type: 'array',
          localized: true,
          maxRows: 3,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'textarea', required: true },
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
