var ipc = require('electron').ipcRenderer;
var dialog = new mdui.Dialog('#Download', { modal: true });
var cmdDialog = new mdui.Dialog('#CMD', { modal: true });
var appPath;

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.on('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
    });
};

function DonloadFile(title, url, name) {
    document.getElementById('DialogContent').innerHTML = title;
    dialog.open();
    document.getElementById('Progress').style.width = '0%';
    ipc.send('Download', {
        URL: url,
        Name: name
    });
    ipc.on('Progress', (event, args) => {
        if (args.Progress <= 100) {
            document.getElementById('Progress').style.width = args.Progress + '%';
        }
    });
}

function Unzip(title, name, filePath) {
    document.getElementById('Progress').style.width = '0%';
    ipc.on('Progress', (event, args) => {
        if (args.Progress >= 100) {
            document.getElementById('DialogContent').innerHTML = title;
            ipc.send('Unzip', {
                fName: name,
                exFolder: filePath
            });
            ipc.on('UnzipProgress', (event, args) => {
                document.getElementById('Progress').style.width = args.Progress + '%';
            });
            ipc.on('UnzipFinish', (event, args) => {
                if (args.Finish == true) {
                    document.getElementById('ConfirmBtn').removeAttribute('disabled');
                }
            });
        }
    });
}

document.getElementById('ConfirmBtn').addEventListener('click', () => {
    document.getElementById('Progress').style.width = '0%';
    document.getElementById('ConfirmBtn').setAttribute('disabled', 'true');
});

function FileCommand(title, path, other, cwd) {
    cmdDialog.open();
    document.getElementById('CMDContent').innerHTML = title;
    ipc.send('DoFileCommand', {
        Path: path,
        Other: other,
        Cwd: cwd
    });
    ipc.once('FileCommandLog', (event, args) => {
        document.getElementById('CMDLog').innerHTML = args.Log;
        console.log(args.Log);
    });
    ipc.once('FileCommandReturn', (event, args) => {
        document.getElementById('CMDConfirm').removeAttribute('disabled');
        if (args.Return == 0) {
            document.getElementById('CMDLog').innerHTML += 'success.';
        } else {
            document.getElementById('CMDLog').innerHTML = 'download failed. exit with code ' + args.Return;
        }
    });
}

document.getElementById('CMDConfirm').addEventListener('click', () => {
    document.getElementById('CMDLog').innerHTML = '';
    document.getElementById('CMDConfirm').setAttribute('disabled', 'true');
});

document.getElementById('installJava').addEventListener('click', () => {
    DonloadFile(
        '正在下载Java...',
        'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.3_7.zip',
        'jdk.zip'
    );
    Unzip(
        '正在安装Java...',
        'jdk.zip',
        'resources'
    );
});
document.getElementById('installMongo').addEventListener('click', () => {
    DonloadFile(
        '正在下载MongoDB...',
        'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-5.0.8.zip',
        'mongo.zip'
    );
    Unzip(
        '正在安装MongoDB...',
        'mongo.zip',
        'resources'
    );
});
document.getElementById('installGit').addEventListener('click', () => {
    DonloadFile(
        '正在下载Git...',
        'https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/Git for Windows 2.36.1/MinGit-2.36.1-busybox-64-bit.zip',
        'git.zip'
    );
    Unzip(
        '正在安装Git...',
        'git.zip',
        'resources/git'
    );
});
document.getElementById('installGC').addEventListener('click', () => {
    FileCommand(
        '正在从Github拉取Grasscutter dev分支...',
        'git/cmd/git.exe',
        'clone -b development https://ghproxy.com/https://github.com/Grasscutters/Grasscutter.git',
        ''
    );
});
document.getElementById('installGC_R').addEventListener('click', () => {
    FileCommand(
        '正在从Github下载Grasscutter所需资源...',
        'git/cmd/git.exe',
        'clone https://ghproxy.com/https://github.com/Koko-boya/Grasscutter_Resources.git',
        ''
    );
});
