import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Building2, User, Plus, Calendar } from "lucide-react"
import Link from "next/link"

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
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

  // Get client details
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("firm_id", profile.firm_id)
    .single()

  if (error || !client) {
    notFound()
  }

  // Get client's cases count
  const { count: casesCount } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              {client.type === "company" ? (
                <Building2 className="h-6 w-6 text-green-600" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
              <h1 className="text-3xl font-bold text-foreground">
                {client.type === "company" ? client.company_name : client.full_name}
              </h1>
              <Badge variant={client.type === "company" ? "default" : "secondary"}>
                {client.type === "company" ? "Empresa" : "Persona"}
              </Badge>
            </div>
            {client.type === "company" && client.full_name && (
              <p className="text-muted-foreground">Contacto: {client.full_name}</p>
            )}
          </div>
        </div>
        <Link href={`/dashboard/clients/${client.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar Cliente
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Client Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Correo Electrónico</p>
                    <p className="text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-muted-foreground">{client.phone}</p>
                  </div>
                </div>
              )}

              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-muted-foreground">{client.address}</p>
                  </div>
                </div>
              )}

              {client.tax_id && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{client.type === "company" ? "RFC" : "RFC/CURP"}</p>
                    <p className="text-muted-foreground">{client.tax_id}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Casos Activos</span>
                <Badge variant="outline">{casesCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cliente desde</span>
                <span className="text-sm text-muted-foreground">{formatDate(client.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/cases/new?client=${client.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Caso
                </Button>
              </Link>
              <Link href={`/dashboard/communications/new?client=${client.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
              </Link>
              <Link href={`/dashboard/calendar/new?client=${client.id}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Cita
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
