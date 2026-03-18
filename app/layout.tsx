import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PropertyPro',
  description: 'Property management system for tenants, leases, and maintenance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
