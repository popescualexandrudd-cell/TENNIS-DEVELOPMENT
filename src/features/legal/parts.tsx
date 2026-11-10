import type { ReactNode } from 'react'

/** Valoare din Setări site sau, dacă lipsește, un marcaj vizibil „de completat” (apare doar în afara producției). */
export function V({ value, label }: { value?: string | number | null; label: string }) {
  if (value !== null && value !== undefined && String(value).trim() !== '') return <>{value}</>
  return <mark className="rounded-sm bg-coral/25 px-1 font-semibold text-ink">⟨de completat: {label}⟩</mark>
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

export function MailLink({ email }: { email?: string | null }) {
  return email ? <a href={`mailto:${email}`}>{email}</a> : <V value={null} label="email pentru date personale" />
}
