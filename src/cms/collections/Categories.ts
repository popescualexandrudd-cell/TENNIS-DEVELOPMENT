import type { CollectionConfig } from 'payload'
import { anyone, isAuthenticated } from '../access'
import { slugPattern } from '../../lib/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categorie', plural: 'Categorii' },
  admin: { useAsTitle: 'name', group: 'Jurnal' },
  access: { read: anyone, create: isAuthenticated, update: isAuthenticated, delete: isAuthenticated },
  fields: [
    { name: 'name', label: 'Denumire', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      localized: true,
      validate: (value: unknown) => (typeof value === 'string' && slugPattern.test(value)) || 'Doar litere mici, cifre și cratime.',
    },
  ],
}
