import { NextRequest, NextResponse } from 'next/server'
import { getAccountLoginMethod, normalizeEmail } from '@/lib/auth/accountLookup'
import { logServerError } from '@/lib/logging/server'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string }
    const email = normalizeEmail(body.email ?? '')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const method = await getAccountLoginMethod(email)

    return NextResponse.json({ method })
  } catch (error) {
    await logServerError('auth.accountMethod.route', error)
    return NextResponse.json({ error: 'Unable to determine login method' }, { status: 500 })
  }
}