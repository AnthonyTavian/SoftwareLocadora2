"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CheckCircle, XCircle, Search, Calendar, DollarSign } from "lucide-react"
import { Label } from "@/components/ui/label"
import type { Vehicle } from "@/lib/vehiclesService"
import type { Rental } from "@/lib/rentalsService"
import type { Customer } from "@/lib/customersService"


export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    startDate: "",
    endDate: "",
  })

  // Load data from localStorage
  useEffect(() => {
    window.electronAPI.getRentals().then((data: Rental[]) => setRentals(data))
    window.electronAPI.getVehicles().then((data: Vehicle[]) => setVehicles(data))
    window.electronAPI.getCustomers().then((data: Customer[]) => setCustomers(data))
  }, [])

  // Save rentals to localStorage
  const saveRentals = async (updatedRentals: Rental[]) => {
    await window.electronAPI.saveRentals(updatedRentals)
    setRentals(updatedRentals)
  }

  // Update vehicle status
  const updateVehicleStatus = async (vehicleId: string, status: Vehicle["status"]) => {
    const updatedVehicles = vehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v))
    await window.electronAPI.saveVehicles(updatedVehicles)
    setVehicles(updatedVehicles)
  }


  // Calculate total amount
  const calculateTotal = (startDate: string, endDate: string, dailyRate: number) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days * dailyRate
  }

  // Add rental
  const handleAddRental = async () => {
    const customer = customers.find((c) => c.id === formData.customerId)
    const vehicle = vehicles.find((v) => v.id === formData.vehicleId)

    if (!customer || !vehicle) return

    const totalAmount = calculateTotal(formData.startDate, formData.endDate, vehicle.dailyRate)

    const newRental: Rental = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      vehicleModel: `${vehicle.brand} ${vehicle.model}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dailyRate: vehicle.dailyRate,
      totalAmount,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    const updatedRentals = [...rentals, newRental]
    await saveRentals(updatedRentals)
    await updateVehicleStatus(vehicle.id, "rented")
    setIsAddDialogOpen(false)
    resetForm()
  }

  // Complete rental
  const handleCompleteRental = async () => {
    if (!selectedRental) return

    const updatedRentals = rentals.map((r) =>
      r.id === selectedRental.id ? { ...r, status: "completed" as const } : r
    )
    await saveRentals(updatedRentals)
    await updateVehicleStatus(selectedRental.vehicleId, "available")
    setIsCompleteDialogOpen(false)
    setSelectedRental(null)
  }


  // Cancel rental
  const handleCancelRental = async () => {
    if (!selectedRental) return

    const updatedRentals = rentals.map((r) =>
      r.id === selectedRental.id ? { ...r, status: "cancelled" as const } : r
    )
    await saveRentals(updatedRentals)
    await updateVehicleStatus(selectedRental.vehicleId, "available")
    setIsCancelDialogOpen(false)
    setSelectedRental(null)
  }


  // Open complete dialog
  const openCompleteDialog = (rental: Rental) => {
    setSelectedRental(rental)
    setIsCompleteDialogOpen(true)
  }

  // Open cancel dialog
  const openCancelDialog = (rental: Rental) => {
    setSelectedRental(rental)
    setIsCancelDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      customerId: "",
      vehicleId: "",
      startDate: "",
      endDate: "",
    })
  }

  // Filter rentals
  const filteredRentals = rentals.filter(
    (rental) =>
      rental.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get available vehicles
  const availableVehicles = vehicles.filter((v) => v.status === "available")

  // Get active customers
  const activeCustomers = customers.filter((c) => c.status === "active")

  // Status badge
  const getStatusBadge = (status: Rental["status"]) => {
    const variants = {
      active: "default",
      completed: "secondary",
      cancelled: "destructive",
    } as const

    const labels = {
      active: "Ativa",
      completed: "Concluída",
      cancelled: "Cancelada",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  // Calculate rental days
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Locações</h1>
        <p className="text-muted-foreground">Gerencie as locações de veículos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Locações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentals.filter((r) => r.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentals.filter((r) => r.status === "completed").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {rentals
                .filter((r) => r.status === "completed")
                .reduce((sum, r) => sum + r.totalAmount, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Locações</CardTitle>
              <CardDescription>Total de {rentals.length} locações registradas</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  Nova Locação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Locação</DialogTitle>
                  <DialogDescription>Preencha os dados para criar uma nova locação</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Cliente</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                    >
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCustomers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">Nenhum cliente ativo disponível</div>
                        ) : (
                          activeCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle">Veículo</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                    >
                      <SelectTrigger id="vehicle">
                        <SelectValue placeholder="Selecione um veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">Nenhum veículo disponível</div>
                        ) : (
                          availableVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.plate} - {vehicle.brand} {vehicle.model} (R$ {vehicle.dailyRate.toFixed(2)}/dia)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Data Início
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Data Fim
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  {formData.vehicleId && formData.startDate && formData.endDate && (
                    <div className="rounded-lg border bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Estimado:</span>
                        <span className="text-lg font-bold">
                          <DollarSign className="inline h-4 w-4" />
                          R${" "}
                          {calculateTotal(
                            formData.startDate,
                            formData.endDate,
                            vehicles.find((v) => v.id === formData.vehicleId)?.dailyRate || 0,
                          ).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateDays(formData.startDate, formData.endDate)} dia(s) x R${" "}
                        {vehicles.find((v) => v.id === formData.vehicleId)?.dailyRate.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddRental}
                    disabled={!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate}
                  >
                    Criar Locação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, placa ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhuma locação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.customerName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{rental.vehiclePlate}</span>
                          <span className="text-xs text-muted-foreground">{rental.vehicleModel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{formatDate(rental.startDate)}</span>
                          <span className="text-xs text-muted-foreground">até {formatDate(rental.endDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{calculateDays(rental.startDate, rental.endDate)}</TableCell>
                      <TableCell className="font-medium">R$ {rental.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(rental.status)}</TableCell>
                      <TableCell className="text-right">
                        {rental.status === "active" && (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => openCompleteDialog(rental)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => openCancelDialog(rental)}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Complete Rental Dialog */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir Locação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja concluir a locação do veículo <strong>{selectedRental?.vehiclePlate}</strong> para{" "}
              <strong>{selectedRental?.customerName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteRental}>Concluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Rental Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Locação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a locação do veículo <strong>{selectedRental?.vehiclePlate}</strong> para{" "}
              <strong>{selectedRental?.customerName}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRental}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Cancelar Locação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
