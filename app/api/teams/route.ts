import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const teams = await prisma.team.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json({ teams })
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const body = await request.json()
  const { name, description } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 }
    )
  }

  const team = await prisma.team.create({
    data: {
      name,
      description,
    },
  })

  return NextResponse.json({ team })
}

