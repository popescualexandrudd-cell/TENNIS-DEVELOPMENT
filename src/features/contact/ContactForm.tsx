'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { track } from '@/components/Analytics'
import { phoneCountries } from './phone'

type Field = 'name' | 'email' | 'phone' | 'requestType' | 'message'
type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string; fields: Field[] }

const stepOneFields: Field[] = ['name', 'email', 'phone']
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const phoneOk = (v: string) => !v.trim() || /^[+\d][\d\s().-]{5,19}$/.test(v.trim())

/**
 * Formular de contact în doi pași (decizia 0016): 1) nume, email, telefon opțional cu prefix; 2) tipul cererii și mesajul.
 * Ambii pași sunt în același <form>, deci se trimite o singură cerere; validarea finală rămâne pe server.
 */
export function ContactForm({ locale, t, privacyHref }: { locale: Locale; t: Dictionary['contact']; privacyHref: string | null }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [step, setStep] = useState<1 | 2>(1)
  const statusRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const invalid = (f: Field) => state.kind === 'error' && state.fields.includes(f)
  const errorMessages: Record<Field, string> = {
    name: t.fieldErrors.name,
    email: t.fieldErrors.email,
    phone: t.fieldErrors.phone,
    requestType: t.fieldErrors.type,
    message: t.fieldErrors.message,
  }
  const focusStatus = () => requestAnimationFrame(() => statusRef.current?.focus())

  function goNext() {
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    const fields: Field[] = []
    if (String(data.get('name') ?? '').trim().length < 2) fields.push('name')
    if (!emailOk(String(data.get('email') ?? ''))) fields.push('email')
    if (!phoneOk(String(data.get('phone') ?? ''))) fields.push('phone')
    if (fields.length) {
      setState({ kind: 'error', message: t.errorValidation, fields })
      focusStatus()
      return
    }
    setState({ kind: 'idle' })
    setStep(2)
    requestAnimationFrame(() => form.querySelector<HTMLInputElement>('input[name="requestType"]:checked')?.focus())
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step === 1) return goNext()
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
        setStep(1)
        setState({ kind: 'success' })
        track('contact_submit_success', { type: String(data.requestType ?? '') })
      } else if (res.status === 429) {
        setState({ kind: 'error', message: t.errorRateLimit, fields: [] })
      } else if (body.error === 'validation') {
        const fields = body.fields ?? []
        if (fields.some((f) => stepOneFields.includes(f))) setStep(1)
        setState({ kind: 'error', message: t.errorValidation, fields })
      } else {
        setState({ kind: 'error', message: t.errorGeneric, fields: [] })
      }
    } catch {
      setState({ kind: 'error', message: t.errorGeneric, fields: [] })
    }
    focusStatus()
  }

  const describedBy = (f: Field, hint?: string) => [hint, invalid(f) ? `err-${f}` : undefined].filter(Boolean).join(' ') || undefined
  const error = (f: Field) =>
    invalid(f) ? (
      <p id={`err-${f}`} className="mt-1 text-sm text-coral-text">
        {errorMessages[f]}
      </p>
    ) : null

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby="contact-status">
      {/* Indicator de pași: 1 —— 2 */}
      <div className="flex items-center gap-3" aria-hidden="true">
        {[1, 2].map((n, i) => (
          <div key={n} className={`flex items-center gap-3 ${i === 0 ? 'flex-1' : ''}`}>
            <span
              className={`inline-flex size-10 items-center justify-center rounded-full border-[1.5px] text-sm font-bold transition-colors ${
                step >= n ? 'border-ink bg-ink text-background' : 'border-control text-muted'
              }`}
            >
              {n}
            </span>
            <span className="hidden text-sm font-semibold sm:inline">{t.stepNames[n - 1]}</span>
            {i === 0 ? <span className={`h-px flex-1 ${step === 2 ? 'bg-ink' : 'bg-line'}`} /> : null}
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {t.stepOf.replace('{n}', String(step))}: {t.stepNames[step - 1]}
      </p>

      <div ref={statusRef} id="contact-status" tabIndex={-1} role="status" aria-live="polite" className="outline-none empty:hidden">
        {state.kind === 'success' ? (
          <p className="rounded-md border-l-4 border-navy bg-panel p-4 font-semibold">{t.success}</p>
        ) : state.kind === 'error' ? (
          <p className="rounded-md border-l-4 border-coral-text bg-panel p-4 font-semibold">{state.message}</p>
        ) : null}
      </div>

      {/* Pasul 1 */}
      <div hidden={step !== 1} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-name" className="field-label">
              {t.name} <span className="text-sm font-normal text-muted">({t.required})</span>
            </label>
            <input id="cf-name" name="name" autoComplete="name" required minLength={2} maxLength={120} className="field-input" aria-invalid={invalid('name')} aria-describedby={describedBy('name')} />
            {error('name')}
          </div>
          <div>
            <label htmlFor="cf-email" className="field-label">
              {t.email} <span className="text-sm font-normal text-muted">({t.required})</span>
            </label>
            <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={254} className="field-input" aria-invalid={invalid('email')} aria-describedby={describedBy('email')} />
            {error('email')}
          </div>
        </div>
        <div>
          <span className="field-label" id="cf-phone-label">
            {t.phone} <span className="text-sm font-normal text-muted">({t.optional})</span>
          </span>
          <div className="grid grid-cols-[minmax(7.5rem,auto)_1fr] gap-3">
            <label htmlFor="cf-phone-country" className="sr-only">
              {t.phoneCountry}
            </label>
            <select id="cf-phone-country" name="phoneCountry" defaultValue="RO" className="field-input appearance-none bg-[length:14px] pr-8">
              {phoneCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code === 'other' ? t.countryOther : `${c.code} ${c.dial}`}
                </option>
              ))}
            </select>
            <input
              id="cf-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={20}
              aria-labelledby="cf-phone-label"
              className="field-input"
              aria-invalid={invalid('phone')}
              aria-describedby={describedBy('phone')}
            />
          </div>
          {error('phone')}
        </div>
        <div>
          <button type="button" onClick={goNext} className="btn btn-primary w-full sm:w-auto sm:min-w-64">
            {t.next} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Pasul 2 */}
      <div hidden={step !== 2} className="grid gap-5">
        <fieldset aria-describedby={describedBy('requestType')}>
          <legend className="field-label">
            {t.type} <span className="text-sm font-normal text-muted">({t.required})</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {(['coaching', 'collaboration', 'other'] as const).map((value, i) => (
              <label key={value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-control px-4 has-[:checked]:border-coral-text has-[:checked]:bg-coral/10">
                <input type="radio" name="requestType" value={value} defaultChecked={i === 0} required className="size-5 accent-[var(--color-coral)]" />
                {t.types[value]}
              </label>
            ))}
          </div>
          {error('requestType')}
        </fieldset>

        <div>
          <label htmlFor="cf-message" className="field-label">
            {t.message} <span className="text-sm font-normal text-muted">({t.required})</span>
          </label>
          <textarea id="cf-message" name="message" required minLength={10} maxLength={4000} rows={6} className="field-input" aria-invalid={invalid('message')} aria-describedby={describedBy('message')} />
          {error('message')}
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

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
            <span aria-hidden="true">←</span> {t.back}
          </button>
          <button type="submit" className="btn btn-primary flex-1 sm:flex-none sm:min-w-64" disabled={state.kind === 'sending'}>
            {state.kind === 'sending' ? t.sending : t.submit}
          </button>
        </div>
      </div>

      {/* Honeypot: ascuns vizual și pentru tehnologii asistive */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
    </form>
  )
}
