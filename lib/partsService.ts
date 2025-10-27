import { app } from "electron";
import fs from "fs";
import path from "path";

export type Part = {
  id: string;
  name: string;
  code: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
};

const filePath = path.join(app.getPath("userData"), "parts.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export function getParts(): Part[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Part[];
}

export function saveParts(data: Part[]): void {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}