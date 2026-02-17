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

    // Find user
    const users = await sql`
      SELECT u.id, u.name, u.email, u.password_hash
      FROM users u
      WHERE u.email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Get profile
    const profiles = await sql`
      SELECT id, onboarded, selected_exam FROM user_profiles WHERE user_id = ${user.id}
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