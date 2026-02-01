'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, GraduationCap, Tags, FileText, User, Settings, Menu, Pencil, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pages', label: 'Pages', icon: FileCode },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/curriculum', label: 'Curriculum', icon: GraduationCap },
  { href: '/admin/profile', label: 'Profile', icon: User },
  { href: '/admin/menu', label: 'Menu', icon: Menu },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
