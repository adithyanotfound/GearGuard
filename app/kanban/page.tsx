import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export default async function KanbanPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <KanbanBoard user={user} />
    </div>
  )
}

