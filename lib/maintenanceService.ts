import { app } from "electron";
import fs from "fs";
import path from "path";

export type MaintenanceRecord = {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  type: "preventive" | "corrective" | "inspection";
  description: string;
  cost: number;
  date: string;
  lastMileage: number;
  dateInterval: number;
  mileageInterval: number;
  nextDate: string;
  nextMileage: number;
  status: "scheduled" | "in-progress" | "completed";
  createdAt: string;
};

const filePath = path.join(app.getPath("userData"), "maintenance.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export function getMaintenance(): MaintenanceRecord[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as MaintenanceRecord[];
}

export function saveMaintenance(data: MaintenanceRecord[]): void {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}