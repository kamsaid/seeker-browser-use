import type { Metadata } from 'next'
import './globals.css'
import { VMProvider } from '@/vm'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Seeker',
  description: 'Browser automation with Computer-Use and Browser-Use APIs',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <VMProvider autoCreate={false}>
            {children}
          </VMProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
