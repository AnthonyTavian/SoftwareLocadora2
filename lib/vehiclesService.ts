import { app } from "electron";
import fs from "fs";
import path from "path";

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;            
  color: string;           
  category: string;        
  dailyRate: number;       
  currentMileage: number;  
  status: "available" | "rented" | "maintenance";
};


const filePath = path.join(app.getPath("userData"), "vehicles.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export function getVehicles(): Vehicle[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Vehicle[];
}

export function saveVehicles(data: Vehicle[]): void {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}