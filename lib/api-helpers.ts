import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from './auth'
import { SessionUser } from './auth'

export async function requireAuth(
  request: NextRequest
): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getSessionUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return { user }
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: SessionUser } | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  return { user }
}

