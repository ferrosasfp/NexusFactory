import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/routing'

/**
 * Root page — redirects to the default locale.
 * This ensures visiting "/" always lands on "/en" (or the configured default).
 * The middleware also handles this, but this page acts as a safety net.
 */
export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
