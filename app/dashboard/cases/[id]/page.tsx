import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, DollarSign, Clock, FileText } from "lucide-react"
import Link from "next/link"

interface CaseDetailPageProps {
  params: {
    id: string
  }
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
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

  // Get case details with related data
  const { data: case_, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (
        id,
        full_name,
        company_name,
        type,
        email,
        phone
      ),
      profiles:assigned_lawyer (
        id,
        full_name,
        email
      )
    `)
    .eq("id", params.id)
    .eq("firm_id", profile.firm_id)
    .single()

  if (error || !case_) {
    notFound()
  }

  // Get case statistics
  const [{ count: documentsCount }, { count: timeEntriesCount }, { data: totalHours }] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("case_id", case_.id),
    supabase.from("time_entries").select("*", { count: "exact", head: true }).eq("case_id", case_.id),
    supabase.from("time_entries").select("hours").eq("case_id", case_.id),
  ])

  const totalBillableHours = totalHours?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0

  const statusConfig = {
    active: { label: "Activo", color: "bg-green-500" },
    pending: { label: "Pendiente", color: "bg-orange-500" },
    closed: { label: "Cerrado", color: "bg-blue-500" },
    archived: { label: "Archivado", color: "bg-gray-500" },
  }

  const priorityConfig = {
    low: { label: "Baja", variant: "secondary" as const },
    medium: { label: "Media", variant: "outline" as const },
    high: { label: "Alta", variant: "destructive" as const },
    urgent: { label: "Urgente", variant: "destructive" as const },
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No definida"
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getClientName = () => {
    return case_.clients.type === "company" ? case_.clients.company_name : case_.clients.full_name
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cases">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{case_.case_number}</h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig[case_.status].color}`} />
                <span className="text-sm font-medium">{statusConfig[case_.status].label}</span>
              </div>
              <Badge variant={priorityConfig[case_.priority].variant}>{priorityConfig[case_.priority].label}</Badge>
            </div>
            <p className="text-xl text-muted-foreground">{case_.title}</p>
            {case_.practice_area && (
              <Badge variant="outline" className="mt-2">
                {case_.practice_area}
              </Badge>
            )}
          </div>
        </div>
        <Link href={`/dashboard/cases/${case_.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Caso
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Case Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Caso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{getClientName()}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Abogado Asignado</p>
                  <p className="font-medium">{case_.profiles?.full_name || "Sin asignar"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Fecha de Inicio</p>
                  <p className="font-medium">{formatDate(case_.start_date)}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Fecha Límite</p>
                  <p className="font-medium">{formatDate(case_.expected_end_date)}</p>
                </div>
              </div>

              {case_.description && (
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">Descripción</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{case_.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Facturación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Tipo de Facturación</p>
                  <p className="font-medium">
                    {case_.billing_type === "hourly" && "Por Horas"}
                    {case_.billing_type === "fixed" && "Tarifa Fija"}
                    {case_.billing_type === "contingency" && "Por Éxito"}
                  </p>
                </div>
                {case_.billing_type === "hourly" && case_.hourly_rate && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Tarifa por Hora</p>
                    <p className="font-medium">{formatCurrency(case_.hourly_rate)}</p>
                  </div>
                )}
                {case_.billing_type === "fixed" && case_.fixed_fee && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Tarifa Fija</p>
                    <p className="font-medium">{formatCurrency(case_.fixed_fee)}</p>
                  </div>
                )}
                {case_.billing_type === "contingency" && case_.contingency_percentage && (
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Porcentaje de Éxito</p>
                    <p className="font-medium">{case_.contingency_percentage}%</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Horas Registradas</p>
                  <p className="font-medium">{totalBillableHours.toFixed(2)} hrs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Documentos</span>
                <Badge variant="outline">{documentsCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Registros de Tiempo</span>
                <Badge variant="outline">{timeEntriesCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Horas Totales</span>
                <Badge variant="outline">{totalBillableHours.toFixed(1)}h</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/documents/new?case=${case_.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Subir Documento
                </Button>
              </Link>
              <Link href={`/dashboard/time-tracking/new?case=${case_.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Clock className="mr-2 h-4 w-4" />
                  Registrar Tiempo
                </Button>
              </Link>
              <Link href={`/dashboard/calendar/new?case=${case_.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Evento
                </Button>
              </Link>
              <Link href={`/dashboard/billing/new?case=${case_.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Generar Factura
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Client Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{getClientName()}</p>
                <Link href={`/dashboard/clients/${case_.clients.id}`} className="text-sm text-primary hover:underline">
                  Ver perfil completo
                </Link>
              </div>
              {case_.clients.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{case_.clients.email}</p>
                </div>
              )}
              {case_.clients.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-sm">{case_.clients.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
