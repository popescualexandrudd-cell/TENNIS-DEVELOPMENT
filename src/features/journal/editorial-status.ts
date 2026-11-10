/**
 * Maparea statusului editorial peste mecanismul nativ de draft al Payload.
 *
 * Sursa de adevăr pentru publicare este `_status` (Payload: `draft` | `published`).
 * Câmpul `workflow` descrie doar etapa de lucru a unui document NEpublicat:
 *   - draft      → `_status: draft`,      `workflow: draft`
 *   - in_review  → `_status: draft`,      `workflow: in_review`
 *   - published  → `_status: published`   (workflow e resetat la `draft`)
 *   - archived   → `_status: draft`,      `workflow: archived` (retras, păstrat)
 *
 * Vezi docs/decisions/0003-editorial-status.md.
 */
export type PayloadStatus = 'draft' | 'published'
export type Workflow = 'draft' | 'in_review' | 'archived'
export type EditorialStatus = 'draft' | 'in_review' | 'published' | 'archived'

export function deriveEditorialStatus(status: PayloadStatus | null | undefined, workflow: Workflow | null | undefined): EditorialStatus {
  if (status === 'published') return 'published'
  return workflow ?? 'draft'
}

/**
 * Normalizează datele înainte de salvare astfel încât cele două câmpuri să nu se contrazică.
 * Arhivarea are prioritate: un articol arhivat nu poate rămâne publicat.
 */
export function normalizeEditorialState<T extends { _status?: PayloadStatus | null; workflow?: Workflow | null }>(data: T): T {
  if (data.workflow === 'archived') return { ...data, _status: 'draft' }
  if (data._status === 'published') return { ...data, workflow: 'draft' }
  return data
}
