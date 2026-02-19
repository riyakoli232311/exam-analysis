'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Settings, Loader2, Check, User, Palette, Sun, Moon } from 'lucide-react'
import { EXAM_TYPES } from '@/lib/constants'
import { useTheme } from 'next-themes'

const fetcher = (url: string) => fetch(url).then(r => r.json())

/* ─────────────────────────────────────────
   SVG background
───────────────────────────────────────── */
function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute -top-56 -left-56 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[160px]" />
      <div className="absolute top-1/3 -right-56 w-[640px] h-[640px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="absolute -bottom-56 left-1/3 w-[540px] h-[540px] rounded-full bg-chart-3/10 blur-[120px]" />

      <svg className="absolute inset-0 w-full h-full text-foreground" style={{ opacity: 0.055 }} aria-hidden="true">
        <defs>
          <pattern id="st-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <pattern id="st-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="15,2 45,2 60,28 45,54 15,54 0,28" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
          <pattern id="st-hatch" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#st-dots)" />
        <g opacity="0.5" transform="translate(56%, -5%) scale(1.1)">
          <rect width="600" height="480" fill="url(#st-hex)" />
        </g>
        <g opacity="0.35" transform="translate(-2%, 68%)">
          <rect width="340" height="300" fill="url(#st-hatch)" />
        </g>
        <circle cx="92%" cy="9%"  r="200" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.4" />
        <circle cx="92%" cy="9%"  r="140" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" strokeDasharray="6 5" />
        <circle cx="5%"  cy="88%" r="130" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <circle cx="5%"  cy="88%" r="80"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.18" strokeDasharray="4 6" />
        <circle cx="50%" cy="4%"  r="65"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"  strokeDasharray="4 6" />
        {([[17,27],[75,16],[37,71],[87,79],[61,44],[22,48]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.42">
            <line x1="-7" y1="0" x2="7" y2="0" stroke="currentColor" strokeWidth="1.1" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" strokeWidth="1.1" />
          </g>
        ))}
        {([[24,9],[71,64],[13,59],[84,39]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.32">
            <polygon points="0,-11 9,0 0,11 -9,0" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </g>
        ))}
        <path d="M -80 900 Q 640 580 1520 840" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.14" strokeDasharray="8 6" />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────
   Glass card
