import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ContractReader, ContractWriter } from '@/features/contracts/components'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ContractsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ContractsPageContent />
}

function ContractsPageContent() {
  const t = useTranslations('contracts')

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <section className="space-y-4">
        <ContractReader />
      </section>

      <section className="space-y-4">
        <ContractWriter />
      </section>
    </div>
  )
}
