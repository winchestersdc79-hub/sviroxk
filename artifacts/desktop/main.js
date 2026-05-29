const { app, BrowserWindow, shell } = require('electron');
const serve = require('electron-serve');
const path = require('path');

const loadURL = serve({ directory: path.join(__dirname, 'web-build') });

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 400,
    minHeight: 600,
    backgroundColor: '#0D0D1F',
    title: 'Sviroxk — Продуктивность',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
  });

  loadURL(win);

  // Open external links in browser, not in Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
