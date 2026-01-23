import { UpdatePasswordForm } from '@/features/auth/components'

export default function UpdatePasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Set new password</h1>
                    <p className="mt-2 text-gray-600">Enter your new password below</p>
                </div>

                <UpdatePasswordForm />
            </div>
        </div>
    )
}
