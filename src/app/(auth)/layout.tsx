export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout para rutas de autenticación */}
      {children}
    </div>
  )
}
