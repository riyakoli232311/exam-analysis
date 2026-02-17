import { NextResponse } from 'next/server'
import { streamText } from 'ai'
import { xai } from '@ai-sdk/xai'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export const maxDuration = 30

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

Return a JSON object with these fields:
{
  "overview": "Brief exam overview",
  "syllabus": ["Key subject 1", "Key subject 2", ...],
  "highWeightageTopics": ["Topic 1", "Topic 2", ...],
  "commonMistakes": ["Mistake 1", "Mistake 2", ...],
  "preparationStrategy": "Detailed strategy paragraph",
  "readinessAssessment": "Assessment based on their ${avgAccuracy}% accuracy"
}

Be specific to ${examType.toUpperCase()}. Do not wrap in markdown code blocks.`

  try {
    const result = await streamText({
      model: xai('grok-3-mini-fast', { apiKey: process.env.XAI_API_KEY }),
      prompt,
    })

    let text = ''
    for await (const chunk of result.textStream) {
      text += chunk
    }

    try {
      const insights = JSON.parse(text.trim())
      return NextResponse.json({ insights, examType })
    } catch {
      return NextResponse.json({
        insights: {
          overview: `The ${examType.toUpperCase()} is one of the most competitive exams in India, requiring thorough preparation across multiple subjects.`,
          syllabus: ['Mathematics', 'Physics', 'Chemistry', 'General Aptitude'],
          highWeightageTopics: ['Calculus', 'Mechanics', 'Organic Chemistry', 'Algebra'],
          commonMistakes: ['Poor time management', 'Skipping easy questions', 'Not reading questions carefully'],
          preparationStrategy: 'Focus on building strong fundamentals, practice regularly with timed mock tests, and analyze your mistakes after each test.',
          readinessAssessment: avgAccuracy > 0 ? `With ${avgAccuracy}% accuracy, you need to improve weak areas systematically.` : 'Take mock tests to assess your readiness.',
        },
        examType,
      })
    }
  } catch {
    return NextResponse.json({
      insights: {
        overview: `Prepare for ${examType.toUpperCase()} with structured practice and analytics.`,
        syllabus: ['Core Subjects', 'Aptitude', 'Reasoning'],
        highWeightageTopics: ['Fundamentals', 'Problem Solving', 'Application-based Questions'],
        commonMistakes: ['Lack of practice', 'Time management issues', 'Concept gaps'],
        preparationStrategy: 'Start by uploading your mock test results to get personalized insights.',
        readinessAssessment: 'Upload tests to get your readiness score.',
      },
      examType,
    })
  }
}
