import { Role, RequestStage } from '@prisma/client'
import { SessionUser } from './auth'

export type AllowedTransition = {
  from: RequestStage
  to: RequestStage
  roles: Role[]
}

// Stage transition rules
export const STAGE_TRANSITIONS: AllowedTransition[] = [
  {
    from: RequestStage.NEW,
    to: RequestStage.IN_PROGRESS,
    roles: [Role.EMPLOYEE, Role.TECHNICIAN, Role.MANAGER, Role.ADMIN],
  },
  {
    from: RequestStage.IN_PROGRESS,
    to: RequestStage.REPAIRED,
    roles: [Role.TECHNICIAN, Role.MANAGER, Role.ADMIN],
  },
  {
    from: RequestStage.REPAIRED,
    to: RequestStage.SCRAP,
    roles: [Role.MANAGER, Role.ADMIN],
  },
  // ADMIN can scrap from any stage
  {
    from: RequestStage.NEW,
    to: RequestStage.SCRAP,
    roles: [Role.ADMIN],
  },
  {
    from: RequestStage.IN_PROGRESS,
    to: RequestStage.SCRAP,
    roles: [Role.ADMIN],
  },
]

export function canTransitionStage(
  user: SessionUser,
  from: RequestStage,
  to: RequestStage,
  requestCreatedById?: string,
  requestAssignedToId?: string
): boolean {
  // Backward moves are not allowed
  const stageOrder = {
    [RequestStage.NEW]: 0,
    [RequestStage.IN_PROGRESS]: 1,
    [RequestStage.REPAIRED]: 2,
    [RequestStage.SCRAP]: 3,
  }

  if (stageOrder[from] > stageOrder[to]) {
    return false
  }

  // Check if transition is allowed for this role
  const transition = STAGE_TRANSITIONS.find(
    (t) => t.from === from && t.to === to
  )

  if (!transition) {
    return false
  }

  // Special rules for EMPLOYEE
  if (user.role === Role.EMPLOYEE) {
    // Can only move own requests from NEW to IN_PROGRESS if no technician assigned
    if (from === RequestStage.NEW && to === RequestStage.IN_PROGRESS) {
      if (requestCreatedById !== user.id) {
        return false
      }
      if (requestAssignedToId) {
        return false // Cannot move if technician already assigned
      }
    }
    return transition.roles.includes(user.role)
  }

  // Special rules for TECHNICIAN
  if (user.role === Role.TECHNICIAN) {
    // Can only move requests assigned to them
    if (requestAssignedToId !== user.id) {
      return false
    }
    return transition.roles.includes(user.role)
  }

  // MANAGER and ADMIN can do any allowed transition
  return transition.roles.includes(user.role)
}

export function canEditField(
  user: SessionUser,
  field: string,
  requestCreatedById?: string,
  requestAssignedToId?: string
): boolean {
  switch (field) {
    case 'scheduleDate':
      return [Role.TECHNICIAN, Role.MANAGER, Role.ADMIN].includes(user.role)
    case 'duration':
      return [Role.TECHNICIAN, Role.MANAGER, Role.ADMIN].includes(user.role)
    case 'priority':
      return [Role.MANAGER, Role.ADMIN].includes(user.role)
    case 'team':
      return [Role.MANAGER, Role.ADMIN].includes(user.role)
    case 'assignedTo':
      return [Role.MANAGER, Role.ADMIN].includes(user.role)
    case 'notes':
      // Anyone can add notes to requests they created or are assigned to
      if (user.role === Role.EMPLOYEE) {
        return requestCreatedById === user.id
      }
      if (user.role === Role.TECHNICIAN) {
        return requestAssignedToId === user.id
      }
      return [Role.MANAGER, Role.ADMIN].includes(user.role)
    default:
      return false
  }
}

export function canViewRequest(
  user: SessionUser,
  requestCreatedById: string,
  requestAssignedToId?: string
): boolean {
  if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
    return true
  }

  if (user.role === Role.EMPLOYEE) {
    return requestCreatedById === user.id
  }

  if (user.role === Role.TECHNICIAN) {
    // Technicians can view requests assigned to them OR unassigned requests (to assign themselves)
    return requestAssignedToId === user.id || !requestAssignedToId
  }

  return false
}

export function canAssignTechnician(user: SessionUser): boolean {
  return [Role.MANAGER, Role.ADMIN].includes(user.role)
}

export function canScrapRequest(user: SessionUser): boolean {
  return user.role === Role.ADMIN
}

export function canEditEquipment(user: SessionUser): boolean {
  return [Role.ADMIN].includes(user.role)
}

export function canEditCategories(user: SessionUser): boolean {
  return [Role.ADMIN].includes(user.role)
}

export function canEditTeams(user: SessionUser): boolean {
  return [Role.ADMIN].includes(user.role)
}

export function canEditWorkCenters(user: SessionUser): boolean {
  return [Role.ADMIN].includes(user.role)
}

export function canViewDashboard(user: SessionUser): boolean {
  return true // All roles can view dashboard, but metrics differ
}

