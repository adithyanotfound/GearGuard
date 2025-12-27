import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''

  const where: any = {
    isActive: true,
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ]
  }

  const equipment = await prisma.equipment.findMany({
    where,
    include: {
      category: true,
      workCenter: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json({ equipment })
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const body = await request.json()
  const { name, description, serialNumber, health, categoryId, workCenterId } = body

  if (!name || !categoryId) {
    return NextResponse.json(
      { error: 'Name and category are required' },
      { status: 400 }
    )
  }

  const equipment = await prisma.equipment.create({
    data: {
      name,
      description,
      serialNumber,
      health: health || 100,
      categoryId,
      workCenterId: workCenterId || null,
    },
    include: {
      category: true,
      workCenter: true,
    },
  })

  return NextResponse.json({ equipment })
}

