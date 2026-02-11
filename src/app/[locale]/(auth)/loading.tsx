export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Title skeleton */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-4">
          {/* OAuth button skeleton */}
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />

          {/* Divider skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Email input skeleton */}
          <div className="space-y-1.5">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>

          {/* Password input skeleton */}
          <div className="space-y-1.5">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>

          {/* Submit button skeleton */}
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-300" />
        </div>

        {/* Link skeleton */}
        <div className="flex justify-center">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
