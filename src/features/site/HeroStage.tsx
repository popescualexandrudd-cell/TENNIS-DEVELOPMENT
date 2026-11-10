import type { ReactNode } from 'react'
import type { Media } from '@/payload-types'
import { hasPublicImage, MediaImage } from '@/components/MediaImage'

/** Liniile terenului, desenate pe stratul de sus (decorativ). */
function CourtOnLayer() {
  return (
    <svg viewBox="0 0 1200 640" className="absolute inset-[6%] h-[88%] w-[88%]" aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <g fill="none" stroke="#FFFFFF" strokeWidth="5" opacity="0.5">
        <rect x="40" y="40" width="1120" height="560" rx="6" />
        <line x1="40" y1="110" x2="1160" y2="110" />
        <line x1="40" y1="530" x2="1160" y2="530" />
        <line x1="320" y1="110" x2="320" y2="530" />
        <line x1="880" y1="110" x2="880" y2="530" />
        <line x1="320" y1="320" x2="880" y2="320" />
      </g>
      <line x1="600" y1="20" x2="600" y2="620" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="3 10" opacity="0.7" />
      <circle cx="790" cy="215" r="16" fill="#E2C84B" />
    </svg>
  )
}

/**
 * Hero cu „scenă 3D” din CSS: straturi ardezie, albastru oțel și portocaliu „în mișcare”, pe fundal albicios.
 * Fără WebGL și fără JavaScript; animația plutitoare se oprește la `prefers-reduced-motion`.
 * O fotografie reală (cu drepturi verificate) apare ca un card plutitor deasupra straturilor.
 */
export function HeroStage({ image, children }: { image?: Media | number | string | null; children: ReactNode }) {
  const photo = hasPublicImage(image)
  return (
    <div className="hero-stage flex min-h-[72svh] flex-col justify-between lg:min-h-[80vh]">
      <div className="hero-layers" aria-hidden="true">
        <div className="hero-layer hero-layer-1" />
        <div className="hero-layer hero-layer-2" />
        <div className="hero-layer hero-layer-3">{photo ? null : <CourtOnLayer />}</div>
      </div>
      {photo ? (
        <div className="relative mx-6 mt-6 aspect-[4/3] overflow-hidden rounded-lg shadow-[0_40px_80px_-30px_rgb(28_38_51/0.45)] sm:mx-10 lg:absolute lg:top-[10%] lg:right-[6%] lg:mx-0 lg:mt-0 lg:w-[42%] lg:rotate-[-2deg]">
          <MediaImage media={image} fill priority sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
      ) : null}
      <div className="relative mt-auto p-6 sm:p-10 lg:max-w-[62%] lg:p-14">
        {/* Voal albicios sub titlu: păstrează lizibilitatea peste liniile terenului */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_90%_at_20%_80%,rgb(250_252_254/0.92),rgb(250_252_254/0.55)_55%,transparent_80%)]" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
