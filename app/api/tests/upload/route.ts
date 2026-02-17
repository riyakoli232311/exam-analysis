import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { testName, examType, questions } = await req.json()
    
    if (!testName || !examType || !questions?.length) {
      return NextResponse.json({ error: 'Test name, exam type and questions are required' }, { status: 400 })
    }

    const sql = getDb()
    
    const totalCorrect = questions.filter((q: { is_correct: boolean }) => q.is_correct).length
    const accuracy = (totalCorrect / questions.length) * 100
    const totalTime = questions.reduce((s: number, q: { time_spent_seconds: number }) => s + (q.time_spent_seconds || 0), 0)
    const totalScore = totalCorrect
    const maxScore = questions.length

    const [test] = await sql`
      INSERT INTO mock_tests (user_id, test_name, exam_type, total_score, max_score, accuracy, time_taken_minutes)
      VALUES (${session.userId}, ${testName}, ${examType}, ${totalScore}, ${maxScore}, ${accuracy}, ${Math.round(totalTime / 60)})
      RETURNING id
    `

    for (const q of questions) {
      await sql`
        INSERT INTO test_questions (test_id, question_number, subject, topic, is_correct, time_spent_seconds, difficulty)
        VALUES (${test.id}, ${q.question_number}, ${q.subject}, ${q.topic}, ${q.is_correct}, ${q.time_spent_seconds}, ${q.difficulty || 'medium'})
      `
    }

    return NextResponse.json({ success: true, testId: test.id })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload test' }, { status: 500 })
  }
}
