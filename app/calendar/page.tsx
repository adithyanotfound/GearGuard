import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { MaintenanceCalendar } from '@/components/calendar/maintenance-calendar'

export default async function CalendarPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <MaintenanceCalendar user={user} />
    </div>
  )
}

