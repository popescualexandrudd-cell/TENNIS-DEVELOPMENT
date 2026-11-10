import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'

export default function NotFound() {
  const t = getDictionary('ro').notFound
  return (
    <section className="container-site section">
      <p className="eyebrow">404</p>
      <h1 className="display h-section mt-3">{t.title}</h1>
      <p className="mt-4 text-lg text-muted">{t.body}</p>
      <Link href="/ro" className="link-arrow mt-6">
        {t.back} <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
