import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { articleData, createEditor, ctx, resetDb, testPayload } from './helpers'

let payload: Payload

beforeAll(async () => {
  payload = await testPayload()
})
beforeEach(async () => {
  await resetDb(payload)
})

describe('accesul public la articole', () => {
  it('un draft nu este vizibil public, nici cu draft=true, nici după ID, nici prin versiuni', async () => {
    const draft = await payload.create({ collection: 'articles', draft: true, context: ctx, data: articleData({ title: 'Draft secret', _status: 'draft' }) })

    const list = await payload.find({ collection: 'articles', overrideAccess: false })
    expect(list.totalDocs).toBe(0)

    const listDraft = await payload.find({ collection: 'articles', overrideAccess: false, draft: true })
    expect(listDraft.docs.map((d) => d.title)).not.toContain('Draft secret')

    await expect(payload.findByID({ collection: 'articles', id: draft.id, overrideAccess: false })).rejects.toThrow()
    await expect(payload.findVersions({ collection: 'articles', overrideAccess: false })).rejects.toThrow()
  })

  it('modificările nepublicate ale unui articol publicat nu ajung public', async () => {
    const doc = await payload.create({ collection: 'articles', context: ctx, data: articleData({ title: 'Titlu publicat', _status: 'published' }) })
    await payload.update({ collection: 'articles', id: doc.id, draft: true, context: ctx, data: { title: 'Titlu încă nepublicat', _status: 'draft' } })

    const pub = await payload.find({ collection: 'articles', overrideAccess: false, where: { _status: { equals: 'published' } } })
    expect(pub.docs.map((d) => d.title)).toEqual(['Titlu publicat'])

    const pubDraftParam = await payload.find({ collection: 'articles', overrideAccess: false, draft: true })
    expect(pubDraftParam.docs.map((d) => d.title)).not.toContain('Titlu încă nepublicat')
  })

  it('un editor autentificat vede draftul în preview', async () => {
    const editor = await createEditor(payload)
    await payload.create({ collection: 'articles', draft: true, context: ctx, data: articleData({ title: 'Draft pentru preview', _status: 'draft' }) })
    const res = await payload.find({ collection: 'articles', overrideAccess: false, user: editor, draft: true })
    expect(res.docs.map((d) => d.title)).toContain('Draft pentru preview')
  })

  it('arhivarea retrage un articol publicat', async () => {
    const doc = await payload.create({ collection: 'articles', context: ctx, data: articleData({ _status: 'published' }) })
    expect((await payload.find({ collection: 'articles', overrideAccess: false })).totalDocs).toBe(1)
    const archived = await payload.update({ collection: 'articles', id: doc.id, context: ctx, data: { workflow: 'archived', _status: 'published' } })
    expect(archived._status).toBe('draft')
    expect(archived.editorialStatus).toBe('archived')
    expect((await payload.find({ collection: 'articles', overrideAccess: false })).totalDocs).toBe(0)
  })

  it('publicarea setează data și statusul editorial', async () => {
    const doc = await payload.create({ collection: 'articles', context: ctx, data: articleData({ workflow: 'in_review', _status: 'published' }) })
    expect(doc.publishedAt).toBeTruthy()
    expect(doc.workflow).toBe('draft')
    expect(doc.editorialStatus).toBe('published')
  })

  it('slugul este generat din titlu și unic per limbă; un slug schimbat devine redirect', async () => {
    const a = await payload.create({ collection: 'articles', context: ctx, data: articleData({ title: 'Serviciul în doi timpi', _status: 'published' }) })
    expect(a.slug).toBe('serviciul-in-doi-timpi')

    await expect(
      payload.create({ collection: 'articles', context: ctx, data: articleData({ title: 'Altul', slug: 'serviciul-in-doi-timpi', _status: 'published' }) }),
    ).rejects.toThrow()
    // Aceeași combinație de slug în altă limbă este permisă.
    const en = await payload.create({
      collection: 'articles',
      context: ctx,
      data: articleData({ title: 'Serve', slug: 'serviciul-in-doi-timpi', language: 'en', _status: 'published' }),
    })
    expect(en.slug).toBe('serviciul-in-doi-timpi')

    const renamed = await payload.update({ collection: 'articles', id: a.id, context: ctx, data: { slug: 'serviciul-pas-cu-pas', _status: 'published' } })
    expect(renamed.previousSlugs?.map((p) => p.slug)).toEqual(['serviciul-in-doi-timpi'])
  })

  it('sursele articolelor și utilizatorii admin nu sunt publice', async () => {
    const doc = await payload.create({ collection: 'articles', context: ctx, data: articleData({ _status: 'published' }) })
    await payload.create({ collection: 'article-sources', data: { article: doc.id, url: 'https://example.org/a', title: 'Sursă', accessedAt: new Date().toISOString() } })
    await createEditor(payload)
    await expect(payload.find({ collection: 'article-sources', overrideAccess: false })).rejects.toThrow()
    await expect(payload.find({ collection: 'admin-users', overrideAccess: false })).rejects.toThrow()
  })
})
