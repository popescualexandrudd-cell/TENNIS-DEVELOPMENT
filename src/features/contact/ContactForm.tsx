'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { track } from '@/components/Analytics'

type Field = 'name' | 'email' | 'requestType' | 'message'
type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string; fields: Field[] }

export function ContactForm({ locale, t, privacyHref }: { locale: Locale; t: Dictionary['contact']; privacyHref: string | null }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const statusRef = useRef<HTMLDivElement>(null)
  const invalid = (f: Field) => state.kind === 'error' && state.fields.includes(f)
  const errorMessages: Record<Field, string> = {
    name: t.fieldErrors.name,
    email: t.fieldErrors.email,
    requestType: t.fieldErrors.type,
    message: t.fieldErrors.message,
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState({ kind: 'sending' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Field[] }
      if (res.status === 201 && body.ok) {
        form.reset()
        setState({ kind: 'success' })
        track('contact_submit_success', { type: String(data.requestType ?? '') })
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

  const describedBy = (f: Field) => (invalid(f) ? `err-${f}` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby="contact-status">
      <div ref={statusRef} id="contact-status" tabIndex={-1} role="status" aria-live="polite" className="outline-none empty:hidden">
        {state.kind === 'success' ? (
          <p className="rounded-md border-l-4 border-brand bg-surface p-4 font-semibold">{t.success}</p>
        ) : state.kind === 'error' ? (
          <p className="rounded-md border-l-4 border-coral-ink bg-surface p-4 font-semibold">{state.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="field-label">
            {t.name} <span className="text-sm font-normal text-muted">({t.required})</span>
          </label>
          <input id="cf-name" name="name" autoComplete="name" required minLength={2} maxLength={120} className="field-input" aria-invalid={invalid('name')} aria-describedby={describedBy('name')} />
          {invalid('name') ? <p id="err-name" className="mt-1 text-sm text-coral-ink">{errorMessages.name}</p> : null}
        </div>
        <div>
          <label htmlFor="cf-email" className="field-label">
            {t.email} <span className="text-sm font-normal text-muted">({t.required})</span>
          </label>
          <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={254} className="field-input" aria-invalid={invalid('email')} aria-describedby={describedBy('email')} />
          {invalid('email') ? <p id="err-email" className="mt-1 text-sm text-coral-ink">{errorMessages.email}</p> : null}
        </div>
      </div>

      <fieldset aria-describedby={describedBy('requestType')}>
        <legend className="field-label">
          {t.type} <span className="text-sm font-normal text-muted">({t.required})</span>
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {(['coaching', 'collaboration', 'other'] as const).map((value, i) => (
            <label key={value} className="inline-flex min-h-11 cursor-pointer items-center gap-2">
              <input type="radio" name="requestType" value={value} defaultChecked={i === 0} required className="size-5 accent-[var(--color-brand-primary)]" />
              {t.types[value]}
            </label>
          ))}
        </div>
        {invalid('requestType') ? <p id="err-requestType" className="mt-1 text-sm text-coral-ink">{errorMessages.requestType}</p> : null}
      </fieldset>

      <div>
        <label htmlFor="cf-message" className="field-label">
          {t.message} <span className="text-sm font-normal text-muted">({t.required})</span>
        </label>
        <textarea id="cf-message" name="message" required minLength={10} maxLength={4000} rows={6} className="field-input" aria-invalid={invalid('message')} aria-describedby={describedBy('message')} />
        {invalid('message') ? <p id="err-message" className="mt-1 text-sm text-coral-ink">{errorMessages.message}</p> : null}
      </div>

      {/* Honeypot: ascuns vizual și pentru tehnologii asistive */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
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
        <button type="submit" className="btn btn-primary" disabled={state.kind === 'sending'}>
          {state.kind === 'sending' ? t.sending : t.submit}
        </button>
      </div>
    </form>
  )
}
