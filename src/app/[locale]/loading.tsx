export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
