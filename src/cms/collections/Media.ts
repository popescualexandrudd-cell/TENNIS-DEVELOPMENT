import path from 'path'
import type { CollectionConfig } from 'payload'
import { anyone, isAuthenticated } from '../access'

/**
 * Imagini și clipuri video scurte (MP4/WebM, fără sunet, buclă de 5–10 s). Un clip are obligatoriu o imagine de previzualizare
 * (`poster`), folosită pe telefon, la „reducere mișcare” și până pornește clipul.
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
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'],
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
    {
      name: 'poster',
      label: 'Imagine de previzualizare (obligatorie pentru video)',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        condition: (data) => typeof data?.mimeType === 'string' && data.mimeType.startsWith('video/'),
        description: 'Un cadru reprezentativ din clip. Se afișează pe telefon și când vizitatorul a cerut mai puțină mișcare.',
      },
      validate: (value: unknown, { data }: { data: Partial<{ mimeType: string | null }> }) =>
        typeof data?.mimeType === 'string' && data.mimeType.startsWith('video/') && !value
          ? 'Un clip video are nevoie de o imagine de previzualizare.'
          : true,
    },
    { name: 'credit', label: 'Credit foto / video', type: 'text' },
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
