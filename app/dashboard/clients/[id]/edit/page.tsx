import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ClientForm } from "@/components/clients/client-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
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

  // Get client details
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .eq("firm_id", profile.firm_id)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clients/${client.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Modificar información de {client.type === "company" ? client.company_name : client.full_name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>Actualiza los datos del cliente según sea necesario.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm initialData={client} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}
