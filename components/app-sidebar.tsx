'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Brain,
  TrendingUp,
  MessageSquare,
  GraduationCap,
  User,
  Settings,
  LogOut,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard',                  label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/dashboard/upload',           label: 'Upload Test',     icon: Upload          },
  { href: '/dashboard/analysis',         label: 'Analysis',        icon: BarChart3       },
  { href: '/dashboard/recommendations',  label: 'AI Recommendations', icon: Brain        },
  { href: '/dashboard/progress',         label: 'Progress',        icon: TrendingUp      },
  { href: '/dashboard/assistant',        label: 'AI Assistant',    icon: MessageSquare   },
  { href: '/dashboard/exam-insights',    label: 'Exam Insights',   icon: GraduationCap   },
]

const bottomItems = [
  { href: '/dashboard/profile',  label: 'Profile',  icon: User     },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

/* ── Dark / Light toggle ── */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 w-full opacity-0 select-none">
      <Sun className="h-4 w-4" />
      <span className="text-sm font-medium">Theme</span>
    </div>
  )

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full',
        'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
    >
      {isDark
        ? <Sun  className="h-4 w-4 shrink-0" />
        : <Moon className="h-4 w-4 shrink-0" />
      }
      <span className="flex-1 text-left">{isDark ? 'Light mode' : 'Dark mode'}</span>
      {/* mini pill toggle */}
      <span className={cn(
        'relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors duration-300 shrink-0',
        isDark ? 'bg-primary' : 'bg-sidebar-foreground/20'
      )}>
        <span className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300',
          isDark ? 'translate-x-4' : 'translate-x-0'
        )} />
      </span>
    </button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <BookOpen className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">Score Sense</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="px-3 py-4 flex flex-col gap-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {/* ── Dark / Light mode toggle ── */}
        <ThemeToggle />

        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
