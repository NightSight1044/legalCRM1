import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientsTable } from "@/components/clients/clients-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Building2 } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Get user's firm with better error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
      // If profile doesn't exist, show setup message instead of redirecting
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
            <p className="text-muted-foreground text-amber-600">
              Configurando tu perfil... Por favor, completa el registro de tu despacho.
            </p>
          </div>
        </div>
      )
    }

    if (!profile) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
            <p className="text-muted-foreground text-amber-600">
              Perfil no encontrado. Por favor, contacta al administrador.
            </p>
          </div>
        </div>
      )
    }

    // Get clients with counts
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("firm_id", profile.firm_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching clients:", error)
    }

    let totalClients = 0,
      individualClients = 0,
      companyClients = 0

    try {
      // Get client statistics
      const [{ count: total }, { count: individual }, { count: company }] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("firm_id", profile.firm_id),
        supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("firm_id", profile.firm_id)
          .eq("type", "individual"),
        supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("firm_id", profile.firm_id)
          .eq("type", "company"),
      ])

      totalClients = total || 0
      individualClients = individual || 0
      companyClients = company || 0
    } catch (statsError) {
      console.error("[v0] Error fetching client statistics:", statsError)
      // Continue with default values
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
            <p className="text-muted-foreground">Administra todos tus clientes y contactos</p>
          </div>
          <Link href="/dashboard/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personas Físicas</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{individualClients}</div>
              <p className="text-xs text-muted-foreground">Clientes individuales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personas Morales</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyClients}</div>
              <p className="text-xs text-muted-foreground">Empresas</p>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Todos los clientes registrados en tu despacho</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable clients={clients || []} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error in clients page:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground text-red-600">
            Error cargando los clientes. Verifica que la base de datos esté configurada correctamente.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Si el problema persiste, ejecuta el script de base de datos desde la configuración del proyecto.
          </p>
        </div>
      </div>
    )
  }
}
