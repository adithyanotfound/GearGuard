'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { canTransitionStage, canEditField, canAssignTechnician, canScrapRequest } from '@/lib/rbac'
import { RequestStage } from '@prisma/client'

interface RequestDetailProps {
  requestId: string
  user: {
    id: string
    role: string
  }
}

interface Request {
  id: string
  subject: string
  description: string | null
  stage: string
  priority: string
  maintenanceType: string
  statusDot: string
  scheduledDate: string | null
  duration: number | null
  createdById: string
  assignedToId: string | null
  createdBy: {
    name: string
  }
  assignedTo: {
    id: string
    name: string
  } | null
  equipment: {
    name: string
  } | null
  category: {
    name: string
  } | null
  team: {
    id: string
    name: string
  } | null
  notes: Array<{
    id: string
    content: string
    createdAt: string
    createdBy: {
      name: string
    }
  }>
}

interface User {
  id: string
  name: string
  role: string
}

export function RequestDetail({ requestId, user }: RequestDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [request, setRequest] = useState<Request | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [noteContent, setNoteContent] = useState('')

  useEffect(() => {
    fetchRequest()
    if (canAssignTechnician(user as any)) {
      fetchUsers()
    }
  }, [])

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${requestId}`)
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load request',
          variant: 'destructive',
        })
        router.push('/requests')
        return
      }

      setRequest(data.request)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?role=TECHNICIAN')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleUpdate = async (updates: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update request',
          variant: 'destructive',
        })
        return
      }

      setRequest(data.request)
      toast({
        title: 'Success',
        description: 'Request updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteContent.trim()) return

    try {
      const response = await fetch(`/api/requests/${requestId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: noteContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add note',
          variant: 'destructive',
        })
        return
      }

      setNoteContent('')
      fetchRequest()
      toast({
        title: 'Success',
        description: 'Note added successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-black">Loading...</div>
      </div>
    )
  }

  if (!request) {
    return null
  }

  const userWithRole = user as any
  const canTransition = (to: RequestStage) => {
    return canTransitionStage(
      userWithRole,
      request.stage as RequestStage,
      to,
      request.createdById,
      request.assignedToId || undefined
    )
  }

  const canEdit = (field: string) => {
    return canEditField(
      userWithRole,
      field,
      request.createdById,
      request.assignedToId || undefined
    )
  }

  const canScrap = canScrapRequest(userWithRole)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">{request.subject}</h1>
        <Button
          onClick={() => router.push('/requests')}
          variant="outline"
          className="border-black"
        >
          Back to Requests
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-black">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-black">Stage</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Select
                    value={request.stage}
                    onValueChange={(value) => {
                      if (canTransition(value as RequestStage)) {
                        handleUpdate({ stage: value })
                      } else {
                        toast({
                          title: 'Error',
                          description: 'Stage transition not allowed',
                          variant: 'destructive',
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RequestStage).map((stage) => (
                        <SelectItem
                          key={stage}
                          value={stage}
                          disabled={!canTransition(stage)}
                        >
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {canScrap && (
                    <Button
                      onClick={() => handleUpdate({ stage: RequestStage.SCRAP })}
                      variant="destructive"
                      className="bg-black text-white hover:bg-black/90"
                    >
                      Scrap
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Priority</Label>
                  {canEdit('priority') ? (
                    <Select
                      value={request.priority}
                      onValueChange={(value) => handleUpdate({ priority: value })}
                    >
                      <SelectTrigger className="border-black mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-2 text-black">{request.priority}</p>
                  )}
                </div>

                <div>
                  <Label className="text-black">Status Dot</Label>
                  <Select
                    value={request.statusDot}
                    onValueChange={(value) => handleUpdate({ statusDot: value })}
                  >
                    <SelectTrigger className="border-black mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHITE">White (In Progress)</SelectItem>
                      <SelectItem value="RED">Red (Blocked)</SelectItem>
                      <SelectItem value="GREEN">Green (Ready)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {canEdit('scheduleDate') && (
                  <div>
                    <Label className="text-black">Scheduled Date</Label>
                    <Input
                      type="datetime-local"
                      value={request.scheduledDate ? new Date(request.scheduledDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleUpdate({ scheduledDate: e.target.value })}
                      className="border-black mt-2"
                    />
                  </div>
                )}

                {canEdit('duration') && (
                  <div>
                    <Label className="text-black">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={request.duration || ''}
                      onChange={(e) => handleUpdate({ duration: parseInt(e.target.value) || null })}
                      className="border-black mt-2"
                    />
                  </div>
                )}

                {canEdit('assignedTo') && (
                  <div>
                    <Label className="text-black">Assigned Technician</Label>
                    <Select
                      value={request.assignedToId || 'unassigned'}
                      onValueChange={(value) => handleUpdate({ assignedToId: value === 'unassigned' ? null : value })}
                    >
                      <SelectTrigger className="border-black mt-2">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-black">Description</Label>
                <p className="mt-2 text-black">{request.description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black">Equipment</Label>
                  <p className="mt-2 text-black">{request.equipment?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-black">Category</Label>
                  <p className="mt-2 text-black">{request.category?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-black">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit('notes') && (
                <div className="space-y-2">
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add a note..."
                    className="border-black"
                  />
                  <Button
                    onClick={handleAddNote}
                    className="bg-black text-white hover:bg-black/90"
                  >
                    Add Note
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {request.notes.map((note) => (
                  <div key={note.id} className="border-b border-black pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-black">{note.createdBy.name}</p>
                      <p className="text-sm text-black">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-black">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-black">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-black">Created By</Label>
                <p className="mt-2 text-black">{request.createdBy.name}</p>
              </div>
              <div>
                <Label className="text-black">Assigned To</Label>
                <p className="mt-2 text-black">{request.assignedTo?.name || 'Unassigned'}</p>
              </div>
              <div>
                <Label className="text-black">Team</Label>
                <p className="mt-2 text-black">{request.team?.name || '-'}</p>
              </div>
              <div>
                <Label className="text-black">Maintenance Type</Label>
                <p className="mt-2 text-black">{request.maintenanceType}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

