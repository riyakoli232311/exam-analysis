'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Target, Clock, TrendingUp, Brain, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const COLORS = [
  'oklch(0.55 0.2 255)',
  'oklch(0.68 0.19 162)',
  'oklch(0.72 0.19 50)',
  'oklch(0.60 0.22 300)',
  'oklch(0.65 0.20 25)',
]

export default function DashboardPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher)
  const { data: userData } = useSWR('/api/auth/me', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const stats = analytics?.stats || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0 }
  const subjectPerformance = analytics?.subjectPerformance || []
  const progressData = analytics?.progressData || []
  const mistakePatterns = analytics?.mistakePatterns || {}
  const readiness = analytics?.readiness || 0
  const weakTopics = analytics?.weakTopics || []

  const mistakeData = Object.entries(mistakePatterns).map(([key, value]) => ({
    name: key === 'conceptual' ? 'Conceptual' : key === 'calculation' ? 'Calculation' : key === 'guessing' ? 'Guessing' : 'Time Pressure',
    value: value as number,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Welcome back, {userData?.user?.display_name || 'Student'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {stats.totalTests > 0
            ? `You have taken ${stats.totalTests} test${stats.totalTests > 1 ? 's' : ''} with an average accuracy of ${stats.avgAccuracy}%.`
            : 'Upload your first mock test to see analytics.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalTests}</p>
              <p className="text-sm text-muted-foreground">Tests Taken</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-3/10">
              <Clock className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Questions Solved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-5/10">
              <TrendingUp className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{readiness}%</p>
              <p className="text-sm text-muted-foreground">Readiness Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Subject Performance</CardTitle>
            <CardDescription>Accuracy across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="subject" className="text-xs" tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                  <YAxis tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0.01 255)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="accuracy" fill="oklch(0.55 0.2 255)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Upload tests to see subject performance
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Progress Over Time</CardTitle>
            <CardDescription>Accuracy trend across tests</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="testName" className="text-xs" tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                  <YAxis tick={{ fill: 'oklch(0.50 0.02 261)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0.01 255)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="oklch(0.68 0.19 162)" strokeWidth={2} dot={{ fill: 'oklch(0.68 0.19 162)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Upload multiple tests to see progress
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mistake Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-5" />
              Mistake Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mistakeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={mistakeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {mistakeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No mistake data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Weak Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length > 0 ? (
              <div className="flex flex-col gap-3">
                {weakTopics.slice(0, 5).map((topic: { topic: string; subject: string; accuracy: number }, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{topic.topic}</span>
                      <span className="text-xs text-muted-foreground">{topic.accuracy}%</span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Upload tests to identify weak topics
              </div>
            )}
          </CardContent>
        </Card>

        {/* Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Exam Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.90 0.01 255)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="oklch(0.55 0.2 255)"
                    strokeWidth="8"
                    strokeDasharray={`${readiness * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{readiness}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center text-pretty">
                {readiness >= 70
                  ? 'Great progress! Keep practicing.'
                  : readiness >= 40
                  ? 'Getting there. Focus on weak areas.'
                  : 'Upload more tests to improve your score.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
