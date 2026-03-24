import './globals.css'
import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { getConfig } from '@/lib/config'
import { getNavigation } from '@/lib/fs-reader'

export const metadata: Metadata = {
  title: 'VibeOrg Dashboard',
  description: 'AI Agent Team Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = getConfig()
  const navigation = getNavigation()
  const projectName = config?.project.name || 'VibeOrg'
  const themeMode = config?.theme.mode || 'dark'

  return (
    <html lang="en" className={themeMode === 'light' ? 'light' : ''}>
      <body className="flex h-screen overflow-hidden">
        <Sidebar projectName={projectName} navigation={navigation} />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <Breadcrumbs />
          <div className="flex-1 px-6 py-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
