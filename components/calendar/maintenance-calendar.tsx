'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface MaintenanceCalendarProps {
  user: {
    id: string
    role: string
  }
}

interface Request {
  id: string
  subject: string
  scheduledDate: string
  maintenanceType: string
}

export function MaintenanceCalendar({ user }: MaintenanceCalendarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<Request[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreventiveRequests()
  }, [])

  const fetchPreventiveRequests = async () => {
    try {
      const response = await fetch('/api/requests')
      const data = await response.json()
      // Filter only preventive maintenance
      const preventive = (data.requests || []).filter(
        (req: Request) => req.maintenanceType === 'PREVENTIVE' && req.scheduledDate
      )
      setRequests(preventive)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    // Navigate to new request form with pre-filled date
    router.push(`/requests/new?scheduledDate=${date.toISOString()}&type=PREVENTIVE`)
  }

  const getRequestsForDate = (date: Date) => {
    return requests.filter((req) => {
      const reqDate = new Date(req.scheduledDate)
      return (
        reqDate.getDate() === date.getDate() &&
        reqDate.getMonth() === date.getMonth() &&
        reqDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const renderCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Add day names
    days.push(
      <div key="header" className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-black p-2">
            {day}
          </div>
        ))}
      </div>
    )

    // Add empty cells for days before the first day of the month
    const emptyCells = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      emptyCells.push(
        <div key={`empty-${i}`} className="aspect-square border border-black" />
      )
    }

    // Add cells for each day of the month
    const dayCells = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayRequests = getRequestsForDate(date)
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()

      dayCells.push(
        <div
          key={day}
          className={`aspect-square border-2 border-black p-2 cursor-pointer hover:bg-black hover:text-white ${
            isToday ? 'bg-black text-white' : 'bg-white text-black'
          }`}
          onClick={() => handleDateClick(date)}
        >
          <div className="font-semibold">{day}</div>
          {dayRequests.length > 0 && (
            <div className="text-xs mt-1">
              {dayRequests.length} request{dayRequests.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )
    }

    days.push(
      <div key="calendar" className="grid grid-cols-7 gap-1">
        {emptyCells}
        {dayCells}
      </div>
    )

    return days
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const changeMonth = (delta: number) => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1)
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">Maintenance Calendar</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white"
          >
            Previous
          </button>
          <h2 className="text-xl font-semibold text-black">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 border-2 border-black hover:bg-black hover:text-white"
          >
            Next
          </button>
        </div>
      </div>

      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-black">Preventive Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-black mb-2">
              Click on a date to create a new preventive maintenance request
            </p>
          </div>
          {renderCalendar()}
        </CardContent>
      </Card>

      <Card className="border-2 border-black mt-6">
        <CardHeader>
          <CardTitle className="text-black">Scheduled Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-black">No preventive maintenance scheduled</p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 border-2 border-black rounded cursor-pointer hover:bg-black hover:text-white"
                  onClick={() => router.push(`/requests/${req.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black">{req.subject}</span>
                    <span className="text-sm text-black">
                      {new Date(req.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

