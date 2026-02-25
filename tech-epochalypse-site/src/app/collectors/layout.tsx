import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Founding Signals - Tech Epochalypse',
  description:
    'Every network starts with its first connection. Honoring the founding signals of Tech Epochalypse.',
}

export default function CollectorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
