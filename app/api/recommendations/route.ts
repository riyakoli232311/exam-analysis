import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export const maxDuration = 30

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const [profile] = await sql`SELECT * FROM user_profiles WHERE id = ${session.userId}`

  const tests = await sql`
    SELECT * FROM mock_tests WHERE user_id = ${session.userId} ORDER BY created_at DESC LIMIT 10
  `

  const questions = await sql`
    SELECT tq.* FROM test_questions tq
    JOIN mock_tests mt ON mt.id = tq.test_id
    WHERE mt.user_id = ${session.userId}
  `

  const topicMap: Record<string, { correct: number; total: number }> = {}
  for (const q of questions) {
    const key = `${q.subject} > ${q.topic}`
    if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0 }
    topicMap[key].total++
    if (q.is_correct) topicMap[key].correct++
  }
  const weakTopics = Object.entries(topicMap)
    .map(([topic, d]) => ({ topic, accuracy: Math.round((d.correct / d.total) * 100) }))
    .filter(t => t.accuracy < 50)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)

  const avgAccuracy = tests.length > 0
    ? Math.round(tests.reduce((s: number, t: { accuracy: number }) => s + Number(t.accuracy), 0) / tests.length)
    : 0

  const prompt = `Generate 5 personalized study recommendations for a ${profile?.selected_exam?.toUpperCase() || 'competitive exam'} aspirant.

Performance:
- Tests taken: ${tests.length}
- Average Accuracy: ${avgAccuracy}%
- Weak Areas: ${weakTopics.map(t => `${t.topic} (${t.accuracy}%)`).join(', ') || 'No data yet'}

Return ONLY a valid JSON array, no markdown, no extra text:
[{"title": "...", "description": "...", "priority": "high", "category": "study"}]

priority must be: high, medium, or low
category must be: study, practice, strategy, or revision`

  try {
    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt,
    })
    const cleaned = text.replace(/```json|```/g, '').trim()
    const recommendations = JSON.parse(cleaned)
    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Groq error:', error)
  }

  return NextResponse.json({
    recommendations: [
      { title: 'Take More Practice Tests', description: 'Upload at least 3 mock tests to get personalized insights.', priority: 'high', category: 'practice' },
      { title: 'Focus on Weak Areas', description: weakTopics.length > 0 ? `Focus on: ${weakTopics.map(t => t.topic).join(', ')}` : 'Upload tests to identify weak areas.', priority: 'high', category: 'study' },
      { title: 'Review Mistakes', description: 'Analyze your mistake patterns to understand conceptual gaps vs calculation errors.', priority: 'medium', category: 'revision' },
      { title: 'Time Management', description: 'Practice solving questions within time limits to improve speed.', priority: 'medium', category: 'strategy' },
      { title: 'Track Progress', description: 'Compare your scores over time to see improvement trends.', priority: 'low', category: 'strategy' },
    ]
  })
}