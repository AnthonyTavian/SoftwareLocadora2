const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const next = require("next");
const express = require("express");
const fs = require("fs");

let mainWindow;
let httpServer;

// Base path para os services compilados (CommonJS)
const servicesPath = path.join(__dirname, "lib");

const { getCustomers, saveCustomers } = require(path.join(servicesPath, "customersService.js"));
const { getMaintenance, saveMaintenance } = require(path.join(servicesPath, "maintenanceService.js"));
const { getParts, saveParts } = require(path.join(servicesPath, "partsService.js"));
const { getVehicles, saveVehicles } = require(path.join(servicesPath, "vehiclesService.js"));
const { getRentals, saveRentals } = require(path.join(servicesPath, "rentalsService.js"));

async function createWindow() {
  const dev = !app.isPackaged;

  // Caminho do Next
  // 👉 Em dev: usa __dirname (raiz do projeto)
  // 👉 Em prod: também usa __dirname (dentro do app.asar, onde está o .next empacotado)
  const dir = __dirname;

  console.log("Ambiente:", dev ? "Desenvolvimento" : "Produção");
  console.log("Next dir:", dir);
  console.log("Existe .next?", fs.existsSync(path.join(dir, ".next")));

  // Inicializa Next
  const nextApp = next({ dev, dir });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  // Configura servidor Express
  const server = express();
  server.use((req, res) => handle(req, res));

  // Cria janela do Electron
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  if (dev) {
    // Dev: conecta no servidor Next local
    await mainWindow.loadURL("http://localhost:3000/dashboard");
    mainWindow.show();
  } else {
    // Produção: inicia servidor Next embutido em porta dinâmica
    httpServer = server.listen(0, async function () {
      const port = this.address().port;
      console.log(`Next rodando em produção na porta ${port}`);

      try {
        await mainWindow.loadURL(`http://localhost:${port}/dashboard`);
        mainWindow.show();
      } catch (err) {
        console.error("Erro ao carregar URL:", err);
        mainWindow.show();
      }
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// Customers
ipcMain.handle("get-customers", () => getCustomers());
ipcMain.handle("save-customers", (_, customers) => {
  saveCustomers(customers);
  return true;
});

// Maintenance
ipcMain.handle("get-maintenance", () => getMaintenance());
ipcMain.handle("save-maintenance", (_, data) => saveMaintenance(data));

// Parts
ipcMain.handle("get-parts", () => getParts());
ipcMain.handle("save-parts", (_, data) => saveParts(data));

// Vehicles
ipcMain.handle("get-vehicles", () => getVehicles());
ipcMain.handle("save-vehicles", (_, data) => saveVehicles(data));

// Rentals
ipcMain.handle("get-rentals", () => getRentals());
ipcMain.handle("save-rentals", (_, data) => saveRentals(data));

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (httpServer) httpServer.close();
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});