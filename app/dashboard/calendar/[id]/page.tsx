import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Clock, MapPin, User, FolderOpen, Bell } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventDetailPageProps {
  params: {
    id: string
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
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

  // Get event details with related data
  const { data: event, error } = await supabase
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
        type,
        email,
        phone
      ),
      profiles:assigned_to (
        id,
        full_name,
        email
      )
    `)
    .eq("id", params.id)
    .eq("firm_id", profile.firm_id)
    .single()

  if (error || !event) {
    notFound()
  }

  const eventTypeConfig = {
    meeting: { label: "Reunión", color: "bg-blue-500", variant: "default" as const },
    hearing: { label: "Audiencia", color: "bg-red-500", variant: "destructive" as const },
    deadline: { label: "Plazo", color: "bg-orange-500", variant: "secondary" as const },
    appointment: { label: "Cita", color: "bg-green-500", variant: "outline" as const },
    reminder: { label: "Recordatorio", color: "bg-purple-500", variant: "secondary" as const },
    other: { label: "Otro", color: "bg-gray-500", variant: "outline" as const },
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "PPP 'a las' HH:mm", { locale: es })
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: es })
  }

  const getClientName = () => {
    if (!event.clients) return null
    return event.clients.type === "company" ? event.clients.company_name : event.clients.full_name
  }

  const getReminderText = (minutes?: number) => {
    if (!minutes || minutes === 0) return "Sin recordatorio"
    if (minutes < 60) return `${minutes} minutos antes`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} horas antes`
    return `${Math.floor(minutes / 1440)} días antes`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/calendar">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
              <Badge variant={eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.variant || "outline"}>
                {eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.label || "Otro"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{formatDateTime(event.start_time)}</p>
          </div>
        </div>
        <Link href={`/dashboard/calendar/${event.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Evento
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{format(new Date(event.start_time), "PPP", { locale: es })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Horario</p>
                    <p className="font-medium">
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Recordatorio</p>
                    <p className="font-medium">{getReminderText(event.reminder_minutes)}</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">Descripción</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associations */}
          <Card>
            <CardHeader>
              <CardTitle>Asociaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.cases && (
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Caso Asociado</p>
                    <Link
                      href={`/dashboard/cases/${event.cases.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {event.cases.case_number} - {event.cases.title}
                    </Link>
                  </div>
                </div>
              )}

              {event.clients && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Cliente</p>
                    <Link
                      href={`/dashboard/clients/${event.clients.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {getClientName()}
                    </Link>
                  </div>
                </div>
              )}

              {event.profiles && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Asignado a</p>
                    <p className="font-medium">{event.profiles.full_name}</p>
                    {event.profiles.email && <p className="text-sm text-muted-foreground">{event.profiles.email}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {event.cases && (
                <Link href={`/dashboard/cases/${event.cases.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Ver Caso
                  </Button>
                </Link>
              )}
              {event.clients && (
                <Link href={`/dashboard/clients/${event.clients.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <User className="mr-2 h-4 w-4" />
                    Ver Cliente
                  </Button>
                </Link>
              )}
              <Link
                href={`/dashboard/calendar/new?case=${event.cases?.id}&client=${event.clients?.id}`}
                className="block"
              >
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Nuevo Evento
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tipo</span>
                <Badge variant="outline">
                  {eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.label || "Otro"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creado</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(event.created_at), "PPP", { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          {event.clients && (event.clients.email || event.clients.phone) && (
            <Card>
              <CardHeader>
                <CardTitle>Contacto del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{getClientName()}</p>
                </div>
                {event.clients.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{event.clients.email}</p>
                  </div>
                )}
                {event.clients.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-sm">{event.clients.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
