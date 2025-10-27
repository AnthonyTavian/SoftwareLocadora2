"use client"
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Rental {
  id: string
  customerName: string
  vehiclePlate: string
  startDate: string
  endDate: string
  status: string
}

export function RecentRentals() {
  const [rentals, setRentals] = useState<Rental[]>([])

  useEffect(() => {
    async function loadRecentRentals() {
      const allRentals = await window.electronAPI.getRentals()
      const recent = allRentals
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5)
      setRentals(recent)
    }

    loadRecentRentals()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {rentals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma locação registrada</p>
        ) : (
          <div className="space-y-3">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rental.customerName}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{rental.vehiclePlate}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rental.startDate).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(rental.endDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <Badge variant={rental.status === "active" ? "default" : "secondary"}>
                  {rental.status === "active" ? "Ativa" : "Concluída"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
