import { getTranslations, setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('dashboard')

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-4 text-gray-600">
        {t('welcomeUser', { email: user.email ?? '' })}
      </p>
    </div>
  )
}
