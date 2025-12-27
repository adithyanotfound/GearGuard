'use client'

import { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { canTransitionStage } from '@/lib/rbac'
import { RequestStage, Role } from '@prisma/client'
import { SessionUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface KanbanBoardProps {
  user: {
    id: string
    role: string
  }
}

interface Request {
  id: string
  subject: string
  priority: string
  statusDot: string
  stage: string
  createdById: string
  assignedToId: string | null
  createdBy: {
    name: string
  }
  assignedTo: {
    name: string
  } | null
}

const STAGES: RequestStage[] = [
  RequestStage.NEW,
  RequestStage.IN_PROGRESS,
  RequestStage.REPAIRED,
  RequestStage.SCRAP,
]

function KanbanColumn({
  stage,
  requests,
  user,
  onDrop,
}: {
  stage: RequestStage
  requests: Request[]
  user: any
  onDrop: (requestId: string, newStage: RequestStage, createdById?: string, assignedToId?: string) => void
}) {
  const [{ isOver }, drop] = useDrop({
    accept: 'request',
    drop: (item: { 
      id: string
      stage: RequestStage
      createdById?: string
      assignedToId?: string
    }) => {
      if (item.stage !== stage) {
        onDrop(item.id, stage, item.createdById, item.assignedToId)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[250px] border-2 border-black rounded-lg p-4 transition-colors ${
        isOver ? 'bg-black/20 border-black' : 'bg-white'
      }`}
    >
      <h2 className="text-xl font-bold text-black mb-4">{stage}</h2>
      <div className="space-y-2 min-h-[200px]">
        {requests.length === 0 ? (
          <p className="text-sm text-black/50 text-center py-8">No requests</p>
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              user={user}
              currentStage={stage}
            />
          ))
        )}
      </div>
    </div>
  )
}

function RequestCard({
  request,
  user,
  currentStage,
}: {
  request: Request
  user: any
  currentStage: RequestStage
}) {
  const router = useRouter()
  const [{ isDragging }, drag] = useDrag({
    type: 'request',
    item: { 
      id: request.id, 
      stage: currentStage as RequestStage,
      createdById: request.createdById,
      assignedToId: request.assignedToId,
    },
    canDrag: () => {
      // Allow dragging - RBAC check happens on drop
      return true
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const getStatusDotColor = (statusDot: string) => {
    switch (statusDot) {
      case 'WHITE':
        return 'bg-white border-2 border-black'
      case 'RED':
        return 'bg-red-500'
      case 'GREEN':
        return 'bg-green-500'
      default:
        return 'bg-white border-2 border-black'
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/requests/${request.id}`)
  }

  return (
    <div
      ref={drag}
      className={`p-3 border-2 border-black rounded bg-white hover:bg-black hover:text-white transition-colors ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
      }`}
      onDoubleClick={handleDoubleClick}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-black">{request.subject}</h3>
        <div
          className={`w-3 h-3 rounded-full ${getStatusDotColor(request.statusDot)}`}
        />
      </div>
      <p className="text-sm text-black">
        {request.createdBy.name} → {request.assignedTo?.name || 'Unassigned'}
      </p>
      <p className="text-xs text-black mt-1">{request.priority}</p>
      <p className="text-xs text-black/50 mt-1">Double-click to view details</p>
    </div>
  )
}

export function KanbanBoard({ user }: KanbanBoardProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests')
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load requests',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = async (
    requestId: string, 
    newStage: RequestStage,
    createdById?: string,
    assignedToId?: string
  ) => {
    const request = requests.find((r) => r.id === requestId)
    if (!request) {
      toast({
        title: 'Error',
        description: 'Request not found',
        variant: 'destructive',
      })
      return
    }

    // Use provided IDs or fetch from request object
    const reqCreatedById = createdById || request.createdById
    const reqAssignedToId = assignedToId !== undefined ? assignedToId : request.assignedToId

    // Create user object with proper role type
    const userWithRole: SessionUser = {
      id: user.id,
      email: user.email || '',
      name: user.name || '',
      role: user.role as Role,
    }

    // Check if transition is allowed
    const canTransition = canTransitionStage(
      userWithRole,
      request.stage as RequestStage,
      newStage,
      reqCreatedById,
      reqAssignedToId || undefined
    )

    if (!canTransition) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to move this request to this stage',
        variant: 'destructive',
      })
      fetchRequests() // Refresh to reset position
      return
    }

    // Optimistic update
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, stage: newStage } : r
    )
    setRequests(updatedRequests)

    // Update on server
    try {
      const updateResponse = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update request',
          variant: 'destructive',
        })
        fetchRequests() // Rollback
        return
      }

      toast({
        title: 'Success',
        description: 'Request moved successfully',
      })
      
      // Refresh to get latest data
      fetchRequests()
    } catch (error) {
      console.error('Drop error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
      fetchRequests() // Rollback
    }
  }

  const requestsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = requests.filter((r) => r.stage === stage)
    return acc
  }, {} as Record<RequestStage, Request[]>)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black mb-8">Kanban Board</h1>
      <p className="text-sm text-black mb-4">
        Role: {user.role} - Drag and drop requests between columns to change their stage
      </p>

      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              requests={requestsByStage[stage] || []}
              user={user}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  )
}

