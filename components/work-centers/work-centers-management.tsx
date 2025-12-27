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
import { useToast } from '@/components/ui/use-toast'
import { Textarea } from '@/components/ui/textarea'

interface WorkCenter {
  id: string
  name: string
  description: string | null
  location: string | null
}

export function WorkCentersManagement() {
  const { toast } = useToast()
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkCenter, setEditingWorkCenter] = useState<WorkCenter | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  })

  useEffect(() => {
    fetchWorkCenters()
  }, [])

  const fetchWorkCenters = async () => {
    try {
      const response = await fetch('/api/work-centers')
      const data = await response.json()
      setWorkCenters(data.workCenters || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load work centers',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingWorkCenter
        ? `/api/work-centers/${editingWorkCenter.id}`
        : '/api/work-centers'
      const method = editingWorkCenter ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save work center',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: `Work center ${editingWorkCenter ? 'updated' : 'created'} successfully`,
      })

      setDialogOpen(false)
      setEditingWorkCenter(null)
      setFormData({ name: '', description: '', location: '' })
      fetchWorkCenters()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (wc: WorkCenter) => {
    setEditingWorkCenter(wc)
    setFormData({
      name: wc.name,
      description: wc.description || '',
      location: wc.location || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work center?')) {
      return
    }

    try {
      const response = await fetch(`/api/work-centers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to delete work center',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Work center deleted successfully',
      })

      fetchWorkCenters()
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
        <h1 className="text-3xl font-bold text-black">Work Centers Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingWorkCenter(null)
                setFormData({ name: '', description: '', location: '' })
              }}
              className="bg-black text-white hover:bg-black/90"
            >
              New Work Center
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-black">
            <DialogHeader>
              <DialogTitle className="text-black">
                {editingWorkCenter ? 'Edit Work Center' : 'New Work Center'}
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
                <Label htmlFor="location" className="text-black">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-black"
                />
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
                  {editingWorkCenter ? 'Update' : 'Create'}
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
          {workCenters.map((wc) => (
            <Card key={wc.id} className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-black">{wc.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {wc.location && (
                  <p className="text-sm text-black">
                    <span className="font-semibold">Location:</span> {wc.location}
                  </p>
                )}
                <p className="text-sm text-black">{wc.description || '-'}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    onClick={() => handleEdit(wc)}
                    variant="outline"
                    className="flex-1 border-black"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(wc.id)}
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

