"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Client {
  id: string
  full_name: string
  company_name?: string
  type: "individual" | "company"
}

interface Lawyer {
  id: string
  full_name: string
}

interface CaseFormProps {
  clients: Client[]
  lawyers: Lawyer[]
  preselectedClientId?: string
  initialData?: {
    id?: string
    case_number: string
    title: string
    description?: string
    status: "active" | "pending" | "closed" | "archived"
    priority: "low" | "medium" | "high" | "urgent"
    practice_area?: string
    client_id: string
    assigned_lawyer?: string
    billing_type: "hourly" | "fixed" | "contingency"
    hourly_rate?: number
    fixed_fee?: number
    contingency_percentage?: number
    start_date?: string
    expected_end_date?: string
  }
  isEditing?: boolean
}

export function CaseForm({ clients, lawyers, preselectedClientId, initialData, isEditing = false }: CaseFormProps) {
  const [formData, setFormData] = useState({
    case_number: initialData?.case_number || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "pending",
    priority: initialData?.priority || "medium",
    practice_area: initialData?.practice_area || "",
    client_id: initialData?.client_id || preselectedClientId || "",
    assigned_lawyer: initialData?.assigned_lawyer || "",
    billing_type: initialData?.billing_type || "hourly",
    hourly_rate: initialData?.hourly_rate || 0,
    fixed_fee: initialData?.fixed_fee || 0,
    contingency_percentage: initialData?.contingency_percentage || 0,
    start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
    expected_end_date: initialData?.expected_end_date ? new Date(initialData.expected_end_date) : undefined,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const generateCaseNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `CASO-${year}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Get current user and firm
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("No se pudo verificar la sesión del usuario")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single()

      if (!profile) {
        setError("No se pudo obtener la información del perfil")
        return
      }

      const caseData = {
        ...formData,
        case_number: formData.case_number || generateCaseNumber(),
        start_date: formData.start_date?.toISOString().split("T")[0],
        expected_end_date: formData.expected_end_date?.toISOString().split("T")[0],
        firm_id: profile.firm_id,
      }

      let result
      if (isEditing && initialData?.id) {
        result = await supabase.from("cases").update(caseData).eq("id", initialData.id).select()
      } else {
        result = await supabase.from("cases").insert([caseData]).select()
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        router.push("/dashboard/cases")
      }
    } catch (err) {
      setError("Error inesperado al guardar el caso")
    } finally {
      setLoading(false)
    }
  }

  const getClientName = (client: Client) => {
    return client.type === "company" ? client.company_name : client.full_name
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="case_number">Número de Caso</Label>
              <Input
                id="case_number"
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                placeholder="Se generará automáticamente si se deja vacío"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título del Caso *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Demanda laboral - Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientName(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice_area">Área de Práctica</Label>
              <Select
                value={formData.practice_area}
                onValueChange={(value) => setFormData({ ...formData, practice_area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Derecho Civil</SelectItem>
                  <SelectItem value="penal">Derecho Penal</SelectItem>
                  <SelectItem value="laboral">Derecho Laboral</SelectItem>
                  <SelectItem value="mercantil">Derecho Mercantil</SelectItem>
                  <SelectItem value="familiar">Derecho Familiar</SelectItem>
                  <SelectItem value="fiscal">Derecho Fiscal</SelectItem>
                  <SelectItem value="administrativo">Derecho Administrativo</SelectItem>
                  <SelectItem value="inmobiliario">Derecho Inmobiliario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del caso..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Case Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestión del Caso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_lawyer">Abogado Asignado</Label>
              <Select
                value={formData.assigned_lawyer}
                onValueChange={(value) => setFormData({ ...formData, assigned_lawyer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar abogado" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => setFormData({ ...formData, start_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Fecha Límite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expected_end_date
                        ? format(formData.expected_end_date, "PPP", { locale: es })
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expected_end_date}
                      onSelect={(date) => setFormData({ ...formData, expected_end_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_type">Tipo de Facturación</Label>
              <Select
                value={formData.billing_type}
                onValueChange={(value: any) => setFormData({ ...formData, billing_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Por Horas</SelectItem>
                  <SelectItem value="fixed">Tarifa Fija</SelectItem>
                  <SelectItem value="contingency">Por Éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.billing_type === "hourly" && (
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Tarifa por Hora (MXN)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                  placeholder="1500"
                />
              </div>
            )}

            {formData.billing_type === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="fixed_fee">Tarifa Fija (MXN)</Label>
                <Input
                  id="fixed_fee"
                  type="number"
                  value={formData.fixed_fee}
                  onChange={(e) => setFormData({ ...formData, fixed_fee: Number(e.target.value) })}
                  placeholder="50000"
                />
              </div>
            )}

            {formData.billing_type === "contingency" && (
              <div className="space-y-2">
                <Label htmlFor="contingency_percentage">Porcentaje de Éxito (%)</Label>
                <Input
                  id="contingency_percentage"
                  type="number"
                  value={formData.contingency_percentage}
                  onChange={(e) => setFormData({ ...formData, contingency_percentage: Number(e.target.value) })}
                  placeholder="30"
                  max="100"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Actualizar Caso" : "Crear Caso"}
        </Button>
      </div>
    </form>
  )
}
