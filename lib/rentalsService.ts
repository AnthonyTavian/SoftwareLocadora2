import { app } from "electron";
import fs from "fs";
import path from "path";

export type Rental = {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
};

const filePath = path.join(app.getPath("userData"), "rentals.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export function getRentals(): Rental[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Rental[];
}

export function saveRentals(data: Rental[]): void {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}