"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, DollarSign, Car, Users } from "lucide-react"

import type { Vehicle } from "@/lib/vehiclesService"
import type { Customer } from "@/lib/customersService"
import type { Rental } from "@/lib/rentalsService"
import type { MaintenanceRecord } from "@/lib/maintenanceService"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [dateRange, setDateRange] = useState("30")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Load data from localStorage
  useEffect(() => {
    window.electronAPI.getVehicles().then((data: Vehicle[]) => setVehicles(data))
    window.electronAPI.getCustomers().then((data: Customer[]) => setCustomers(data))
    window.electronAPI.getRentals().then((data: Rental[]) => setRentals(data))
    window.electronAPI.getMaintenance().then((data: MaintenanceRecord[]) => setMaintenance(data))
  }, [])

  // Filter data by date range
  const filterByDateRange = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const daysAgo = Number.parseInt(dateRange)

    if (startDate && endDate) {
      return date >= new Date(startDate) && date <= new Date(endDate)
    }

    const rangeDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    return date >= rangeDate
  }

  const filteredRentals = rentals.filter((r) => filterByDateRange(r.createdAt))
  const filteredMaintenance = maintenance.filter((m) => filterByDateRange(m.date))

  // Financial metrics
  const totalRevenue = rentals.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.totalAmount, 0)
  const periodRevenue = filteredRentals
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.totalAmount, 0)
  const maintenanceCosts = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0)
  const netProfit = periodRevenue - maintenanceCosts

  // Vehicle utilization
  const totalVehicles = vehicles.length
  const rentedVehicles = vehicles.filter((v) => v.status === "rented").length
  const availableVehicles = vehicles.filter((v) => v.status === "available").length
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length
  const utilizationRate = totalVehicles > 0 ? ((rentedVehicles / totalVehicles) * 100).toFixed(1) : "0"

  // Customer metrics
  const activeCustomers = customers.filter((c) => c.status === "active").length
  const newCustomers = customers.filter((c) => filterByDateRange(c.createdAt)).length

  // Rental metrics
  const activeRentals = rentals.filter((r) => r.status === "active").length
  const completedRentals = filteredRentals.filter((r) => r.status === "completed").length
  const cancelledRentals = filteredRentals.filter((r) => r.status === "cancelled").length

  // Vehicle status distribution
  const vehicleStatusData = [
    { name: "Disponível", value: availableVehicles },
    { name: "Alugado", value: rentedVehicles },
    { name: "Manutenção", value: maintenanceVehicles },
  ]

  // Revenue by vehicle category
  const revenueByCategory = vehicles.reduce(
    (acc, vehicle) => {
      const vehicleRentals = filteredRentals.filter((r) => r.vehicleId === vehicle.id && r.status === "completed")
      const revenue = vehicleRentals.reduce((sum, r) => sum + r.totalAmount, 0)

      if (!acc[vehicle.category]) {
        acc[vehicle.category] = 0
      }
      acc[vehicle.category] += revenue

      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(revenueByCategory).map(([name, value]) => ({
    name,
    revenue: value,
  }))

  // Top performing vehicles
  const vehiclePerformance = vehicles
    .map((vehicle) => {
      const vehicleRentals = filteredRentals.filter((r) => r.vehicleId === vehicle.id && r.status === "completed")
      const revenue = vehicleRentals.reduce((sum, r) => sum + r.totalAmount, 0)
      const rentCount = vehicleRentals.length

      return {
        plate: vehicle.plate,
        model: `${vehicle.brand} ${vehicle.model}`,
        rentCount,
        revenue,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Monthly revenue trend (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const monthRentals = rentals.filter((r) => {
      const rentalDate = new Date(r.createdAt)
      return rentalDate >= monthStart && rentalDate <= monthEnd && r.status === "completed"
    })

    const revenue = monthRentals.reduce((sum, r) => sum + r.totalAmount, 0)

    return {
      month: date.toLocaleDateString("pt-BR", { month: "short" }),
      revenue,
    }
  })

  // Maintenance costs by type
  const maintenanceByType = filteredMaintenance.reduce(
    (acc, m) => {
      if (!acc[m.type]) {
        acc[m.type] = 0
      }
      acc[m.type] += m.cost
      return acc
    },
    {} as Record<string, number>,
  )

  const maintenanceTypeData = Object.entries(maintenanceByType).map(([type, cost]) => ({
    name: type === "preventive" ? "Preventiva" : type === "corrective" ? "Corretiva" : "Inspeção",
    cost,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise e métricas do sistema</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {periodRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 text-green-600" /> {completedRentals} locações concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {netProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Receita - Custos de manutenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Utilização</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rentedVehicles} de {totalVehicles} veículos alugados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeCustomers} clientes ativos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Veículos</CardTitle>
                <CardDescription>Distribuição atual da frota</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Categoria</CardTitle>
                <CardDescription>Desempenho por tipo de veículo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Veículos Mais Rentáveis</CardTitle>
              <CardDescription>Top 5 veículos por receita no período</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Locações</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiclePerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehiclePerformance.map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{vehicle.plate}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.rentCount}</TableCell>
                        <TableCell className="text-right font-medium">R$ {vehicle.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Receita</CardTitle>
              <CardDescription>Receita mensal dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Receita" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Todas as locações concluídas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Custos de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {maintenanceCosts.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Período selecionado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {completedRentals > 0 ? (periodRevenue / completedRentals).toFixed(2) : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Por locação</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">Na frota</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Veículos Alugados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentedVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">{utilizationRate}% de utilização</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Em Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">Indisponíveis</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Veículo</CardTitle>
              <CardDescription>Análise detalhada de cada veículo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Locações</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => {
                    const vehicleRentals = filteredRentals.filter(
                      (r) => r.vehicleId === vehicle.id && r.status === "completed",
                    )
                    const revenue = vehicleRentals.reduce((sum, r) => sum + r.totalAmount, 0)

                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.plate}</TableCell>
                        <TableCell>
                          {vehicle.brand} {vehicle.model}
                        </TableCell>
                        <TableCell>{vehicle.category}</TableCell>
                        <TableCell>
                          {vehicle.status === "available"
                            ? "Disponível"
                            : vehicle.status === "rented"
                              ? "Alugado"
                              : "Manutenção"}
                        </TableCell>
                        <TableCell>{vehicleRentals.length}</TableCell>
                        <TableCell className="text-right">R$ {revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Tipo de Manutenção</CardTitle>
                <CardDescription>Distribuição de gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={maintenanceTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Bar dataKey="cost" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de Manutenção</CardTitle>
                <CardDescription>Estatísticas do período</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de Manutenções</span>
                  <span className="text-2xl font-bold">{filteredMaintenance.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custo Total</span>
                  <span className="text-2xl font-bold">R$ {maintenanceCosts.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custo Médio</span>
                  <span className="text-2xl font-bold">
                    R${" "}
                    {filteredMaintenance.length > 0
                      ? (maintenanceCosts / filteredMaintenance.length).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Agendadas</span>
                  <span className="text-xl font-bold">
                    {filteredMaintenance.filter((m) => m.status === "scheduled").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Manutenção</CardTitle>
              <CardDescription>Registros do período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaintenance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum registro de manutenção no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaintenance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{record.vehiclePlate}</TableCell>
                        <TableCell>
                          {record.type === "preventive"
                            ? "Preventiva"
                            : record.type === "corrective"
                              ? "Corretiva"
                              : "Inspeção"}
                        </TableCell>
                        <TableCell>
                          {record.status === "scheduled"
                            ? "Agendada"
                            : record.status === "in-progress"
                              ? "Em Andamento"
                              : "Concluída"}
                        </TableCell>
                        <TableCell className="text-right">R$ {record.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
