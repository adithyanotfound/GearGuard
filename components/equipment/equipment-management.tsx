'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'

interface Equipment {
  id: string
  name: string
  description: string | null
  serialNumber: string | null
  health: number
  isActive: boolean
  category: {
    id: string
    name: string
  }
  workCenter: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
}

interface WorkCenter {
  id: string
  name: string
}

export function EquipmentManagement() {
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    health: 100,
    categoryId: '',
    workCenterId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipmentRes, categoriesRes, workCentersRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/categories'),
        fetch('/api/work-centers'),
      ])

      const equipmentData = await equipmentRes.json()
      const categoriesData = await categoriesRes.json()
      const workCentersData = await workCentersRes.json()

      setEquipment(equipmentData.equipment || [])
      setCategories(categoriesData.categories || [])
      setWorkCenters(workCentersData.workCenters || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEquipment
        ? `/api/equipment/${editingEquipment.id}`
        : '/api/equipment'
      const method = editingEquipment ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workCenterId: formData.workCenterId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save equipment',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: `Equipment ${editingEquipment ? 'updated' : 'created'} successfully`,
      })

      setDialogOpen(false)
      setEditingEquipment(null)
      setFormData({
        name: '',
        description: '',
        serialNumber: '',
        health: 100,
        categoryId: '',
        workCenterId: '',
      })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq)
    setFormData({
      name: eq.name,
      description: eq.description || '',
      serialNumber: eq.serialNumber || '',
      health: eq.health,
      categoryId: eq.category.id,
      workCenterId: eq.workCenter?.id || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to mark this equipment as inactive?')) {
      return
    }

    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to delete equipment',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Equipment marked as inactive',
      })

      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Equipment Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingEquipment(null)
                setFormData({
                  name: '',
                  description: '',
                  serialNumber: '',
                  health: 100,
                  categoryId: '',
                  workCenterId: '',
                })
              }}
              className="bg-black text-white hover:bg-black/90"
            >
              New Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-black">
            <DialogHeader>
              <DialogTitle className="text-black">
                {editingEquipment ? 'Edit Equipment' : 'New Equipment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-black">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="health" className="text-black">Health (%)</Label>
                <Input
                  id="health"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.health}
                  onChange={(e) => setFormData({ ...formData, health: parseInt(e.target.value) })}
                  className="border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-black">Category *</Label>
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
                <Label htmlFor="workCenterId" className="text-black">Work Center</Label>
                <Select
                  value={formData.workCenterId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, workCenterId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select work center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {workCenters.map((wc) => (
                      <SelectItem key={wc.id} value={wc.id}>
                        {wc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-black"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-black text-white hover:bg-black/90">
                  {editingEquipment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center text-black">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((eq) => (
            <Card key={eq.id} className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-black">{eq.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-black">
                  <span className="font-semibold">Category:</span> {eq.category.name}
                </p>
                {eq.workCenter && (
                  <p className="text-sm text-black">
                    <span className="font-semibold">Work Center:</span> {eq.workCenter.name}
                  </p>
                )}
                <p className="text-sm text-black">
                  <span className="font-semibold">Health:</span> {eq.health}%
                </p>
                {eq.serialNumber && (
                  <p className="text-sm text-black">
                    <span className="font-semibold">Serial:</span> {eq.serialNumber}
                  </p>
                )}
                <div className="flex space-x-2 mt-4">
                  <Button
                    onClick={() => handleEdit(eq)}
                    variant="outline"
                    className="flex-1 border-black"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(eq.id)}
                    variant="destructive"
                    className="flex-1 bg-black text-white hover:bg-black/90"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

