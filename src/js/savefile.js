var ipc = require('electron').ipcRenderer;
var app = require("electron").remote;
var path = require ('path');

let homeDir =  path.dirname(app.getPath('exe'))

function SaveFile(link, name, path) {
    ipc.send('download', {
        downloadPath: link,
        fileName: name,
        filePath: path
    })
}

document.getElementById('installJava').addEventListener('click', () => {
    SaveFile(
        'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.3_7.zip',
        'jdk.zip',
        homeDir + 'resource'
    )
})