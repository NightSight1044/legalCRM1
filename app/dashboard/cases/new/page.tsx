import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CaseForm } from "@/components/cases/case-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NewCasePageProps {
  searchParams: {
    client?: string
  }
}

export default async function NewCasePage({ searchParams }: NewCasePageProps) {
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

  // Get clients for the dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, company_name, type")
    .eq("firm_id", profile.firm_id)
    .order("full_name")

  // Get lawyers for assignment
  const { data: lawyers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("firm_id", profile.firm_id)
    .in("role", ["admin", "lawyer"])
    .order("full_name")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cases">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Caso</h1>
          <p className="text-muted-foreground">Registra un nuevo expediente legal</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Caso</CardTitle>
          <CardDescription>
            Completa los datos del nuevo expediente. Todos los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CaseForm clients={clients || []} lawyers={lawyers || []} preselectedClientId={searchParams.client} />
        </CardContent>
      </Card>
    </div>
  )
}
