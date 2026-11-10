import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { isAuthenticated } from '../access'
import { revalidateWholeSite } from '../hooks/revalidate'

const afterChange: CollectionAfterChangeHook = async ({ req, doc }) => {
  await revalidateWholeSite(req)
  return doc
}

/**
 * Oferte de antrenament confirmate de Daniel. Doar cele cu `confirmed` apar public (maximum 3 pe homepage).
 */
export const CoachingServices: CollectionConfig = {
  slug: 'coaching-services',
  labels: { singular: 'Antrenament', plural: 'Antrenamente' },
  admin: { useAsTitle: 'title', group: 'Conținut', defaultColumns: ['title', 'confirmed', 'availability', 'order'] },
  access: {
    read: ({ req }) => (req.user ? true : { confirmed: { equals: true } }),
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  defaultSort: 'order',
  hooks: { afterChange: [afterChange] },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true, localized: true },
    { name: 'audience', label: 'Cui se adresează', type: 'textarea', required: true, localized: true },
    { name: 'format', label: 'Cum se desfășoară', type: 'textarea', required: true, localized: true },
    { name: 'goals', label: 'Ce urmărește', type: 'textarea', required: true, localized: true },
    { name: 'description', label: 'Descriere suplimentară', type: 'textarea', localized: true },
    { name: 'image', label: 'Fotografie sau video (opțional)', type: 'upload', relationTo: 'media' },
    {
      name: 'confirmed',
      label: 'Ofertă confirmată de Daniel (apare public)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'availability',
      label: 'Disponibilitate',
      type: 'select',
      defaultValue: 'available',
      options: [
        { label: 'Disponibil', value: 'available' },
        { label: 'Locuri limitate', value: 'limited' },
        { label: 'Momentan complet', value: 'full' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
