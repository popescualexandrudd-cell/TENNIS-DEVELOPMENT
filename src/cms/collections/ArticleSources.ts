import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '../access'

/** Sursele unui articol. Accesibile doar în administrare; pe site se afișează numai prin articolul publicat. */
export const ArticleSources: CollectionConfig = {
  slug: 'article-sources',
  labels: { singular: 'Sursă articol', plural: 'Surse articole' },
  admin: { useAsTitle: 'title', group: 'Jurnal', defaultColumns: ['title', 'publisher', 'article', 'accessedAt'] },
  access: { read: isAuthenticated, create: isAuthenticated, update: isAuthenticated, delete: isAuthenticated },
  fields: [
    { name: 'article', label: 'Articol', type: 'relationship', relationTo: 'articles', required: true, index: true },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string') return 'URL obligatoriu.'
        try {
          const u = new URL(value)
          return u.protocol === 'https:' || u.protocol === 'http:' ? true : 'Doar http(s).'
        } catch {
          return 'URL invalid.'
        }
      },
    },
    { name: 'title', label: 'Titlu', type: 'text', required: true },
    { name: 'publisher', label: 'Publicație / autor', type: 'text' },
    { name: 'accessedAt', label: 'Data accesării', type: 'date', required: true, defaultValue: () => new Date().toISOString() },
    { name: 'showPublicly', label: 'Afișează în lista de surse a articolului', type: 'checkbox', defaultValue: true },
    { name: 'notes', label: 'Note interne', type: 'textarea' },
  ],
}
