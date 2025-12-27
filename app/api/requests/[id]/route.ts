import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'
import { canViewRequest, canTransitionStage, canEditField, canScrapRequest } from '@/lib/rbac'
import { RequestStage, Priority, StatusDot } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      equipment: {
        select: {
          id: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      workCenter: {
        select: {
          id: true,
          name: true,
        },
      },
      notes: {
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!maintenanceRequest) {
    return NextResponse.json(
      { error: 'Request not found' },
      { status: 404 }
    )
  }

  if (!canViewRequest(user, maintenanceRequest.createdById, maintenanceRequest.assignedToId || undefined)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  return NextResponse.json({ request: maintenanceRequest })
}

export async function PATCH(
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

  const body = await request.json()
  const updateData: any = {}

  // Handle stage transition
  if (body.stage && body.stage !== existingRequest.stage) {
    if (!canTransitionStage(
      user,
      existingRequest.stage,
      body.stage as RequestStage,
      existingRequest.createdById,
      existingRequest.assignedToId || undefined
    )) {
      return NextResponse.json(
        { error: 'Stage transition not allowed' },
        { status: 403 }
      )
    }
    updateData.stage = body.stage as RequestStage

    // Auto-complete if moved to REPAIRED
    if (body.stage === RequestStage.REPAIRED) {
      updateData.completedAt = new Date()
    }
  }

  // Handle field updates with RBAC
  if (body.scheduledDate !== undefined && canEditField(user, 'scheduleDate', existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    updateData.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null
  }

  if (body.duration !== undefined && canEditField(user, 'duration', existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    updateData.duration = body.duration
  }

  if (body.priority !== undefined && canEditField(user, 'priority', existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    updateData.priority = body.priority as Priority
  }

  if (body.teamId !== undefined && canEditField(user, 'team', existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    updateData.teamId = body.teamId || null
  }

  if (body.assignedToId !== undefined && canEditField(user, 'assignedTo', existingRequest.createdById, existingRequest.assignedToId || undefined)) {
    updateData.assignedToId = body.assignedToId || null
  }

  if (body.statusDot !== undefined) {
    updateData.statusDot = body.statusDot as StatusDot
  }

  // Handle scrap (only ADMIN)
  if (body.stage === RequestStage.SCRAP) {
    if (!canScrapRequest(user)) {
      return NextResponse.json(
        { error: 'Only ADMIN can scrap requests' },
        { status: 403 }
      )
    }
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id: params.id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      equipment: {
        select: {
          id: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      workCenter: {
        select: {
          id: true,
          name: true,
        },
      },
      notes: {
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  return NextResponse.json({ request: updatedRequest })
}

