import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const sql = getDb()
    
    const users = await sql`
      SELECT na.id, na.name, na.email, acc.password
      FROM neon_auth."user" na
      JOIN neon_auth.account acc ON acc."userId" = na.id
      WHERE na.email = ${email} AND acc."providerId" = 'credentials'
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const profiles = await sql`
      SELECT id, onboarded, selected_exam FROM user_profiles WHERE auth_user_id = ${user.id}
    `

    if (profiles.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    await createSession(profiles[0].id)

    return NextResponse.json({
      success: true,
      userId: profiles[0].id,
      onboarded: profiles[0].onboarded,
      selectedExam: profiles[0].selected_exam,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
