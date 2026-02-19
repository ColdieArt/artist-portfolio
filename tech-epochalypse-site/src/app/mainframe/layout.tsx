import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Mainframe — Tech Epochalypse',
  description:
    'The nerve center of Tech Epochalypse. Live intelligence, community exports, and founding signals.',
}

export default function MainframeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
