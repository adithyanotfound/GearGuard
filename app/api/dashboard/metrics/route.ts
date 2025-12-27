import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'
import { RequestStage, Priority } from '@prisma/client'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  let requestWhere: any = {}

  // RBAC: Filter requests based on role
  if (user.role === 'EMPLOYEE') {
    requestWhere.createdById = user.id
  } else if (user.role === 'TECHNICIAN') {
    // Technicians can see requests assigned to them OR unassigned requests
    requestWhere.OR = [
      { assignedToId: user.id },
      { assignedToId: null },
    ]
  }
  // MANAGER and ADMIN see all requests

  // Critical Equipment (Priority = CRITICAL or Health < 30%)
  const criticalEquipment = await prisma.equipment.count({
    where: {
      isActive: true,
      OR: [
        {
          requests: {
            some: {
              priority: Priority.CRITICAL,
              stage: {
                not: RequestStage.SCRAP,
              },
            },
          },
        },
        {
          health: {
            lt: 30,
          },
        },
      ],
    },
  })

  // Technician Load
  const totalTechnicians = await prisma.user.count({
    where: {
      role: 'TECHNICIAN',
    },
  })

  const techniciansWithOpenRequests = await prisma.user.count({
    where: {
      role: 'TECHNICIAN',
      assignedRequests: {
        some: {
          stage: {
            not: RequestStage.SCRAP,
          },
        },
      },
    },
  })

  const technicianLoad = totalTechnicians > 0
    ? Math.round((techniciansWithOpenRequests / totalTechnicians) * 100)
    : 0

  // Open Requests (NEW stage)
  const openRequests = await prisma.maintenanceRequest.count({
    where: {
      ...requestWhere,
      stage: RequestStage.NEW,
    },
  })

  return NextResponse.json({
    criticalEquipment,
    technicianLoad,
    openRequests,
  })
}

