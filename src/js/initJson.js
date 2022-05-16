const fs = require('fs');
const { app, ipcMain } = require('electron');
const path = require('path');

exports.initJson = function (win) {
    ipcMain.on('ReadConf', (event, args) => {
        let jsonPath = path.join(app.getAppPath(), args.Path);
        fs.readFile(jsonPath, (err, data) => {
            let confData = data.toString();
            let jsonContent = JSON.parse(confData);
            win.webContents.send('ConfContent', { Obj: jsonContent });
        });
    });
    ipcMain.on('WriteConf', (event, args) => {
        let jsonPath = path.join(app.getAppPath(), args.Path);
        let writeContent = JSON.stringify(args.Obj);
        fs.writeFile(jsonPath, writeContent, () => { });
    });
};