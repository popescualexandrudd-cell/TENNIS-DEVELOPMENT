'use client'

import { Children, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

/** `slide` e un șablon serializabil (vine din componente server): „{n} din {total}”. */
type Labels = { prev: string; next: string; slide: string }
const fill = (tpl: string, n: number, total: number) => tpl.replace('{n}', String(n)).replace('{total}', String(total))

/**
 * Carusel cu efect 3D „coverflow” (decizia 0016), fără bibliotecă:
 * - pista e un scroll orizontal nativ cu `scroll-snap` → funcționează și fără JavaScript, cu touch, trackpad și tastatură;
 * - la derulare, fiecare slide primește rotație, scalare și adâncime după distanța față de centru (doar `transform`/`opacity`);
 * - butoane anterior/următor, bară de progres, săgeți de la tastatură, anunț „2 din 4” pentru cititoarele de ecran;
 * - cu `prefers-reduced-motion: reduce` efectul 3D se oprește și rămâne un scroll simplu.
 */
export function Slider3D({ label, labels, children, tone = 'light' }: { label: string; labels: Labels; children: ReactNode; tone?: 'light' | 'dark' }) {
  const slides = Children.toArray(children)
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [edges, setEdges] = useState({ start: true, end: slides.length <= 1 })
  const id = useId()

  const update = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    setProgress(max > 0 ? track.scrollLeft / max : 1)
    setEdges({ start: track.scrollLeft <= 4, end: track.scrollLeft >= max - 4 })
    const center = track.getBoundingClientRect().left + track.clientWidth / 2
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let best = 0
    let bestDist = Infinity
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement
      const r = el.getBoundingClientRect()
      const d = (r.left + r.width / 2 - center) / r.width // 0 = în centru, ±1 = un slide alături
      if (Math.abs(d) < bestDist) {
        bestDist = Math.abs(d)
        best = i
      }
      if (reduced) {
        el.style.transform = ''
        el.style.opacity = ''
        return
      }
      const c = Math.max(-1.6, Math.min(1.6, d))
      el.style.transform = `perspective(1400px) translateZ(${-Math.abs(c) * 120}px) rotateY(${c * -22}deg) scale(${1 - Math.abs(c) * 0.06})`
      el.style.opacity = String(1 - Math.min(Math.abs(c), 1.4) * 0.35)
    })
    setActive(best)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    // Primul calcul: după ce browserul a așezat elementele (nu sincron în efect).
    frame = requestAnimationFrame(update)
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mq.removeEventListener('change', onScroll)
    }
  }, [update])

  const go = (dir: 1 | -1) => {
    const track = trackRef.current
    const target = track?.children[Math.max(0, Math.min(slides.length - 1, active + dir))] as HTMLElement | undefined
    if (!track || !target) return
    const left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' })
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(-1)
    }
  }

  const ring = tone === 'dark' ? 'border-white/40 text-white hover:border-white' : 'border-control text-ink hover:border-ink'
  return (
    <div role="region" aria-roledescription="carusel" aria-label={label} onKeyDown={onKeyDown} className="slider3d">
      <div ref={trackRef} id={id} className="slider3d-track" aria-live="off">
        {slides.map((slide, i) => (
          <div key={i} className="slider3d-slide" role="group" aria-roledescription="slide" aria-label={fill(labels.slide, i + 1, slides.length)}>
            {slide}
          </div>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="mt-8 flex items-center gap-6">
          <button type="button" onClick={() => go(-1)} disabled={edges.start} aria-controls={id} aria-label={labels.prev} className={`slider3d-btn ${ring}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <div className={`relative h-0.5 flex-1 overflow-hidden rounded-full ${tone === 'dark' ? 'bg-white/20' : 'bg-line'}`} aria-hidden="true">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${tone === 'dark' ? 'bg-white' : 'bg-ink'}`}
              style={{ width: `${Math.max(1 / slides.length, progress) * 100}%`, transition: 'width 200ms var(--ease)' }}
            />
          </div>
          <button type="button" onClick={() => go(1)} disabled={edges.end} aria-controls={id} aria-label={labels.next} className={`slider3d-btn ${ring}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <p className="sr-only" aria-live="polite">
            {fill(labels.slide, active + 1, slides.length)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
