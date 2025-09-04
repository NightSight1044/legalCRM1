"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Building2 } from "lucide-react"

interface ClientFormProps {
  initialData?: {
    id?: string
    type: "individual" | "company"
    full_name: string
    company_name?: string
    email?: string
    phone?: string
    address?: string
    tax_id?: string
    notes?: string
  }
  isEditing?: boolean
}

export function ClientForm({ initialData, isEditing = false }: ClientFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || "individual",
    full_name: initialData?.full_name || "",
    company_name: initialData?.company_name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    tax_id: initialData?.tax_id || "",
    notes: initialData?.notes || "",
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

      const clientData = {
        ...formData,
        firm_id: profile.firm_id,
        created_by: user.id,
      }

      let result
      if (isEditing && initialData?.id) {
        result = await supabase.from("clients").update(clientData).eq("id", initialData.id).select()
      } else {
        result = await supabase.from("clients").insert([clientData]).select()
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        router.push("/dashboard/clients")
      }
    } catch (err) {
      setError("Error inesperado al guardar el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Client Type */}
      <div className="space-y-3">
        <Label>Tipo de Cliente</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: "individual" | "company") => setFormData({ ...formData, type: value })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              Persona Física
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-4 w-4" />
              Persona Moral
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.type === "company" && (
              <div className="space-y-2">
                <Label htmlFor="company_name">Razón Social *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required={formData.type === "company"}
                  placeholder="Empresa S.A. de C.V."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">
                {formData.type === "company" ? "Nombre del Contacto *" : "Nombre Completo *"}
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Juan Pérez García"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax_id">{formData.type === "company" ? "RFC" : "RFC/CURP"}</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder={formData.type === "company" ? "ABC123456789" : "CURP o RFC"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle, número, colonia, ciudad, estado, CP"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre el cliente..."
                rows={3}
              />
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
          {loading ? "Guardando..." : isEditing ? "Actualizar Cliente" : "Crear Cliente"}
        </Button>
      </div>
    </form>
  )
}
