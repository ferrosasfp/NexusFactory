import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NexusFactory',
  description: 'The nexus between Web2 and Web3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
