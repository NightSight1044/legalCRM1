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
import { Search, MoreHorizontal, Eye, Edit, Clock, CheckCircle, AlertCircle, Archive } from "lucide-react"
import Link from "next/link"

interface Case {
  id: string
  case_number: string
  title: string
  status: "active" | "pending" | "closed" | "archived"
  priority: "low" | "medium" | "high" | "urgent"
  practice_area?: string
  start_date?: string
  expected_end_date?: string
  created_at: string
  clients: {
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

interface CasesTableProps {
  cases: Case[]
}

const statusConfig = {
  active: { label: "Activo", color: "bg-green-500", icon: Clock },
  pending: { label: "Pendiente", color: "bg-orange-500", icon: AlertCircle },
  closed: { label: "Cerrado", color: "bg-blue-500", icon: CheckCircle },
  archived: { label: "Archivado", color: "bg-gray-500", icon: Archive },
}

const priorityConfig = {
  low: { label: "Baja", variant: "secondary" as const },
  medium: { label: "Media", variant: "outline" as const },
  high: { label: "Alta", variant: "destructive" as const },
  urgent: { label: "Urgente", variant: "destructive" as const },
}

export function CasesTable({ cases }: CasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "closed" | "archived">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high" | "urgent">("all")

  const filteredCases = cases.filter((case_) => {
    try {
      const caseNumber = case_.case_number || ""
      const title = case_.title || ""
      const clientFullName = case_.clients?.full_name || ""
      const clientCompanyName = case_.clients?.company_name || ""
      const practiceArea = case_.practice_area || ""

      const matchesSearch =
        caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practiceArea.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || case_.status === statusFilter
      const matchesPriority = priorityFilter === "all" || case_.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    } catch (error) {
      console.log("[v0] Error filtering case:", error)
      return false
    }
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getClientName = (client: Case["clients"]) => {
    if (!client) return "Cliente desconocido"
    return client.type === "company"
      ? client.company_name || "Empresa sin nombre"
      : client.full_name || "Cliente sin nombre"
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar casos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Activos
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pendientes
            </Button>
            <Button
              variant={statusFilter === "closed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("closed")}
            >
              Cerrados
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caso</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Abogado</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                    ? "No se encontraron casos con los filtros aplicados"
                    : "No hay casos registrados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((case_) => {
                const StatusIcon = statusConfig[case_.status].icon
                return (
                  <TableRow key={case_.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{case_.case_number}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">{case_.title}</div>
                        {case_.practice_area && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {case_.practice_area}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getClientName(case_.clients)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusConfig[case_.status].color}`} />
                        <span className="text-sm">{statusConfig[case_.status].label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityConfig[case_.priority].variant}>
                        {priorityConfig[case_.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{case_.profiles?.full_name || "Sin asignar"}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(case_.expected_end_date)}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cases/${case_.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cases/${case_.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
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
        Mostrando {filteredCases.length} de {cases.length} casos
      </div>
    </div>
  )
}
