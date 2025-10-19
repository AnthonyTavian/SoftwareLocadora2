"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, FileText, AlertTriangle } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalCustomers: 0,
    activeRentals: 0,
    maintenanceAlerts: 0,
  })

  useEffect(() => {
    const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    const rentals = JSON.parse(localStorage.getItem("rentals") || "[]")
    const maintenance = JSON.parse(localStorage.getItem("maintenance") || "[]")

    const activeRentals = rentals.filter((r: any) => r.status === "active").length
    const availableVehicles = vehicles.filter((v: any) => v.status === "available").length
    const maintenanceAlerts = maintenance.filter((m: any) => {
      const nextDate = new Date(m.nextDate)
      const today = new Date()
      const daysUntil = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 7 && daysUntil >= 0
    }).length

    setStats({
      totalVehicles: vehicles.length,
      availableVehicles,
      totalCustomers: customers.length,
      activeRentals,
      maintenanceAlerts,
    })
  }, [])

  const statCards = [
    {
      title: "Total de Veículos",
      value: stats.totalVehicles,
      icon: Car,
      description: `${stats.availableVehicles} disponíveis`,
    },
    {
      title: "Clientes",
      value: stats.totalCustomers,
      icon: Users,
      description: "Cadastrados no sistema",
    },
    {
      title: "Locações Ativas",
      value: stats.activeRentals,
      icon: FileText,
      description: "Em andamento",
    },
    {
      title: "Alertas de Manutenção",
      value: stats.maintenanceAlerts,
      icon: AlertTriangle,
      description: "Próximos 7 dias",
      alert: stats.maintenanceAlerts > 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.alert ? "text-warning" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.alert ? "text-warning" : ""}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
