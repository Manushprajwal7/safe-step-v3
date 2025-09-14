import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Get the user from the session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Get the user's profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', session.user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    role: profile?.role || 'user',
    onboarding_completed: profile?.onboarding_completed || false
  })
}
