var ele = require('electron');
var dl = require('./src/js/initDownload').initDownload;

var app = ele.app;
var BrowserWindow = ele.BrowserWindow;
var ipc = ele.ipcMain;

let mainWindow
function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    mainWindow.loadFile('./src/index.html')
    mainWindow.webContents.openDevTools()
    dl(mainWindow)
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipc.on('window-close', function () {
    mainWindow.close();
})
ipc.on('window-max', function () {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
})
ipc.on('window-min', function () {
    mainWindow.minimize();
})
