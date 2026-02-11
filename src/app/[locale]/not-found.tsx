import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('common')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-300">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {t('notFound')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('notFoundMessage')}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  )
}
