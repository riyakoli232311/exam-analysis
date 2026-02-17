'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { TrendingUp, CalendarDays } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProgressPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher)

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-muted-foreground">Loading progress...</div></div>
  }

  const progressData = analytics?.progressData || []
  const tests = analytics?.tests || []
  const readiness = analytics?.readiness || 0

  // Calculate improvement
  const hasMultipleTests = progressData.length >= 2
  const firstAccuracy = hasMultipleTests ? progressData[0].accuracy : 0
  const lastAccuracy = hasMultipleTests ? progressData[progressData.length - 1].accuracy : 0
  const improvement = lastAccuracy - firstAccuracy

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          Progress Tracking
        </h1>
        <p className="text-muted-foreground mt-1">Track your improvement over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-foreground">{progressData.length}</p>
            <p className="text-sm text-muted-foreground">Tests Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className={`text-3xl font-bold ${improvement >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Overall Improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-primary">{readiness}%</p>
            <p className="text-sm text-muted-foreground">Readiness Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Accuracy Trend</CardTitle>
          <CardDescription>Your accuracy progression across mock tests</CardDescription>
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.2 255)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.2 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="testName" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'oklch(1 0 0)', border: '1px solid oklch(0.90 0.01 255)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="accuracy" stroke="oklch(0.55 0.2 255)" fill="url(#accuracyGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">Upload multiple tests to see progress</div>
          )}
        </CardContent>
      </Card>

      {/* Score Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Score History</CardTitle>
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="testName" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'oklch(1 0 0)', border: '1px solid oklch(0.90 0.01 255)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.68 0.19 162)" strokeWidth={2} name="Score" />
                <Line type="monotone" dataKey="maxScore" stroke="oklch(0.90 0.01 255)" strokeWidth={1} strokeDasharray="5 5" name="Max" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No data yet</div>
          )}
        </CardContent>
      </Card>

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Test History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {tests.map((t: { id: string; test_name: string; accuracy: number; total_score: number; max_score: number; exam_type: string; created_at: string; time_taken_minutes: number }) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.test_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()} - {t.time_taken_minutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{t.exam_type.toUpperCase()}</Badge>
                    <span className="text-sm font-medium text-foreground">{Number(t.total_score)}/{Number(t.max_score)}</span>
                    <Badge className={Number(t.accuracy) >= 70 ? 'bg-accent text-accent-foreground' : Number(t.accuracy) >= 50 ? 'bg-chart-3/20 text-chart-3' : 'bg-destructive/10 text-destructive'}>
                      {Number(t.accuracy).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tests taken yet.</p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic">
        Improvement tracking shows correlation in your performance over time, not guaranteed predictions.
      </p>
    </div>
  )
}
