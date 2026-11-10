import { describe, expect, it } from 'vitest'
import type { Media } from '@/payload-types'
import { hasPublicImage, hasPublicMedia, mediaSrc, stillImage } from '@/lib/media'
import { absoluteUrl } from '@/lib/seo/site'
import { buildMetadata } from '@/lib/seo/metadata'

const base = { id: 1, alt: 'x', updatedAt: '', createdAt: '' }
const photo = { ...base, id: 1, url: 'http://localhost:3000/api/media/file/a.webp', mimeType: 'image/webp', rights: 'own' } as Media
const unverified = { ...photo, id: 2, rights: 'unverified' } as Media
const video = { ...base, id: 3, url: 'http://localhost:3000/api/media/file/v.mp4', mimeType: 'video/mp4', rights: 'licensed', poster: photo } as Media
const videoNoPoster = { ...video, id: 4, poster: null } as Media
const videoPrivatePoster = { ...video, id: 5, poster: unverified } as Media

describe('media', () => {
  it('face relative URL-urile de fișiere media, ca next/image să le accepte', () => {
    expect(mediaSrc('http://localhost:3000/api/media/file/a.webp?2')).toBe('/api/media/file/a.webp?2')
    expect(mediaSrc('/api/media/file/a.webp')).toBe('/api/media/file/a.webp')
    expect(mediaSrc('https://cdn.example.test/x.jpg')).toBe('https://cdn.example.test/x.jpg')
  })
  it('un clip video nu este imagine', () => {
    expect(hasPublicImage(photo)).toBe(true)
    expect(hasPublicImage(video)).toBe(false)
    expect(hasPublicImage(unverified)).toBe(false)
  })
  it('un clip apare public doar cu imagine de previzualizare publică', () => {
    expect(hasPublicMedia(video)).toBe(true)
    expect(hasPublicMedia(videoNoPoster)).toBe(false)
    expect(hasPublicMedia(videoPrivatePoster)).toBe(false)
    expect(hasPublicMedia(unverified)).toBe(false)
    expect(hasPublicMedia(7)).toBe(false)
  })
  it('imaginea statică a unui clip este posterul', () => {
    expect(stillImage(video)?.id).toBe(photo.id)
    expect(stillImage(photo)?.id).toBe(photo.id)
    expect(stillImage(videoNoPoster)).toBeNull()
  })
})

describe('SEO cu media', () => {
  it('absoluteUrl nu dublează domeniul pentru URL-uri deja absolute', () => {
    expect(absoluteUrl('http://localhost:3000/api/media/file/a.webp')).toBe('http://localhost:3000/api/media/file/a.webp')
    expect(absoluteUrl('/ro')).toMatch(/^https?:\/\/[^/]+\/ro$/)
  })
  it('Open Graph folosește posterul pentru un clip video, niciodată fișierul video', () => {
    const md = buildMetadata({ locale: 'ro', path: '/ro', title: 'T', image: video })
    const images = md.openGraph?.images as { url: string }[]
    expect(images[0]?.url).toBe(photo.url)
  })
})
