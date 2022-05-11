const { ipcMain, app } = require('electron')
const path = require('path')
const unZip = require('decompress-zip');

exports.initUnzip = function (win) {
    let UnzipFile = {
        filePath: '',
        extractPath: ''
    };
    function Reset() {
        UnzipFile = {
            filePath: '',
            extractPath: ''
        };
    }

    ipcMain.on('unzip', (event, args) => {
        let fPath = path.join(app.getAppPath(), 'resources', args.fName);
        let exPath = path.join(app.getAppPath(), args.exFolder);
        let unzipper = new unZip(fPath);
        unzipper.extract({ path: exPath });
        unzipper.on('progress', function (fileIndex, fileCount) {
            let progress = fileIndex / fileCount * 100;
            win.webContents.send('unzipProgress', { Progress: progress });
        });
        unzipper.on('extract', function (log) {
            win.webContents.send('unzipFinish', { Finish: true })
            Reset();
            console.log('Finished extracting');
        });
    })
}