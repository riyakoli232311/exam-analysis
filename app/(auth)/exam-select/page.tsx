'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Loader2, GraduationCap } from 'lucide-react'
import { EXAM_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ExamSelectPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)

    try {
      const res = await fetch('/api/exam/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: selected }),
      })

      if (res.ok) {
        router.push('/dashboard')
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">Select Your Target Exam</h1>
          <p className="text-muted-foreground text-center text-pretty">
            This helps us personalize your analytics, AI recommendations, and study strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {EXAM_TYPES.map((exam) => (
            <Card
              key={exam.value}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50',
                selected === exam.value && 'border-primary ring-2 ring-primary/20 bg-primary/5'
              )}
              onClick={() => setSelected(exam.value)}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {exam.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <CardDescription>{exam.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selected || loading}
            className="min-w-48"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  )
}
