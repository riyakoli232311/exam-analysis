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

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AnalysisPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher)

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse text-muted-foreground">Loading analysis...</div></div>
  }

  const subjectPerformance = analytics?.subjectPerformance || []
  const topicPerformance = analytics?.topicPerformance || []
  const weakTopics = analytics?.weakTopics || []
  const strongTopics = analytics?.strongTopics || []
  const mistakePatterns = analytics?.mistakePatterns || {}

  const radarData = subjectPerformance.map((s: { subject: string; accuracy: number; mastery: number }) => ({
    subject: s.subject,
    accuracy: s.accuracy,
    mastery: Math.min(s.mastery, 100),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Performance Analysis</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your test performance and identify areas for improvement.</p>
      </div>

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="flex flex-col gap-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Subject Accuracy</CardTitle>
                <CardDescription>How well you perform in each subject</CardDescription>
              </CardHeader>
              <CardContent>
                {subjectPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                      <YAxis type="category" dataKey="subject" width={100} tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'oklch(1 0 0)', border: '1px solid oklch(0.90 0.01 255)', borderRadius: '8px' }} />
                      <Bar dataKey="accuracy" fill="oklch(0.55 0.2 255)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">Upload tests to see analysis</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Skill Radar</CardTitle>
                <CardDescription>Overall subject mastery visualization</CardDescription>
              </CardHeader>
              <CardContent>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="oklch(0.90 0.01 255)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'oklch(0.50 0.02 261)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                      <Radar name="Accuracy" dataKey="accuracy" stroke="oklch(0.55 0.2 255)" fill="oklch(0.55 0.2 255)" fillOpacity={0.2} />
                      <Radar name="Mastery" dataKey="mastery" stroke="oklch(0.68 0.19 162)" fill="oklch(0.68 0.19 162)" fillOpacity={0.1} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">No data yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subject mastery bars */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Subject Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {subjectPerformance.map((s: { subject: string; accuracy: number; mastery: number; total: number; correct: number }, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{s.subject}</span>
                      <span className="text-xs text-muted-foreground">{s.correct}/{s.total} correct ({s.accuracy}%)</span>
                    </div>
                    <Progress value={Math.min(s.mastery, 100)} className="h-2.5" />
                  </div>
                ))}
                {subjectPerformance.length === 0 && (
                  <p className="text-muted-foreground text-sm">Upload tests to see mastery scores.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="flex flex-col gap-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground text-destructive">Weak Topics</CardTitle>
                <CardDescription>Topics below 50% accuracy that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                {weakTopics.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {weakTopics.map((t: { topic: string; subject: string; accuracy: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.topic}</p>
                          <p className="text-xs text-muted-foreground">{t.subject}</p>
                        </div>
                        <Badge variant="destructive">{t.accuracy}%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No weak topics identified yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground text-accent">Strong Topics</CardTitle>
                <CardDescription>Topics above 75% accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                {strongTopics.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {strongTopics.map((t: { topic: string; subject: string; accuracy: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.topic}</p>
                          <p className="text-xs text-muted-foreground">{t.subject}</p>
                        </div>
                        <Badge className="bg-accent text-accent-foreground">{t.accuracy}%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No strong topics yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">All Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {topicPerformance.map((t: { topic: string; subject: string; accuracy: number; total: number; correct: number }, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{t.subject} &gt; {t.topic}</span>
                      <span className="text-xs text-muted-foreground">{t.correct}/{t.total} ({t.accuracy}%)</span>
                    </div>
                    <Progress value={t.accuracy} className="h-2" />
                  </div>
                ))}
                {topicPerformance.length === 0 && <p className="text-muted-foreground text-sm">No topic data.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mistakes" className="flex flex-col gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Mistake Pattern Analysis</CardTitle>
              <CardDescription>Understanding the types of mistakes you make helps improve strategy.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(MISTAKE_TYPES).map(([key, info]) => {
                  const count = mistakePatterns[key] || 0
                  return (
                    <div key={key} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">{info.label}</span>
                        <span className="text-lg font-bold text-primary">{count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Note: These patterns are estimated based on response time and correctness proxies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
