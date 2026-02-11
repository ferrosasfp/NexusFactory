'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { updatePassword } from '@/actions/auth'

export function UpdatePasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const t = useTranslations('auth')
    const locale = useLocale()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError(t('passwordsMismatch'))
            setLoading(false)
            return
        }

        formData.set('locale', locale)
        const result = await updatePassword(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="password" className="block text-sm font-medium">
                    {t('newPassword')}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    {t('confirmPassword')}
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? t('updating') : t('updatePassword')}
            </button>
        </form>
    )
}
