'use client'

import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, BookOpen, AlertTriangle, Target, Brain, Loader2 } from 'lucide-react'

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

/* ── Section header inside a card ── */
function CardHeading({
  icon: Icon,
  title,
  description,
  iconClass = 'text-primary',
  iconBg = 'bg-primary/15',
}: {
  icon: React.ElementType
  title: string
  description?: string
  iconClass?: string
  iconBg?: string
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconBg} shrink-0 mt-0.5`}>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════ */
export default function ExamInsightsPage() {
  const { data, isLoading } = useSWR('/api/exam/insights', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Generating exam insights…</p>
        </div>
      </div>
    )
  }

  const insights = data?.insights || {}
  const examType = data?.examType || ''

  return (
    <div className="relative flex flex-col gap-6 pb-6">

      {/* ── Page header ── */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Exam Insights
              {examType && (
                <span className="ml-2 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 align-middle">
                  {examType.toUpperCase()}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-generated insights tailored to your target exam
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ── Overview ── */}
      {insights.overview && (
        <GlassCard glow="blue" className="p-6">
          <CardHeading
            icon={BookOpen}
            title="Exam Overview"
            iconClass="text-primary"
            iconBg="bg-primary/15"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.overview}</p>
        </GlassCard>
      )}

      {/* ── Syllabus + High Weightage Topics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Key Subjects */}
        <GlassCard className="p-6">
          <CardHeading
            icon={BookOpen}
            title="Key Subjects"
            description="Main subjects covered in the exam"
            iconClass="text-chart-3"
            iconBg="bg-chart-3/15"
          />
          {(insights.syllabus || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(insights.syllabus || []).map((item: string, i: number) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border
                    bg-chart-3/8 text-chart-3 border-chart-3/25
                    hover:bg-chart-3/15 transition-colors duration-150"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">No syllabus data available</p>
          )}
        </GlassCard>

        {/* High-Weightage Topics */}
        <GlassCard className="p-6">
          <CardHeading
            icon={Target}
            title="High-Weightage Topics"
            description="Topics that carry the most marks"
            iconClass="text-accent"
            iconBg="bg-accent/15"
          />
          {(insights.highWeightageTopics || []).length > 0 ? (
            <div className="flex flex-col gap-2">
              {(insights.highWeightageTopics || []).map((topic: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl
                    border border-white/20 dark:border-white/6
                    bg-white/40 dark:bg-white/[0.025]
                    hover:bg-white/60 dark:hover:bg-white/[0.05]
                    backdrop-blur-sm transition-all duration-150 px-3.5 py-2.5"
                >
                  <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <span className="text-sm text-foreground">{topic}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">No topic data available</p>
          )}
        </GlassCard>
      </div>

      {/* ── Common Pitfalls ── */}
      <GlassCard glow="rose" className="p-6">
        <CardHeading
          icon={AlertTriangle}
          title="Common Pitfalls"
          description="Mistakes most students make in this exam"
          iconClass="text-chart-5"
          iconBg="bg-chart-5/15"
        />
        {(insights.commonMistakes || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(insights.commonMistakes || []).map((mistake: string, i: number) => (
              <div
                key={i}
                className="relative rounded-xl border border-destructive/15 bg-destructive/5 p-3.5 overflow-hidden group hover:bg-destructive/8 transition-colors duration-150"
              >
                {/* left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-destructive/40 rounded-l-xl" />
                <div className="flex items-start gap-2 pl-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive/60 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-foreground leading-relaxed">{mistake}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No pitfall data available</p>
        )}
      </GlassCard>

      {/* ── Preparation Strategy + Readiness Assessment ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Preparation Strategy */}
        <GlassCard glow="purple" className="p-6">
          <CardHeading
            icon={Brain}
            title="Preparation Strategy"
            iconClass="text-chart-4"
            iconBg="bg-chart-4/15"
          />
          {insights.preparationStrategy ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{insights.preparationStrategy}</p>
          ) : (
            <p className="text-xs text-muted-foreground/60">No strategy data available</p>
          )}
        </GlassCard>

        {/* Readiness Assessment */}
        <GlassCard glow="green" className="p-6">
          <CardHeading
            icon={Target}
            title="Your Readiness Assessment"
            iconClass="text-accent"
            iconBg="bg-accent/15"
          />
          {insights.readinessAssessment ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{insights.readinessAssessment}</p>
          ) : (
            <p className="text-xs text-muted-foreground/60">Upload tests to generate your readiness assessment</p>
          )}
        </GlassCard>
      </div>

      <p className="text-xs text-muted-foreground/50 italic px-1">
        AI-assisted exam insights. Data may not reflect the latest exam pattern changes.
      </p>
    </div>
  )
}
