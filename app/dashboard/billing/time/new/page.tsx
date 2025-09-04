"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Play, Square } from "lucide-react"
import Link from "next/link"

export default function NewTimeEntryPage() {
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Tiempo</h1>
          <p className="text-gray-600">Registra el tiempo trabajado en un caso</p>
        </div>
      </div>

      {/* Timer Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cronómetro
          </CardTitle>
          <CardDescription>Usa el cronómetro para registrar tiempo en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-blue-600">{formatTime(timerSeconds)}</div>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                variant={isTimerRunning ? "destructive" : "default"}
              >
                {isTimerRunning ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Detener
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTimerSeconds(0)
                  setIsTimerRunning(false)
                }}
              >
                Reiniciar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Tiempo</CardTitle>
          <CardDescription>Completa la información del tiempo trabajado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Horas Trabajadas</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  placeholder="0.00"
                  value={timerSeconds > 0 ? (timerSeconds / 3600).toFixed(2) : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="case">Caso</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case1">Divorcio - María González</SelectItem>
                  <SelectItem value="case2">Mercantil - Tech Solutions SA</SelectItem>
                  <SelectItem value="case3">Laboral - Juan Pérez</SelectItem>
                  <SelectItem value="case4">Penal - Carlos Ruiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Tipo de Actividad</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consulta con cliente</SelectItem>
                  <SelectItem value="research">Investigación legal</SelectItem>
                  <SelectItem value="drafting">Redacción de documentos</SelectItem>
                  <SelectItem value="court">Audiencia/Tribunal</SelectItem>
                  <SelectItem value="negotiation">Negociación</SelectItem>
                  <SelectItem value="review">Revisión de documentos</SelectItem>
                  <SelectItem value="travel">Viaje</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Tarifa por Hora</Label>
              <Input id="rate" type="number" placeholder="300.00" defaultValue="300" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Trabajo</Label>
              <Textarea id="description" placeholder="Describe el trabajo realizado..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billable">Estado de Facturación</Label>
              <Select defaultValue="billable">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billable">Facturable</SelectItem>
                  <SelectItem value="non-billable">No facturable</SelectItem>
                  <SelectItem value="pro-bono">Pro bono</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Guardar Entrada de Tiempo
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/billing">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
