import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { WorkCentersManagement } from '@/components/work-centers/work-centers-management'

export default async function WorkCentersPage() {
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
      <WorkCentersManagement />
    </div>
  )
}

