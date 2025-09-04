import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FolderOpen, Calendar, Clock, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get user's firm
    const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single()

    if (!profile) return null

    try {
      // Get dashboard metrics
      const [
        { count: clientsCount },
        { count: casesCount },
        { count: activeCasesCount },
        { count: upcomingEventsCount },
      ] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("firm_id", profile.firm_id),
        supabase.from("cases").select("*", { count: "exact", head: true }).eq("firm_id", profile.firm_id),
        supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("firm_id", profile.firm_id)
          .eq("status", "active"),
        supabase
          .from("calendar_events")
          .select("*", { count: "exact", head: true })
          .eq("firm_id", profile.firm_id)
          .gte("start_time", new Date().toISOString()),
      ])

      const stats = [
        {
          title: "Total Clientes",
          value: clientsCount || 0,
          description: "Clientes registrados",
          icon: Users,
          color: "text-blue-600",
        },
        {
          title: "Casos Totales",
          value: casesCount || 0,
          description: "Expedientes en el sistema",
          icon: FolderOpen,
          color: "text-green-600",
        },
        {
          title: "Casos Activos",
          value: activeCasesCount || 0,
          description: "En proceso actualmente",
          icon: TrendingUp,
          color: "text-orange-600",
        },
        {
          title: "Próximos Eventos",
          value: upcomingEventsCount || 0,
          description: "Citas y audiencias",
          icon: Calendar,
          color: "text-purple-600",
        },
      ]

      return (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen general de tu despacho jurídico</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimas acciones en tu despacho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Nuevo cliente registrado</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                    <Badge variant="secondary">Cliente</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Caso actualizado</p>
                      <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                    </div>
                    <Badge variant="secondary">Caso</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Documento subido</p>
                      <p className="text-xs text-muted-foreground">Ayer</p>
                    </div>
                    <Badge variant="secondary">Documento</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximas Citas
                </CardTitle>
                <CardDescription>Eventos programados para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Audiencia - Caso #001</p>
                      <p className="text-xs text-muted-foreground">10:00 AM</p>
                    </div>
                    <Badge>Audiencia</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Reunión con cliente</p>
                      <p className="text-xs text-muted-foreground">2:00 PM</p>
                    </div>
                    <Badge variant="outline">Reunión</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Revisión de documentos</p>
                      <p className="text-xs text-muted-foreground">4:30 PM</p>
                    </div>
                    <Badge variant="secondary">Revisión</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    } catch (metricsError) {
      console.error("[v0] Error loading dashboard metrics:", metricsError)

      // Return dashboard with default values if metrics fail
      const stats = [
        {
          title: "Total Clientes",
          value: 0,
          description: "Clientes registrados",
          icon: Users,
          color: "text-blue-600",
        },
        {
          title: "Casos Totales",
          value: 0,
          description: "Expedientes en el sistema",
          icon: FolderOpen,
          color: "text-green-600",
        },
        {
          title: "Casos Activos",
          value: 0,
          description: "En proceso actualmente",
          icon: TrendingUp,
          color: "text-orange-600",
        },
        {
          title: "Próximos Eventos",
          value: 0,
          description: "Citas y audiencias",
          icon: Calendar,
          color: "text-purple-600",
        },
      ]

      return (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen general de tu despacho jurídico</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimas acciones en tu despacho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Nuevo cliente registrado</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                    <Badge variant="secondary">Cliente</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Caso actualizado</p>
                      <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                    </div>
                    <Badge variant="secondary">Caso</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Documento subido</p>
                      <p className="text-xs text-muted-foreground">Ayer</p>
                    </div>
                    <Badge variant="secondary">Documento</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximas Citas
                </CardTitle>
                <CardDescription>Eventos programados para hoy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Audiencia - Caso #001</p>
                      <p className="text-xs text-muted-foreground">10:00 AM</p>
                    </div>
                    <Badge>Audiencia</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Reunión con cliente</p>
                      <p className="text-xs text-muted-foreground">2:00 PM</p>
                    </div>
                    <Badge variant="outline">Reunión</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Revisión de documentos</p>
                      <p className="text-xs text-muted-foreground">4:30 PM</p>
                    </div>
                    <Badge variant="secondary">Revisión</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  } catch (error) {
    console.error("[v0] Error in dashboard page:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-red-600">
            Error cargando el dashboard. Por favor, recarga la página.
          </p>
        </div>
      </div>
    )
  }
}
