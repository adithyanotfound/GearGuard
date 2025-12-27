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
  const { name, description } = body

  const team = await prisma.team.update({
    where: { id: params.id },
    data: {
      name,
      description,
    },
  })

  return NextResponse.json({ team })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireRole(request, ['ADMIN'])

  if (authResult instanceof NextResponse) {
    return authResult
  }

  await prisma.team.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}

