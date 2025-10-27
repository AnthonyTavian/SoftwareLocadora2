export {};

import type { Customer } from "./lib/customersService";
import type { MaintenanceRecord } from "./lib/maintenanceService";
import type { Part } from "./lib/partsService";
import type { Vehicle } from "./lib/vehiclesService";
import type { Rental } from "./lib/rentalsService";

declare global {
  interface Window {
    electronAPI: {
      // Customers
      getCustomers: () => Promise<Customer[]>;
      saveCustomers: (customers: Customer[]) => Promise<void>;

      // Maintenance
      getMaintenance: () => Promise<MaintenanceRecord[]>;
      saveMaintenance: (records: MaintenanceRecord[]) => Promise<void>;

      // Parts
      getParts: () => Promise<Part[]>;
      saveParts: (parts: Part[]) => Promise<void>;

      // Vehicles
      getVehicles: () => Promise<Vehicle[]>;
      saveVehicles: (vehicles: Vehicle[]) => Promise<void>;

      // Rentals
      getRentals: () => Promise<Rental[]>;
      saveRentals: (rentals: Rental[]) => Promise<void>;
    };
  }
}