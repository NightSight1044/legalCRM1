import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EventForm } from "@/components/calendar/event-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NewEventPageProps {
  searchParams: {
    case?: string
    client?: string
    date?: string
  }
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
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

  // Get cases for the dropdown
  const { data: cases } = await supabase
    .from("cases")
    .select("id, case_number, title")
    .eq("firm_id", profile.firm_id)
    .order("case_number")

  // Get clients for the dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, company_name, type")
    .eq("firm_id", profile.firm_id)
    .order("full_name")

  // Get lawyers for assignment
  const { data: lawyers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("firm_id", profile.firm_id)
    .in("role", ["admin", "lawyer"])
    .order("full_name")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/calendar">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Evento</h1>
          <p className="text-muted-foreground">Programa una nueva cita, audiencia o recordatorio</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>Completa los datos del evento. Los campos marcados con * son obligatorios.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            cases={cases || []}
            clients={clients || []}
            lawyers={lawyers || []}
            preselectedCaseId={searchParams.case}
            preselectedClientId={searchParams.client}
            preselectedDate={searchParams.date}
          />
        </CardContent>
      </Card>
    </div>
  )
}
