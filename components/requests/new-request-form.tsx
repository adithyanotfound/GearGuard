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

interface NewRequestFormProps {
  user: {
    id: string
    role: string
  }
}

interface Equipment {
  id: string
  name: string
  categoryId: string
  workCenterId: string | null
}

interface Category {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
}

interface WorkCenter {
  id: string
  name: string
}

export function NewRequestForm({ user }: NewRequestFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipmentId: '',
    workCenterId: '',
    categoryId: '',
    teamId: '',
    priority: 'MEDIUM',
    maintenanceType: 'CORRECTIVE',
    scheduledDate: '',
    statusDot: 'WHITE',
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const [equipmentRes, categoriesRes, teamsRes, workCentersRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/categories'),
        fetch('/api/teams'),
        fetch('/api/work-centers'),
      ])

      if (!equipmentRes.ok) {
        throw new Error(`Equipment API error: ${equipmentRes.status}`)
      }
      if (!categoriesRes.ok) {
        throw new Error(`Categories API error: ${categoriesRes.status}`)
      }
      if (!teamsRes.ok) {
        throw new Error(`Teams API error: ${teamsRes.status}`)
      }
      if (!workCentersRes.ok) {
        throw new Error(`Work Centers API error: ${workCentersRes.status}`)
      }

      const equipmentData = await equipmentRes.json()
      const categoriesData = await categoriesRes.json()
      const teamsData = await teamsRes.json()
      const workCentersData = await workCentersRes.json()

      setEquipment(equipmentData.equipment || [])
      setCategories(categoriesData.categories || [])
      setTeams(teamsData.teams || [])
      setWorkCenters(workCentersData.workCenters || [])

      // Log for debugging
      console.log('Loaded options:', {
        equipment: equipmentData.equipment?.length || 0,
        categories: categoriesData.categories?.length || 0,
        teams: teamsData.teams?.length || 0,
        workCenters: workCentersData.workCenters?.length || 0,
      })

      // Show warning if no data
      if (
        (!equipmentData.equipment || equipmentData.equipment.length === 0) &&
        (!categoriesData.categories || categoriesData.categories.length === 0) &&
        (!teamsData.teams || teamsData.teams.length === 0)
      ) {
        toast({
          title: 'No Data',
          description: 'No equipment, categories, or teams found. Please seed the database or create them first.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching options:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load options',
        variant: 'destructive',
      })
    }
  }

  const handleEquipmentChange = (equipmentId: string) => {
    const selectedEquipment = equipment.find((eq) => eq.id === equipmentId)
    if (selectedEquipment) {
      setFormData({
        ...formData,
        equipmentId,
        categoryId: selectedEquipment.categoryId,
        workCenterId: selectedEquipment.workCenterId || '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          equipmentId: formData.equipmentId || null,
          workCenterId: formData.workCenterId || null,
          categoryId: formData.categoryId || null,
          teamId: formData.teamId || null,
          scheduledDate: formData.scheduledDate || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create request',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Request created successfully',
      })

      router.push(`/requests/${data.request.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black mb-8">New Maintenance Request</h1>

      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-black">Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-black">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="border-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-black">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment" className="text-black">Equipment</Label>
                <Select
                  value={formData.equipmentId}
                  onValueChange={handleEquipmentChange}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workCenter" className="text-black">Work Center</Label>
                <Select
                  value={formData.workCenterId}
                  onValueChange={(value) => setFormData({ ...formData, workCenterId: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select work center" />
                  </SelectTrigger>
                  <SelectContent>
                    {workCenters.map((wc) => (
                      <SelectItem key={wc.id} value={wc.id}>
                        {wc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-black">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team" className="text-black">Team</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceType" className="text-black">Maintenance Type</Label>
                <Select
                  value={formData.maintenanceType}
                  onValueChange={(value) => setFormData({ ...formData, maintenanceType: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                    <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="text-black">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="border-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusDot" className="text-black">Status</Label>
                <Select
                  value={formData.statusDot}
                  onValueChange={(value) => setFormData({ ...formData, statusDot: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHITE">White (In Progress)</SelectItem>
                    <SelectItem value="RED">Red (Blocked)</SelectItem>
                    <SelectItem value="GREEN">Green (Ready)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-black">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="border-black"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black text-white hover:bg-black/90"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

