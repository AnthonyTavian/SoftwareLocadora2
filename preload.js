const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Customers
  getCustomers: () => ipcRenderer.invoke("get-customers"),
  saveCustomers: (customers) => ipcRenderer.invoke("save-customers", customers),

  // Maintenance
  getMaintenance: () => ipcRenderer.invoke("get-maintenance"),
  saveMaintenance: (data) => ipcRenderer.invoke("save-maintenance", data),

  // Parts
  getParts: () => ipcRenderer.invoke("get-parts"),
  saveParts: (data) => ipcRenderer.invoke("save-parts", data),

  // Vehicles
  getVehicles: () => ipcRenderer.invoke("get-vehicles"),
  saveVehicles: (data) => ipcRenderer.invoke("save-vehicles", data),

  // Rentals
  getRentals: () => ipcRenderer.invoke("get-rentals"),
  saveRentals: (data) => ipcRenderer.invoke("save-rentals", data),

});

console.log("Preload carregado");