"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, Clock, MapPin, User, FolderOpen } from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import { es } from "date-fns/locale"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  event_type: string
  reminder_minutes?: number
  cases?: {
    id: string
    case_number: string
    title: string
  }
  clients?: {
    id: string
    full_name: string
    company_name?: string
    type: "individual" | "company"
  }
  profiles?: {
    id: string
    full_name: string
  }
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

const eventTypeConfig = {
  meeting: { label: "Reunión", color: "bg-blue-500", textColor: "text-blue-700" },
  hearing: { label: "Audiencia", color: "bg-red-500", textColor: "text-red-700" },
  deadline: { label: "Plazo", color: "bg-orange-500", textColor: "text-orange-700" },
  appointment: { label: "Cita", color: "bg-green-500", textColor: "text-green-700" },
  reminder: { label: "Recordatorio", color: "bg-purple-500", textColor: "text-purple-700" },
  other: { label: "Otro", color: "bg-gray-500", textColor: "text-gray-700" },
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDate = (date: Date) => {
    if (!events || !Array.isArray(events)) return []
    return events.filter((event) => {
      try {
        const eventDate = new Date(event.start_time)
        return isSameDay(eventDate, date)
      } catch (error) {
        console.log("[v0] Error parsing event date:", error)
        return false
      }
    })
  }

  const getSelectedDateEvents = () => {
    if (!selectedDate) return []
    return getEventsForDate(selectedDate)
  }

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "HH:mm", { locale: es })
    } catch (error) {
      console.log("[v0] Error formatting time:", error)
      return "00:00"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP 'a las' HH:mm", { locale: es })
    } catch (error) {
      console.log("[v0] Error formatting datetime:", error)
      return "Fecha inválida"
    }
  }

  const getClientName = (client?: CalendarEvent["clients"]) => {
    if (!client) return null
    return client.type === "company"
      ? client.company_name || "Empresa sin nombre"
      : client.full_name || "Cliente sin nombre"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>
            Mes
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
            Semana
          </Button>
          <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>
            Día
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentDate}
                onMonthChange={setCurrentDate}
                locale={es}
                className="w-full"
                components={{
                  DayContent: ({ date }) => {
                    const dayEvents = getEventsForDate(date)
                    const hasEvents = dayEvents && dayEvents.length > 0

                    return (
                      <div className="relative w-full h-full">
                        <span className={`${isToday(date) ? "font-bold" : ""}`}>{date.getDate()}</span>
                        {hasEvents && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                            <div className="flex gap-1">
                              {dayEvents.slice(0, 3).map((event, index) => (
                                <div
                                  key={index}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.color ||
                                    "bg-gray-500"
                                  }`}
                                />
                              ))}
                              {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Events Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getSelectedDateEvents().length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay eventos programados para esta fecha</p>
                ) : (
                  getSelectedDateEvents().map((event) => (
                    <div key={event.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.textColor || "text-gray-700"}`}
                        >
                          {eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.label || "Otro"}
                        </Badge>
                      </div>

                      {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}

                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}

                      {event.cases && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FolderOpen className="h-3 w-3" />
                          <Link href={`/dashboard/cases/${event.cases.id}`} className="hover:text-primary">
                            {event.cases.case_number}
                          </Link>
                        </div>
                      )}

                      {event.clients && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <Link href={`/dashboard/clients/${event.clients.id}`} className="hover:text-primary">
                            {getClientName(event.clients)}
                          </Link>
                        </div>
                      )}

                      {event.profiles && (
                        <div className="text-xs text-muted-foreground">Asignado a: {event.profiles.full_name}</div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/dashboard/calendar/${event.id}`}>
                          <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/dashboard/calendar/${event.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipos de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <span className="text-sm">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
