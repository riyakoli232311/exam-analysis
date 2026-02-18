'use client'

import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { TrendingUp, CalendarDays, Flame, Award, Target, ChevronUp, ChevronDown, Minus } from 'lucide-react'

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

/* ── Chart tooltip ── */
const GlassTooltip = ({
  active, payload, label,
}: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/30 bg-background/90 backdrop-blur-xl px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-muted-foreground mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-foreground">
          {p.name ? `${p.name}: ` : ''}{p.value}
          {p.name !== 'Score' && p.name !== 'Max' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

function EmptyState({ label, height = 'h-64' }: { label: string; height?: string }) {
  return (
    <div className={`flex items-center justify-center ${height} text-sm text-muted-foreground/60`}>
      {label}
    </div>
  )
}

/* ── Trend pill ── */
function TrendPill({ value }: { value: number }) {
  if (value === 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      <Minus className="h-3 w-3" /> No change
    </span>
  )
  const isUp = value > 0
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isUp ? 'bg-accent/15 text-accent' : 'bg-destructive/10 text-destructive'}`}>
      {isUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      {isUp ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

/* ── Streak dots ── */
function StreakDots({ tests }: { tests: { accuracy: number }[] }) {
  const last7 = tests.slice(-7)
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 7 }).map((_, i) => {
        const t = last7[i]
        if (!t) return <div key={i} className="w-2.5 h-2.5 rounded-full bg-muted/40" />
        const acc = Number(t.accuracy)
        const color = acc >= 70 ? 'bg-accent' : acc >= 50 ? 'bg-chart-3' : 'bg-destructive/70'
        return <div key={i} className={`w-2.5 h-2.5 rounded-full ${color}`} title={`${acc}%`} />
      })}
    </div>
  )
}

/* ── Mini score badge ── */
function AccBadge({ accuracy }: { accuracy: number }) {
  const acc = Number(accuracy)
  if (acc >= 70) return <Badge className="bg-accent/15 text-accent border-accent/20 border">{acc.toFixed(0)}%</Badge>
  if (acc >= 50) return <Badge className="bg-chart-3/15 text-chart-3 border-chart-3/20 border">{acc.toFixed(0)}%</Badge>
  return <Badge className="bg-destructive/10 text-destructive border-destructive/20 border">{acc.toFixed(0)}%</Badge>
}

/* ══════════════════════════════════════════════════ */
export default function ProgressPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading progress…</p>
        </div>
      </div>
    )
  }

  const progressData = analytics?.progressData || []
  const tests        = analytics?.tests        || []
  const readiness    = analytics?.readiness    || 0

  const hasMultipleTests = progressData.length >= 2
  const firstAccuracy    = hasMultipleTests ? progressData[0].accuracy : 0
  const lastAccuracy     = hasMultipleTests ? progressData[progressData.length - 1].accuracy : 0
  const improvement      = lastAccuracy - firstAccuracy

  // Best & worst test
  const bestTest  = [...tests].sort((a, b) => Number(b.accuracy) - Number(a.accuracy))[0]
  const worstTest = [...tests].sort((a, b) => Number(a.accuracy) - Number(b.accuracy))[0]

  // Streak: consecutive tests >= 50%
  let streak = 0
  for (let i = tests.length - 1; i >= 0; i--) {
    if (Number(tests[i].accuracy) >= 50) streak++
    else break
  }

  return (
    <div className="relative flex flex-col gap-6 pb-6">

      {/* ── Page header ── */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 ring-2 ring-accent/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Progress Tracking</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your improvement journey over time</p>
            </div>
          </div>
          {tests.length > 0 && (
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">Last 7 tests</span>
              <StreakDots tests={tests} />
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Tests completed */}
        <GlassCard glow="blue" className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary shrink-0">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{progressData.length}</p>
              <p className="text-sm text-muted-foreground">Tests Completed</p>
            </div>
          </div>
        </GlassCard>

        {/* Overall improvement */}
        <GlassCard glow={improvement >= 0 ? 'green' : 'rose'} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${improvement >= 0 ? 'bg-accent/15 text-accent' : 'bg-destructive/10 text-destructive'}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-bold tabular-nums ${improvement >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Overall Improvement</p>
            </div>
          </div>
        </GlassCard>

        {/* Streak */}
        <GlassCard glow="amber" className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-3/15 text-chart-3 shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{streak}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
          </div>
        </GlassCard>

        {/* Readiness */}
        <GlassCard glow="purple" className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-5/15 text-chart-5 shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{readiness}%</p>
              <p className="text-sm text-muted-foreground">Readiness Score</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Best / Worst callout row ── */}
      {tests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard className="p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 shrink-0">
              <Award className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Best Performance</p>
              <p className="text-sm font-semibold text-foreground truncate">{bestTest?.test_name ?? '—'}</p>
              <div className="flex items-center gap-2 mt-1">
                <TrendPill value={Number(bestTest?.accuracy ?? 0)} />
                <span className="text-xs text-muted-foreground">{Number(bestTest?.total_score ?? 0)}/{Number(bestTest?.max_score ?? 0)} pts</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10 shrink-0">
              <Target className="h-4 w-4 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Needs Most Work</p>
              <p className="text-sm font-semibold text-foreground truncate">{worstTest?.test_name ?? '—'}</p>
              <div className="flex items-center gap-2 mt-1">
                <AccBadge accuracy={worstTest?.accuracy ?? 0} />
                <span className="text-xs text-muted-foreground">{Number(worstTest?.total_score ?? 0)}/{Number(worstTest?.max_score ?? 0)} pts</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Accuracy Trend */}
        <GlassCard className="p-6">
          <p className="text-sm font-semibold text-foreground mb-0.5">Accuracy Trend</p>
          <p className="text-xs text-muted-foreground mb-5">Your accuracy progression across mock tests</p>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="testName" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#10b981', strokeOpacity: 0.3 }} />
                <Area
                  type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5}
                  fill="url(#accuracyGrad)"
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: 'var(--background)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="Upload multiple tests to see progress" />
          )}
        </GlassCard>

        {/* Score History */}
        <GlassCard className="p-6">
          <p className="text-sm font-semibold text-foreground mb-0.5">Score History</p>
          <p className="text-xs text-muted-foreground mb-5">Raw score vs maximum possible</p>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={progressData}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="testName" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#6366f1', strokeOpacity: 0.3 }} />
                <Line
                  type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} name="Score"
                  dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: 'var(--background)', strokeWidth: 2 }}
                />
                <Line
                  type="monotone" dataKey="maxScore" stroke="currentColor" strokeWidth={1.2}
                  strokeDasharray="5 5" name="Max"
                  dot={false}
                  strokeOpacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="No data yet" />
          )}
        </GlassCard>
      </div>

      {/* ── Progress milestones banner ── */}
      {tests.length > 0 && (
        <GlassCard className="px-6 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milestones</span>
            {tests.length >= 1  && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">🎯 First Test</span>}
            {tests.length >= 5  && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">🔥 5 Tests Done</span>}
            {tests.length >= 10 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-chart-3/10 text-chart-3 border border-chart-3/20">⚡ 10 Tests Done</span>}
            {Number(analytics?.stats?.avgAccuracy ?? 0) >= 70 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-chart-4/10 text-chart-4 border border-chart-4/20">🏆 70%+ Avg Accuracy</span>}
            {improvement > 10 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">📈 +10% Improvement</span>}
            {streak >= 3 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-chart-3/10 text-chart-3 border border-chart-3/20">🔥 3-Test Streak</span>}
          </div>
        </GlassCard>
      )}

      {/* ── Test history ── */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Test History</p>
          {tests.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{tests.length} test{tests.length > 1 ? 's' : ''}</span>
          )}
        </div>
        {tests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tests.map((t: {
              id: string; test_name: string; accuracy: number
              total_score: number; max_score: number; exam_type: string
              created_at: string; time_taken_minutes: number
            }, idx: number) => {
              const acc = Number(t.accuracy)
              // micro progress bar fill
              const pct = Math.min(acc, 100)
              return (
                <div
                  key={t.id}
                  className="group relative rounded-xl border border-white/20 dark:border-white/6 bg-white/40 dark:bg-white/[0.025] hover:bg-white/60 dark:hover:bg-white/[0.05] backdrop-blur-sm transition-all duration-200 overflow-hidden"
                >
                  {/* thin left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: acc >= 70 ? '#10b981' : acc >= 50 ? '#f59e0b' : '#ef4444' }}
                  />
                  {/* progress fill (very subtle) */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ background: `linear-gradient(to right, ${acc >= 70 ? '#10b981' : acc >= 50 ? '#f59e0b' : '#ef4444'} ${pct}%, transparent ${pct}%)` }}
                  />

                  <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground/50 tabular-nums w-5 shrink-0">
                        #{tests.length - idx}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{t.test_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {t.time_taken_minutes ? ` · ${t.time_taken_minutes} min` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold tracking-wide uppercase border-white/30 dark:border-white/10"
                      >
                        {t.exam_type}
                      </Badge>
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {Number(t.total_score)}/{Number(t.max_score)}
                      </span>
                      <AccBadge accuracy={t.accuracy} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState label="No tests taken yet" height="h-32" />
        )}
      </GlassCard>

      <p className="text-xs text-muted-foreground/50 italic px-1">
        Improvement tracking reflects your performance correlation over time, not guaranteed predictions.
      </p>
    </div>
  )
}
