import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { FileUploader, StorageViewer } from '@/features/storage/components'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function StoragePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <StoragePageContent />
}

function StoragePageContent() {
  const t = useTranslations('storage')

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-gray-600">{t('description')}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('upload')}</h2>
        <FileUploader />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('viewer')}</h2>
        <StorageViewer />
      </section>
    </div>
  )
}