───────────────────────────────────────── */
function GlassCard({
  children,
  className = '',
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const glowMap: Record<string, string> = {
    blue:   'before:bg-primary/25',
    green:  'before:bg-accent/25',
    amber:  'before:bg-chart-3/25',
    purple: 'before:bg-chart-4/25',
  }
  return (
    <div className={[
      'relative overflow-hidden rounded-2xl',
      'border border-white/25 dark:border-white/8',
      'bg-white/65 dark:bg-white/[0.04]',
      'backdrop-blur-xl',
      'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.75)]',
      'dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]',
      'transition-all duration-300',
      glow ? `before:absolute before:inset-0 before:opacity-30 before:blur-2xl before:-z-10 ${glowMap[glow]}` : '',
      className,
    ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { data: userData, mutate } = useSWR('/api/auth/me', fetcher)
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedExam, setSelectedExam] = useState('')

  const user = userData?.user || {}

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || undefined,
          selectedExam: selectedExam || undefined,
        }),
      })
      mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const isDark = theme === 'dark'

  return (
    <>
      <SceneBackground />

      <div className="flex flex-col gap-5 max-w-2xl relative">

        {/* ── Page header ── */}
        <GlassCard className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and preferences</p>
            </div>
          </div>
        </GlassCard>

        {/* ── Profile settings ── */}
        <GlassCard glow="blue">
          {/* Section header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/20 dark:border-white/6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/12 ring-1 ring-primary/20 shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Profile Settings</p>
              <p className="text-xs text-muted-foreground mt-0.5">Update your name and target exam</p>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Current profile pill */}
            {user.display_name && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/6 border border-primary/15">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 ring-2 ring-primary/20 shrink-0">
                  <span className="text-sm font-bold text-primary">{user.display_name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.display_name}</p>
                  {user.selected_exam && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target:{' '}
                      <span className="font-medium text-primary/80">
                        {EXAM_TYPES.find(e => e.value === user.selected_exam)?.label || user.selected_exam}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Display name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Display Name</Label>
              <Input
                id="name"
                placeholder={user.display_name || 'Your name'}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 backdrop-blur-sm"
              />
            </div>

            {/* Target exam */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Target Exam</Label>
              <Select value={selectedExam || user.selected_exam || ''} onValueChange={setSelectedExam}>
                <SelectTrigger className="bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 backdrop-blur-sm">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map((exam) => (
                    <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">Changes are applied immediately.</p>
              <Button
                onClick={handleSave}
                disabled={saving}
                className={[
                  'gap-2 min-w-[130px] transition-all duration-300',
                  saved
                    ? 'bg-accent hover:bg-accent text-accent-foreground shadow-[0_2px_12px_-2px_rgba(16,185,129,0.4)]'
                    : 'shadow-[0_2px_12px_-2px_rgba(99,102,241,0.4)]',
                ].join(' ')}
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : saved
                  ? <><Check className="h-4 w-4" /> Saved!</>
                  : 'Save Changes'
                }
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* ── Appearance ── */}
        <GlassCard glow="purple">
          {/* Section header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/20 dark:border-white/6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-4/12 ring-1 ring-chart-4/20 shrink-0">
              <Palette className="h-4 w-4 text-chart-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark mode</p>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Toggle row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mode swatch */}
                <div className={[
                  'flex items-center justify-center w-12 h-12 rounded-xl ring-2 transition-all duration-300 shrink-0',
                  isDark
                    ? 'bg-slate-900 ring-slate-700 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.5)]'
                    : 'bg-white ring-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.1)]',
                ].join(' ')}>
                  {isDark
                    ? <Moon className="h-5 w-5 text-indigo-400" />
                    : <Sun  className="h-5 w-5 text-amber-500" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isDark ? 'Using dark theme across the app' : 'Using light theme across the app'}
                  </p>
                </div>
              </div>

              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Theme preview tiles */}
            <div className="grid grid-cols-2 gap-3">
              {/* Light */}
              <button
                onClick={() => setTheme('light')}
                className={[
                  'flex flex-col gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 text-left',
                  !isDark
                    ? 'border-primary/50 bg-primary/4 shadow-[0_2px_12px_-2px_rgba(99,102,241,0.2)]'
                    : 'border-white/20 dark:border-white/8 hover:border-primary/25 hover:bg-white/30 dark:hover:bg-white/5',
                ].join(' ')}
              >
                {/* Mini mockup */}
                <div className="w-full h-16 rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div className="h-1.5 w-1/2 rounded-full bg-gray-300" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200" />
                  <div className="h-1.5 w-4/5 rounded-full bg-gray-200" />
                  <div className="h-3.5 w-2/5 rounded-md bg-indigo-100 border border-indigo-200 mt-auto" />
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-semibold text-foreground">Light</span>
                  {!isDark && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>
              </button>

              {/* Dark */}
              <button
                onClick={() => setTheme('dark')}
                className={[
                  'flex flex-col gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 text-left',
                  isDark
                    ? 'border-primary/50 bg-primary/4 shadow-[0_2px_12px_-2px_rgba(99,102,241,0.2)]'
                    : 'border-white/20 dark:border-white/8 hover:border-primary/25 hover:bg-white/30 dark:hover:bg-white/5',
                ].join(' ')}
              >
                {/* Mini mockup */}
                <div className="w-full h-16 rounded-lg bg-slate-900 border border-slate-700 p-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="h-1.5 w-1/2 rounded-full bg-slate-600" />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-700" />
                  <div className="h-1.5 w-4/5 rounded-full bg-slate-700" />
                  <div className="h-3.5 w-2/5 rounded-md bg-indigo-900 border border-indigo-700 mt-auto" />
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-semibold text-foreground">Dark</span>
                  {isDark && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>
              </button>
            </div>

          </div>
        </GlassCard>

      </div>
    </>
  )
}
