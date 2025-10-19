"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, Gauge, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

type MaintenanceRecord = {
  id: string
  vehicleId: string
  vehiclePlate: string
  vehicleModel: string
  type: "preventive" | "corrective" | "inspection"
  description: string
  date: string
  lastMileage: number
  dateInterval: number
  mileageInterval: number
  nextDate: string
  nextMileage: number
  status: "scheduled" | "in-progress" | "completed"
}

type Vehicle = {
  id: string
  plate: string
  brand: string
  model: string
  currentMileage: number
}

export function NotificationsDropdown() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loadData = () => {
      const storedMaintenance = localStorage.getItem("maintenance")
      const storedVehicles = localStorage.getItem("vehicles")

      if (storedMaintenance) setMaintenanceRecords(JSON.parse(storedMaintenance))
      if (storedVehicles) setVehicles(JSON.parse(storedVehicles))
    }

    loadData()

    // Refresh data every 30 seconds to keep alerts up to date
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [])

  const getMaintenanceAlerts = () => {
    const today = new Date()
    const alertThresholdDays = 30
    const alertThresholdKm = 1000

    return maintenanceRecords
      .filter((record) => record.status !== "completed")
      .map((record) => {
        const vehicle = vehicles.find((v) => v.id === record.vehicleId)
        const nextDate = new Date(record.nextDate)
        const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const kmUntil = record.nextMileage - (vehicle?.currentMileage || 0)

        const dateAlert = daysUntil <= alertThresholdDays && daysUntil >= 0
        const mileageAlert = kmUntil <= alertThresholdKm && kmUntil >= 0
        const overdue = daysUntil < 0 || kmUntil < 0

        return {
          record,
          vehicle,
          daysUntil,
          kmUntil,
          dateAlert,
          mileageAlert,
          overdue,
          shouldAlert: dateAlert || mileageAlert || overdue,
        }
      })
      .filter((alert) => alert.shouldAlert)
      .sort((a, b) => {
        if (a.overdue && !b.overdue) return -1
        if (!a.overdue && b.overdue) return 1
        return Math.min(a.daysUntil, a.kmUntil / 100) - Math.min(b.daysUntil, b.kmUntil / 100)
      })
  }

  const alerts = getMaintenanceAlerts()
  const alertCount = alerts.length

  const getMaintenanceTypeBadge = (type: MaintenanceRecord["type"]) => {
    const labels = {
      preventive: "Preventiva",
      corrective: "Corretiva",
      inspection: "Inspeção",
    }
    return labels[type]
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
              {alertCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notificações</h3>
          {alertCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {alertCount} {alertCount === 1 ? "alerta" : "alertas"}
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {alertCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground">Todas as manutenções estão em dia</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map(({ record, vehicle, daysUntil, kmUntil, overdue }) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setOpen(false)
                    window.location.href = "/maintenance"
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${overdue ? "text-destructive" : "text-warning"}`}
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{record.vehiclePlate}</span>
                        <span className="text-xs text-muted-foreground truncate">{record.vehicleModel}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getMaintenanceTypeBadge(record.type)} - {record.description}
                      </p>
                      <div className="flex flex-col gap-1 text-xs pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className={overdue && daysUntil < 0 ? "text-destructive font-medium" : ""}>
                            {daysUntil < 0 ? `Atrasado ${Math.abs(daysUntil)} dias` : `${daysUntil} dias restantes`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          <span className={overdue && kmUntil < 0 ? "text-destructive font-medium" : ""}>
                            {kmUntil < 0
                              ? `Excedido ${Math.abs(kmUntil).toLocaleString("pt-BR")} km`
                              : `${kmUntil.toLocaleString("pt-BR")} km restantes`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {alertCount > 0 && (
          <div className="border-t p-2">
            <Link href="/maintenance" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full text-xs" size="sm">
                Ver todas as manutenções
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
