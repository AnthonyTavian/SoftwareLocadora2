const { app, BrowserWindow } = require('electron');
const path = require('path');
const next = require('next');
const express = require('express');
const fs = require('fs');

let mainWindow;
let httpServer;

async function createWindow() {
  const dev = !app.isPackaged;

  // Caminho do Next
  const dir = dev
    ? __dirname
    : path.join(process.resourcesPath, 'app.asar.unpacked');

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
    },
    show: false,
  });

  if (dev) {
    // Dev: conecta no servidor Next local
    await mainWindow.loadURL('http://localhost:3000/dashboard');
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (httpServer) httpServer.close();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});