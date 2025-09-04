import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplatesGrid } from "@/components/documents/templates-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookTemplate as Template, FileText, Download } from "lucide-react"
import Link from "next/link"

export default async function TemplatesPage() {
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

  // Get templates
  const { data: templates, error } = await supabase
    .from("documents")
    .select(`
      *,
      profiles:uploaded_by (
        id,
        full_name
      )
    `)
    .eq("firm_id", profile.firm_id)
    .eq("is_template", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching templates:", error)
  }

  // Predefined templates
  const predefinedTemplates = [
    {
      id: "contract-services",
      name: "Contrato de Servicios Profesionales",
      description: "Plantilla estándar para contratos de servicios legales",
      type: "contract",
      category: "Contratos",
    },
    {
      id: "power-attorney",
      name: "Poder Notarial",
      description: "Formato para otorgamiento de poderes legales",
      type: "template",
      category: "Poderes",
    },
    {
      id: "demand-civil",
      name: "Demanda Civil",
      description: "Plantilla para demandas en materia civil",
      type: "template",
      category: "Demandas",
    },
    {
      id: "agreement-settlement",
      name: "Convenio de Transacción",
      description: "Formato para acuerdos extrajudiciales",
      type: "contract",
      category: "Convenios",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/documents">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Documentos
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Plantillas de Documentos</h1>
            <p className="text-muted-foreground">Gestiona y utiliza plantillas para generar documentos</p>
          </div>
        </div>
        <Link href="/dashboard/documents/new?template=true">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        </Link>
      </div>

      {/* Predefined Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Template className="h-5 w-5" />
            Plantillas Predefinidas
          </CardTitle>
          <CardDescription>Plantillas estándar listas para usar en tu práctica legal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predefinedTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    <Template className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-muted px-2 py-1 rounded">{template.category}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" className="h-7 px-2">
                        Usar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Personalizadas</CardTitle>
          <CardDescription>Plantillas creadas por tu despacho</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplatesGrid templates={templates || []} />
        </CardContent>
      </Card>
    </div>
  )
}
