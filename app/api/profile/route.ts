import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { displayName, selectedExam, darkMode } = await req.json()
  const sql = getDb()

  await sql`
    UPDATE user_profiles SET
      display_name = COALESCE(${displayName}, display_name),
      selected_exam = COALESCE(${selectedExam}, selected_exam),
      dark_mode = COALESCE(${darkMode}, dark_mode),
      updated_at = now()
    WHERE id = ${session.userId}
  `

  return NextResponse.json({ success: true })
}
