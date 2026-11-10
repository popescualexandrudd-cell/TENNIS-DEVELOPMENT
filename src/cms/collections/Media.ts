import path from 'path'
import type { CollectionConfig } from 'payload'
import { anyone, isAuthenticated } from '../access'

/**
 * Media se stochează local (director persistent). Adaptorul se poate înlocui ulterior
 * cu un plugin de stocare S3-compatibil fără schimbarea modelului. Vezi docs/ARCHITECTURE.md.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Fișier media', plural: 'Media' },
  admin: { group: 'Conținut', defaultColumns: ['filename', 'alt', 'rights', 'updatedAt'] },
  access: { read: anyone, create: isAuthenticated, update: isAuthenticated, delete: isAuthenticated },
  upload: {
    staticDir: path.resolve(process.env.MEDIA_DIR || 'media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumb', width: 480 },
      { name: 'medium', width: 960 },
      { name: 'large', width: 1600 },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      label: 'Text alternativ',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Descrie ce se vede, pentru cititorii de ecran. Ex: „Daniel explică priza la forehand pe zgură”.' },
    },
    { name: 'credit', label: 'Credit foto', type: 'text' },
    {
      name: 'rights',
      label: 'Drepturi de utilizare',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      options: [
        { label: 'Neverificat — nu folosi public', value: 'unverified' },
        { label: 'Fotografie proprie', value: 'own' },
        { label: 'Licență / acord scris', value: 'licensed' },
        { label: 'Persoane identificabile: acord obținut', value: 'consent' },
      ],
    },
    { name: 'rightsNote', label: 'Note drepturi', type: 'textarea' },
  ],
}
