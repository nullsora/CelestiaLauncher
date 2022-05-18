const fs = require('fs');
const { ipcMain } = require('electron');

exports.InitJsonOperatorIn = function (win) {
    ipcMain.on('ReadJson', (event, args) => {
        let jsonPath = args.Path;
        fs.readFile(jsonPath, (err, data) => {
            let jsonData = data.toString();
            let jsonContent = JSON.parse(jsonData);
            win.webContents.send('JsonContent', { Obj: jsonContent });
        });
    });
    ipcMain.on('WriteJson', (event, args) => {
        let jsonPath = args.Path;
        let writeContent = JSON.stringify(args.Obj);
        fs.writeFile(jsonPath, writeContent, () => { });
    });
};