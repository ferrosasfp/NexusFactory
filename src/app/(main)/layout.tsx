export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Nav, Sidebar, etc. */}
      <main>{children}</main>
    </div>
  )
}
