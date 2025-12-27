import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { EquipmentManagement } from '@/components/equipment/equipment-management'

export default async function EquipmentPage() {
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
      <EquipmentManagement />
    </div>
  )
}

