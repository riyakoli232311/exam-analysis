'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { EXAM_TYPES } from '@/lib/constants'
import Papa from 'papaparse'

interface Question {
  question_number: number
  subject: string
  topic: string
  is_correct: boolean
  time_spent_seconds: number
  difficulty: string
}

export default function UploadPage() {
  const router = useRouter()
  const [testName, setTestName] = useState('')
  const [examType, setExamType] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'csv' | 'manual'>('csv')

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete(results) {
        const parsed: Question[] = results.data
          .filter((row: Record<string, string>) => row.subject && row.topic)
          .map((row: Record<string, string>, i: number) => ({
            question_number: i + 1,
            subject: row.subject || '',
            topic: row.topic || '',
            is_correct: row.is_correct === 'true' || row.is_correct === '1' || row.correct === 'true' || row.correct === '1',
            time_spent_seconds: parseInt(row.time_spent_seconds || row.time || '60') || 60,
            difficulty: row.difficulty || 'medium',
          }))
        setQuestions(parsed)
      },
      error() {
        setError('Failed to parse CSV file')
      },
    })
  }

  function addManualQuestion() {
    setQuestions([...questions, {
      question_number: questions.length + 1,
      subject: '',
      topic: '',
      is_correct: false,
      time_spent_seconds: 60,
      difficulty: 'medium',
    }])
  }

  function updateQuestion(index: number, field: string, value: string | boolean | number) {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, question_number: i + 1 })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!testName || !examType || questions.length === 0) {
      setError('Please fill in all fields and add at least one question')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tests/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, examType, questions }),
      })

      if (res.ok) {
        router.push('/dashboard/analysis')
      } else {
        const data = await res.json()
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function loadSampleData() {
    setTestName('Sample Mock Test 1')
    setExamType('jee')
    setQuestions([
      { question_number: 1, subject: 'Mathematics', topic: 'Algebra', is_correct: true, time_spent_seconds: 90, difficulty: 'easy' },
      { question_number: 2, subject: 'Mathematics', topic: 'Calculus', is_correct: false, time_spent_seconds: 180, difficulty: 'hard' },
      { question_number: 3, subject: 'Physics', topic: 'Mechanics', is_correct: true, time_spent_seconds: 120, difficulty: 'medium' },
      { question_number: 4, subject: 'Physics', topic: 'Optics', is_correct: false, time_spent_seconds: 30, difficulty: 'medium' },
      { question_number: 5, subject: 'Chemistry', topic: 'Organic', is_correct: true, time_spent_seconds: 60, difficulty: 'easy' },
      { question_number: 6, subject: 'Mathematics', topic: 'Probability', is_correct: false, time_spent_seconds: 200, difficulty: 'hard' },
      { question_number: 7, subject: 'Physics', topic: 'Thermodynamics', is_correct: true, time_spent_seconds: 100, difficulty: 'medium' },
      { question_number: 8, subject: 'Chemistry', topic: 'Inorganic', is_correct: false, time_spent_seconds: 45, difficulty: 'medium' },
      { question_number: 9, subject: 'Mathematics', topic: 'Trigonometry', is_correct: true, time_spent_seconds: 80, difficulty: 'easy' },
      { question_number: 10, subject: 'Physics', topic: 'Electricity', is_correct: true, time_spent_seconds: 110, difficulty: 'medium' },
    ])
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Mock Test</h1>
        <p className="text-muted-foreground mt-1">Upload your test results via CSV or enter them manually.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input id="testName" value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="e.g., JEE Mock 1" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Exam Type</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
              <SelectContent>
                {EXAM_TYPES.map((exam) => (
                  <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="button" variant={mode === 'csv' ? 'default' : 'outline'} onClick={() => setMode('csv')} className="gap-2">
            <FileText className="h-4 w-4" /> CSV Upload
          </Button>
          <Button type="button" variant={mode === 'manual' ? 'default' : 'outline'} onClick={() => setMode('manual')} className="gap-2">
            <Plus className="h-4 w-4" /> Manual Entry
          </Button>
          <Button type="button" variant="outline" onClick={loadSampleData} className="ml-auto">
            Load Sample Data
          </Button>
        </div>

        {mode === 'csv' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">Upload CSV File</CardTitle>
              <CardDescription>
                CSV should have columns: subject, topic, is_correct (true/false), time_spent_seconds, difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-8">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload CSV</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'manual' && (
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" onClick={addManualQuestion} className="self-start gap-2">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>
        )}

        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="text-xs text-muted-foreground w-6">#{q.question_number}</span>
                    {mode === 'manual' ? (
                      <>
                        <Input className="flex-1" placeholder="Subject" value={q.subject} onChange={(e) => updateQuestion(i, 'subject', e.target.value)} />
                        <Input className="flex-1" placeholder="Topic" value={q.topic} onChange={(e) => updateQuestion(i, 'topic', e.target.value)} />
                        <Select value={q.is_correct ? 'true' : 'false'} onValueChange={(v) => updateQuestion(i, 'is_correct', v === 'true')}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Correct</SelectItem>
                            <SelectItem value="false">Wrong</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input className="w-20" type="number" placeholder="Time(s)" value={q.time_spent_seconds} onChange={(e) => updateQuestion(i, 'time_spent_seconds', parseInt(e.target.value) || 0)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-foreground flex-1">{q.subject} &gt; {q.topic}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${q.is_correct ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                          {q.is_correct ? 'Correct' : 'Wrong'}
                        </span>
                        <span className="text-xs text-muted-foreground">{q.time_spent_seconds}s</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={loading || questions.length === 0} className="self-start gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Test
        </Button>
      </form>
    </div>
  )
}
