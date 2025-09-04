import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Calendar, DollarSign, Shield, Zap, CheckCircle, ArrowRight } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Administra toda la información de tus clientes y contactos en un solo lugar",
    },
    {
      icon: FileText,
      title: "Casos y Expedientes",
      description: "Organiza y da seguimiento a todos tus casos legales con facilidad",
    },
    {
      icon: Calendar,
      title: "Calendario Integrado",
      description: "Programa audiencias, citas y recordatorios automáticos",
    },
    {
      icon: DollarSign,
      title: "Facturación Automática",
      description: "Control de tiempos y generación automática de facturas",
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Cumplimiento con LFPDPPP y encriptación de datos",
    },
    {
      icon: Zap,
      title: "Comunicación Integrada",
      description: "WhatsApp, email y llamadas desde la plataforma",
    },
  ]

  const plans = [
    {
      name: "Básico",
      price: "$399",
      period: "por usuario/mes",
      features: ["Gestión de clientes", "Expedientes básicos", "Documentos", "Recordatorios", "Soporte por email"],
    },
    {
      name: "Pro",
      price: "$899",
      period: "por usuario/mes",
      popular: true,
      features: [
        "Todo lo del plan Básico",
        "Flujos de trabajo",
        "Firma electrónica",
        "WhatsApp integrado",
        "Reportes avanzados",
        "Soporte prioritario",
      ],
    },
    {
      name: "Empresarial",
      price: "$1,499",
      period: "por usuario/mes",
      features: [
        "Todo lo del plan Pro",
        "Portal de clientes",
        "Integraciones API",
        "Permisos avanzados",
        "Soporte 24/7",
        "Consultoría incluida",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary"></div>
            <span className="text-xl font-bold text-primary">LegalCRM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Prueba Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            CRM Especializado para Abogados
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Gestiona tu despacho jurídico de manera <span className="text-primary">profesional</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Plataforma SaaS completa para la gestión de clientes, casos, documentos y facturación. Diseñada
            específicamente para despachos jurídicos en México.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Todo lo que necesitas para tu despacho</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Funcionalidades diseñadas específicamente para las necesidades de los abogados mexicanos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Planes que se adaptan a tu despacho</h2>
          <p className="text-xl text-muted-foreground">Desde despachos individuales hasta grandes firmas</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Más Popular</Badge>}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground"> {plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                  Comenzar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-primary"></div>
                <span className="font-bold text-primary">LegalCRM</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma CRM más completa para despachos jurídicos en México.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Características</li>
                <li>Precios</li>
                <li>Seguridad</li>
                <li>Integraciones</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentación</li>
                <li>Tutoriales</li>
                <li>Contacto</li>
                <li>Estado del Sistema</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Términos y Condiciones</li>
                <li>Aviso de Privacidad</li>
                <li>Política de Seguridad</li>
                <li>LFPDPPP</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 LegalCRM. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
