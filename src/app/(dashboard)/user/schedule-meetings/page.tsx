'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { useSession } from 'next-auth/react'
import { EventInput, EventContentArg } from '@fullcalendar/core'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GoogleCalendarEvent {
  summary: string
  description: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const { status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoading(false)
      return
    }
    if (status !== 'authenticated') return

    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/calendar-events')
        if (!res.ok) throw new Error('Failed to fetch events.')
        const data = await res.json()

        const formattedEvents: EventInput[] = data.items.map((event: GoogleCalendarEvent) => ({
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          extendedProps: {
            description: event.description,
          },
        }))
        setEvents(formattedEvents)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [status])

  const handleEventClick = (eventClickInfo: any) => {
    setSelectedEvent({
      title: eventClickInfo.event.title,
      description: eventClickInfo.event.extendedProps.description,
      start: eventClickInfo.event.start,
      end: eventClickInfo.event.end,
    })
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Karachi',
    }).format(date)

  if (isLoading || status === 'loading') {
    return (
      <div className="w-full h-full flex justify-center items-center py-6">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <div className="p-4">Please sign in to view your calendar.</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-5 bg-foreground text-white rounded-2xl mb-6">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
      />

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-white">
            <p className='!text-white break-words'>
              <strong>Description:</strong> <br />
                {selectedEvent?.description
                  ?.split(/(https?:\/\/[^\s]+)/g)
                  .map((part: string, i: number) =>
                    part.match(/^https?:\/\/[^\s]+$/) ? (
                      <a
                        key={i}
                        href={part}
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {part}
                      </a>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  ) || 'No description'}
            </p>
            <p className='!text-white'>
              <strong>Start:</strong> <br /> {selectedEvent?.start && formatDate(selectedEvent.start)}
            </p>
            <p className='!text-white'>
              <strong>End:</strong> <br /> {selectedEvent?.end && formatDate(selectedEvent.end)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function renderEventContent(eventInfo: EventContentArg) {
  const timeStr = eventInfo.timeText
  return (
    <div className="text-sm p-2 hover:bg-blue-950 rounded-xl">
      <b>{eventInfo.event.title}</b><br />
      <b>{timeStr}</b> 
    </div>
  )
}