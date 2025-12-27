import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'MANAGER'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const searchParams = request.nextUrl.searchParams
  const role = searchParams.get('role') as Role | null

  const where: any = {}
  if (role) {
    where.role = role
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({ users })
}

