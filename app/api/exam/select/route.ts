import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { examType } = await req.json()
  if (!examType) return NextResponse.json({ error: 'Exam type required' }, { status: 400 })

  const sql = getDb()
  await sql`
    UPDATE user_profiles 
    SET selected_exam = ${examType}, onboarded = true, updated_at = now()
    WHERE id = ${session.userId}
  `

  return NextResponse.json({ success: true })
}
