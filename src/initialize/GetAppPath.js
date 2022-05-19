const { app, ipcMain } = require('electron');

exports.SendAppPathTo = function (win) {
    ipcMain.on('GetAppPath', (event, args) => {
        win.webContents.send('ReturnAppPath', {
            ProgramPath: process.cwd(),
            ResourcesPath: app.getAppPath()
        });
    });
};