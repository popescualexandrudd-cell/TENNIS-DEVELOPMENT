/** Wordmark tipografic „DANIEL POPESCU”. Variantele SVG sunt în public/brand/. */
export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`font-display text-[0.9rem] font-[800] tracking-[0.08em] uppercase sm:text-[0.95rem] ${className}`}>Daniel Popescu</span>
}
