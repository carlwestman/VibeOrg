'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/lib/types'

interface SidebarProps {
  projectName: string
  navigation: NavItem[]
}

export function Sidebar({ projectName, navigation }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-background-secondary">
      {/* Project name */}
      <div className="border-b border-border px-4 py-4">
        <h1 className="truncate text-sm font-semibold text-foreground">
          {projectName || 'VibeOrg'}
        </h1>
        <p className="text-xs text-foreground-secondary">Agent Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground-secondary hover:bg-background hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-foreground-secondary">
          Powered by VibeOrg
        </p>
      </div>
    </aside>
  )
}
