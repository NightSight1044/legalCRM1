"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Download, Eye, Edit, Trash2, FileText, File, ImageIcon } from "lucide-react"
import Link from "next/link"

interface Document {
  id: string
  name: string
  description?: string
  type: "contract" | "evidence" | "correspondence" | "template" | "other"
  file_url?: string
  file_size?: number
  mime_type?: string
  version: number
  is_template: boolean
  created_at: string
  cases?: {
    id: string
    case_number: string
    title: string
  }
  clients?: {
    id: string
    full_name: string
    company_name?: string
    type: "individual" | "company"
  }
  profiles?: {
    id: string
    full_name: string
  }
}

interface DocumentsTableProps {
  documents: Document[]
}

const typeConfig = {
  contract: { label: "Contrato", color: "bg-blue-500", icon: FileText },
  evidence: { label: "Evidencia", color: "bg-green-500", icon: File },
  correspondence: { label: "Correspondencia", color: "bg-orange-500", icon: FileText },
  template: { label: "Plantilla", color: "bg-purple-500", icon: FileText },
  other: { label: "Otro", color: "bg-gray-500", icon: File },
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<
    "all" | "contract" | "evidence" | "correspondence" | "template" | "other"
  >("all")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.cases?.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.cases?.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || doc.type === typeFilter

    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const getClientName = (client?: Document["clients"]) => {
    if (!client) return "-"
    return client.type === "company" ? client.company_name : client.full_name
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return File
    if (mimeType.startsWith("image/")) return ImageIcon
    return FileText
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={typeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("all")}>
            Todos
          </Button>
          <Button
            variant={typeFilter === "contract" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("contract")}
          >
            Contratos
          </Button>
          <Button
            variant={typeFilter === "evidence" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("evidence")}
          >
            Evidencias
          </Button>
          <Button
            variant={typeFilter === "template" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("template")}
          >
            Plantillas
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Caso/Cliente</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Subido por</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm || typeFilter !== "all"
                    ? "No se encontraron documentos con los filtros aplicados"
                    : "No hay documentos registrados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const FileIcon = getFileIcon(doc.mime_type)
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          {doc.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {doc.description}
                            </div>
                          )}
                          {doc.version > 1 && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              v{doc.version}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${typeConfig[doc.type].color}`} />
                        <span className="text-sm">{typeConfig[doc.type].label}</span>
                        {doc.is_template && (
                          <Badge variant="secondary" className="text-xs">
                            Plantilla
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {doc.cases && <div className="text-sm font-medium">{doc.cases.case_number}</div>}
                        {doc.clients && (
                          <div className="text-sm text-muted-foreground">{getClientName(doc.clients)}</div>
                        )}
                        {!doc.cases && !doc.clients && <span className="text-sm text-muted-foreground">General</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.profiles?.full_name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(doc.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {doc.file_url && (
                            <DropdownMenuItem asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Documento
                              </a>
                            </DropdownMenuItem>
                          )}
                          {doc.file_url && (
                            <DropdownMenuItem asChild>
                              <a href={doc.file_url} download>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/documents/${doc.id}/edit`}>
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
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDocuments.length} de {documents.length} documentos
      </div>
    </div>
  )
}
