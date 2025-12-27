import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'
import { canViewRequest, canEditField } from '@/lib/rbac'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  const existingRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: params.id },
  })

  if (!existingRequest) {
    return NextResponse.json(
      { error: 'Request not found' },
      { status: 404 }
    )
  }

  if (!canViewRequest(user, existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  if (!canEditField(user, 'notes', existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    return NextResponse.json(
      { error: 'Cannot add notes to this request' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { content } = body

  if (!content) {
    return NextResponse.json(
      { error: 'Content is required' },
      { status: 400 }
    )
  }

  const note = await prisma.requestNote.create({
    data: {
      content,
      requestId: params.id,
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json({ note })
}

