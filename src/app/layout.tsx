import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexusFactory',
  description: 'The nexus between Web2 and Web3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
