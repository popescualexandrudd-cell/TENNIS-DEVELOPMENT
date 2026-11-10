'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

// Clipul rulează doar pe ecrane ≥ 768 px, fără „reducere mișcare” și fără „economisire date”.
const QUERY = '(prefers-reduced-motion: no-preference) and (min-width: 768px)'
const saveData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const canPlay = () => window.matchMedia(QUERY).matches && !saveData()

/**
 * Buclă video scurtă, fără sunet, peste imaginea de previzualizare (care rămâne singură pe telefon).
 * Pornește doar când e vizibilă pe ecran și are buton de pauză (WCAG 2.2.2). Decorativă: textul alternativ e pe imagine.
 */
export function LoopVideo({ src, type, labels }: { src: string; type: string; labels: { pause: string; play: string } }) {
  const enabled = useSyncExternalStore(subscribe, canPlay, () => false)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  // Ref callback: pornește/oprește clipul după vizibilitate, fără efecte cu setState.
  const attach = (video: HTMLVideoElement | null) => {
    observer.current?.disconnect()
    if (!video) return
    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && video.dataset.userPaused !== 'true') void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.current.observe(video)
  }

  if (!enabled) return null
  return (
    <>
      <video
        ref={attach}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? 'opacity-100' : 'opacity-0'}`}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        data-user-paused={userPaused ? 'true' : 'false'}
        onPlaying={() => setPlaying(true)}
      >
        <source src={src} type={type} />
      </video>
      <button
        type="button"
        onClick={(e) => {
          const video = e.currentTarget.previousElementSibling as HTMLVideoElement | null
          if (!video) return
          if (userPaused) void video.play().catch(() => {})
          else video.pause()
          setUserPaused(!userPaused)
        }}
        aria-label={userPaused ? labels.play : labels.pause}
        className="absolute right-4 bottom-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          {userPaused ? <path d="M7 4.5v15l13-7.5z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}
        </svg>
      </button>
    </>
  )
}
