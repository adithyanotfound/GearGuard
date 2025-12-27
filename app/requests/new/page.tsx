import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { NewRequestForm } from '@/components/requests/new-request-form'

export default async function NewRequestPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <NewRequestForm user={user} />
    </div>
  )
}

