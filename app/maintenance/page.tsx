"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Search, AlertTriangle, Calendar, Gauge } from "lucide-react"
import { Label } from "@/components/ui/label"

type MaintenanceRecord = {
  id: string
  vehicleId: string
  vehiclePlate: string
  vehicleModel: string
  type: "preventive" | "corrective" | "inspection"
  description: string
  cost: number
  date: string
  lastMileage: number
  dateInterval: number // days until next maintenance
  mileageInterval: number // km until next maintenance
  nextDate: string
  nextMileage: number
  status: "scheduled" | "in-progress" | "completed"
  createdAt: string
}

type Part = {
  id: string
  name: string
  code: string
  quantity: number
  minQuantity: number
  unitPrice: number
  supplier: string
  lastRestocked: string
}

type Vehicle = {
  id: string
  plate: string
  brand: string
  model: string
  currentMileage: number
  status: string
}

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [partsSearchTerm, setPartsSearchTerm] = useState("")

  // Maintenance dialogs
  const [isAddMaintenanceDialogOpen, setIsAddMaintenanceDialogOpen] = useState(false)
  const [isEditMaintenanceDialogOpen, setIsEditMaintenanceDialogOpen] = useState(false)
  const [isDeleteMaintenanceDialogOpen, setIsDeleteMaintenanceDialogOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null)

  // Parts dialogs
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false)
  const [isEditPartDialogOpen, setIsEditPartDialogOpen] = useState(false)
  const [isDeletePartDialogOpen, setIsDeletePartDialogOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  const [maintenanceFormData, setMaintenanceFormData] = useState({
    vehicleId: "",
    type: "preventive" as MaintenanceRecord["type"],
    description: "",
    cost: 0,
    date: "",
    lastMileage: 0,
    dateInterval: 180, // default 6 months
    mileageInterval: 10000, // default 10,000 km
    status: "scheduled" as MaintenanceRecord["status"],
  })

  const [partFormData, setPartFormData] = useState({
    name: "",
    code: "",
    quantity: 0,
    minQuantity: 0,
    unitPrice: 0,
    supplier: "",
  })

  // Load data from localStorage
  useEffect(() => {
    const storedMaintenance = localStorage.getItem("maintenance")
    const storedParts = localStorage.getItem("parts")
    const storedVehicles = localStorage.getItem("vehicles")

    if (storedMaintenance) setMaintenanceRecords(JSON.parse(storedMaintenance))
    if (storedParts) setParts(JSON.parse(storedParts))
    if (storedVehicles) setVehicles(JSON.parse(storedVehicles))
  }, [])

  // Save maintenance records
  const saveMaintenanceRecords = (updatedRecords: MaintenanceRecord[]) => {
    localStorage.setItem("maintenance", JSON.stringify(updatedRecords))
    setMaintenanceRecords(updatedRecords)
  }

  // Save parts
  const saveParts = (updatedParts: Part[]) => {
    localStorage.setItem("parts", JSON.JSON.stringify(updatedParts))
    setParts(updatedParts)
  }

  const calculateNextMaintenance = (
    date: string,
    lastMileage: number,
    dateInterval: number,
    mileageInterval: number,
  ) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + dateInterval)
    const nextMileage = lastMileage + mileageInterval

    return {
      nextDate: nextDate.toISOString().split("T")[0],
      nextMileage,
    }
  }

  // Maintenance CRUD operations
  const handleAddMaintenance = () => {
    const vehicle = vehicles.find((v) => v.id === maintenanceFormData.vehicleId)
    if (!vehicle) return

    const { nextDate, nextMileage } = calculateNextMaintenance(
      maintenanceFormData.date,
      maintenanceFormData.lastMileage,
      maintenanceFormData.dateInterval,
      maintenanceFormData.mileageInterval,
    )

    const newRecord: MaintenanceRecord = {
      id: crypto.randomUUID(),
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      vehicleModel: `${vehicle.brand} ${vehicle.model}`,
      type: maintenanceFormData.type,
      description: maintenanceFormData.description,
      cost: maintenanceFormData.cost,
      date: maintenanceFormData.date,
      lastMileage: maintenanceFormData.lastMileage,
      dateInterval: maintenanceFormData.dateInterval,
      mileageInterval: maintenanceFormData.mileageInterval,
      nextDate,
      nextMileage,
      status: maintenanceFormData.status,
      createdAt: new Date().toISOString(),
    }

    saveMaintenanceRecords([...maintenanceRecords, newRecord])
    setIsAddMaintenanceDialogOpen(false)
    resetMaintenanceForm()
  }

  const handleEditMaintenance = () => {
    if (!selectedMaintenance) return

    const { nextDate, nextMileage } = calculateNextMaintenance(
      maintenanceFormData.date,
      maintenanceFormData.lastMileage,
      maintenanceFormData.dateInterval,
      maintenanceFormData.mileageInterval,
    )

    const updatedRecords = maintenanceRecords.map((m) =>
      m.id === selectedMaintenance.id
        ? {
            ...selectedMaintenance,
            ...maintenanceFormData,
            nextDate,
            nextMileage,
          }
        : m,
    )
    saveMaintenanceRecords(updatedRecords)
    setIsEditMaintenanceDialogOpen(false)
    setSelectedMaintenance(null)
    resetMaintenanceForm()
  }

  const handleDeleteMaintenance = () => {
    if (!selectedMaintenance) return

    const updatedRecords = maintenanceRecords.filter((m) => m.id !== selectedMaintenance.id)
    saveMaintenanceRecords(updatedRecords)
    setIsDeleteMaintenanceDialogOpen(false)
    setSelectedMaintenance(null)
  }

  // Parts CRUD operations
  const handleAddPart = () => {
    const newPart: Part = {
      id: crypto.randomUUID(),
      ...partFormData,
      lastRestocked: new Date().toISOString(),
    }

    saveParts([...parts, newPart])
    setIsAddPartDialogOpen(false)
    resetPartForm()
  }

  const handleEditPart = () => {
    if (!selectedPart) return

    const updatedParts = parts.map((p) => (p.id === selectedPart.id ? { ...selectedPart, ...partFormData } : p))
    saveParts(updatedParts)
    setIsEditPartDialogOpen(false)
    setSelectedPart(null)
    resetPartForm()
  }

  const handleDeletePart = () => {
    if (!selectedPart) return

    const updatedParts = parts.filter((p) => p.id !== selectedPart.id)
    saveParts(updatedParts)
    setIsDeletePartDialogOpen(false)
    setSelectedPart(null)
  }

  // Dialog helpers
  const openEditMaintenanceDialog = (record: MaintenanceRecord) => {
    setSelectedMaintenance(record)
    setMaintenanceFormData({
      vehicleId: record.vehicleId,
      type: record.type,
      description: record.description,
      cost: record.cost,
      date: record.date,
      lastMileage: record.lastMileage,
      dateInterval: record.dateInterval,
      mileageInterval: record.mileageInterval,
      status: record.status,
    })
    setIsEditMaintenanceDialogOpen(true)
  }

  const openEditPartDialog = (part: Part) => {
    setSelectedPart(part)
    setPartFormData({
      name: part.name,
      code: part.code,
      quantity: part.quantity,
      minQuantity: part.minQuantity,
      unitPrice: part.unitPrice,
      supplier: part.supplier,
    })
    setIsEditPartDialogOpen(true)
  }

  const resetMaintenanceForm = () => {
    setMaintenanceFormData({
      vehicleId: "",
      type: "preventive",
      description: "",
      cost: 0,
      date: "",
      lastMileage: 0,
      dateInterval: 180,
      mileageInterval: 10000,
      status: "scheduled",
    })
  }

  const resetPartForm = () => {
    setPartFormData({
      name: "",
      code: "",
      quantity: 0,
      minQuantity: 0,
      unitPrice: 0,
      supplier: "",
    })
  }

  // Filter functions
  const filteredMaintenance = maintenanceRecords.filter(
    (record) =>
      record.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
      part.code.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
      part.supplier.toLowerCase().includes(partsSearchTerm.toLowerCase()),
  )

  // Status badges
  const getMaintenanceStatusBadge = (status: MaintenanceRecord["status"]) => {
    const variants = {
      scheduled: "secondary",
      "in-progress": "default",
      completed: "outline",
    } as const

    const labels = {
      scheduled: "Agendada",
      "in-progress": "Em Andamento",
      completed: "Concluída",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getMaintenanceTypeBadge = (type: MaintenanceRecord["type"]) => {
    const labels = {
      preventive: "Preventiva",
      corrective: "Corretiva",
      inspection: "Inspeção",
    }

    return <Badge variant="outline">{labels[type]}</Badge>
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getMaintenanceAlerts = () => {
    const today = new Date()
    const alertThresholdDays = 30 // Alert 30 days before
    const alertThresholdKm = 1000 // Alert 1000 km before

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
        // Sort by urgency: overdue first, then by days/km remaining
        if (a.overdue && !b.overdue) return -1
        if (!a.overdue && b.overdue) return 1
        return Math.min(a.daysUntil, a.kmUntil / 100) - Math.min(b.daysUntil, b.kmUntil / 100)
      })
  }

  const maintenanceAlerts = getMaintenanceAlerts()

  // Low stock parts
  const lowStockParts = parts.filter((p) => p.quantity <= p.minQuantity)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manutenção Preventiva</h1>
        <p className="text-muted-foreground">Sistema de controle de revisões por data e quilometragem</p>
      </div>

      {maintenanceAlerts.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning">Alertas de Manutenção</CardTitle>
            </div>
            <CardDescription>{maintenanceAlerts.length} veículo(s) precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceAlerts.map(({ record, vehicle, daysUntil, kmUntil, overdue }) => (
                <div key={record.id} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${overdue ? "text-destructive" : "text-warning"}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{record.vehiclePlate}</span>
                      <span className="text-sm text-muted-foreground">{record.vehicleModel}</span>
                      {getMaintenanceTypeBadge(record.type)}
                    </div>
                    <p className="text-sm">{record.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className={overdue && daysUntil < 0 ? "text-destructive font-medium" : ""}>
                          {daysUntil < 0 ? `Atrasado ${Math.abs(daysUntil)} dias` : `${daysUntil} dias restantes`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        <span className={overdue && kmUntil < 0 ? "text-destructive font-medium" : ""}>
                          {kmUntil < 0
                            ? `Excedido ${Math.abs(kmUntil).toLocaleString("pt-BR")} km`
                            : `${kmUntil.toLocaleString("pt-BR")} km restantes`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manutenções Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenanceRecords.filter((m) => m.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{maintenanceAlerts.length}</div>
              {maintenanceAlerts.length > 0 && <AlertTriangle className="h-5 w-5 text-warning" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peças em Falta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{lowStockParts.length}</div>
              {lowStockParts.length > 0 && <AlertTriangle className="h-5 w-5 text-warning" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList>
          <TabsTrigger value="maintenance">Manutenções</TabsTrigger>
          <TabsTrigger value="parts">Peças</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Histórico de Manutenções</CardTitle>
                  <CardDescription>Total de {maintenanceRecords.length} registros</CardDescription>
                </div>
                <Dialog open={isAddMaintenanceDialogOpen} onOpenChange={setIsAddMaintenanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetMaintenanceForm}>
                      <Plus className="h-4 w-4" />
                      Nova Manutenção
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Registrar Manutenção</DialogTitle>
                      <DialogDescription>
                        Registre a data e quilometragem da última manutenção. O sistema calculará automaticamente a
                        próxima revisão.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="vehicle">Veículo</Label>
                        <Select
                          value={maintenanceFormData.vehicleId}
                          onValueChange={(value) => {
                            const vehicle = vehicles.find((v) => v.id === value)
                            setMaintenanceFormData({
                              ...maintenanceFormData,
                              vehicleId: value,
                              lastMileage: vehicle?.currentMileage || 0,
                            })
                          }}
                        >
                          <SelectTrigger id="vehicle">
                            <SelectValue placeholder="Selecione um veículo" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.plate} - {vehicle.brand} {vehicle.model} (
                                {(vehicle.currentMileage || 0).toLocaleString("pt-BR")} km)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Tipo de Manutenção</Label>
                          <Select
                            value={maintenanceFormData.type}
                            onValueChange={(value: MaintenanceRecord["type"]) =>
                              setMaintenanceFormData({ ...maintenanceFormData, type: value })
                            }
                          >
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preventive">Preventiva</SelectItem>
                              <SelectItem value="corrective">Corretiva</SelectItem>
                              <SelectItem value="inspection">Inspeção</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={maintenanceFormData.status}
                            onValueChange={(value: MaintenanceRecord["status"]) =>
                              setMaintenanceFormData({ ...maintenanceFormData, status: value })
                            }
                          >
                            <SelectTrigger id="status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Agendada</SelectItem>
                              <SelectItem value="in-progress">Em Andamento</SelectItem>
                              <SelectItem value="completed">Concluída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição da Manutenção</Label>
                        <Textarea
                          id="description"
                          placeholder="Ex: Troca de óleo e filtros, revisão dos 10.000 km..."
                          value={maintenanceFormData.description}
                          onChange={(e) =>
                            setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Data da Última Manutenção</Label>
                          <Input
                            id="date"
                            type="date"
                            value={maintenanceFormData.date}
                            onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, date: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lastMileage">Quilometragem na Manutenção (km)</Label>
                          <Input
                            id="lastMileage"
                            type="number"
                            placeholder="50000"
                            value={maintenanceFormData.lastMileage}
                            onChange={(e) =>
                              setMaintenanceFormData({
                                ...maintenanceFormData,
                                lastMileage: Number.parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                        <h4 className="font-medium text-sm">Intervalos para Próxima Manutenção</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="dateInterval">Intervalo de Tempo (dias)</Label>
                            <Input
                              id="dateInterval"
                              type="number"
                              placeholder="180"
                              value={maintenanceFormData.dateInterval}
                              onChange={(e) =>
                                setMaintenanceFormData({
                                  ...maintenanceFormData,
                                  dateInterval: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">Recomendado: 180 dias (6 meses)</p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="mileageInterval">Intervalo de Km</Label>
                            <Input
                              id="mileageInterval"
                              type="number"
                              placeholder="10000"
                              value={maintenanceFormData.mileageInterval}
                              onChange={(e) =>
                                setMaintenanceFormData({
                                  ...maintenanceFormData,
                                  mileageInterval: Number.parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">Recomendado: 10.000 km</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cost">Custo da Manutenção (R$)</Label>
                        <Input
                          id="cost"
                          type="number"
                          placeholder="350.00"
                          value={maintenanceFormData.cost}
                          onChange={(e) =>
                            setMaintenanceFormData({
                              ...maintenanceFormData,
                              cost: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMaintenanceDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddMaintenance}>Registrar Manutenção</Button>
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
                    placeholder="Buscar por veículo ou descrição..."
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
                      <TableHead>Veículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Última Manutenção</TableHead>
                      <TableHead>Próxima Manutenção</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMaintenance.map((record) => {
                        const vehicle = vehicles.find((v) => v.id === record.vehicleId)
                        const kmRemaining = record.nextMileage - (vehicle?.currentMileage || 0)

                        return (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{record.vehiclePlate}</span>
                                <span className="text-xs text-muted-foreground">{record.vehicleModel}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getMaintenanceTypeBadge(record.type)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm">
                                <span>{formatDate(record.date)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {record.lastMileage.toLocaleString("pt-BR")} km
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm">
                                <span>{formatDate(record.nextDate)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {record.nextMileage.toLocaleString("pt-BR")} km
                                </span>
                                {record.status !== "completed" && (
                                  <span
                                    className={`text-xs ${kmRemaining < 1000 ? "text-warning font-medium" : "text-muted-foreground"}`}
                                  >
                                    (
                                    {kmRemaining > 0
                                      ? `${kmRemaining.toLocaleString("pt-BR")} km restantes`
                                      : "Vencido"}
                                    )
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>R$ {record.cost.toFixed(2)}</TableCell>
                            <TableCell>{getMaintenanceStatusBadge(record.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => openEditMaintenanceDialog(record)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => {
                                    setSelectedMaintenance(record)
                                    setIsDeleteMaintenanceDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Estoque de Peças</CardTitle>
                  <CardDescription>Total de {parts.length} peças cadastradas</CardDescription>
                </div>
                <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetPartForm}>
                      <Plus className="h-4 w-4" />
                      Nova Peça
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nova Peça</DialogTitle>
                      <DialogDescription>Adicione uma nova peça ao estoque</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="part-name">Nome da Peça</Label>
                          <Input
                            id="part-name"
                            placeholder="Filtro de óleo"
                            value={partFormData.name}
                            onChange={(e) => setPartFormData({ ...partFormData, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="part-code">Código</Label>
                          <Input
                            id="part-code"
                            placeholder="FO-001"
                            value={partFormData.code}
                            onChange={(e) => setPartFormData({ ...partFormData, code: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="quantity">Quantidade</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={partFormData.quantity}
                            onChange={(e) =>
                              setPartFormData({ ...partFormData, quantity: Number.parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="minQuantity">Qtd. Mínima</Label>
                          <Input
                            id="minQuantity"
                            type="number"
                            value={partFormData.minQuantity}
                            onChange={(e) =>
                              setPartFormData({ ...partFormData, minQuantity: Number.parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="unitPrice">Preço Unit. (R$)</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            value={partFormData.unitPrice}
                            onChange={(e) =>
                              setPartFormData({ ...partFormData, unitPrice: Number.parseFloat(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="supplier">Fornecedor</Label>
                        <Input
                          id="supplier"
                          placeholder="Auto Peças XYZ"
                          value={partFormData.supplier}
                          onChange={(e) => setPartFormData({ ...partFormData, supplier: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddPartDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddPart}>Adicionar</Button>
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
                    placeholder="Buscar por nome, código ou fornecedor..."
                    value={partsSearchTerm}
                    onChange={(e) => setPartsSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Qtd. Mínima</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Nenhuma peça encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.name}</TableCell>
                          <TableCell>{part.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{part.quantity}</span>
                              {part.quantity <= part.minQuantity && <AlertTriangle className="h-4 w-4 text-warning" />}
                            </div>
                          </TableCell>
                          <TableCell>{part.minQuantity}</TableCell>
                          <TableCell>R$ {part.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{part.supplier}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon-sm" onClick={() => openEditPartDialog(part)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                  setSelectedPart(part)
                                  setIsDeletePartDialogOpen(true)
                                }}
                              >
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
        </TabsContent>
      </Tabs>

      {/* Edit Maintenance Dialog */}
      <Dialog open={isEditMaintenanceDialogOpen} onOpenChange={setIsEditMaintenanceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Manutenção</DialogTitle>
            <DialogDescription>Atualize os dados da manutenção</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-vehicle">Veículo</Label>
              <Select
                value={maintenanceFormData.vehicleId}
                onValueChange={(value) => setMaintenanceFormData({ ...maintenanceFormData, vehicleId: value })}
              >
                <SelectTrigger id="edit-vehicle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  value={maintenanceFormData.type}
                  onValueChange={(value: MaintenanceRecord["type"]) =>
                    setMaintenanceFormData({ ...maintenanceFormData, type: value })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={maintenanceFormData.status}
                  onValueChange={(value: MaintenanceRecord["status"]) =>
                    setMaintenanceFormData({ ...maintenanceFormData, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={maintenanceFormData.description}
                onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Data da Manutenção</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={maintenanceFormData.date}
                  onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastMileage">Quilometragem (km)</Label>
                <Input
                  id="edit-lastMileage"
                  type="number"
                  value={maintenanceFormData.lastMileage}
                  onChange={(e) =>
                    setMaintenanceFormData({
                      ...maintenanceFormData,
                      lastMileage: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-dateInterval">Intervalo de Tempo (dias)</Label>
                <Input
                  id="edit-dateInterval"
                  type="number"
                  value={maintenanceFormData.dateInterval}
                  onChange={(e) =>
                    setMaintenanceFormData({
                      ...maintenanceFormData,
                      dateInterval: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-mileageInterval">Intervalo de Km</Label>
                <Input
                  id="edit-mileageInterval"
                  type="number"
                  value={maintenanceFormData.mileageInterval}
                  onChange={(e) =>
                    setMaintenanceFormData({
                      ...maintenanceFormData,
                      mileageInterval: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cost">Custo (R$)</Label>
              <Input
                id="edit-cost"
                type="number"
                value={maintenanceFormData.cost}
                onChange={(e) =>
                  setMaintenanceFormData({ ...maintenanceFormData, cost: Number.parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMaintenanceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditMaintenance}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={isEditPartDialogOpen} onOpenChange={setIsEditPartDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Peça</DialogTitle>
            <DialogDescription>Atualize os dados da peça</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-part-name">Nome da Peça</Label>
                <Input
                  id="edit-part-name"
                  value={partFormData.name}
                  onChange={(e) => setPartFormData({ ...partFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-part-code">Código</Label>
                <Input
                  id="edit-part-code"
                  value={partFormData.code}
                  onChange={(e) => setPartFormData({ ...partFormData, code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantidade</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={partFormData.quantity}
                  onChange={(e) => setPartFormData({ ...partFormData, quantity: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-minQuantity">Qtd. Mínima</Label>
                <Input
                  id="edit-minQuantity"
                  type="number"
                  value={partFormData.minQuantity}
                  onChange={(e) => setPartFormData({ ...partFormData, minQuantity: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-unitPrice">Preço Unit. (R$)</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  value={partFormData.unitPrice}
                  onChange={(e) => setPartFormData({ ...partFormData, unitPrice: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-supplier">Fornecedor</Label>
              <Input
                id="edit-supplier"
                value={partFormData.supplier}
                onChange={(e) => setPartFormData({ ...partFormData, supplier: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPartDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPart}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Maintenance Dialog */}
      <AlertDialog open={isDeleteMaintenanceDialogOpen} onOpenChange={setIsDeleteMaintenanceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de manutenção? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMaintenance}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Part Dialog */}
      <AlertDialog open={isDeletePartDialogOpen} onOpenChange={setIsDeletePartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a peça <strong>{selectedPart?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePart} className="bg-destructive text-white hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
