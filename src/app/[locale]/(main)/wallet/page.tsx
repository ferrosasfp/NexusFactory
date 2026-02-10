import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ConnectWallet, WalletInfo, NetworkSwitcher, SmartAccountInfo } from '@/features/wallet/components'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function WalletPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <WalletContent />
}

function WalletContent() {
  const t = useTranslations('wallet')

  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <div className="max-w-lg space-y-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('externalWallet')}</h2>
          <ConnectWallet />
          <div className="mt-4">
            <WalletInfo />
          </div>
        </section>

        <section>
          <NetworkSwitcher />
        </section>

        <section>
          <SmartAccountInfo />
        </section>
      </div>
    </div>
  )
}
