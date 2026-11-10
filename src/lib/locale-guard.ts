import 'server-only'
import { notFound } from 'next/navigation'
import type { Locale } from './i18n/config'
import { isLocaleEnabled } from './content'

/** 404 pentru orice rută a unei limbi care nu este publică. */
export async function ensureLocale(locale: Locale): Promise<void> {
  if (!(await isLocaleEnabled(locale))) notFound()
}
