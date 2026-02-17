'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, BookOpen, AlertTriangle, Target, Brain, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ExamInsightsPage() {
  const { data, isLoading } = useSWR('/api/exam/insights', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-muted-foreground">Generating exam insights...</span>
      </div>
    )
  }

  const insights = data?.insights || {}
  const examType = data?.examType || ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Exam Insights - {examType.toUpperCase()}
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-generated insights tailored to your target exam.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Exam Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.overview}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Syllabus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-chart-3" />
              Key Subjects
            </CardTitle>
            <CardDescription>Main subjects covered in the exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(insights.syllabus || []).map((item: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Weightage Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              High-Weightage Topics
            </CardTitle>
            <CardDescription>Topics that carry the most marks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {(insights.highWeightageTopics || []).map((topic: string, i: number) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-sm text-foreground">{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Mistakes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-5" />
            Common Pitfalls
          </CardTitle>
          <CardDescription>Mistakes most students make in this exam</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(insights.commonMistakes || []).map((mistake: string, i: number) => (
              <div key={i} className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
                <p className="text-sm text-foreground">{mistake}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preparation Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Preparation Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.preparationStrategy}</p>
        </CardContent>
      </Card>

      {/* Readiness Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Your Readiness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.readinessAssessment}</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic">
        AI-assisted exam insights. Data may not reflect the latest exam pattern changes.
      </p>
    </div>
  )
}
