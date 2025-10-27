import { app } from "electron";
import fs from "fs";
import path from "path";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "active" | "inactive";
  createdAt: string;
};

const filePath = path.join(app.getPath("userData"), "customers.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export function getCustomers(): Customer[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Customer[];
}

export function saveCustomers(customers: Customer[]): void {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(customers, null, 2));
}