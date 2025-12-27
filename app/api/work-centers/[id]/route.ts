import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const body = await request.json()
  const { name, description, location } = body

  const workCenter = await prisma.workCenter.update({
    where: { id: params.id },
    data: {
      name,
      description,
      location,
    },
  })

  return NextResponse.json({ workCenter })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  await prisma.workCenter.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

