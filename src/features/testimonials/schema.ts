import { z } from 'zod'

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().max(120).optional().or(z.literal('')),
  quote: z.string().trim().min(20).max(600),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()).optional().or(z.literal('')),
  /** Acordul explicit de publicare; fără el nu se salvează nimic. */
  consent: z.literal(true),
  locale: z.enum(['ro', 'en']).default('ro'),
  /** Honeypot: trebuie să rămână gol. Oamenii nu îl văd. */
  website: z.string().max(0).optional().or(z.literal('')),
})

export type TestimonialField = 'name' | 'role' | 'quote' | 'email' | 'consent'
const fields: readonly TestimonialField[] = ['name', 'role', 'quote', 'email', 'consent']

export function testimonialFieldErrors(error: z.ZodError): TestimonialField[] {
  const out = new Set<TestimonialField>()
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && (fields as readonly string[]).includes(key)) out.add(key as TestimonialField)
  }
  return [...out]
}

export const MAX_TESTIMONIAL_BYTES = 8 * 1024
/** Cel mult 2 păreri pe oră de la același IP (hash). */
export const TESTIMONIAL_RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 2 } as const
