'use client'

import useSWR from 'swr'
import { BarChart3, Target, Clock, TrendingUp, Brain, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const SLICE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

/* ─────────────────────────────────────────
   SVG decorative background
───────────────────────────────────────── */
function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">

      {/* ── Ambient colour blobs ── */}
      <div className="absolute -top-56 -left-56 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[160px]" />
      <div className="absolute top-1/3 -right-56 w-[640px] h-[640px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="absolute -bottom-56 left-1/3 w-[540px] h-[540px] rounded-full bg-chart-3/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -left-32 w-[360px] h-[360px] rounded-full bg-chart-4/8 blur-[100px]" />

      {/* ── SVG geometric decoration ── */}
      <svg
        className="absolute inset-0 w-full h-full text-foreground"
        style={{ opacity: 0.055 }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* subtle dot grid */}
          <pattern id="bg-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>

          {/* diagonal hatch */}
          <pattern id="bg-hatch" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="currentColor" strokeWidth="0.7" />
          </pattern>

          {/* hexagon grid */}
          <pattern id="bg-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="15,2 45,2 60,28 45,54 15,54 0,28"
              fill="none" stroke="currentColor" strokeWidth="0.8"
            />
          </pattern>

          {/* fine square grid */}
          <pattern id="bg-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>

        {/* base dot grid – full bleed */}
        <rect width="100%" height="100%" fill="url(#bg-dots)" />

        {/* fine grid overlay – centre-right region */}
        <rect x="45%" y="0" width="55%" height="50%" fill="url(#bg-grid)" opacity="0.35" />

        {/* hex cluster – top-right */}
        <g opacity="0.6" transform="translate(55%, -8%) scale(1.2)">
          <rect width="640" height="520" fill="url(#bg-hex)" />
        </g>

        {/* diagonal hatch – bottom-left corner */}
        <g opacity="0.4" transform="translate(-2%, 72%)">
          <rect width="360" height="320" fill="url(#bg-hatch)" />
        </g>

        {/* ── Large concentric rings – top right ── */}
        <circle cx="92%" cy="9%"  r="210" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.45" />
        <circle cx="92%" cy="9%"  r="155" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3"  strokeDasharray="6 5" />
        <circle cx="92%" cy="9%"  r="95"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
        <circle cx="92%" cy="9%"  r="45"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" strokeDasharray="3 4" />

        {/* ── Medium rings – bottom left ── */}
        <circle cx="6%"  cy="88%" r="140" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.35" />
        <circle cx="6%"  cy="88%" r="90"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.22" strokeDasharray="4 6" />
        <circle cx="6%"  cy="88%" r="48"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />

        {/* ── Accent rings – scattered ── */}
        <circle cx="50%" cy="4%"  r="70"  fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.25" strokeDasharray="4 6" />
        <circle cx="96%" cy="54%" r="52"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.22" />
        <circle cx="28%" cy="96%" r="42"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.18" />
        <circle cx="70%" cy="78%" r="34"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.15" strokeDasharray="3 5" />

        {/* ── Cross / plus marks ── */}
        {(
          [[17,27],[75,16],[37,71],[87,79],[61,44],[9,14],[48,54],[82,34],[22,48]] as [number, number][]
        ).map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.48">
            <line x1="-7" y1="0" x2="7" y2="0" stroke="currentColor" strokeWidth="1.1" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" strokeWidth="1.1" />
          </g>
        ))}

        {/* ── Diamonds ── */}
        {(
          [[24,9],[71,64],[13,59],[84,39],[55,20]] as [number, number][]
        ).map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.38">
            <polygon points="0,-11 9,0 0,11 -9,0" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </g>
        ))}

        {/* ── Triangles – scattered ── */}
        {(
          [[40,15],[68,52],[18,80]] as [number, number][]
        ).map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.28">
            <polygon points="0,-12 10,8 -10,8" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </g>
        ))}

        {/* ── Sweeping arcs ── */}
        <path d="M -80 900 Q 640 580 1520 840"  fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.18" strokeDasharray="8 6" />
        <path d="M 840 -60 Q 1140 240 1520 100" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
        <path d="M 0 480 Q 400 300 900 520"      fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.12" strokeDasharray="5 7" />

        {/* ── Tiny floating circles ── */}
        {(
          [[31,39,3.2],[57,21,2.2],[79,47,4],[43,81,2.6],[91,29,3],[9,49,2.2],
           [67,87,3],[19,74,2],[54,67,2],[46,33,1.8],[83,62,2.4]] as [number, number, number][]
        ).map(([cx, cy, r], i) => (
          <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={r}
            fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        ))}

        {/* ── Small square grid cluster – mid area ── */}
        <g opacity="0.18" transform="translate(38%, 28%)">
          {[0,1,2,3,4,5].map(row =>
            [0,1,2,3,4,5].map(col => (
              <rect key={`${row}-${col}`} x={col * 22} y={row * 22}
                width="14" height="14" fill="none" stroke="currentColor" strokeWidth="0.5" rx="2" />
            ))
          )}
        </g>

        {/* ── Star-burst lines – top left ── */}
        <g opacity="0.15" transform="translate(4%, 6%)">
          {[0,30,60,90,120,150].map((angle, i) => (
            <line key={i}
              x1="0" y1="0"
              x2={Math.cos(angle * Math.PI / 180) * 80}
              y2={Math.sin(angle * Math.PI / 180) * 80}
              stroke="currentColor" strokeWidth="0.6"
            />
          ))}
        </g>
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
      {/* top-edge shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

/* ── Stat card ── */
function StatCard({
  icon: Icon, value, label, glow, accent,
}: {
  icon: React.ElementType; value: string | number; label: string
  glow: 'blue' | 'green' | 'amber' | 'purple' | 'rose'; accent: string
}) {
  return (
    <GlassCard glow={glow} className="p-6">
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${accent} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </GlassCard>
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
          {typeof p.value === 'number' && p.name !== 'Score' && p.name !== 'Max' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

/* ── Mistake legend — crisp pill rows that read in both modes ── */
function MistakeLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="flex flex-col gap-2 mt-4 px-1">
      {data.map((entry, i) => {
        const color = SLICE_COLORS[i % SLICE_COLORS.length]
        return (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {/* Explicit dark + light color classes for visibility */}
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate leading-none">
                {entry.name}
              </span>
            </div>
            <span
              className="text-xs font-bold tabular-nums shrink-0 px-2 py-0.5 rounded-lg border"
              style={{
                color,
                backgroundColor: `${color}1a`,
                borderColor: `${color}40`,
              }}
            >
              {entry.value}
            </span>
          </div>
        )
      })}
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

/* ══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher)
  const { data: userData } = useSWR('/api/auth/me', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const stats               = analytics?.stats              || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0 }
  const subjectPerformance  = analytics?.subjectPerformance || []
  const progressData        = analytics?.progressData       || []
  const mistakePatterns     = analytics?.mistakePatterns    || {}
  const readiness           = analytics?.readiness          || 0
  const weakTopics          = analytics?.weakTopics         || []

  const mistakeData: { name: string; value: number }[] = Object.entries(mistakePatterns).map(([key, value]) => ({
    name:
      key === 'conceptual'  ? 'Conceptual'
      : key === 'calculation' ? 'Calculation'
      : key === 'guessing'    ? 'Guessing'
      : 'Time Pressure',
    value: value as number,
  }))

  const name = userData?.user?.display_name || 'Student'

  return (
    <>
      <SceneBackground />

      <div className="relative flex flex-col gap-6 pb-6">

        {/* ── Welcome header ── */}
        <GlassCard className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0">
              <span className="text-lg font-bold text-primary">{name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Welcome back, <span className="text-primary">{name}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stats.totalTests > 0
                  ? `${stats.totalTests} test${stats.totalTests > 1 ? 's' : ''} completed · ${stats.avgAccuracy}% average accuracy`
                  : 'Upload your first mock test to see analytics.'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BarChart3}  value={stats.totalTests}        label="Tests Taken"      glow="blue"   accent="bg-primary/15 text-primary" />
          <StatCard icon={Target}     value={`${stats.avgAccuracy}%`} label="Avg Accuracy"     glow="green"  accent="bg-accent/15 text-accent" />
          <StatCard icon={Clock}      value={stats.totalQuestions}    label="Questions Solved" glow="amber"  accent="bg-chart-3/15 text-chart-3" />
          <StatCard icon={TrendingUp} value={`${readiness}%`}         label="Readiness Score"  glow="purple" accent="bg-chart-5/15 text-chart-5" />
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <GlassCard className="p-6">
            <p className="text-sm font-semibold text-foreground mb-0.5">Subject Performance</p>
            <p className="text-xs text-muted-foreground mb-5">Accuracy across different subjects</p>
            {subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={subjectPerformance} barSize={32}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="subject" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: '#6366f1', fillOpacity: 0.06, radius: 6 }} />
                  <Bar dataKey="accuracy" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="Upload tests to see subject performance" />
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-sm font-semibold text-foreground mb-0.5">Progress Over Time</p>
            <p className="text-xs text-muted-foreground mb-5">Accuracy trend across tests</p>
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="testName" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} cursor={{ stroke: '#10b981', strokeOpacity: 0.3 }} />
                  <Line
                    type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                    activeDot={{ r: 6, fill: '#10b981', stroke: 'var(--background)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="Upload multiple tests to see progress" />
            )}
          </GlassCard>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Mistake Patterns */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">Mistake Patterns</p>
            </div>
            {mistakeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={148}>
                  <PieChart>
                    <Pie
                      data={mistakeData} cx="50%" cy="50%"
                      outerRadius={68} innerRadius={38}
                      dataKey="value" paddingAngle={3} strokeWidth={0}
                    >
                      {mistakeData.map((_, i) => (
                        <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<GlassTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend — always readable */}
                <MistakeLegend data={mistakeData} />
              </>
            ) : (
              <EmptyState label="No mistake data yet" height="h-48" />
            )}
          </GlassCard>

          {/* Weak Topics */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Weak Topics</p>
            </div>
            {weakTopics.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {weakTopics.slice(0, 5).map((topic: { topic: string; subject: string; accuracy: number }, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground truncate max-w-[70%]">{topic.topic}</span>
                      <span className="text-xs tabular-nums font-semibold text-muted-foreground">{topic.accuracy}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="Upload tests to identify weak topics" height="h-48" />
            )}
          </GlassCard>

          {/* Exam Readiness */}
          <GlassCard glow="blue" className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-foreground">Exam Readiness</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 mx-auto mb-4">
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-25"
                  style={{ background: `conic-gradient(#6366f1 ${readiness * 3.6}deg, transparent 0deg)` }}
                />
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="8"
                    strokeDasharray={`${readiness * 2.64} 264`} strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <circle cx="50" cy="50" r="34" fill="none" stroke="#6366f1" strokeOpacity={0.1} strokeWidth="1" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground tabular-nums">{readiness}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Ready</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-[160px]">
                {readiness >= 70 ? '🎯 Great progress! Keep practicing.'
                  : readiness >= 40 ? '📈 Getting there. Focus on weak areas.'
                  : '📋 Upload more tests to track readiness.'}
              </p>
            </div>
          </GlassCard>

        </div>
      </div>
    </>
  )
}
