/** Wordmark tipografic „DANIEL POPESCU”. Variantele SVG sunt în public/brand/. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-[0.95rem] font-extrabold tracking-[0.16em] uppercase sm:text-base ${className}`}>
      Daniel Popescu
    </span>
  )
}
