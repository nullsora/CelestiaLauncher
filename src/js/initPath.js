const { app, ipcMain } = require('electron');

exports.initPath = function (win) {
    var path = app.getAppPath();
    ipcMain.on('GetAppPath', (event, args) => {
        setTimeout(() => {
            win.webContents.send('ReturnAppPath', {
                Path: path
            });
        }, 100);
    });
};