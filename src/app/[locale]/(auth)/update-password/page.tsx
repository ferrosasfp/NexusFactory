import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { UpdatePasswordForm } from '@/features/auth/components'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function UpdatePasswordPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <UpdatePasswordContent />
}

function UpdatePasswordContent() {
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('updatePasswordTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('updatePasswordSubtitle')}</p>
        </div>

        <UpdatePasswordForm />
      </div>
    </div>
  )
}
