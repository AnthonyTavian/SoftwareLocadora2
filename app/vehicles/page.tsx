"use client"

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
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { Label } from "@/components/ui/label"

type Vehicle = {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  category: string
  dailyRate: number
  currentMileage: number
  status: "available" | "rented" | "maintenance"
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<Omit<Vehicle, "id">>({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    category: "",
    dailyRate: 0,
    currentMileage: 0,
    status: "available",
  })

  // Load vehicles from localStorage
  useEffect(() => {
    const storedVehicles = localStorage.getItem("vehicles")
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles))
    }
  }, [])

  // Save vehicles to localStorage
  const saveVehicles = (updatedVehicles: Vehicle[]) => {
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))
    setVehicles(updatedVehicles)
  }

  // Add vehicle
  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      ...formData,
    }
    const updatedVehicles = [...vehicles, newVehicle]
    saveVehicles(updatedVehicles)
    setIsAddDialogOpen(false)
    resetForm()
  }

  // Edit vehicle
  const handleEditVehicle = () => {
    if (!selectedVehicle) return
    const updatedVehicles = vehicles.map((v) => (v.id === selectedVehicle.id ? { ...selectedVehicle, ...formData } : v))
    saveVehicles(updatedVehicles)
    setIsEditDialogOpen(false)
    setSelectedVehicle(null)
    resetForm()
  }

  // Delete vehicle
  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return
    const updatedVehicles = vehicles.filter((v) => v.id !== selectedVehicle.id)
    saveVehicles(updatedVehicles)
    setIsDeleteDialogOpen(false)
    setSelectedVehicle(null)
  }

  // Open edit dialog
  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      category: vehicle.category,
      dailyRate: vehicle.dailyRate,
      currentMileage: vehicle.currentMileage || 0,
      status: vehicle.status,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsDeleteDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      category: "",
      dailyRate: 0,
      currentMileage: 0,
      status: "available",
    })
  }

  // Filter vehicles
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Status badge
  const getStatusBadge = (status: Vehicle["status"]) => {
    const variants = {
      available: "default",
      rented: "secondary",
      maintenance: "destructive",
    } as const

    const labels = {
      available: "Disponível",
      rented: "Alugado",
      maintenance: "Manutenção",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Veículos</h1>
        <p className="text-muted-foreground">Gerencie a frota de veículos da locadora</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Veículos</CardTitle>
              <CardDescription>Total de {vehicles.length} veículos cadastrados</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  Adicionar Veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Veículo</DialogTitle>
                  <DialogDescription>Preencha os dados do veículo para adicionar à frota</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="plate">Placa</Label>
                      <Input
                        id="plate"
                        placeholder="ABC-1234"
                        value={formData.plate}
                        onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Econômico">Econômico</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                          <SelectItem value="Luxo">Luxo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        placeholder="Toyota"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        placeholder="Corolla"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="year">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2024"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Cor</Label>
                      <Input
                        id="color"
                        placeholder="Preto"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dailyRate">Diária (R$)</Label>
                      <Input
                        id="dailyRate"
                        type="number"
                        placeholder="150.00"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Vehicle["status"]) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="rented">Alugado</SelectItem>
                          <SelectItem value="maintenance">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currentMileage">Quilometragem Atual (km)</Label>
                      <Input
                        id="currentMileage"
                        type="number"
                        placeholder="10000"
                        value={formData.currentMileage}
                        onChange={(e) => setFormData({ ...formData, currentMileage: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddVehicle}>Adicionar</Button>
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
                placeholder="Buscar por placa, marca ou modelo..."
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
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Km Atual</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.plate}</TableCell>
                      <TableCell>
                        {vehicle.brand} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.category}</TableCell>
                      <TableCell>{vehicle.color}</TableCell>
                      <TableCell>{(vehicle.currentMileage || 0).toLocaleString("pt-BR")} km</TableCell>
                      <TableCell>R$ {vehicle.dailyRate.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(vehicle)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openDeleteDialog(vehicle)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>Atualize os dados do veículo</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-plate">Placa</Label>
                <Input
                  id="edit-plate"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Econômico">Econômico</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Pickup">Pickup</SelectItem>
                    <SelectItem value="Luxo">Luxo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-brand">Marca</Label>
                <Input
                  id="edit-brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-year">Ano</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Cor</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-currentMileage">Quilometragem Atual (km)</Label>
                <Input
                  id="edit-currentMileage"
                  type="number"
                  value={formData.currentMileage}
                  onChange={(e) => setFormData({ ...formData, currentMileage: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dailyRate">Diária (R$)</Label>
                <Input
                  id="edit-dailyRate"
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Vehicle["status"]) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="rented">Alugado</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditVehicle}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo <strong>{selectedVehicle?.plate}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
