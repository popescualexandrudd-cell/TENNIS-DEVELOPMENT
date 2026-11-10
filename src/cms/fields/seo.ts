import type { Field } from 'payload'

export function seoGroup({ localized }: { localized: boolean }): Field {
  return {
    name: 'seo',
    label: 'SEO',
    type: 'group',
    admin: { description: 'Opțional. Dacă rămân goale, se folosesc titlul și rezumatul.' },
    fields: [
      { name: 'title', label: 'Titlu SEO', type: 'text', localized, maxLength: 70 },
      { name: 'description', label: 'Descriere SEO', type: 'textarea', localized, maxLength: 170 },
      { name: 'image', label: 'Imagine Open Graph', type: 'upload', relationTo: 'media' },
      { name: 'noindex', label: 'Exclude din indexare', type: 'checkbox', defaultValue: false },
    ],
  }
}
