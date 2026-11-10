import type { ReactNode } from 'react'
import type { Media } from '@/payload-types'
import type { Locale } from '@/lib/i18n/config'
import { hasPublicMedia, SectionMedia } from '@/components/SectionMedia'

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
 * Hero cu „scenă 3D” din CSS: panou ardezie cu straturi albastru oțel și portocaliu „în mișcare”.
 * Fără WebGL și fără JavaScript; animația plutitoare se oprește la `prefers-reduced-motion`.
 * O fotografie sau o buclă video (cu drepturi verificate) apare ca un card plutitor deasupra straturilor.
 */
export function HeroStage({ image, locale, children }: { image?: Media | number | string | null; locale: Locale; children: ReactNode }) {
  const photo = hasPublicMedia(image)
  return (
    <div className="hero-stage on-navy flex min-h-[72svh] flex-col justify-between lg:min-h-[80vh]">
      <div className="hero-layers" aria-hidden="true">
        <div className="hero-layer hero-layer-1" />
        <div className="hero-layer hero-layer-2" />
        <div className="hero-layer hero-layer-3">{photo ? null : <CourtOnLayer />}</div>
      </div>
      {photo ? (
        <div className="relative mx-6 mt-6 aspect-[4/3] overflow-hidden rounded-lg shadow-[0_40px_80px_-30px_rgb(28_38_51/0.45)] sm:mx-10 lg:absolute lg:top-[10%] lg:right-[6%] lg:mx-0 lg:mt-0 lg:w-[42%] lg:rotate-[-2deg]">
          <SectionMedia media={image} locale={locale} priority sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
      ) : null}
      <div className="relative isolate mt-auto p-6 sm:p-10 lg:max-w-[62%] lg:p-14">
        {/* Voal ardezie sub titlu (în contextul `isolate` al blocului, deci peste straturi): textul alb rămâne lizibil peste portocaliu */}
        <div
          className="absolute inset-x-0 -top-20 bottom-0 -z-10 bg-[linear-gradient(to_top,rgb(28_38_51/0.96)_0%,rgb(28_38_51/0.92)_72%,transparent_100%)] lg:-inset-x-14 lg:-top-32 lg:-right-40 lg:bg-[radial-gradient(50%_56%_at_40%_62%,rgb(28_38_51/0.95)_0%,rgb(28_38_51/0.88)_55%,transparent_100%)]"
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  )
}
