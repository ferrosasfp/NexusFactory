import Link from 'next/link'

export default function CheckEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 p-8 text-center">
                <h1 className="text-3xl font-bold">Check your email</h1>
                <p className="text-gray-600">
                    We&apos;ve sent you a confirmation link. Please check your email to complete your registration.
                </p>
                <Link
                    href="/login"
                    className="inline-block text-blue-600 hover:underline"
                >
                    Back to login
                </Link>
            </div>
        </div>
    )
}
