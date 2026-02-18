'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, BookOpen, Target, BarChart3, Loader2, Sparkles } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const categoryIcons: Record<string, React.ReactNode> = {
  study:    <BookOpen  className="h-5 w-5 text-primary"  />,
  practice: <Target    className="h-5 w-5 text-accent"   />,
  strategy: <Brain     className="h-5 w-5 text-chart-3"  />,
  revision: <BarChart3 className="h-5 w-5 text-chart-5"  />,
}

const categoryGlow: Record<string, string> = {
  study:    'before:bg-primary/20',
  practice: 'before:bg-accent/20',
  strategy: 'before:bg-chart-3/20',
  revision: 'before:bg-chart-5/20',
}

const categoryIconBg: Record<string, string> = {
  study:    'bg-primary/12 ring-primary/20',
  practice: 'bg-accent/12 ring-accent/20',
  strategy: 'bg-chart-3/12 ring-chart-3/20',
  revision: 'bg-chart-5/12 ring-chart-5/20',
}

const priorityConfig: Record<string, { classes: string; dot: string; label: string }> = {
  high:   { classes: 'bg-destructive/10 text-destructive border-destructive/25',  dot: 'bg-destructive',  label: 'High'   },
  medium: { classes: 'bg-chart-3/10 text-chart-3 border-chart-3/25',              dot: 'bg-chart-3',      label: 'Medium' },
  low:    { classes: 'bg-accent/10 text-accent border-accent/25',                 dot: 'bg-accent',       label: 'Low'    },
}

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
          <pattern id="rc-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <pattern id="rc-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="15,2 45,2 60,28 45,54 15,54 0,28" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
          <pattern id="rc-hatch" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
          <pattern id="rc-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#rc-dots)" />
        <rect x="50%" y="0" width="50%" height="55%" fill="url(#rc-grid)" opacity="0.35" />

        <g opacity="0.55" transform="translate(58%, -6%) scale(1.2)">
          <rect width="640" height="520" fill="url(#rc-hex)" />
        </g>
        <g opacity="0.4" transform="translate(-2%, 70%)">
          <rect width="360" height="320" fill="url(#rc-hatch)" />
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
  glow?: string
}) {
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
      glow ? `before:absolute before:inset-0 before:opacity-30 before:blur-2xl before:-z-10 ${glow}` : '',
      className,
    ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   Recommendation card
───────────────────────────────────────── */
function RecCard({ rec, index }: {
  rec: { title: string; description: string; priority: string; category: string }
  index: number
}) {
  const priority = priorityConfig[rec.priority] || priorityConfig.medium
  const iconBg   = categoryIconBg[rec.category]  || 'bg-primary/12 ring-primary/20'
  const glow     = categoryGlow[rec.category]    || 'before:bg-primary/20'
  const icon     = categoryIcons[rec.category]   || <Brain className="h-5 w-5 text-primary" />

  return (
    <GlassCard glow={glow} className="p-5 group cursor-default">
      {/* subtle index watermark */}
      <span className="absolute top-4 right-4 text-[10px] font-bold text-muted-foreground/20 tabular-nums select-none">
        #{String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex items-start gap-4">
        {/* icon badge */}
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl ring-2 shrink-0 ${iconBg}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* title + priority */}
          <div className="flex items-start gap-2 flex-wrap mb-2 pr-6">
            <h3 className="text-sm font-semibold text-foreground leading-snug flex-1">{rec.title}</h3>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg border shrink-0 ${priority.classes}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
          </div>

          {/* description */}
          <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>

          {/* category pill */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/8 px-2 py-0.5 rounded-lg capitalize">
              {rec.category}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

/* ══════════════════════════════════════════════════ */
export default function RecommendationsPage() {
  const { data, isLoading } = useSWR('/api/recommendations', fetcher)

  const recommendations = data?.recommendations || []

  return (
    <>
      <SceneBackground />

      <div className="flex flex-col gap-6 relative">

        {/* ── Header ── */}
        <GlassCard className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0 relative">
              <Brain className="h-5 w-5 text-primary" />
              {/* sparkle accent */}
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-chart-3" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Study Recommendations</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Personalized recommendations generated by AI based on your performance data.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* ── Loading state ── */}
        {isLoading ? (
          <GlassCard className="py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <Brain className="absolute inset-0 m-auto h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Generating AI recommendations…</p>
            </div>
          </GlassCard>
        ) : recommendations.length === 0 ? (

          /* ── Empty state ── */
          <GlassCard className="py-16 px-6" glow="before:bg-primary/15">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 ring-2 ring-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">No recommendations yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Upload your test results so the AI can analyse your performance and generate personalised study tips.
              </p>
            </div>
          </GlassCard>

        ) : (
          <>
            {/* ── Summary strip ── */}
            <GlassCard className="px-5 py-3.5">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground tabular-nums">{recommendations.length}</span> recommendation{recommendations.length !== 1 ? 's' : ''} generated
                </span>
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {(['high','medium','low'] as const).map(p => {
                    const count = recommendations.filter((r: { priority: string }) => r.priority === p).length
                    if (!count) return null
                    const cfg = priorityConfig[p]
                    return (
                      <span key={p} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${cfg.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {count} {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </GlassCard>

            {/* ── Cards grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec: { title: string; description: string; priority: string; category: string }, i: number) => (
                <RecCard key={i} rec={rec} index={i} />
              ))}
            </div>
          </>
        )}

        {/* ── Footer note ── */}
        {!isLoading && (
          <GlassCard className="px-5 py-3.5">
            <p className="text-xs text-muted-foreground italic text-center">
              AI-assisted guidance based on available performance data. Recommendations are suggestions and should be adapted to your study style.
            </p>
          </GlassCard>
        )}

      </div>
    </>
  )
}
