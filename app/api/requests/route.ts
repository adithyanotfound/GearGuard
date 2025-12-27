import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'
import { canViewRequest } from '@/lib/rbac'
import { RequestStage, Priority, MaintenanceType, StatusDot } from '@prisma/client'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  const stage = searchParams.get('stage') as RequestStage | null

  let where: any = {}

  // RBAC: Filter requests based on role
  if (user.role === 'EMPLOYEE') {
    where.createdById = user.id
  } else if (user.role === 'TECHNICIAN') {
    // Technicians can see requests assigned to them OR unassigned requests (so they can assign themselves)
    where.OR = [
      { assignedToId: user.id },
      { assignedToId: null },
    ]
  }
  // MANAGER and ADMIN can see all requests

  if (stage) {
    where.stage = stage
  }

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where,
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Filter by RBAC view permissions
  const filteredRequests = requests.filter((req) =>
    canViewRequest(user, req.createdById, req.assignedToId || undefined)
  )

  return NextResponse.json({ requests: filteredRequests })
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  const body = await request.json()
  const {
    subject,
    description,
    equipmentId,
    workCenterId,
    categoryId,
    teamId,
    priority = 'MEDIUM',
    maintenanceType = 'CORRECTIVE',
    scheduledDate,
    statusDot = 'WHITE',
  } = body

  if (!subject) {
    return NextResponse.json(
      { error: 'Subject is required' },
      { status: 400 }
    )
  }

  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      subject,
      description,
      equipmentId: equipmentId || null,
      workCenterId: workCenterId || null,
      categoryId: categoryId || null,
      teamId: teamId || null,
      priority: priority as Priority,
      maintenanceType: maintenanceType as MaintenanceType,
      statusDot: statusDot as StatusDot,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      createdById: user.id,
      stage: RequestStage.NEW,
    },
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
    },
  })

  return NextResponse.json({ request: maintenanceRequest })
}

