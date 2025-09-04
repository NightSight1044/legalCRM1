"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Download, Edit, Copy, Trash2, FileText } from "lucide-react"
import Link from "next/link"
import { ReplaceIcon as TemplateIcon } from "lucide-react"

interface Template {
  id: string
  name: string
  description?: string
  type: "contract" | "evidence" | "correspondence" | "template" | "other"
  file_url?: string
  created_at: string
  profiles?: {
    id: string
    full_name: string
  }
}

interface TemplatesGridProps {
  templates: Template[]
}

const typeConfig = {
  contract: { label: "Contrato", color: "bg-blue-500" },
  evidence: { label: "Evidencia", color: "bg-green-500" },
  correspondence: { label: "Correspondencia", color: "bg-orange-500" },
  template: { label: "Plantilla", color: "bg-purple-500" },
  other: { label: "Otro", color: "bg-gray-500" },
}

export function TemplatesGrid({ templates }: TemplatesGridProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <TemplateIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No hay plantillas personalizadas</h3>
        <p className="text-muted-foreground mb-4">
          Crea tu primera plantilla para agilizar la generación de documentos
        </p>
        <Link href="/dashboard/documents/new?template=true">
          <Button>
            <TemplateIcon className="mr-2 h-4 w-4" />
            Crear Primera Plantilla
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar plantillas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron plantillas con el término de búsqueda
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {template.name}
                    </CardTitle>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Usar Plantilla
                      </DropdownMenuItem>
                      {template.file_url && (
                        <DropdownMenuItem asChild>
                          <a href={template.file_url} download>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${template.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${typeConfig[template.type].color}`} />
                    <span className="text-xs">{typeConfig[template.type].label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(template.created_at)}</div>
                </div>
                {template.profiles && (
                  <div className="text-xs text-muted-foreground mt-2">Por: {template.profiles.full_name}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredTemplates.length} de {templates.length} plantillas
      </div>
    </div>
  )
}
