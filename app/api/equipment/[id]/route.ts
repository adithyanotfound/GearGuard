import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireRole(request, ['ADMIN', 'MANAGER', 'TECHNICIAN', 'EMPLOYEE'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      workCenter: true,
    },
  })

  if (!equipment) {
    return NextResponse.json(
      { error: 'Equipment not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ equipment })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const body = await request.json()
  const { name, description, serialNumber, health, categoryId, workCenterId, isActive } = body

  const equipment = await prisma.equipment.update({
    where: { id: params.id },
    data: {
      name,
      description,
      serialNumber,
      health,
      categoryId,
      workCenterId,
      isActive,
    },
    include: {
      category: true,
      workCenter: true,
    },
  })

  return NextResponse.json({ equipment })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  // Mark as inactive instead of deleting
  await prisma.equipment.update({
    where: { id: params.id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}

