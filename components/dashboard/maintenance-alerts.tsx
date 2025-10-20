"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface MaintenanceAlert {
  id: string
  vehiclePlate: string
  partName: string
  nextDate: string
  daysUntil: number
}

export function MaintenanceAlerts() {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([])

  useEffect(() => {
    const maintenance = JSON.parse(localStorage.getItem("maintenance") || "[]")
    const today = new Date()

    const upcomingAlerts = maintenance
      .map((m: any) => {
        const nextDate = new Date(m.nextDate)
        const daysUntil = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return { ...m, daysUntil }
      })
      .filter((m: any) => m.daysUntil <= 7 && m.daysUntil >= 0)
      .sort((a: any, b: any) => a.daysUntil - b.daysUntil)

    setAlerts(upcomingAlerts)
  }, [])

  if (alerts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas de Manutenção
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{alert.vehiclePlate}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{alert.partName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Próxima troca: {new Date(alert.nextDate).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <Badge variant={alert.daysUntil <= 2 ? "destructive" : "secondary"}>
                {alert.daysUntil === 0 ? "Hoje" : `${alert.daysUntil} dias`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
