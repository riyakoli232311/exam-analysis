import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const sql = getDb()
    
    const existing = await sql`SELECT id FROM neon_auth."user" WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    
    const [authUser] = await sql`
      INSERT INTO neon_auth."user" (name, email, "emailVerified", role, banned)
      VALUES (${name}, ${email}, true, 'user', false)
      RETURNING id
    `

    await sql`
      INSERT INTO neon_auth.account ("userId", "providerId", password, scope)
      VALUES (${authUser.id}, 'credentials', ${hashedPassword}, 'email')
    `

    const [profile] = await sql`
      INSERT INTO user_profiles (auth_user_id, display_name, onboarded)
      VALUES (${authUser.id}, ${name}, false)
      RETURNING id
    `

    await createSession(profile.id)

    return NextResponse.json({ success: true, userId: profile.id, onboarded: false })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
