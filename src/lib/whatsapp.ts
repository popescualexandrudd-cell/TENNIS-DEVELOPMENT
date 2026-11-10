/**
 * Număr de telefon → format internațional, doar cifre (cerut de wa.me). Acceptă „0726 409 988”, „+40 726…”, „0040…”.
 * Numerele naționale românești (0 + 9 cifre) primesc prefixul 40. Întoarce null pentru ceva ce nu pare un număr valid.
 */
export function whatsappNumber(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  let digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) {
    // deja internațional
  } else if (digits.startsWith('00')) {
    digits = digits.slice(2)
  } else if (digits.length === 10 && digits.startsWith('0')) {
    digits = `40${digits.slice(1)}`
  }
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null
}

/** Link „click to chat” oficial WhatsApp, cu un mesaj de început opțional (vizitatorul îl poate modifica înainte de trimitere). */
export function whatsappLink(input: string | null | undefined, message?: string): string | null {
  const number = whatsappNumber(input)
  if (!number) return null
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

/** Afișare lizibilă pentru numere românești: 0726 409 988. */
export function formatPhoneRo(input: string): string {
  const n = whatsappNumber(input)
  if (n?.startsWith('40') && n.length === 11) return `0${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`
  return input.trim()
}
