'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Upload, BarChart3, Brain, TrendingUp, MessageSquare,
  GraduationCap, User, Settings, LogOut, BookOpen, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/upload', label: 'Upload Test', icon: Upload },
  { href: '/dashboard/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/dashboard/recommendations', label: 'AI Recommendations', icon: Brain },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/assistant', label: 'AI Assistant', icon: MessageSquare },
  { href: '/dashboard/exam-insights', label: 'Exam Insights', icon: GraduationCap },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="flex lg:hidden items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <BookOpen className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">ExamIQ</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center gap-2 px-6 py-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ExamIQ</span>
          </div>
          <nav className="flex flex-col gap-1 px-3 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent/20 text-primary'
                      : 'text-foreground/70 hover:bg-accent/10 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-3 px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-accent/10 w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
