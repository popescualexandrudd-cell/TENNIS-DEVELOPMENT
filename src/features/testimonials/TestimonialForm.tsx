'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { track } from '@/components/Analytics'
import type { TestimonialField } from './schema'

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string; fields: TestimonialField[] }

/** Formular public „Lasă o părere”. Trimite la `/api/feedback`; părerea apare pe site doar după aprobare. */
export function TestimonialForm({ locale, t, privacyHref }: { locale: Locale; t: Dictionary['testimonialForm']; privacyHref: string | null }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const statusRef = useRef<HTMLDivElement>(null)
  const invalid = (f: TestimonialField) => state.kind === 'error' && state.fields.includes(f)
  const describedBy = (f: TestimonialField, hint?: string) => [hint, invalid(f) ? `tf-err-${f}` : undefined].filter(Boolean).join(' ') || undefined
  const error = (f: TestimonialField) =>
    invalid(f) ? (
      <p id={`tf-err-${f}`} className="mt-1 text-sm text-coral-text">
        {t.fieldErrors[f]}
      </p>
    ) : null

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState({ kind: 'sending' })
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, consent: data.consent === 'on', locale }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: TestimonialField[] }
      if (res.status === 201 && body.ok) {
        form.reset()
        setState({ kind: 'success' })
        track('testimonial_submit_success')
      } else if (res.status === 429) {
        setState({ kind: 'error', message: t.errorRateLimit, fields: [] })
      } else if (body.error === 'validation') {
        setState({ kind: 'error', message: t.errorValidation, fields: body.fields ?? [] })
      } else {
        setState({ kind: 'error', message: t.errorGeneric, fields: [] })
      }
    } catch {
      setState({ kind: 'error', message: t.errorGeneric, fields: [] })
    }
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby="testimonial-status">
      <div ref={statusRef} id="testimonial-status" tabIndex={-1} role="status" aria-live="polite" className="outline-none empty:hidden">
        {state.kind === 'success' ? (
          <p className="rounded-md border-l-4 border-navy bg-panel p-4 font-semibold">{t.success}</p>
        ) : state.kind === 'error' ? (
          <p className="rounded-md border-l-4 border-coral-text bg-panel p-4 font-semibold">{state.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="tf-name" className="field-label">
            {t.name} <span className="text-sm font-normal text-muted">({t.required})</span>
          </label>
          <input id="tf-name" name="name" autoComplete="name" required minLength={2} maxLength={80} className="field-input" aria-invalid={invalid('name')} aria-describedby={describedBy('name')} />
          {error('name')}
        </div>
        <div>
          <label htmlFor="tf-role" className="field-label">
            {t.role} <span className="text-sm font-normal text-muted">({t.optional})</span>
          </label>
          <input id="tf-role" name="role" maxLength={120} className="field-input" aria-invalid={invalid('role')} aria-describedby={describedBy('role', 'tf-role-hint')} />
          <p id="tf-role-hint" className="mt-1 text-sm text-muted">
            {t.roleHint}
          </p>
          {error('role')}
        </div>
      </div>

      <div>
        <label htmlFor="tf-quote" className="field-label">
          {t.quote} <span className="text-sm font-normal text-muted">({t.required})</span>
        </label>
        <textarea id="tf-quote" name="quote" required minLength={20} maxLength={600} rows={5} className="field-input" aria-invalid={invalid('quote')} aria-describedby={describedBy('quote')} />
        {error('quote')}
      </div>

      <div>
        <label htmlFor="tf-email" className="field-label">
          {t.email} <span className="text-sm font-normal text-muted">({t.optional})</span>
        </label>
        <input id="tf-email" name="email" type="email" autoComplete="email" maxLength={254} className="field-input" aria-invalid={invalid('email')} aria-describedby={describedBy('email', 'tf-email-hint')} />
        <p id="tf-email-hint" className="mt-1 text-sm text-muted">
          {t.emailHint}
        </p>
        {error('email')}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-1 size-5 shrink-0 accent-[var(--color-coral)]" aria-invalid={invalid('consent')} aria-describedby={describedBy('consent')} />
          <span>{t.consent}</span>
        </label>
        {error('consent')}
      </div>

      {/* Honeypot: ascuns vizual și pentru tehnologii asistive */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="tf-website">Website</label>
        <input id="tf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-sm text-muted">
        {t.privacyNote}{' '}
        {privacyHref ? (
          <Link href={privacyHref} className="underline">
            {t.privacyLink}
          </Link>
        ) : (
          t.privacyLink
        )}
        .
      </p>

      <div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto sm:min-w-64" disabled={state.kind === 'sending'}>
          {state.kind === 'sending' ? t.sending : t.submit}
        </button>
      </div>
    </form>
  )
}
