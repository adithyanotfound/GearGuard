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

interface Team {
  id: string
  name: string
  description: string | null
}

export function TeamsManagement() {
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()
      setTeams(data.teams || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load teams',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams'
      const method = editingTeam ? 'PATCH' : 'POST'

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
          description: data.error || 'Failed to save team',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: `Team ${editingTeam ? 'updated' : 'created'} successfully`,
      })

      setDialogOpen(false)
      setEditingTeam(null)
      setFormData({ name: '', description: '' })
      fetchTeams()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return
    }

    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to delete team',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Team deleted successfully',
      })

      fetchTeams()
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
        <h1 className="text-3xl font-bold text-black">Teams Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTeam(null)
                setFormData({ name: '', description: '' })
              }}
              className="bg-black text-white hover:bg-black/90"
            >
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-black">
            <DialogHeader>
              <DialogTitle className="text-black">
                {editingTeam ? 'Edit Team' : 'New Team'}
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
                  {editingTeam ? 'Update' : 'Create'}
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
          {teams.map((team) => (
            <Card key={team.id} className="border-2 border-black">
              <CardHeader>
                <CardTitle className="text-black">{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-black mb-4">{team.description || '-'}</p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(team)}
                    variant="outline"
                    className="flex-1 border-black"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(team.id)}
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

