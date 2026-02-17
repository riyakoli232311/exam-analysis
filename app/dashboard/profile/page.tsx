'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, BarChart3, Target, GraduationCap, CalendarDays } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProfilePage() {
  const { data: userData } = useSWR('/api/auth/me', fetcher)
  const { data: analytics } = useSWR('/api/analytics', fetcher)

  const user = userData?.user || {}
  const stats = analytics?.stats || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0 }
  const readiness = analytics?.readiness || 0

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Profile
        </h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{user.display_name || 'Student'}</h2>
            <p className="text-sm text-muted-foreground">{user.email || ''}</p>
            <Badge variant="secondary" className="mt-2">
              <GraduationCap className="h-3 w-3 mr-1" />
              {user.selected_exam?.toUpperCase() || 'No exam selected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Tests Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stats.totalTests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Avg Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stats.avgAccuracy}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Questions Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stats.totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{readiness}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
