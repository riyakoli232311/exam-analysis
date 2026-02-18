'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Loader2, Plus, Trash2, Sparkles, CheckCircle2, XCircle } from 'lucide-react'
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

/* ─────────────────────────────────────────
   Shared SVG decorative background
   (same language as dashboard)
───────────────────────────────────────── */
function SceneBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      {/* Ambient blobs */}
      <div className="absolute -top-56 -left-56 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[160px]" />
      <div className="absolute top-1/3 -right-56 w-[640px] h-[640px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="absolute -bottom-56 left-1/3 w-[540px] h-[540px] rounded-full bg-chart-3/10 blur-[120px]" />
      <div className="absolute bottom-1/4 -left-32 w-[360px] h-[360px] rounded-full bg-chart-4/8 blur-[100px]" />

      {/* SVG scene */}
      <svg
        className="absolute inset-0 w-full h-full text-foreground"
        style={{ opacity: 0.055 }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="up-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <pattern id="up-hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon points="15,2 45,2 60,28 45,54 15,54 0,28"
              fill="none" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
          <pattern id="up-hatch" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
          <pattern id="up-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#up-dots)" />
        <rect x="45%" y="0" width="55%" height="50%" fill="url(#up-grid)" opacity="0.35" />

        <g opacity="0.55" transform="translate(55%, -8%) scale(1.2)">
          <rect width="640" height="520" fill="url(#up-hex)" />
        </g>
        <g opacity="0.38" transform="translate(-2%, 68%)">
          <rect width="360" height="320" fill="url(#up-hatch)" />
        </g>

        {/* Concentric rings – top right */}
        <circle cx="92%" cy="9%"  r="210" fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.4" />
        <circle cx="92%" cy="9%"  r="155" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.28" strokeDasharray="6 5" />
        <circle cx="92%" cy="9%"  r="95"  fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.18" />

        {/* Rings – bottom left */}
        <circle cx="6%"  cy="88%" r="130" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.32" />
        <circle cx="6%"  cy="88%" r="82"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 6" />

        {/* Accent rings */}
        <circle cx="50%" cy="4%"  r="70"  fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.22" strokeDasharray="4 6" />
        <circle cx="96%" cy="54%" r="50"  fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

        {/* Plus marks */}
        {([[17,27],[75,16],[37,71],[87,79],[61,44],[9,14],[48,54]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.45">
            <line x1="-7" y1="0" x2="7" y2="0" stroke="currentColor" strokeWidth="1.1" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="currentColor" strokeWidth="1.1" />
          </g>
        ))}

        {/* Diamonds */}
        {([[24,9],[71,64],[13,59],[84,39]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx}%, ${cy}%)`} opacity="0.35">
            <polygon points="0,-11 9,0 0,11 -9,0" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </g>
        ))}

        {/* Sweeping arcs */}
        <path d="M -80 900 Q 640 580 1520 840"  fill="none" stroke="currentColor" strokeWidth="1"   opacity="0.16" strokeDasharray="8 6" />
        <path d="M 840 -60 Q 1140 240 1520 100" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.13" />

        {/* Tiny circles */}
        {([[31,39,3],[57,21,2.2],[79,47,4],[43,81,2.6],[91,29,3],[67,87,3],[19,74,2]] as [number,number,number][]).map(([cx,cy,r],i) => (
          <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={r}
            fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.28" />
        ))}

        {/* Square cluster mid */}
        <g opacity="0.16" transform="translate(38%, 28%)">
          {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
            <rect key={`${row}-${col}`} x={col*22} y={row*22} width="14" height="14"
              fill="none" stroke="currentColor" strokeWidth="0.5" rx="2" />
          )))}
        </g>
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────
   Glass card wrapper
───────────────────────────────────────── */
function GlassCard({
  children,
  className = '',
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const glowMap: Record<string, string> = {
    blue:   'before:bg-primary/20',
    green:  'before:bg-accent/20',
    amber:  'before:bg-chart-3/20',
    purple: 'before:bg-chart-4/20',
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
      glow ? `before:absolute before:inset-0 before:opacity-30 before:blur-2xl before:-z-10 ${glowMap[glow]}` : '',
      className,
    ].join(' ')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function UploadPage() {
  const router = useRouter()
  const [testName, setTestName]   = useState('')
  const [examType, setExamType]   = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [mode, setMode]           = useState<'csv' | 'manual'>('csv')
  const [csvFileName, setCsvFileName] = useState('')

  /* ── all original handlers, untouched ── */
  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFileName(file.name)
    Papa.parse<Record<string, string>>(file, {
    header: true,
    complete(results) {
      const parsed: Question[] = results.data
        .filter((row) => row.subject && row.topic)
        .map((row, i) => ({
          question_number: i + 1,
          subject: row.subject ?? '',
          topic: row.topic ?? '',
          is_correct:
            row.is_correct === 'true' ||
            row.is_correct === '1' ||
            row.correct === 'true' ||
            row.correct === '1',
          time_spent_seconds:
            parseInt(row.time_spent_seconds ?? row.time ?? '60') || 60,
          difficulty: row.difficulty ?? 'medium',
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
      subject: '', topic: '', is_correct: false,
      time_spent_seconds: 60, difficulty: 'medium',
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
      { question_number: 1,  subject: 'Mathematics', topic: 'Algebra',         is_correct: true,  time_spent_seconds: 90,  difficulty: 'easy'   },
      { question_number: 2,  subject: 'Mathematics', topic: 'Calculus',         is_correct: false, time_spent_seconds: 180, difficulty: 'hard'   },
      { question_number: 3,  subject: 'Physics',     topic: 'Mechanics',        is_correct: true,  time_spent_seconds: 120, difficulty: 'medium' },
      { question_number: 4,  subject: 'Physics',     topic: 'Optics',           is_correct: false, time_spent_seconds: 30,  difficulty: 'medium' },
      { question_number: 5,  subject: 'Chemistry',   topic: 'Organic',          is_correct: true,  time_spent_seconds: 60,  difficulty: 'easy'   },
      { question_number: 6,  subject: 'Mathematics', topic: 'Probability',      is_correct: false, time_spent_seconds: 200, difficulty: 'hard'   },
      { question_number: 7,  subject: 'Physics',     topic: 'Thermodynamics',   is_correct: true,  time_spent_seconds: 100, difficulty: 'medium' },
      { question_number: 8,  subject: 'Chemistry',   topic: 'Inorganic',        is_correct: false, time_spent_seconds: 45,  difficulty: 'medium' },
      { question_number: 9,  subject: 'Mathematics', topic: 'Trigonometry',     is_correct: true,  time_spent_seconds: 80,  difficulty: 'easy'   },
      { question_number: 10, subject: 'Physics',     topic: 'Electricity',      is_correct: true,  time_spent_seconds: 110, difficulty: 'medium' },
    ])
  }

  const correctCount = questions.filter(q => q.is_correct).length
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

  return (
    <>
      <SceneBackground />

      <div className="relative flex flex-col gap-6 max-w-4xl pb-8">

        {/* ── Page header ── */}
        <GlassCard className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 ring-2 ring-primary/20 shrink-0">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Upload Mock Test</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload your test results via CSV or enter them manually.
              </p>
            </div>
          </div>
        </GlassCard>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Error banner ── */}
          {error && (
            <GlassCard className="px-4 py-3 border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </GlassCard>
          )}

          {/* ── Test info ── */}
          <GlassCard className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Test Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="testName" className="text-sm font-medium text-foreground">Test Name</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., JEE Mock 1"
                  required
                  className="bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 backdrop-blur-sm focus:ring-primary/30"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">Exam Type</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 backdrop-blur-sm">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((exam) => (
                      <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* ── Mode switcher ── */}
          <GlassCard className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Input Method</p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* CSV button */}
              <button
                type="button"
                onClick={() => setMode('csv')}
                className={[
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                  mode === 'csv'
                    ? 'bg-primary/12 dark:bg-primary/15 text-primary border-primary/25 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.25)]'
                    : 'text-muted-foreground border-white/20 dark:border-white/8 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/8',
                ].join(' ')}
              >
                <FileText className="h-4 w-4" /> CSV Upload
              </button>

              {/* Manual button */}
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={[
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                  mode === 'manual'
                    ? 'bg-primary/12 dark:bg-primary/15 text-primary border-primary/25 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.25)]'
                    : 'text-muted-foreground border-white/20 dark:border-white/8 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/8',
                ].join(' ')}
              >
                <Plus className="h-4 w-4" /> Manual Entry
              </button>

              {/* Sample data */}
              <button
                type="button"
                onClick={loadSampleData}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/20 dark:border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/8 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" /> Load Sample
              </button>
            </div>
          </GlassCard>

          {/* ── CSV drop zone ── */}
          {mode === 'csv' && (
            <GlassCard className="p-5" glow="blue">
              <p className="text-sm font-semibold text-foreground mb-1">Upload CSV File</p>
              <p className="text-xs text-muted-foreground mb-4">
                Columns needed: <span className="font-mono text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">subject</span>{' '}
                <span className="font-mono text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">topic</span>{' '}
                <span className="font-mono text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">is_correct</span>{' '}
                <span className="font-mono text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">time_spent_seconds</span>{' '}
                <span className="font-mono text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">difficulty</span>
              </p>

              <label className="group flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-primary/25 dark:border-primary/20 bg-primary/5 dark:bg-primary/5 hover:bg-primary/8 hover:border-primary/40 transition-all duration-200 p-10">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-200">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                {csvFileName ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{csvFileName}</span>
                    <span className="text-xs text-accent font-medium">✓ File loaded — {questions.length} questions parsed</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium text-foreground">Click to upload CSV</span>
                    <span className="text-xs text-muted-foreground">or drag and drop your file here</span>
                  </div>
                )}
                <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              </label>
            </GlassCard>
          )}

          {/* ── Manual add button ── */}
          {mode === 'manual' && (
            <Button
              type="button"
              variant="outline"
              onClick={addManualQuestion}
              className="self-start gap-2 bg-white/50 dark:bg-white/5 border-white/30 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          )}

          {/* ── Questions list ── */}
          {questions.length > 0 && (
            <GlassCard className="p-5" glow="green">
              {/* Header with live stats */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-foreground">
                    Questions <span className="text-muted-foreground font-normal">({questions.length})</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle2 className="h-3 w-3" /> {correctCount} correct
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                    <XCircle className="h-3 w-3" /> {questions.length - correctCount} wrong
                  </span>
                  <span className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    {accuracy}%
                  </span>
                </div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className={[
                      'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150',
                      'bg-white/50 dark:bg-white/[0.03]',
                      q.is_correct
                        ? 'border-accent/20 dark:border-accent/15'
                        : 'border-destructive/15 dark:border-destructive/10',
                    ].join(' ')}
                  >
                    <span className="text-xs text-muted-foreground w-6 tabular-nums shrink-0 font-medium">
                      #{q.question_number}
                    </span>

                    {mode === 'manual' ? (
                      <>
                        <Input
                          className="flex-1 h-8 text-xs bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10"
                          placeholder="Subject"
                          value={q.subject}
                          onChange={(e) => updateQuestion(i, 'subject', e.target.value)}
                        />
                        <Input
                          className="flex-1 h-8 text-xs bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10"
                          placeholder="Topic"
                          value={q.topic}
                          onChange={(e) => updateQuestion(i, 'topic', e.target.value)}
                        />
                        <Select
                          value={q.is_correct ? 'true' : 'false'}
                          onValueChange={(v) => updateQuestion(i, 'is_correct', v === 'true')}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Correct</SelectItem>
                            <SelectItem value="false">Wrong</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          className="w-20 h-8 text-xs bg-white/60 dark:bg-white/5 border-white/30 dark:border-white/10"
                          type="number"
                          placeholder="Time(s)"
                          value={q.time_spent_seconds}
                          onChange={(e) => updateQuestion(i, 'time_spent_seconds', parseInt(e.target.value) || 0)}
                        />
                        <Button
                          type="button" variant="ghost" size="icon"
                          onClick={() => removeQuestion(i)}
                          className="h-8 w-8 hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-foreground flex-1 truncate">
                          {q.subject} <span className="text-muted-foreground mx-1">›</span> {q.topic}
                        </span>
                        <span className={[
                          'text-xs font-semibold px-2 py-0.5 rounded-lg border shrink-0',
                          q.is_correct
                            ? 'bg-accent/10 text-accent border-accent/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20',
                        ].join(' ')}>
                          {q.is_correct ? '✓ Correct' : '✗ Wrong'}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0 w-12 text-right">
                          {q.time_spent_seconds}s
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ── Submit ── */}
          <GlassCard className="p-4" glow="blue">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">Ready to upload?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {questions.length > 0
                    ? `${questions.length} questions · ${accuracy}% accuracy · ${examType.toUpperCase() || 'no exam selected'}`
                    : 'Add questions above to continue'}
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading || questions.length === 0}
                className="gap-2 min-w-[140px] bg-primary hover:bg-primary/90 shadow-[0_4px_12px_-2px_rgba(99,102,241,0.4)] disabled:shadow-none"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  : <><Upload className="h-4 w-4" /> Upload Test</>
                }
              </Button>
            </div>
          </GlassCard>

        </form>
      </div>
    </>
  )
}
