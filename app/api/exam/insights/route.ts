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
  const examType = profile?.selected_exam || 'jee'

  const tests = await sql`
    SELECT accuracy, total_score, max_score FROM mock_tests 
    WHERE user_id = ${session.userId} ORDER BY created_at DESC LIMIT 5
  `
  const avgAccuracy = tests.length > 0
    ? Math.round(tests.reduce((s: number, t: { accuracy: number }) => s + Number(t.accuracy), 0) / tests.length)
    : 0

  const prompt = `Generate exam insights for the ${examType.toUpperCase()} competitive exam.
Student's current average accuracy: ${avgAccuracy}% across ${tests.length} tests.

Return ONLY a valid JSON object, no markdown, no code blocks, no extra text:
{
  "overview": "Brief exam overview (2-3 sentences)",
  "syllabus": ["Key subject 1", "Key subject 2", "Key subject 3"],
  "highWeightageTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "commonMistakes": ["Mistake 1", "Mistake 2", "Mistake 3"],
  "preparationStrategy": "Detailed strategy paragraph",
  "readinessAssessment": "Assessment based on their ${avgAccuracy}% accuracy"
}

Be specific to ${examType.toUpperCase()}.`

  try {
    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt,
    })

    try {
      const cleaned = text.replace(/```json|```/g, '').trim()
      const insights = JSON.parse(cleaned)
      return NextResponse.json({ insights, examType })
    } catch {
      // fall through to fallback
    }
  } catch (error) {
    console.error('Groq insights error:', error)
  }

  return NextResponse.json({
    insights: {
      overview: `The ${examType.toUpperCase()} is one of the most competitive exams in India, requiring thorough preparation across multiple subjects.`,
      syllabus: ['Mathematics', 'Physics', 'Chemistry', 'General Aptitude'],
      highWeightageTopics: ['Calculus', 'Mechanics', 'Organic Chemistry', 'Algebra'],
      commonMistakes: ['Poor time management', 'Skipping easy questions', 'Not reading questions carefully'],
      preparationStrategy: 'Focus on building strong fundamentals, practice regularly with timed mock tests, and analyze your mistakes after each test.',
      readinessAssessment: avgAccuracy > 0
        ? `With ${avgAccuracy}% accuracy, you need to improve weak areas systematically.`
        : 'Take mock tests to assess your readiness.',
    },
    examType,
  })
}