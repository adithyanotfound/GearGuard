import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { UsersList } from '@/components/users/users-list'

export default async function UsersPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <UsersList />
    </div>
  )
}

