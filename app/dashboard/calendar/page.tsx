import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarView } from "@/components/calendar/calendar-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's firm
  const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get calendar events with related data
  const { data: events, error } = await supabase
    .from("calendar_events")
    .select(`
      *,
      cases (
        id,
        case_number,
        title
      ),
      clients (
        id,
        full_name,
        company_name,
        type
      ),
      profiles:assigned_to (
        id,
        full_name
      )
    `)
    .eq("firm_id", profile.firm_id)
    .gte("start_time", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .lte("start_time", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()) // Next 90 days
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
  }

  // Get event statistics
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const todayEvents =
    events?.filter((event) => {
      const eventDate = new Date(event.start_time)
      return eventDate >= today && eventDate < tomorrow
    }) || []

  const upcomingEvents =
    events?.filter((event) => {
      const eventDate = new Date(event.start_time)
      return eventDate >= tomorrow && eventDate < nextWeek
    }) || []

  const overdueEvents =
    events?.filter((event) => {
      const eventDate = new Date(event.start_time)
      return eventDate < today && event.event_type === "deadline"
    }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario y Recordatorios</h1>
          <p className="text-muted-foreground">Gestiona audiencias, citas y plazos legales</p>
        </div>
        <Link href="/dashboard/calendar/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">Programados para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 Días</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Eventos próximos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plazos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueEvents.length}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <p className="text-xs text-muted-foreground">En el período</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
          <CardDescription>Vista de eventos, audiencias y plazos importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarView events={events || []} />
        </CardContent>
      </Card>
    </div>
  )
}
