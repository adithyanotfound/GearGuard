import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const workCenters = await prisma.workCenter.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json({ workCenters })
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const body = await request.json()
  const { name, description, location } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 }
    )
  }

  const workCenter = await prisma.workCenter.create({
    data: {
      name,
      description,
      location,
    },
  })

  return NextResponse.json({ workCenter })
}

