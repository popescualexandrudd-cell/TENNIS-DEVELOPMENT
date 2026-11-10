import type { SiteSetting } from '@/payload-types'

export const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  x: 'X',
}

/** Numai conturi verificate, introduse în Setări site. Fără conturi = nimic afișat. */
export function SocialLinks({ settings, className = '' }: { settings: SiteSetting; className?: string }) {
  const social = (settings.social ?? []).filter((s) => s.url?.startsWith('https://'))
  if (social.length === 0) return null
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      {social.map((s) => (
        <li key={s.url}>
          <a href={s.url} rel="me noopener" target="_blank" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
            {platformLabels[s.platform] ?? s.platform}
          </a>
        </li>
      ))}
    </ul>
  )
}
