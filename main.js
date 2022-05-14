var ele = require('electron');
var initDownload = require('./src/js/initDownload').initDownload;
var initUnzip = require('./src/js/initUnzip').initUnzip;
var initCMD = require('./src/js/initCmd').initCmd;
var initPath = require('./src/js/initPath').initPath;

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
    initDownload(mainWindow)
    initUnzip(mainWindow)
    initCMD(mainWindow)
    initPath(mainWindow)
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

// Problems: 执行命令时应用无响应
// TODO: 读写config
// TODO - 2: 实时命令面板（链接到cmd），手动配置环境
// TODO - 3: 便捷的更改Grasscutter配置文件，查询ID