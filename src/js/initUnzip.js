const { ipcMain } = require('electron')
const fs = require('fs')
const unzip = require('./unzip/unzip')
let filePath;//文件路径
let unzipPath; //解压后路径

ipcMain.on('unzip', (event, args) => {
    filePath = args.filePath
    unzipPath = args.unzipPath;
    fs.createReadStream(filePath).pipe(unzip.Extract({ path: unzipPath }));
})