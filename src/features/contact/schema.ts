import { z } from 'zod'

export const requestTypes = ['coaching', 'collaboration', 'other'] as const

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  requestType: z.enum(requestTypes),
  message: z.string().trim().min(10).max(4000),
  locale: z.enum(['ro', 'en']).default('ro'),
  /** Honeypot: trebuie să rămână gol. Oamenii nu îl văd. */
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactField = 'name' | 'email' | 'requestType' | 'message'

export function fieldErrors(error: z.ZodError): ContactField[] {
  const fields = new Set<ContactField>()
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (key === 'name' || key === 'email' || key === 'requestType' || key === 'message') fields.add(key)
  }
  return [...fields]
}

export const MAX_BODY_BYTES = 16 * 1024
