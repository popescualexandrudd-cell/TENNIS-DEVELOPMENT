import config from '@payload-config'
import { getPayload } from 'payload'
import { handleContactRequest } from '@/features/contact/handle'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const result = await handleContactRequest(payload, request)
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } })
}
