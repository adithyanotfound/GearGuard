'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface RequestsListProps {
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
  createdBy: {
    name: string
  }
  assignedTo: {
    name: string
  } | null
  equipment: {
    name: string
  } | null
  category: {
    name: string
  } | null
  createdAt: string
}

export function RequestsList({ user }: RequestsListProps) {
  const router = useRouter()
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Maintenance Requests</h1>
        <Button
          onClick={() => router.push('/requests/new')}
          className="bg-black text-white hover:bg-black/90"
        >
          New Request
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-black">Loading...</div>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="border-2 border-black">
              <CardContent className="p-8 text-center text-black">
                No requests found
              </CardContent>
            </Card>
          ) : (
            requests.map((req) => (
              <Card
                key={req.id}
                className="border-2 border-black cursor-pointer hover:bg-black group transition-colors"
                onClick={() => router.push(`/requests/${req.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black group-hover:text-white transition-colors">{req.subject}</CardTitle>
                    <span className="text-sm text-black group-hover:text-white transition-colors">{req.stage}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-black group-hover:text-white transition-colors">Employee</p>
                      <p className="text-black group-hover:text-white transition-colors">{req.createdBy.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-black group-hover:text-white transition-colors">Technician</p>
                      <p className="text-black group-hover:text-white transition-colors">{req.assignedTo?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-black group-hover:text-white transition-colors">Priority</p>
                      <p className="text-black group-hover:text-white transition-colors">{req.priority}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-black group-hover:text-white transition-colors">Category</p>
                      <p className="text-black group-hover:text-white transition-colors">{req.category?.name || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

