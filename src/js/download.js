var ipc = require('electron').ipcRenderer;
var $ = mdui.$;
var dialog = new mdui.Dialog('#Download', { modal: true });
var progressLine = document.getElementById('Progress');
var confirmBtn = document.getElementById('ConfirmBtn');
var dialogTitle = document.getElementById('DialogTitle');

function download(title, url, name, path) {
    dialogTitle = title;
    dialog.open();
    progressLine.style.width = '0%';
    ipc.send('download', {
        URL: url,
        Name: name,
        Path: path
    });
    ipc.on('progress', (event, args) => {
        let Progress = args.Progress * 100;
        if (Progress < 100) {
            progressLine.style.width = Progress + '%';
        } else {
            confirmBtn.removeAttribute('disabled');
        }
    });
}

document.getElementById('installJava').addEventListener('click', () => {
    download(
        '正在下载Java...',
        'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.3_7.zip',
        'jdk.zip',
        './res/'
    );
})