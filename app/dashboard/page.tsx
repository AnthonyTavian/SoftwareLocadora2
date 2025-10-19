import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { MaintenanceAlerts } from "@/components/dashboard/maintenance-alerts"
import { RecentRentals } from "@/components/dashboard/recent-rentals"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de locadora</p>
      </div>

      <DashboardStats />
      <MaintenanceAlerts />
      <RecentRentals />
    </div>
  )
}
