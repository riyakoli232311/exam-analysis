'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { User, GraduationCap, Edit2, Check, X, Award, Trophy, Flame, Target, Calendar, Clock, BookOpen, Zap } from 'lucide-react'
import { EXAM_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

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

  const user = userData?.user || {}
  const stats = analytics?.stats || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0 }
  const readiness = analytics?.readiness || 0
  const tests = testsData?.tests || []

  // Calculate study streak (days with tests in last 30 days)
  const last30Days = tests.filter((t: any) => {
    const testDate = new Date(t.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return testDate >= thirtyDaysAgo
  })
  const uniqueDays = new Set(last30Days.map((t: any) => new Date(t.created_at).toDateString())).size

  // Calculate badges
  const badges = [
    {
      id: 'first-test',
      name: 'Getting Started',
      icon: BookOpen,
      earned: stats.totalTests >= 1,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'five-tests',
      name: '5 Test Streak',
      icon: Flame,
      earned: stats.totalTests >= 5,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: 'high-accuracy',
      name: '80% Club',
      icon: Target,
      earned: stats.avgAccuracy >= 80,
      color: 'text-green-500 bg-green-500/10'
    },
    {
      id: 'hundred-questions',
      name: 'Century',
      icon: Trophy,
      earned: stats.totalQuestions >= 100,
      color: 'text-yellow-500 bg-yellow-500/10'
    },
    {
      id: 'ready',
      name: 'Exam Ready',
      icon: Award,
      earned: readiness >= 70,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      id: 'consistent',
      name: 'Consistent',
      icon: Calendar,
      earned: uniqueDays >= 7,
      color: 'text-pink-500 bg-pink-500/10'
    },
  ]

  const earnedBadges = badges.filter(b => b.earned)

  // Recent activity
  const recentActivity = tests.slice(0, 5).map((t: any) => ({
    id: t.id,
    type: 'test',
    title: `Completed ${t.test_name}`,
    accuracy: Number(t.accuracy).toFixed(0),
    score: `${t.total_score}/${t.max_score}`,
    date: new Date(t.created_at).toLocaleDateString(),
    time: new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }))

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || undefined,
          selectedExam: selectedExam || undefined,
          targetScore: targetScore || undefined,
          examDate: examDate || undefined,
          studyHours: studyHours || undefined,
          bio: bio || undefined,
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

  // Calculate days until exam — reads from saved user data, not local state
  const daysUntilExam = user.exam_date
    ? Math.ceil((new Date(user.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your personal information and track your journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">About Me</CardTitle>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b">
                <div className="relative">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/20">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-xs font-bold border-2 border-background">
                    {stats.totalTests}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">{user.display_name || 'Student'}</h3>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Target Exam</Label>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPES.map((exam) => (
                          <SelectItem key={exam.value} value={exam.value}>
                            {exam.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Target Score / Rank</Label>
                    <Input
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      placeholder="e.g., 95 percentile, AIR 500"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Exam Date</Label>
                    <Input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Daily Study Hours</Label>
                    <Input
                      type="number"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      placeholder="e.g., 6"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Bio / Study Goals</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="What motivates you? What are your goals?"
                      className="min-h-20 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Target Exam</p>
                    <Badge className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {EXAM_TYPES.find(e => e.value === user.selected_exam)?.label || 'Not set'}
                    </Badge>
                  </div>

                  {user.target_score && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Goal</p>
                      <p className="text-sm font-medium text-foreground">{user.target_score}</p>
                    </div>
                  )}

                  {daysUntilExam !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Exam Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {daysUntilExam > 0 ? `${daysUntilExam} days to go` : daysUntilExam === 0 ? 'Today!' : 'Exam completed'}
                        </span>
                      </div>
                    </div>
                  )}

                  {user.study_hours_per_day && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Daily Study Goal</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">{user.study_hours_per_day} hours/day</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Study Streak</p>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-foreground">{uniqueDays} active days (last 30 days)</span>
                    </div>
                  </div>

                  {user.bio && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">About</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
                    </div>
                  )}

                  {!user.target_score && !user.exam_date && !user.study_hours_per_day && !user.bio && (
                    <div className="pt-2 pb-1">
                      <p className="text-xs text-muted-foreground italic">
                        Click edit to add personal goals and preferences
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Achievements & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Achievements
                <Badge variant="secondary" className="ml-auto">
                  {earnedBadges.length}/{badges.length} Unlocked
                </Badge>
              </CardTitle>
              <CardDescription>
                Keep studying to unlock all badges!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                      badge.earned
                        ? "border-primary/20 shadow-sm"
                        : "border-border/50 opacity-40"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full",
                      badge.earned ? badge.color : "bg-muted text-muted-foreground"
                    )}>
                      <badge.icon className="h-7 w-7" />
                    </div>
                    <p className="text-xs font-medium text-center text-foreground">{badge.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your last 5 test submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.date} • {activity.time}</span>
                          <Badge variant="outline" className="text-xs">
                            Score: {activity.score}
                          </Badge>
                        </div>
                      </div>
                      <div className={cn(
                        "text-sm font-bold shrink-0",
                        Number(activity.accuracy) >= 70 ? "text-accent" :
                        Number(activity.accuracy) >= 50 ? "text-chart-3" : "text-destructive"
                      )}>
                        {activity.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No tests uploaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload your first test to start tracking!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.totalTests}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tests Taken</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{stats.avgAccuracy}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Avg Accuracy</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-3">{stats.totalQuestions}</p>
                  <p className="text-xs text-muted-foreground mt-1">Questions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-chart-5">{readiness}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Readiness</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}