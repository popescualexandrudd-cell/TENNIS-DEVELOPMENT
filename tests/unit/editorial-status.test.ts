import { describe, expect, it } from 'vitest'
import { deriveEditorialStatus, normalizeEditorialState } from '@/features/journal/editorial-status'

describe('status editorial', () => {
  it('derivă cele patru stări din _status + workflow', () => {
    expect(deriveEditorialStatus('draft', 'draft')).toBe('draft')
    expect(deriveEditorialStatus('draft', 'in_review')).toBe('in_review')
    expect(deriveEditorialStatus('published', 'draft')).toBe('published')
    expect(deriveEditorialStatus('published', 'in_review')).toBe('published')
    expect(deriveEditorialStatus('draft', 'archived')).toBe('archived')
    expect(deriveEditorialStatus(undefined, undefined)).toBe('draft')
  })
  it('arhivarea retrage publicarea', () => {
    expect(normalizeEditorialState({ _status: 'published', workflow: 'archived' })).toEqual({ _status: 'draft', workflow: 'archived' })
  })
  it('publicarea resetează etapa de lucru', () => {
    expect(normalizeEditorialState({ _status: 'published', workflow: 'in_review' })).toEqual({ _status: 'published', workflow: 'draft' })
  })
  it('nu modifică un draft obișnuit', () => {
    expect(normalizeEditorialState({ _status: 'draft', workflow: 'in_review' })).toEqual({ _status: 'draft', workflow: 'in_review' })
  })
})
