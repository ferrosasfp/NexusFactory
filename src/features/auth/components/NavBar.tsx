'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { signout } from '@/actions/auth'

const NAV_ITEMS = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/wallet', key: 'wallet' },
  { href: '/contracts', key: 'contracts' },
  { href: '/storage', key: 'storage' },
] as const

export function NavBar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleSignout() {
    await signout(locale)
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-lg font-bold text-gray-900">
            NexusFactory
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {t(key)}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 sm:flex">
            {/* Locale switcher */}
            <Link
              href={pathname}
              locale={locale === 'en' ? 'es' : 'en'}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              {locale === 'en' ? 'ES' : 'EN'}
            </Link>

            <button
              type="button"
              onClick={handleSignout}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              {t('signout')}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-50 sm:hidden"
            aria-label={t('menu')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 sm:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {NAV_ITEMS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(href)
                    ? 'bg-gray-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <Link
                href={pathname}
                locale={locale === 'en' ? 'es' : 'en'}
                className="rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
              >
                {locale === 'en' ? 'Español' : 'English'}
              </Link>
              <button
                type="button"
                onClick={handleSignout}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {t('signout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
