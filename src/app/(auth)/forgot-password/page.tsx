import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Reset password</h1>
                    <p className="mt-2 text-gray-600">Enter your email to receive a reset link</p>
                </div>

                <ForgotPasswordForm />

                <p className="text-center text-sm text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    )
}
