"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function NewInvoicePage() {
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", hours: 0, rate: 300, amount: 0 }])

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { description: "", hours: 0, rate: 300, amount: 0 }])
  }

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...invoiceItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "hours" || field === "rate") {
      updated[index].amount = updated[index].hours * updated[index].rate
    }
    setInvoiceItems(updated)
  }

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * 0.16 // 16% IVA
  const total = subtotal + tax

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
          <p className="text-gray-600">Crea una nueva factura para un cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Número de Factura</Label>
                  <Input id="invoice-number" defaultValue="FAC-2024-005" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client1">María González</SelectItem>
                      <SelectItem value="client2">Tech Solutions SA</SelectItem>
                      <SelectItem value="client3">Juan Pérez</SelectItem>
                      <SelectItem value="client4">Carlos Ruiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Fecha de Vencimiento</Label>
                  <Input
                    id="due-date"
                    type="date"
                    defaultValue={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case">Caso Relacionado (Opcional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un caso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="case1">Divorcio - María González</SelectItem>
                    <SelectItem value="case2">Mercantil - Tech Solutions SA</SelectItem>
                    <SelectItem value="case3">Laboral - Juan Pérez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conceptos</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Concepto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Label>Descripción</Label>
                      <Input
                        placeholder="Descripción del servicio"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Horas</Label>
                      <Input
                        type="number"
                        step="0.25"
                        value={item.hours}
                        onChange={(e) => updateItem(index, "hours", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Tarifa</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <Input value={`$${item.amount.toLocaleString()}`} readOnly />
                    </div>
                    <div className="col-span-1">
                      {invoiceItems.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Notas o términos adicionales para la factura..." rows={3} />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="send-email" />
                <Label htmlFor="send-email">Enviar por email al cliente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-reminder" />
                <Label htmlFor="auto-reminder">Recordatorio automático</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full">Crear Factura</Button>
            <Button variant="outline" className="w-full bg-transparent">
              Guardar como Borrador
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/billing">Cancelar</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
