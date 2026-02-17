import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const sql = getDb()

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    // Create user
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id
    `

    // Create profile
    const [profile] = await sql`
      INSERT INTO user_profiles (user_id, display_name, onboarded)
      VALUES (${user.id}, ${name}, false)
      RETURNING id
    `

    await createSession(profile.id)

    return NextResponse.json({ success: true, userId: profile.id, onboarded: false })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}