export default function MainLoading() {
  return (
    <div className="min-h-screen p-8">
      {/* Page title skeleton */}
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-5 w-72 animate-pulse rounded bg-gray-200" />

      {/* Content area skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 p-6"
          >
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
