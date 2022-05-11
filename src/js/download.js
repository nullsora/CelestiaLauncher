const { ipcMain, shell } = require('electron')
const path = require('path')

exports.initDownload = function (mainWindow) {
    let downloadObj = {
        downloadPath: '', // 要下载的链接或文件
        fileName: '', // 要保存的文件名，需要带文件后缀名
        savedPath: '' // 要保存的路径
    }
    function resetDownloadObj() {
        downloadObj = {
            downloadPath: '',
            fileName: '',
            savedPath: ''
        }
    }
    // 监听渲染进程发出的download事件
    ipcMain.on('download', (evt, args) => {
        downloadObj.downloadPath = args.downloadPath
        downloadObj.fileName = args.fileName
        downloadObj.savedPath = args.filePath
        let ext = path.extname(downloadObj.fileName)
        let filters = [{ name: '全部文件', extensions: ['*'] }]
        if (ext && ext !== '.') {
            filters.unshift({
                name: '',
                extensions: [ext.match(/[a-zA-Z]+$/)[0]]
            })
        }
        if (downloadObj.savedPath) {
            mainWindow.webContents.downloadURL(downloadObj.downloadPath) // 触发will-download事件
        }
    })

    mainWindow.webContents.session.on('will-download', (event, item) => {
        //设置文件存放位置
        item.setSavePath(downloadObj.savedPath)
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused')
                } else {
                    console.log(`Received bytes: ${item.getReceivedBytes()}`)
                }
            }
        })
        item.once('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully')
                shell.showItemInFolder(downloadObj.savedPath) // 下载成功后打开文件所在文件夹
            } else {
                console.log(`Download failed: ${state}`)
            }
            resetDownloadObj()
        })
    })
}
