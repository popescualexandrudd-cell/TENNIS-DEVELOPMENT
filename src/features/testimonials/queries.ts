import { cache } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { getPayloadClient } from '@/lib/payload'

export type PublicTestimonial = { id: string | number; name: string; role?: string | null; quote: string }

/** Păreri aprobate, în limba paginii, cele mai noi întâi. Numai câmpurile publice (accesul public le filtrează oricum). */
export const getApprovedTestimonials = cache(async (locale: Locale, limit = 6): Promise<PublicTestimonial[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'testimonials',
    overrideAccess: false,
    where: { and: [{ status: { equals: 'approved' } }, { language: { equals: locale } }, { consent: { equals: true } }] },
    sort: '-approvedAt',
    limit,
    depth: 0,
    select: { name: true, role: true, quote: true },
  })
  return docs.map((d) => ({ id: d.id, name: d.name, role: d.role, quote: d.quote }))
})
