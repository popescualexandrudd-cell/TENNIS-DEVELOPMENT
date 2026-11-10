import { randomUUID } from 'crypto'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { isAuthenticated, publishedOrAuthenticated } from '../access'
import { seoGroup } from '../fields/seo'
import { revalidatePaths } from '../hooks/revalidate'
import { normalizeEditorialState, deriveEditorialStatus, type PayloadStatus, type Workflow } from '../../features/journal/editorial-status'
import { articlePath, pagePath } from '../../lib/i18n/routes'
import type { Locale } from '../../lib/i18n/config'
import { slugify, slugPattern } from '../../lib/slug'

type ArticleLike = {
  id: number | string
  slug?: string
  language?: Locale
  _status?: PayloadStatus
  workflow?: Workflow
  previousSlugs?: { slug: string }[]
  publishedAt?: string | null
  title?: string
}

const beforeChange: CollectionBeforeChangeHook<ArticleLike> = ({ data, originalDoc }) => {
  let next = normalizeEditorialState({ ...data })
  if (!next.slug && next.title) next.slug = slugify(next.title)
  // Păstrăm slugurile vechi pentru redirect permanent, dacă slugul unui articol publicat se schimbă.
  const oldSlug = originalDoc?.slug
  if (oldSlug && next.slug && oldSlug !== next.slug && originalDoc?._status === 'published') {
    const previous = (next.previousSlugs ?? originalDoc?.previousSlugs ?? []).filter((p) => p.slug !== next.slug)
    if (!previous.some((p) => p.slug === oldSlug)) previous.push({ slug: oldSlug })
    next = { ...next, previousSlugs: previous }
  }
  if (next._status === 'published' && !next.publishedAt) next.publishedAt = new Date().toISOString()
  return next
}

function pathsFor(doc?: ArticleLike | null): string[] {
  if (!doc?.language) return []
  const paths = [pagePath(doc.language, 'home'), pagePath(doc.language, 'journal')]
  if (doc.slug) paths.push(articlePath(doc.language, doc.slug))
  for (const p of doc.previousSlugs ?? []) paths.push(articlePath(doc.language, p.slug))
  return paths
}

const afterChange: CollectionAfterChangeHook<ArticleLike> = async ({ doc, previousDoc, req }) => {
  // Revalidăm atât la publicare, cât și la retragere (published → draft/archived).
  if (doc._status === 'published' || previousDoc?._status === 'published') {
    await revalidatePaths([...pathsFor(doc), ...pathsFor(previousDoc)], req)
  }
  return doc
}

const afterDelete: CollectionAfterDeleteHook<ArticleLike> = async ({ doc, req }) => {
  await revalidatePaths(pathsFor(doc), req)
  return doc
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Articol', plural: 'Articole' },
  admin: {
    useAsTitle: 'title',
    group: 'Jurnal',
    defaultColumns: ['title', 'language', 'editorialStatus', 'publishedAt', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    preview: (doc) => {
      const d = doc as ArticleLike & { id?: string | number }
      if (!d?.id) return null
      return `/api/preview?collection=articles&id=${encodeURIComponent(String(d.id))}`
    },
  },
  access: {
    read: publishedOrAuthenticated,
    readVersions: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  versions: { drafts: { autosave: false, schedulePublish: false }, maxPerDoc: 50 },
  indexes: [{ fields: ['language', 'slug'], unique: true }],
  hooks: { beforeChange: [beforeChange], afterChange: [afterChange], afterDelete: [afterDelete] },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true, maxLength: 140 },
    {
      type: 'row',
      fields: [
        {
          name: 'language',
          label: 'Limba',
          type: 'select',
          required: true,
          defaultValue: 'ro',
          options: [
            { label: 'Română', value: 'ro' },
            { label: 'English', value: 'en' },
          ],
          admin: { width: '30%' },
        },
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          index: true,
          admin: { width: '70%', description: 'Se generează din titlu dacă rămâne gol. Unic per limbă.' },
          validate: (value: unknown) =>
            value == null || value === '' || (typeof value === 'string' && slugPattern.test(value)) || 'Doar litere mici, cifre și cratime.',
        },
      ],
    },
    {
      name: 'excerpt',
      label: 'Rezumat',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: { description: 'Una-două fraze, folosite în liste și ca descriere implicită.' },
    },
    { name: 'coverImage', label: 'Imagine principală', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Conținut', type: 'richText', required: true },
    {
      name: 'sources',
      label: 'Surse',
      type: 'join',
      collection: 'article-sources',
      on: 'article',
      admin: { description: 'Sursele se adaugă din colecția „Surse articole”.' },
    },
    {
      name: 'relatedServices',
      label: 'Antrenamente relevante',
      type: 'relationship',
      relationTo: 'coaching-services',
      hasMany: true,
      maxRows: 2,
    },
    seoGroup({ localized: false }),
    // —— Sidebar ——
    {
      name: 'editorialStatus',
      label: 'Status editorial',
      type: 'text',
      virtual: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Derivat din publicare + etapă de lucru.' },
      hooks: {
        afterRead: [
          ({ siblingData }) => deriveEditorialStatus(siblingData?._status as PayloadStatus, siblingData?.workflow as Workflow),
        ],
      },
    },
    {
      name: 'workflow',
      label: 'Etapă de lucru (nepublicat)',
      type: 'select',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'În revizuire', value: 'in_review' },
        { label: 'Arhivat (retras)', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Publicarea se face cu butonul „Publish”. „Arhivat” retrage articolul de pe site.',
      },
    },
    { name: 'category', label: 'Categorie', type: 'relationship', relationTo: 'categories', admin: { position: 'sidebar' } },
    { name: 'authorName', label: 'Autor', type: 'text', defaultValue: 'Daniel Popescu', required: true, admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      label: 'Data publicării',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, description: 'Se completează automat la prima publicare.' },
    },
    {
      name: 'translationGroup',
      label: 'Grup de traducere',
      type: 'text',
      index: true,
      required: true,
      defaultValue: () => randomUUID(),
      admin: {
        position: 'sidebar',
        description: 'Aceeași valoare la versiunea RO și EN a aceluiași articol.',
      },
    },
    {
      name: 'previousSlugs',
      label: 'Sluguri anterioare (redirect)',
      type: 'array',
      admin: { position: 'sidebar', readOnly: true, initCollapsed: true },
      fields: [{ name: 'slug', type: 'text', required: true }],
    },
  ],
}
