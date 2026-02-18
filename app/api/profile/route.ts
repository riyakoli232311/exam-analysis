import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { displayName, selectedExam, darkMode, targetScore, examDate, studyHours, bio } = await req.json()
  const sql = getDb()

  await sql`
    UPDATE user_profiles SET
      display_name = COALESCE(${displayName ?? null}, display_name),
      selected_exam = COALESCE(${selectedExam ?? null}, selected_exam),
      dark_mode = COALESCE(${darkMode ?? null}, dark_mode),
      target_score = COALESCE(${targetScore ?? null}, target_score),
      exam_date = COALESCE(${examDate ?? null}, exam_date),
      study_hours_per_day = COALESCE(${studyHours ? Number(studyHours) : null}, study_hours_per_day),
      bio = COALESCE(${bio ?? null}, bio),
      updated_at = now()
    WHERE id = ${session.userId}
  `

  return NextResponse.json({ success: true })
}