const electron = require('electron');
const { InitDownloadEvtIn } = require('./src/initialize/FileOperate');
const { InitUnzipEvtIn } = require('./src/initialize/FileOperate');
const { InitJsonOperatorIn } = require('./src/initialize/JsonOperate');
const { InitCmdExecuteIn } = require('./src/initialize/SysCommand');
const { SendAppPathTo } = require('./src/initialize/GetAppPath');
const checkFile = require('./src/initialize/CheckStats').checkFile;

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;

let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        width: 1366,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('./src/index.html');
    mainWindow.webContents.openDevTools();
    InitDownloadEvtIn(mainWindow);
    InitUnzipEvtIn(mainWindow);
    InitJsonOperatorIn(mainWindow);
    InitCmdExecuteIn(mainWindow);
    SendAppPathTo(mainWindow);
    checkFile(mainWindow);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipc.on('window-close', function () {
    mainWindow.close();
});
ipc.on('window-max', function () {
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
});
ipc.on('window-min', function () {
    mainWindow.minimize();
});
