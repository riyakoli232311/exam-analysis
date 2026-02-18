'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  User, GraduationCap, Edit2, Check, X, Award, Trophy,
  Flame, Target, Calendar, Clock, BookOpen, Zap,
} from 'lucide-react'
import { EXAM_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

/* ─────────────────────────────────────────
   Glass card — identical to dashboard
───────────────────────────────────────── */
function GlassCard({
  children,
  className = '',
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: 'blue' | 'green' | 'amber' | 'purple' | 'rose'
}) {
  const glowMap: Record<string, string> = {
    blue:   'before:bg-primary/25',
    green:  'before:bg-accent/25',
    amber:  'before:bg-chart-3/25',
    purple: 'before:bg-chart-4/25',
    rose:   'before:bg-chart-5/25',
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
      'hover:shadow-[0_8px_36px_-6px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_8px_36px_-6px_rgba(0,0,0,0.65)]',
      glow ? `before:absolute before:inset-0 before:opacity-35 before:blur-2xl before:-z-10 ${glowMap[glow]}` : '',
      className,
    ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

/* ── Glass input wrapper ── */
function GlassField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  )
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value, iconClass = 'text-primary' }: {
  icon: React.ElementType; label: string; value: React.ReactNode; iconClass?: string
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/15 dark:border-white/5 last:border-0">
      <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-white/30 dark:bg-white/5 shrink-0 mt-0.5`}>
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { data: userData, mutate: mutateUser } = useSWR('/api/auth/me', fetcher)
  const { data: analytics } = useSWR('/api/analytics', fetcher)
  const { data: testsData } = useSWR('/api/tests', fetcher)

  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [targetScore, setTargetScore] = useState('')
  const [examDate, setExamDate] = useState('')
  const [studyHours, setStudyHours] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  const user      = userData?.user || {}
  const stats     = analytics?.stats || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0 }
  const readiness = analytics?.readiness || 0
  const tests     = testsData?.tests || []

  const last30Days = tests.filter((t: any) => {
    const testDate = new Date(t.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return testDate >= thirtyDaysAgo
  })
  const uniqueDays = new Set(last30Days.map((t: any) => new Date(t.created_at).toDateString())).size

  const badges = [
    { id: 'first-test',        name: 'Getting Started', icon: BookOpen, earned: stats.totalTests >= 1,      color: 'text-blue-500',   bg: 'bg-blue-500/12',   border: 'border-blue-500/25'   },
    { id: 'five-tests',        name: '5 Test Streak',   icon: Flame,    earned: stats.totalTests >= 5,      color: 'text-orange-500', bg: 'bg-orange-500/12', border: 'border-orange-500/25' },
    { id: 'high-accuracy',     name: '80% Club',        icon: Target,   earned: stats.avgAccuracy >= 80,    color: 'text-accent',     bg: 'bg-accent/12',     border: 'border-accent/25'     },
    { id: 'hundred-questions', name: 'Century',         icon: Trophy,   earned: stats.totalQuestions >= 100,color: 'text-yellow-500', bg: 'bg-yellow-500/12', border: 'border-yellow-500/25' },
    { id: 'ready',             name: 'Exam Ready',      icon: Award,    earned: readiness >= 70,            color: 'text-chart-4',    bg: 'bg-chart-4/12',    border: 'border-chart-4/25'    },
    { id: 'consistent',        name: 'Consistent',      icon: Calendar, earned: uniqueDays >= 7,            color: 'text-pink-500',   bg: 'bg-pink-500/12',   border: 'border-pink-500/25'   },
  ]
  const earnedBadges = badges.filter(b => b.earned)

  const recentActivity = tests.slice(0, 5).map((t: any) => ({
    id:       t.id,
    title:    t.test_name,
    accuracy: Number(t.accuracy).toFixed(0),
    score:    `${t.total_score}/${t.max_score}`,
    date:     new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    time:     new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }))

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName:  displayName  || undefined,
          selectedExam: selectedExam || undefined,
          targetScore:  targetScore  || undefined,
          examDate:     examDate     || undefined,
          studyHours:   studyHours   || undefined,
          bio:          bio          || undefined,
        }),
      })
      mutateUser()
      setEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit() {
    setDisplayName(user.display_name || '')
    setSelectedExam(user.selected_exam || '')
    setTargetScore(user.target_score || '')
    setExamDate(user.exam_date ? user.exam_date.split('T')[0] : '')
    setStudyHours(user.study_hours_per_day || '')
    setBio(user.bio || '')
    setEditing(true)
  }

  const daysUntilExam = user.exam_date
    ? Math.ceil((new Date(user.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const initials = (user.display_name || 'S').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="relative flex flex-col gap-6 pb-6">

      {/* ── Page header ── */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your info and track your journey</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Left: Profile card ── */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <GlassCard glow="blue" className="p-6">

            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-foreground">About Me</p>
              {!editing ? (
                <Button
                  variant="ghost" size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setEditing(false)} disabled={saving}
                    className="h-8 w-8 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={handleSave} disabled={saving}
                    className="h-8 w-8 p-0 rounded-xl hover:bg-accent/10 hover:text-accent"
                  >
                    {saving
                      ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                      : <Check className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-110" />
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/25 text-2xl font-bold text-primary">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-xs font-bold border-2 border-background shadow-lg">
                  {stats.totalTests}
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground">{user.display_name || 'Student'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                {user.selected_exam && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <GraduationCap className="h-3 w-3" />
                    {EXAM_TYPES.find(e => e.value === user.selected_exam)?.label || user.selected_exam}
                  </span>
                )}
              </div>
            </div>

            {/* Edit form */}
            {editing ? (
              <div className="space-y-3.5">
                <GlassField label="Display Name">
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="h-9 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10" />
                </GlassField>
                <GlassField label="Target Exam">
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger className="h-9 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10">
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_TYPES.map(exam => (
                        <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </GlassField>
                <GlassField label="Target Score / Rank">
                  <Input value={targetScore} onChange={e => setTargetScore(e.target.value)} placeholder="e.g., 95 percentile, AIR 500" className="h-9 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10" />
                </GlassField>
                <GlassField label="Exam Date">
                  <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="h-9 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10" />
                </GlassField>
                <GlassField label="Daily Study Hours">
                  <Input type="number" value={studyHours} onChange={e => setStudyHours(e.target.value)} placeholder="e.g., 6" className="h-9 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10" />
                </GlassField>
                <GlassField label="Bio / Study Goals">
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="What motivates you? What are your goals?" className="min-h-20 resize-none bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10" />
                </GlassField>
              </div>
            ) : (
              <div>
                {user.target_score && (
                  <InfoRow icon={Target} label="Target Goal" value={user.target_score} iconClass="text-accent" />
                )}
                {daysUntilExam !== null && (
                  <InfoRow
                    icon={Calendar} label="Exam Countdown" iconClass="text-primary"
                    value={
                      <span className={daysUntilExam <= 7 ? 'text-destructive' : daysUntilExam <= 30 ? 'text-chart-3' : 'text-foreground'}>
                        {daysUntilExam > 0 ? `${daysUntilExam} days to go` : daysUntilExam === 0 ? '🎯 Today!' : 'Exam completed'}
                      </span>
                    }
                  />
                )}
                {user.study_hours_per_day && (
                  <InfoRow icon={Clock} label="Daily Study Goal" value={`${user.study_hours_per_day} hours / day`} iconClass="text-accent" />
                )}
                <InfoRow
                  icon={Flame} label="Study Streak (30 days)" iconClass="text-orange-500"
                  value={
                    <span className="flex items-center gap-1.5">
                      {uniqueDays} active day{uniqueDays !== 1 ? 's' : ''}
                      {uniqueDays >= 7 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">🔥 On fire</span>}
                    </span>
                  }
                />
                {user.bio && (
                  <div className="pt-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1.5">About</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
                  </div>
                )}
                {!user.target_score && !user.exam_date && !user.study_hours_per_day && !user.bio && (
                  <p className="text-xs text-muted-foreground/60 italic text-center py-4">
                    Tap ✏️ to add your goals & preferences
                  </p>
                )}
              </div>
            )}
          </GlassCard>

          {/* Exam countdown bar (only when exam date set) */}
          {daysUntilExam !== null && daysUntilExam > 0 && (
            <GlassCard glow="amber" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-chart-3" />
                <p className="text-sm font-semibold text-foreground">Countdown</p>
              </div>
              <div className="text-center mb-3">
                <p className="text-4xl font-bold text-chart-3 tabular-nums">{daysUntilExam}</p>
                <p className="text-xs text-muted-foreground">days remaining</p>
              </div>
              <div className="h-1.5 rounded-full bg-chart-3/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-chart-3/60 to-chart-3 transition-all duration-700"
                  style={{ width: `${Math.max(5, Math.min(100, 100 - (daysUntilExam / 365) * 100))}%` }}
                />
              </div>
            </GlassCard>
          )}
        </div>

        {/* ── Right: Achievements + Activity + Stats ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: stats.totalTests,     label: 'Tests Taken',  glow: 'blue'   as const, color: 'text-primary'  },
              { value: `${stats.avgAccuracy}%`, label: 'Avg Accuracy', glow: 'green' as const, color: 'text-accent'   },
              { value: stats.totalQuestions, label: 'Questions',    glow: 'amber'  as const, color: 'text-chart-3'  },
              { value: `${readiness}%`,      label: 'Readiness',   glow: 'purple' as const, color: 'text-chart-5'  },
            ].map((s, i) => (
              <GlassCard key={i} glow={s.glow} className="p-4 text-center">
                <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Achievements */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Achievements</p>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {earnedBadges.length}/{badges.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Keep studying to unlock all badges!</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className={cn(
                    'relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200',
                    badge.earned
                      ? `${badge.bg} ${badge.border} shadow-sm`
                      : 'border-white/15 dark:border-white/5 bg-white/20 dark:bg-white/[0.02] opacity-40 grayscale'
                  )}
                >
                  {badge.earned && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                  )}
                  <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full',
                    badge.earned ? `${badge.bg} border ${badge.border}` : 'bg-muted/50'
                  )}>
                    <badge.icon className={cn('h-6 w-6', badge.earned ? badge.color : 'text-muted-foreground')} />
                  </div>
                  <p className="text-xs font-semibold text-center text-foreground leading-tight">{badge.name}</p>
                  {badge.earned && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Earned</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Recent Activity</p>
              <span className="ml-auto text-xs text-muted-foreground">Last 5 tests</span>
            </div>

            {recentActivity.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {recentActivity.map((activity) => {
                  const acc = Number(activity.accuracy)
                  const accentColor = acc >= 70 ? '#10b981' : acc >= 50 ? '#f59e0b' : '#ef4444'
                  return (
                    <div
                      key={activity.id}
                      className="group relative flex items-center gap-3 rounded-xl border border-white/20 dark:border-white/6 bg-white/40 dark:bg-white/[0.025] hover:bg-white/60 dark:hover:bg-white/[0.05] backdrop-blur-sm transition-all duration-150 px-4 py-3 overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ backgroundColor: accentColor }} />
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 shrink-0">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.date} · {activity.time} · <span className="font-medium">{activity.score} pts</span>
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums shrink-0 px-2.5 py-1 rounded-lg border"
                        style={{ color: accentColor, backgroundColor: `${accentColor}18`, borderColor: `${accentColor}35` }}
                      >
                        {activity.accuracy}%
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/30">
                  <BookOpen className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No tests uploaded yet</p>
                <p className="text-xs text-muted-foreground/60">Upload your first test to start tracking!</p>
              </div>
            )}
          </GlassCard>

        </div>
      </div>
    </div>
  )
}
