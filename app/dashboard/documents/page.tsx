import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DocumentsTable } from "@/components/documents/documents-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, BookTemplate as Template, Upload, FolderOpen } from "lucide-react"
import Link from "next/link"

export default async function DocumentsPage() {
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

  // Get documents with related data
  const { data: documents, error } = await supabase
    .from("documents")
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
      profiles:uploaded_by (
        id,
        full_name
      )
    `)
    .eq("firm_id", profile.firm_id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching documents:", error)
  }

  // Get document statistics
  const [
    { count: totalDocuments },
    { count: contractDocuments },
    { count: evidenceDocuments },
    { count: templateDocuments },
  ] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("firm_id", profile.firm_id),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("firm_id", profile.firm_id)
      .eq("type", "contract"),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("firm_id", profile.firm_id)
      .eq("type", "evidence"),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("firm_id", profile.firm_id)
      .eq("is_template", true),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentos y Plantillas</h1>
          <p className="text-muted-foreground">Gestiona todos los documentos legales de tu despacho</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/documents/templates">
            <Button variant="outline" className="bg-transparent">
              <Template className="mr-2 h-4 w-4" />
              Plantillas
            </Button>
          </Link>
          <Link href="/dashboard/documents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Archivos almacenados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Documentos contractuales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evidencias</CardTitle>
            <Upload className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evidenceDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Pruebas y evidencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <Template className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templateDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Plantillas disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>Todos los archivos y documentos de tu despacho</CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentsTable documents={documents || []} />
        </CardContent>
      </Card>
    </div>
  )
}
