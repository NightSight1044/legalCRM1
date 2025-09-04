import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, FileText, Plus, Search, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación y Tiempos</h1>
          <p className="text-gray-600 mt-1">Gestiona el tiempo trabajado y genera facturas</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/billing/time/new">
              <Clock className="h-4 w-4 mr-2" />
              Registrar Tiempo
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/billing/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Este Mes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156.5</div>
            <p className="text-xs text-gray-600">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Facturados</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230</div>
            <p className="text-xs text-gray-600">+8% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-600">$12,450 en total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$289/hr</div>
            <p className="text-xs text-gray-600">Todas las áreas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="time" className="space-y-6">
        <TabsList>
          <TabsTrigger value="time">Registro de Tiempo</TabsTrigger>
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entradas de Tiempo Recientes</CardTitle>
              <CardDescription>Tiempo registrado en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: "2024-01-15",
                    case: "Divorcio - María González",
                    hours: 3.5,
                    description: "Revisión de documentos y preparación de alegatos",
                    rate: 300,
                  },
                  {
                    date: "2024-01-15",
                    case: "Mercantil - Tech Solutions SA",
                    hours: 2.0,
                    description: "Reunión con cliente y análisis de contrato",
                    rate: 350,
                  },
                  {
                    date: "2024-01-14",
                    case: "Laboral - Juan Pérez",
                    hours: 1.5,
                    description: "Redacción de demanda laboral",
                    rate: 280,
                  },
                  {
                    date: "2024-01-14",
                    case: "Penal - Carlos Ruiz",
                    hours: 4.0,
                    description: "Audiencia preliminar y seguimiento",
                    rate: 400,
                  },
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">{entry.date}</div>
                        <Badge variant="outline">{entry.hours}h</Badge>
                      </div>
                      <div className="font-medium mt-1">{entry.case}</div>
                      <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(entry.hours * entry.rate).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">${entry.rate}/hr</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Facturas</CardTitle>
                  <CardDescription>Gestiona las facturas generadas</CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Buscar facturas..." className="pl-10 w-64" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="sent">Enviadas</SelectItem>
                      <SelectItem value="paid">Pagadas</SelectItem>
                      <SelectItem value="overdue">Vencidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    number: "FAC-2024-001",
                    client: "María González",
                    amount: 1050,
                    status: "paid",
                    date: "2024-01-10",
                    dueDate: "2024-01-25",
                  },
                  {
                    number: "FAC-2024-002",
                    client: "Tech Solutions SA",
                    amount: 2800,
                    status: "sent",
                    date: "2024-01-12",
                    dueDate: "2024-01-27",
                  },
                  {
                    number: "FAC-2024-003",
                    client: "Juan Pérez",
                    amount: 420,
                    status: "draft",
                    date: "2024-01-14",
                    dueDate: "2024-01-29",
                  },
                  {
                    number: "FAC-2024-004",
                    client: "Carlos Ruiz",
                    amount: 1600,
                    status: "overdue",
                    date: "2024-01-08",
                    dueDate: "2024-01-23",
                  },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{invoice.number}</div>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "sent"
                                ? "secondary"
                                : invoice.status === "draft"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {invoice.status === "paid"
                            ? "Pagada"
                            : invoice.status === "sent"
                              ? "Enviada"
                              : invoice.status === "draft"
                                ? "Borrador"
                                : "Vencida"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{invoice.client}</div>
                      <div className="text-sm text-gray-600">Vence: {invoice.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">${invoice.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Fecha: {invoice.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Pagos recibidos y pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    invoice: "FAC-2024-001",
                    client: "María González",
                    amount: 1050,
                    date: "2024-01-20",
                    method: "Transferencia",
                  },
                  {
                    invoice: "FAC-2023-098",
                    client: "Constructora ABC",
                    amount: 3200,
                    date: "2024-01-18",
                    method: "Cheque",
                  },
                  {
                    invoice: "FAC-2023-097",
                    client: "Restaurante El Buen Sabor",
                    amount: 850,
                    date: "2024-01-15",
                    method: "Efectivo",
                  },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{payment.invoice}</div>
                      <div className="text-sm text-gray-600 mt-1">{payment.client}</div>
                      <div className="text-sm text-gray-600">Método: {payment.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg text-green-600">${payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{payment.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
