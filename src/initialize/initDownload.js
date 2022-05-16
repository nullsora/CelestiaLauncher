const { ipcMain, app } = require('electron');
const path = require('path');

exports.initDownload = function (win) {
    let downloadObj = {
        downloadPath: '',
        fileName: '',
        savedPath: ''
    };
    function resetDownloadObj() {
        downloadObj = {
            downloadPath: '',
            fileName: '',
            savedPath: ''
        };
    }
    ipcMain.on('Download', (event, args) => {
        downloadObj.downloadPath = args.URL;
        downloadObj.fileName = args.Name;
        win.webContents.downloadURL(downloadObj.downloadPath);
    });

    win.webContents.session.on('will-download', (event, item) => {
        let savePath = path.join(app.getAppPath(), 'resources', downloadObj.fileName);
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
                    win.webContents.send('Progress', { Progress: progress });
                }
            }
        });
        item.once('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully');
            } else {
                console.log(`Download failed: ${state}`);
            }
            resetDownloadObj();
        });
    });
};
