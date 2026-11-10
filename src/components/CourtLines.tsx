/**
 * Motiv grafic decorativ: liniile unui teren de tenis, văzute de sus, în paleta site-ului.
 * Folosit când nu există încă o fotografie reală — nu sugerează o persoană sau un antrenament.
 */
export function CourtLines({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 780" className={className} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="360" height="780" fill="#1A2A4A" />
      <g fill="none" stroke="#DCE8F5" strokeWidth="4" opacity="0.85">
        <rect x="30" y="30" width="300" height="720" />
        <line x1="67.5" y1="30" x2="67.5" y2="750" />
        <line x1="292.5" y1="30" x2="292.5" y2="750" />
        <line x1="67.5" y1="222" x2="292.5" y2="222" />
        <line x1="67.5" y1="558" x2="292.5" y2="558" />
        <line x1="180" y1="222" x2="180" y2="558" />
        <line x1="180" y1="30" x2="180" y2="42" />
        <line x1="180" y1="738" x2="180" y2="750" />
      </g>
      <line x1="14" y1="390" x2="346" y2="390" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="2 5" opacity="0.6" />
      <circle cx="238" cy="300" r="9" fill="var(--color-accent-coral)" />
    </svg>
  )
}
