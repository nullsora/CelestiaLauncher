const fs = require('fs');
const { app, ipcMain } = require('electron');
const path = require('path');

exports.initConfig = function (win) {
    let confPath = path.join(app.getAppPath(), 'src/conf/config.json');
    let confContent;
    ipcMain.on('ReadConf', (event, args) => {
        fs.readFile(confPath, (err, data) => {
            let confData = data.toString();
            confContent = JSON.parse(confData);
            win.webContents.send('ConfContent', { Obj: confContent });
        });
    });
    ipcMain.on('WriteConf', (event, args) => {
        let writeContent = JSON.stringify(args.Obj);
        fs.writeFile(confPath, writeContent);
    });
};