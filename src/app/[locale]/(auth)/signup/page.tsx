import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { SignupForm } from '@/features/auth/components'
import { Link } from '@/i18n/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function SignupPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SignupContent />
}

function SignupContent() {
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('signupTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('signupSubtitle')}</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-gray-600">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
