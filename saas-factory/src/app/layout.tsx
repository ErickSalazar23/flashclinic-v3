import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FlashClinic V3',
  description: 'Intelligent clinic operations platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
