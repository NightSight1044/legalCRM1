import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DocumentForm } from "@/components/documents/document-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NewDocumentPageProps {
  searchParams: {
    case?: string
    client?: string
  }
}

export default async function NewDocumentPage({ searchParams }: NewDocumentPageProps) {
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

  // Get cases for the dropdown
  const { data: cases } = await supabase
    .from("cases")
    .select("id, case_number, title")
    .eq("firm_id", profile.firm_id)
    .order("case_number")

  // Get clients for the dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, company_name, type")
    .eq("firm_id", profile.firm_id)
    .order("full_name")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subir Documento</h1>
          <p className="text-muted-foreground">Agrega un nuevo documento al sistema</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Documento</CardTitle>
          <CardDescription>Completa los datos del documento y selecciona el archivo a subir.</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentForm
            cases={cases || []}
            clients={clients || []}
            preselectedCaseId={searchParams.case}
            preselectedClientId={searchParams.client}
          />
        </CardContent>
      </Card>
    </div>
  )
}
