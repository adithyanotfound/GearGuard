'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface DashboardContentProps {
  user: {
    id: string
    name: string
    role: string
  }
}

interface Metrics {
  criticalEquipment: number
  technicianLoad: number
  openRequests: number
}

interface Request {
  id: string
  subject: string
  createdBy: {
    name: string
  }
  assignedTo: {
    name: string
  } | null
  category: {
    name: string
  } | null
  stage: string
  team: {
    name: string
  } | null
}

export function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [metricsRes, requestsRes] = await Promise.all([
        fetch('/api/dashboard/metrics'),
        fetch('/api/requests'),
      ])

      const metricsData = await metricsRes.json()
      const requestsData = await requestsRes.json()

      setMetrics(metricsData)
      setRequests(requestsData.requests || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((req) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      req.subject.toLowerCase().includes(searchLower) ||
      req.createdBy.name.toLowerCase().includes(searchLower) ||
      req.assignedTo?.name.toLowerCase().includes(searchLower) ||
      req.category?.name.toLowerCase().includes(searchLower) ||
      req.team?.name.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <Button
          onClick={() => router.push('/requests/new')}
          className="bg-black text-white hover:bg-black/90"
        >
          New Request
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex justify-center">
          <Input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md border-black"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-black">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-black">Critical Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {metrics?.criticalEquipment || 0}
                </div>
                <p className="text-sm text-black mt-2">Priority = 3 or Health &lt; 30%</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-black">Technician Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {metrics?.technicianLoad || 0}%
                </div>
                <p className="text-sm text-black mt-2">Technicians with open requests</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-black">Open Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {metrics?.openRequests || 0}
                </div>
                <p className="text-sm text-black mt-2">Stage = NEW</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="text-black">Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left p-2 text-black">Subject</th>
                      <th className="text-left p-2 text-black">Employee</th>
                      <th className="text-left p-2 text-black">Technician</th>
                      <th className="text-left p-2 text-black">Category</th>
                      <th className="text-left p-2 text-black">Stage</th>
                      <th className="text-left p-2 text-black">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-4 text-black">
                          No requests found
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          className="border-b border-black cursor-pointer hover:bg-black group transition-colors"
                          onClick={() => router.push(`/requests/${req.id}`)}
                        >
                          <td className="p-2 text-black group-hover:text-white transition-colors">{req.subject}</td>
                          <td className="p-2 text-black group-hover:text-white transition-colors">{req.createdBy.name}</td>
                          <td className="p-2 text-black group-hover:text-white transition-colors">{req.assignedTo?.name || '-'}</td>
                          <td className="p-2 text-black group-hover:text-white transition-colors">{req.category?.name || '-'}</td>
                          <td className="p-2 text-black group-hover:text-white transition-colors">{req.stage}</td>
                          <td className="p-2 text-black group-hover:text-white transition-colors">{req.team?.name || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

