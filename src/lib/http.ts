/** Utilitare comune pentru endpointurile publice care primesc JSON (contact, păreri). */

export type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; status: 400 | 403 | 413 | 415; error: 'bad_request' | 'forbidden' | 'too_large' | 'unsupported' }

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // cereri fără Origin (ex. unele clienți) — protejate oricum de lipsa sesiunii
  const allowed = process.env.NEXT_PUBLIC_SITE_URL
  try {
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
    return origin === allowed || (host !== null && new URL(origin).host === host)
  } catch {
    return false
  }
}

/** Origine, tip de conținut și mărime verificate înainte de a citi corpul; apoi JSON.parse. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  if (!sameOrigin(request)) return { ok: false, status: 403, error: 'forbidden' }
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return { ok: false, status: 415, error: 'unsupported' }
  }
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > maxBytes) return { ok: false, status: 413, error: 'too_large' }
  try {
    const text = await request.text()
    if (Buffer.byteLength(text) > maxBytes) return { ok: false, status: 413, error: 'too_large' }
    return { ok: true, data: JSON.parse(text) }
  } catch {
    return { ok: false, status: 400, error: 'bad_request' }
  }
}
