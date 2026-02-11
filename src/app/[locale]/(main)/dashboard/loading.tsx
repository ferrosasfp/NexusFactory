export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}
