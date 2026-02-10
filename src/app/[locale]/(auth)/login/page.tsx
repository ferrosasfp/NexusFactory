import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { LoginForm } from '@/features/auth/components'
import { Link } from '@/i18n/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LoginContent />
}

function LoginContent() {
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('loginTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('loginSubtitle')}</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-600">
          {t('noAccount')}{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            {t('signupLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
