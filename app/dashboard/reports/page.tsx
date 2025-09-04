import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, FileText, Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-600 mt-1">Análisis de rendimiento y métricas del despacho</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="current-month">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mes Actual</SelectItem>
              <SelectItem value="last-month">Mes Anterior</SelectItem>
              <SelectItem value="current-quarter">Trimestre Actual</SelectItem>
              <SelectItem value="current-year">Año Actual</SelectItem>
              <SelectItem value="custom">Período Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127,450</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Facturables</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342.5</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3.4% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +20% vs mes anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="productivity">Productividad</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="cases">Casos</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
                <CardDescription>Comparación de ingresos en los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: "Enero 2024", amount: 98500, change: 5.2 },
                    { month: "Febrero 2024", amount: 112300, change: 14.0 },
                    { month: "Marzo 2024", amount: 105800, change: -5.8 },
                    { month: "Abril 2024", amount: 118900, change: 12.4 },
                    { month: "Mayo 2024", amount: 134200, change: 12.9 },
                    { month: "Junio 2024", amount: 127450, change: -5.0 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{item.month}</div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold">${item.amount.toLocaleString()}</div>
                        <Badge variant={item.change > 0 ? "default" : "destructive"}>
                          {item.change > 0 ? "+" : ""}
                          {item.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Área de Práctica</CardTitle>
                <CardDescription>Distribución de ingresos por especialidad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { area: "Derecho Corporativo", amount: 45200, percentage: 35.5 },
                    { area: "Derecho Laboral", amount: 32100, percentage: 25.2 },
                    { area: "Derecho Civil", amount: 28400, percentage: 22.3 },
                    { area: "Derecho Penal", amount: 21750, percentage: 17.0 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{item.area}</div>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <div className="font-bold text-sm">${item.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Facturación</CardTitle>
              <CardDescription>Resumen del estado actual de las facturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$89,200</div>
                  <div className="text-sm text-gray-600">Facturas Pagadas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$24,800</div>
                  <div className="text-sm text-gray-600">Facturas Enviadas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">$13,450</div>
                  <div className="text-sm text-gray-600">Facturas Vencidas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">$8,900</div>
                  <div className="text-sm text-gray-600">Borradores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Horas por Abogado</CardTitle>
                <CardDescription>Productividad mensual del equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Dr. Juan Martínez", hours: 142.5, target: 160, efficiency: 89 },
                    { name: "Dra. Ana López", hours: 156.0, target: 160, efficiency: 97 },
                    { name: "Dr. Carlos Ruiz", hours: 134.2, target: 150, efficiency: 89 },
                    { name: "Dra. María González", hours: 128.8, target: 140, efficiency: 92 },
                  ].map((lawyer, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{lawyer.name}</div>
                        <div className="text-sm text-gray-600">{lawyer.efficiency}% eficiencia</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(lawyer.hours / lawyer.target) * 100}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium">
                          {lawyer.hours}h / {lawyer.target}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tiempo por Tipo de Actividad</CardTitle>
                <CardDescription>Distribución del tiempo trabajado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { activity: "Consultas con clientes", hours: 89.5, percentage: 26.1 },
                    { activity: "Redacción de documentos", hours: 76.2, percentage: 22.2 },
                    { activity: "Investigación legal", hours: 68.8, percentage: 20.1 },
                    { activity: "Audiencias/Tribunales", hours: 54.3, percentage: 15.9 },
                    { activity: "Negociaciones", hours: 32.1, percentage: 9.4 },
                    { activity: "Administración", hours: 21.6, percentage: 6.3 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.activity}</div>
                        <div className="text-xs text-gray-600">
                          {item.hours}h ({item.percentage}%)
                        </div>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage * 4}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Adquisición de Clientes</CardTitle>
                <CardDescription>Nuevos clientes por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: "Enero", clients: 8, revenue: 24500 },
                    { month: "Febrero", clients: 12, revenue: 36800 },
                    { month: "Marzo", clients: 6, revenue: 18200 },
                    { month: "Abril", clients: 15, revenue: 45600 },
                    { month: "Mayo", clients: 10, revenue: 32100 },
                    { month: "Junio", clients: 12, revenue: 38900 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{item.month}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-bold">{item.clients}</span> clientes
                        </div>
                        <div className="text-sm font-bold text-green-600">${item.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clientes por Ingresos</CardTitle>
                <CardDescription>Clientes más valiosos del período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Tech Solutions SA", revenue: 18500, cases: 3 },
                    { name: "Constructora ABC", revenue: 15200, cases: 2 },
                    { name: "Grupo Empresarial XYZ", revenue: 12800, cases: 4 },
                    { name: "Restaurante El Buen Sabor", revenue: 9600, cases: 1 },
                    { name: "María González", revenue: 8400, cases: 2 },
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.cases} casos activos</div>
                      </div>
                      <div className="font-bold text-green-600">${client.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Casos por Estado</CardTitle>
                <CardDescription>Distribución actual de casos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: "Activos", count: 28, percentage: 56 },
                    { status: "En Revisión", count: 12, percentage: 24 },
                    { status: "Pendientes", count: 6, percentage: 12 },
                    { status: "Cerrados", count: 4, percentage: 8 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{item.status}</div>
                        <div className="text-sm text-gray-600">{item.count} casos</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tiempo Promedio por Tipo de Caso</CardTitle>
                <CardDescription>Duración promedio de resolución</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Derecho Corporativo", avgDays: 45, cases: 8 },
                    { type: "Derecho Laboral", avgDays: 62, cases: 12 },
                    { type: "Derecho Civil", avgDays: 89, cases: 15 },
                    { type: "Derecho Penal", avgDays: 156, cases: 6 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-gray-600">{item.cases} casos</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.avgDays} días</div>
                        <div className="text-sm text-gray-600">promedio</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
