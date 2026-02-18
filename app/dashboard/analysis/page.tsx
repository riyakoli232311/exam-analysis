'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { MISTAKE_TYPES } from '@/lib/constants'
import { TrendingUp, TrendingDown, BookOpen, AlertTriangle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

/* ─────────────────────────────────────────
   SVG decorative background
───────────────────────────────────────── */
function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute -top-56 -left-56 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[160px]" />
      <div className="absolute top-1/3 -right-56 w-[640px] h-[640px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="absolute -bottom-56 left-1/3 w-[540px] h-[540px] rounded-full bg-chart-3/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -left-32 w-[360px] h-[360px] rounded-full bg-chart-4/8 blur-[100px]" />

      <svg
        className="absolute inset-0 w-full h-full text-foreground"
        style={{ opacity: 0.055 }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="an-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <pattern id="an-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="15,2 45,2 60,28 45,54 15,54 0,28" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
          <pattern id="an-hatch" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
          <pattern id="an-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#an-dots)" />
        <rect x="50%" y="0" width="50%" height="55%" fill="url(#an-grid)" opacity="0.35" />

        <g opacity="0.55" transform="translate(58%, -6%) scale(1.2)">
          <rect width="640" height="520" fill="url(#an-hex)" />
        </g>
        <g opacity="0.4" transform="translate(-2%, 70%)">
          <rect width="360" height="320" fill="url(#an-hatch)" />
        </g>

        <circle cx="92%" cy="9%"  r="210" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.42" />
        <circle cx="92%" cy="9%"  r="155" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.28" strokeDasharray="6 5" />
        <circle cx="92%" cy="9%"  r="95"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.18" />
        <circle cx="5%"  cy="88%" r="140" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.32" />
        <circle cx="5%"  cy="88%" r="88"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"  strokeDasharray="4 6" />
        <circle cx="50%" cy="4%"  r="70"  fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.22" strokeDasharray="4 6" />
        <circle cx="96%" cy="54%" r="52"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

        {([[17,27],[75,16],[37,71],[87,79],[61,44],[9,14],[48,54],[22,48]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.45">
            <line x1="-7" y1="0" x2="7" y2="0" stroke="currentColor" strokeWidth="1.1" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" strokeWidth="1.1" />
          </g>
        ))}

        {([[24,9],[71,64],[13,59],[84,39],[55,20]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.35">
            <polygon points="0,-11 9,0 0,11 -9,0" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </g>
        ))}

        <path d="M -80 900 Q 640 580 1520 840" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.16" strokeDasharray="8 6" />
        <path d="M 840 -60 Q 1140 240 1520 100" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.13" />

        {([[31,39,3.2],[57,21,2.2],[79,47,4],[43,81,2.6],[91,29,3],[9,49,2.2],[67,87,3],[19,74,2]] as [number,number,number][]).map(([cx,cy,r],i) => (
          <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={r} fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
        ))}

        <g opacity="0.16" transform="translate(38%, 28%)">
          {[0,1,2,3,4,5].map(row => [0,1,2,3,4,5].map(col => (
            <rect key={`${row}-${col}`} x={col*22} y={row*22} width="14" height="14"
              fill="none" stroke="currentColor" strokeWidth="0.5" rx="2" />
          )))}
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
      'hover:shadow-[0_8px_36px_-6px_rgba(0,0,0,0.13)] dark:hover:shadow-[0_8px_36px_-6px_rgba(0,0,0,0.6)]',
      glow ? `before:absolute before:inset-0 before:opacity-35 before:blur-2xl before:-z-10 ${glowMap[glow]}` : '',
      className,
    ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

/* ── Glass chart tooltip ── */
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
          {typeof p.value === 'number' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

/* ── Accuracy colour helper ── */
function accuracyColor(pct: number) {
  if (pct >= 75) return { text: 'text-accent', bg: 'bg-accent/12', border: 'border-accent/25' }
  if (pct >= 50) return { text: 'text-chart-3', bg: 'bg-chart-3/12', border: 'border-chart-3/25' }
  return { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-sm text-muted-foreground/60">
      {label}
    </div>
  )
}

/* ══════════════════════════════════════════════════ */
export default function AnalysisPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading analysis…</p>
        </div>
      </div>
    )
  }

  const subjectPerformance = analytics?.subjectPerformance || []
  const topicPerformance   = analytics?.topicPerformance   || []
  const weakTopics         = analytics?.weakTopics         || []
  const strongTopics       = analytics?.strongTopics       || []
  const mistakePatterns    = analytics?.mistakePatterns    || {}

  const radarData = subjectPerformance.map((s: { subject: string; accuracy: number; mastery: number }) => ({
    subject: s.subject,
    accuracy: s.accuracy,
    mastery: Math.min(s.mastery, 100),
  }))

  return (
    <>
      <SceneBackground />

      <div className="flex flex-col gap-6 relative">

        {/* ── Header ── */}
        <GlassCard className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Performance Analysis</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Deep dive into your test performance and identify areas for improvement.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ── Tabs ── */}
        <Tabs defaultValue="subjects" className="w-full">

          {/* Tab bar — glass pill style */}
          <GlassCard className="p-1.5">
            <TabsList className="w-full bg-transparent gap-1 h-auto p-0">
              {[
                { value: 'subjects', label: 'Subjects',  icon: BookOpen      },
                { value: 'topics',   label: 'Topics',    icon: TrendingDown  },
                { value: 'mistakes', label: 'Mistakes',  icon: AlertTriangle },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium',
                    'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                    'data-[state=active]:shadow-[0_2px_12px_-2px_rgba(99,102,241,0.4)]',
                    'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
                    'transition-all duration-200',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </GlassCard>

          {/* ════════════════════
              SUBJECTS TAB
          ════════════════════ */}
          <TabsContent value="subjects" className="flex flex-col gap-5 mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Subject Accuracy bar chart */}
              <GlassCard className="p-6" glow="blue">
                <p className="text-sm font-semibold text-foreground mb-0.5">Subject Accuracy</p>
                <p className="text-xs text-muted-foreground mb-5">How well you perform in each subject</p>
                {subjectPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance} layout="vertical" barSize={18}>
                      <defs>
                        <linearGradient id="an-barH" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="subject" width={90} tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<GlassTooltip />} cursor={{ fill: '#6366f1', fillOpacity: 0.05, radius: 6 }} />
                      <Bar dataKey="accuracy" fill="url(#an-barH)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState label="Upload tests to see analysis" />
                )}
              </GlassCard>

              {/* Skill Radar */}
              <GlassCard className="p-6" glow="purple">
                <p className="text-sm font-semibold text-foreground mb-0.5">Skill Radar</p>
                <p className="text-xs text-muted-foreground mb-5">Overall subject mastery visualization</p>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 10 }} />
                      <Radar name="Accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="Mastery"  dataKey="mastery"  stroke="#10b981" fill="#10b981" fillOpacity={0.1}  strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState label="No data yet" />
                )}
              </GlassCard>
            </div>

            {/* Subject mastery bars */}
            <GlassCard className="p-6">
              <p className="text-sm font-semibold text-foreground mb-5">Subject Mastery</p>
              <div className="flex flex-col gap-4">
                {subjectPerformance.map((s: { subject: string; accuracy: number; mastery: number; total: number; correct: number }, i: number) => {
                  const col = accuracyColor(s.accuracy)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{s.subject}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border tabular-nums ${col.text} ${col.bg} ${col.border}`}>
                          {s.correct}/{s.total} · {s.accuracy}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-primary/8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(s.mastery, 100)}%`,
                            background: s.accuracy >= 75
                              ? 'linear-gradient(90deg, #10b98199, #10b981)'
                              : s.accuracy >= 50
                              ? 'linear-gradient(90deg, #f59e0b99, #f59e0b)'
                              : 'linear-gradient(90deg, #ef444499, #ef4444)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                {subjectPerformance.length === 0 && (
                  <p className="text-muted-foreground text-sm">Upload tests to see mastery scores.</p>
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* ════════════════════
              TOPICS TAB
          ════════════════════ */}
          <TabsContent value="topics" className="flex flex-col gap-5 mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Weak topics */}
              <GlassCard className="p-6" glow="rose">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">Weak Topics</p>
                </div>
                <p className="text-xs text-muted-foreground mb-5">Topics below 50% accuracy that need attention</p>
                {weakTopics.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {weakTopics.map((t: { topic: string; subject: string; accuracy: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-destructive/15 bg-destructive/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.topic}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.subject}</p>
                        </div>
                        <Badge variant="destructive" className="tabular-nums">{t.accuracy}%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No weak topics identified yet.</p>
                )}
              </GlassCard>

              {/* Strong topics */}
              <GlassCard className="p-6" glow="green">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-accent">Strong Topics</p>
                </div>
                <p className="text-xs text-muted-foreground mb-5">Topics above 75% accuracy</p>
                {strongTopics.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {strongTopics.map((t: { topic: string; subject: string; accuracy: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.topic}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.subject}</p>
                        </div>
                        <Badge className="bg-accent text-accent-foreground tabular-nums">{t.accuracy}%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No strong topics yet.</p>
                )}
              </GlassCard>
            </div>

            {/* All topics */}
            <GlassCard className="p-6">
              <p className="text-sm font-semibold text-foreground mb-5">All Topics</p>
              <div className="flex flex-col gap-3.5">
                {topicPerformance.map((t: { topic: string; subject: string; accuracy: number; total: number; correct: number }, i: number) => {
                  const col = accuracyColor(t.accuracy)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground">
                          <span className="text-muted-foreground">{t.subject}</span>
                          {' › '}
                          {t.topic}
                        </span>
                        <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-lg border ${col.text} ${col.bg} ${col.border}`}>
                          {t.correct}/{t.total} · {t.accuracy}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-primary/8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${t.accuracy}%`,
                            background: t.accuracy >= 75
                              ? 'linear-gradient(90deg, #10b98188, #10b981)'
                              : t.accuracy >= 50
                              ? 'linear-gradient(90deg, #f59e0b88, #f59e0b)'
                              : 'linear-gradient(90deg, #ef444488, #ef4444)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                {topicPerformance.length === 0 && (
                  <p className="text-muted-foreground text-sm">No topic data.</p>
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* ════════════════════
              MISTAKES TAB
          ════════════════════ */}
          <TabsContent value="mistakes" className="flex flex-col gap-5 mt-5">
            <GlassCard className="p-6" glow="amber">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-foreground">Mistake Pattern Analysis</p>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Understanding the types of mistakes you make helps improve strategy.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(MISTAKE_TYPES).map(([key, info]) => {
                  const count = mistakePatterns[key] || 0
                  const colors = [
                    { ring: 'ring-primary/30',    bg: 'bg-primary/10',    text: 'text-primary'    },
                    { ring: 'ring-chart-3/30',     bg: 'bg-chart-3/10',    text: 'text-chart-3'    },
                    { ring: 'ring-destructive/30', bg: 'bg-destructive/10',text: 'text-destructive' },
                    { ring: 'ring-chart-4/30',     bg: 'bg-chart-4/10',    text: 'text-chart-4'    },
                  ]
                  const colorKeys = Object.keys(MISTAKE_TYPES)
                  const idx = colorKeys.indexOf(key) % colors.length
                  const c = colors[idx]

                  return (
                    <div
                      key={key}
                      className={[
                        'rounded-xl border border-white/20 dark:border-white/8',
                        'bg-white/40 dark:bg-white/[0.03]',
                        'backdrop-blur-sm p-4',
                        'transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/[0.06]',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-foreground">{info.label}</span>
                        <span className={`flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold ring-2 ${c.ring} ${c.bg} ${c.text}`}>
                          {count}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>

                      {/* mini fill bar */}
                      {count > 0 && (
                        <div className="mt-3 h-1 rounded-full bg-primary/8 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${c.bg.replace('/10', '/50')}`}
                            style={{ width: `${Math.min((count / 20) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-5 italic">
                Note: These patterns are estimated based on response time and correctness proxies.
              </p>
            </GlassCard>
          </TabsContent>

        </Tabs>
      </div>
    </>
  )
}
