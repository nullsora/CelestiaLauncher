const { ipcMain, app } = require('electron');
const path = require('path');
const unZip = require('decompress-zip');
const { exec } = require('child_process');

exports.InitDownloadEvtIn = function (win) {
    let downloadObj = {
        downloadPath: '',
        fileName: '',
        savedPath: ''
    };
    function Reset() {
        downloadObj = {
            downloadPath: '',
            fileName: '',
            savedPath: ''
        };
    }
    ipcMain.on('Download', (event, args) => {
        downloadObj.downloadPath = args.URL;
        downloadObj.fileName = args.Name;
        downloadObj.savedPath = args.Path;
        win.webContents.downloadURL(downloadObj.downloadPath);
    });

    win.webContents.session.on('will-download', (event, item) => {
        let savePath = path.join(downloadObj.savedPath, downloadObj.fileName);
        item.setSavePath(savePath);
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed');
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused');
                } else {
                    let progress = item.getReceivedBytes() / item.getTotalBytes() * 100;
                    win.setProgressBar(progress);
                    win.webContents.send('DownloadProgress', { Progress: progress });
                }
            }
        });
        item.once('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully');
            } else {
                console.log(`Download failed: ${state}`);
            }
            Reset();
        });
    });
};

exports.InitUnzipEvtIn = function (win) {
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

    ipcMain.on('Unzip', (event, args) => {
        let fPath = args.FilePath;
        let exPath = args.ExPath;
        let unzipper = new unZip(fPath);
        unzipper.extract({ path: exPath });
        unzipper.on('progress', function (fileIndex, fileCount) {
            let progress = fileIndex / fileCount * 100;
            win.webContents.send('UnzipProgress', { Progress: progress });
        });
        unzipper.on('extract', function (log) {
            win.webContents.send('UnzipFinish', {});
            exec('del /S /Q ' + `"${fPath}"`, () => { });
            Reset();
        });
    });
};