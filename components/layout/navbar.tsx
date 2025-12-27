'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface NavbarProps {
  user: {
    name: string
    role: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  return (
    <nav className="border-b-2 border-black bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-xl font-bold text-black">
            GearGuard
          </Link>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="text-black hover:underline">
              Dashboard
            </Link>
            <Link href="/requests" className="text-black hover:underline">
              Requests
            </Link>
            <Link href="/kanban" className="text-black hover:underline">
              Kanban
            </Link>
            <Link href="/calendar" className="text-black hover:underline">
              Calendar
            </Link>
            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <>
                <Link href="/equipment" className="text-black hover:underline">
                  Equipment
                </Link>
                <Link href="/categories" className="text-black hover:underline">
                  Categories
                </Link>
                <Link href="/teams" className="text-black hover:underline">
                  Teams
                </Link>
                <Link href="/work-centers" className="text-black hover:underline">
                  Work Centers
                </Link>
              </>
            )}
            {user.role === 'ADMIN' && (
              <Link href="/users" className="text-black hover:underline">
                Users
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-black">{user.name} ({user.role})</span>
          <Button onClick={handleLogout} variant="outline" className="border-black">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}

