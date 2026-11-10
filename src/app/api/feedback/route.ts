import config from '@payload-config'
import { getPayload } from 'payload'
import { handleTestimonialSubmission } from '@/features/testimonials/handle'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const result = await handleTestimonialSubmission(payload, request)
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } })
}
