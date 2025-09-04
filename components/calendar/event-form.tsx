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
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Case {
  id: string
  case_number: string
  title: string
}

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

interface EventFormProps {
  cases: Case[]
  clients: Client[]
  lawyers: Lawyer[]
  preselectedCaseId?: string
  preselectedClientId?: string
  preselectedDate?: string
  initialData?: {
    id?: string
    title: string
    description?: string
    start_time: string
    end_time: string
    location?: string
    event_type: string
    case_id?: string
    client_id?: string
    assigned_to?: string
    reminder_minutes?: number
  }
  isEditing?: boolean
}

export function EventForm({
  cases,
  clients,
  lawyers,
  preselectedCaseId,
  preselectedClientId,
  preselectedDate,
  initialData,
  isEditing = false,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_type: initialData?.event_type || "meeting",
    case_id: initialData?.case_id || preselectedCaseId || "",
    client_id: initialData?.client_id || preselectedClientId || "",
    assigned_to: initialData?.assigned_to || "",
    location: initialData?.location || "",
    reminder_minutes: initialData?.reminder_minutes || 30,
    date: initialData ? new Date(initialData.start_time) : preselectedDate ? new Date(preselectedDate) : new Date(),
    start_time: initialData ? format(new Date(initialData.start_time), "HH:mm") : "09:00",
    end_time: initialData ? format(new Date(initialData.end_time), "HH:mm") : "10:00",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!formData.start_time || !formData.end_time) {
        setError("Las horas de inicio y fin son requeridas")
        return
      }

      const startTimeParts = formData.start_time.split(":")
      const endTimeParts = formData.end_time.split(":")

      if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
        setError("Formato de hora inválido")
        return
      }

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

      // Create datetime strings with validation
      const startDateTime = new Date(formData.date)
      const [startHour, startMinute] = startTimeParts
      const startHourNum = Number.parseInt(startHour, 10)
      const startMinuteNum = Number.parseInt(startMinute, 10)

      if (
        isNaN(startHourNum) ||
        isNaN(startMinuteNum) ||
        startHourNum < 0 ||
        startHourNum > 23 ||
        startMinuteNum < 0 ||
        startMinuteNum > 59
      ) {
        setError("Hora de inicio inválida")
        return
      }

      startDateTime.setHours(startHourNum, startMinuteNum, 0, 0)

      const endDateTime = new Date(formData.date)
      const [endHour, endMinute] = endTimeParts
      const endHourNum = Number.parseInt(endHour, 10)
      const endMinuteNum = Number.parseInt(endMinute, 10)

      if (
        isNaN(endHourNum) ||
        isNaN(endMinuteNum) ||
        endHourNum < 0 ||
        endHourNum > 23 ||
        endMinuteNum < 0 ||
        endMinuteNum > 59
      ) {
        setError("Hora de fin inválida")
        return
      }

      endDateTime.setHours(endHourNum, endMinuteNum, 0, 0)

      if (endDateTime <= startDateTime) {
        setError("La hora de fin debe ser posterior a la hora de inicio")
        return
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: formData.location,
        event_type: formData.event_type,
        case_id: formData.case_id || null,
        client_id: formData.client_id || null,
        assigned_to: formData.assigned_to || null,
        reminder_minutes: formData.reminder_minutes,
        firm_id: profile.firm_id,
        created_by: user.id,
      }

      let result
      if (isEditing && initialData?.id) {
        result = await supabase.from("calendar_events").update(eventData).eq("id", initialData.id).select()
      } else {
        result = await supabase.from("calendar_events").insert([eventData]).select()
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        router.push("/dashboard/calendar")
      }
    } catch (err) {
      console.log("[v0] Error in event form:", err)
      setError("Error inesperado al guardar el evento")
    } finally {
      setLoading(false)
    }
  }

  const getClientName = (client: Client) => {
    if (!client) return "Cliente desconocido"
    return client.type === "company"
      ? client.company_name || "Empresa sin nombre"
      : client.full_name || "Cliente sin nombre"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Audiencia - Caso ABC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Reunión</SelectItem>
                  <SelectItem value="hearing">Audiencia</SelectItem>
                  <SelectItem value="deadline">Plazo Legal</SelectItem>
                  <SelectItem value="appointment">Cita</SelectItem>
                  <SelectItem value="reminder">Recordatorio</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalles adicionales del evento..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Juzgado, oficina, sala de juntas..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Date, Time and Associations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fecha, Hora y Asociaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha del Evento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Hora de Inicio</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">Hora de Fin</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="case_id">Caso Asociado</Label>
              <Select value={formData.case_id} onValueChange={(value) => setFormData({ ...formData, case_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar caso (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin caso asociado</SelectItem>
                  {cases.map((case_) => (
                    <SelectItem key={case_.id} value={case_.id}>
                      {case_.case_number} - {case_.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente Asociado</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente asociado</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientName(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Asignado a</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar abogado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_minutes">Recordatorio (minutos antes)</Label>
              <Select
                value={formData.reminder_minutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, reminder_minutes: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin recordatorio</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="1440">1 día</SelectItem>
                  <SelectItem value="10080">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Actualizar Evento" : "Crear Evento"}
        </Button>
      </div>
    </form>
  )
}
