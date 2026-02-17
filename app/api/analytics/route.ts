import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { classifyMistake } from '@/lib/constants'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  
  const tests = await sql`
    SELECT * FROM mock_tests WHERE user_id = ${session.userId} ORDER BY created_at ASC
  `

  const questions = await sql`
    SELECT tq.* FROM test_questions tq
    JOIN mock_tests mt ON mt.id = tq.test_id
    WHERE mt.user_id = ${session.userId}
  `

  // Subject performance
  const subjectMap: Record<string, { correct: number; total: number; totalTime: number }> = {}
  for (const q of questions) {
    if (!subjectMap[q.subject]) subjectMap[q.subject] = { correct: 0, total: 0, totalTime: 0 }
    subjectMap[q.subject].total++
    subjectMap[q.subject].totalTime += q.time_spent_seconds || 0
    if (q.is_correct) subjectMap[q.subject].correct++
  }

  const subjectPerformance = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    total: data.total,
    correct: data.correct,
    avgTime: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
    mastery: Math.min(100, Math.round((data.correct / data.total) * 100 * (1 + data.total / 50))),
  }))

  // Topic performance
  const topicMap: Record<string, { correct: number; total: number; totalTime: number; subject: string }> = {}
  for (const q of questions) {
    const key = `${q.subject}|${q.topic}`
    if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0, totalTime: 0, subject: q.subject }
    topicMap[key].total++
    topicMap[key].totalTime += q.time_spent_seconds || 0
    if (q.is_correct) topicMap[key].correct++
  }

  const topicPerformance = Object.entries(topicMap).map(([key, data]) => {
    const topic = key.split('|')[1]
    return {
      topic,
      subject: data.subject,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      total: data.total,
      correct: data.correct,
      mastery: Math.min(100, Math.round((data.correct / data.total) * 100)),
    }
  })

  // Weak topics
  const weakTopics = topicPerformance.filter(t => t.accuracy < 50).sort((a, b) => a.accuracy - b.accuracy)
  const strongTopics = topicPerformance.filter(t => t.accuracy >= 75).sort((a, b) => b.accuracy - a.accuracy)

  // Mistake patterns
  const avgTime = questions.length > 0 
    ? questions.reduce((s: number, q: { time_spent_seconds: number }) => s + (q.time_spent_seconds || 0), 0) / questions.length 
    : 60
  const mistakePatterns: Record<string, number> = {}
  for (const q of questions) {
    const type = classifyMistake(q.time_spent_seconds || 0, q.is_correct, avgTime)
    if (type) {
      mistakePatterns[type] = (mistakePatterns[type] || 0) + 1
    }
  }

  // Progress over time
  const progressData = tests.map((t: { test_name: string; accuracy: number; total_score: number; max_score: number; created_at: string }) => ({
    testName: t.test_name,
    accuracy: Number(t.accuracy),
    score: Number(t.total_score),
    maxScore: Number(t.max_score),
    date: t.created_at,
  }))

  // Overall stats
  const totalTests = tests.length
  const avgAccuracy = totalTests > 0 
    ? Math.round(tests.reduce((s: number, t: { accuracy: number }) => s + Number(t.accuracy), 0) / totalTests) 
    : 0
  const totalQuestions = questions.length
  const totalCorrect = questions.filter((q: { is_correct: boolean }) => q.is_correct).length

  // Readiness indicator
  const readiness = Math.min(100, Math.round(
    (avgAccuracy * 0.4) + 
    (Math.min(totalTests, 20) / 20 * 30) + 
    (strongTopics.length / Math.max(topicPerformance.length, 1) * 30)
  ))

  return NextResponse.json({
    tests,
    subjectPerformance,
    topicPerformance,
    weakTopics,
    strongTopics,
    mistakePatterns,
    progressData,
    readiness,
    stats: { totalTests, avgAccuracy, totalQuestions, totalCorrect },
  })
}
