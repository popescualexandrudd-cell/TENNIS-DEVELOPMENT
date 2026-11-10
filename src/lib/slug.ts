const map: Record<string, string> = { ă: 'a', â: 'a', î: 'i', ș: 's', ş: 's', ț: 't', ţ: 't' }

/** Slug lizibil, fără diacritice: „Pregătire și progres” → „pregatire-si-progres”. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ăâîșşțţ]/g, (c) => map[c] ?? c)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
