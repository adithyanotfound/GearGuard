import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { CategoriesManagement } from '@/components/categories/categories-management'

export default async function CategoriesPage() {
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
      <CategoriesManagement />
    </div>
  )
}

