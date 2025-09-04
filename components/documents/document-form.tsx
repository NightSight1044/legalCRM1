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
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileText, X } from "lucide-react"

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

interface DocumentFormProps {
  cases: Case[]
  clients: Client[]
  preselectedCaseId?: string
  preselectedClientId?: string
  initialData?: {
    id?: string
    name: string
    description?: string
    type: "contract" | "evidence" | "correspondence" | "template" | "other"
    case_id?: string
    client_id?: string
    is_template: boolean
  }
  isEditing?: boolean
}

export function DocumentForm({
  cases,
  clients,
  preselectedCaseId,
  preselectedClientId,
  initialData,
  isEditing = false,
}: DocumentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "other",
    case_id: initialData?.case_id || preselectedCaseId || "defaultCaseId",
    client_id: initialData?.client_id || preselectedClientId || "defaultClientId",
    is_template: initialData?.is_template || false,
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!formData.name) {
        setFormData({ ...formData, name: selectedFile.name })
      }
    }
  }

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `documents/${fileName}`

    // For now, we'll simulate file upload since we don't have Blob integration set up
    // In a real implementation, you would use Vercel Blob or Supabase Storage
    return {
      url: `/placeholder-documents/${fileName}`,
      size: file.size,
      mimeType: file.type,
    }
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

      let fileUrl = null
      let fileSize = null
      let mimeType = null

      // Upload file if provided
      if (file) {
        setUploadProgress(25)
        const uploadResult = await uploadFile(file)
        fileUrl = uploadResult.url
        fileSize = uploadResult.size
        mimeType = uploadResult.mimeType
        setUploadProgress(75)
      }

      const documentData = {
        ...formData,
        firm_id: profile.firm_id,
        file_url: fileUrl,
        file_size: fileSize,
        mime_type: mimeType,
        uploaded_by: user.id,
        version: 1,
      }

      setUploadProgress(90)

      let result
      if (isEditing && initialData?.id) {
        result = await supabase.from("documents").update(documentData).eq("id", initialData.id).select()
      } else {
        result = await supabase.from("documents").insert([documentData]).select()
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        setUploadProgress(100)
        router.push("/dashboard/documents")
      }
    } catch (err) {
      setError("Error inesperado al guardar el documento")
    } finally {
      setLoading(false)
      setUploadProgress(0)
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
        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Documento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Contrato de servicios - Cliente ABC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Documento</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="evidence">Evidencia</SelectItem>
                  <SelectItem value="correspondence">Correspondencia</SelectItem>
                  <SelectItem value="template">Plantilla</SelectItem>
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
                placeholder="Descripción detallada del documento..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_template"
                checked={formData.is_template}
                onCheckedChange={(checked) => setFormData({ ...formData, is_template: !!checked })}
              />
              <Label
                htmlFor="is_template"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Marcar como plantilla
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* File Upload and Association */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Archivo y Asociación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="file">Archivo</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Haz clic para seleccionar un archivo</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT, JPG, PNG (máx. 10MB)</p>
                  </label>
                </div>
                {file && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm flex-1">{file.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subiendo archivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="case_id">Caso Asociado</Label>
              <Select value={formData.case_id} onValueChange={(value) => setFormData({ ...formData, case_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar caso (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defaultCaseId">Sin caso asociado</SelectItem>
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
                  <SelectItem value="defaultClientId">Sin cliente asociado</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientName(client)}
                    </SelectItem>
                  ))}
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
        <Button type="submit" disabled={loading || (!file && !isEditing)}>
          {loading ? "Guardando..." : isEditing ? "Actualizar Documento" : "Subir Documento"}
        </Button>
      </div>
    </form>
  )
}
