import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CheckEmailPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CheckEmailContent />
}

function CheckEmailContent() {
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <h1 className="text-3xl font-bold">{t('checkEmailTitle')}</h1>
        <p className="text-gray-600">{t('checkEmailMessage')}</p>
        <Link
          href="/login"
          className="inline-block text-blue-600 hover:underline"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  )
}
