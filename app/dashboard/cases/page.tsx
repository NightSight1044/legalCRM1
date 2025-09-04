import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CasesTable } from "@/components/cases/cases-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderOpen, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function CasesPage() {
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

  // Get cases with client information
  const { data: cases, error } = await supabase
    .from("cases")
    .select(`
      *,
      clients (
        id,
        full_name,
        company_name,
        type
      ),
      profiles:assigned_lawyer (
        id,
        full_name
      )
    `)
    .eq("firm_id", profile.firm_id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cases:", error)
  }

  // Get case statistics
  const [{ count: totalCases }, { count: activeCases }, { count: pendingCases }, { count: closedCases }] =
    await Promise.all([
      supabase.from("cases").select("*", { count: "exact", head: true }).eq("firm_id", profile.firm_id),
      supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("firm_id", profile.firm_id)
        .eq("status", "active"),
      supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("firm_id", profile.firm_id)
        .eq("status", "pending"),
      supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("firm_id", profile.firm_id)
        .eq("status", "closed"),
    ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Casos y Expedientes</h1>
          <p className="text-muted-foreground">Gestiona todos los casos legales de tu despacho</p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caso
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Casos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases || 0}</div>
            <p className="text-xs text-muted-foreground">Casos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases || 0}</div>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCases || 0}</div>
            <p className="text-xs text-muted-foreground">Por iniciar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedCases || 0}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Casos</CardTitle>
          <CardDescription>Todos los expedientes de tu despacho</CardDescription>
        </CardHeader>
        <CardContent>
          <CasesTable cases={cases || []} />
        </CardContent>
      </Card>
    </div>
  )
}
