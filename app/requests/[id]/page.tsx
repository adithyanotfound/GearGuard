import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { RequestDetail } from '@/components/requests/request-detail'

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <RequestDetail requestId={params.id} user={user} />
    </div>
  )
}

