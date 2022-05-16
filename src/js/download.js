var ipc = require('electron').ipcRenderer;
var path = require('path');

var appPath, stats, config, confPath = 'conf/config.json';

var dialog = new mdui.Dialog('#Download', { modal: true });
var cmdDialog = new mdui.Dialog('#CMD', { modal: true });

var installEvent = {
    Java: document.getElementById('InstallJava'),
    Mongo: document.getElementById('InstallMongo'),
    Git: document.getElementById('InstallGit'),
    GC: document.getElementById('InstallGC'),
    GCR: document.getElementById('InstallGC_R'),
    GCstat: true
};

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.once('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
    });
    ipc.send('ReadConf', { Path: confPath });
    ipc.once('ConfContent', (event, args) => {
        config = args.Obj;
        setInterval(UpdateStats(), 500);
    });
};

function Caution(message) {
    mdui.snackbar({ message: message });
}

function UpdateStats() {
    ipc.send('GetStats', {});
    ipc.once('StatsReturn', (event, args) => {
        stats = args.Stats;
        installEvent.GCstat = stats.hasGit || config.UseGitPath;
        if (installEvent.GCstat) {
            installEvent.GC.setAttribute('class', 'mdui-list-item mdui-ripple');
            installEvent.GCR.setAttribute('class', 'mdui-list-item mdui-ripple');
        } else {
            installEvent.GC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
            installEvent.GCR.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
        }
    });
}

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

function UnzipAfterDownload(title, name, filePath) {
    ipc.on('Progress', (event, args) => {
        if (args.Progress >= 100) {
            document.getElementById('Progress').style.width = '0%';
            ipc.removeAllListeners('Progress');
            document.getElementById('DialogContent').innerHTML = title;
            ipc.send('Unzip', {
                fName: name,
                exFolder: filePath
            });
            ipc.on('UnzipProgress', (event, args) => {
                document.getElementById('Progress').style.width = args.Progress + '%';
            });
            ipc.once('UnzipFinish', (event, args) => {
                if (args.Finish == true) {
                    document.getElementById('ConfirmBtn').removeAttribute('disabled');
                    document.getElementById('DialogContent').innerHTML = '已完成.';
                    Caution('下载已完成');
                }
                ipc.removeAllListeners('UnzipProgress');
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
            Caution('下载已完成');
        } else {
            document.getElementById('CMDLog').innerHTML = 'download failed. exit with code ' + args.Return;
            Caution('下载失败');
        }
    });
}

document.getElementById('CMDConfirm').addEventListener('click', () => {
    document.getElementById('CMDLog').innerHTML = '';
    document.getElementById('CMDConfirm').setAttribute('disabled', 'true');
});

installEvent.Java.addEventListener('click', () => {
    DonloadFile(
        '正在下载Java...',
        'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.3_7.zip',
        'jdk.zip'
    );
    UnzipAfterDownload(
        '正在安装Java...',
        'jdk.zip',
        'resources'
    );
});
installEvent.Mongo.addEventListener('click', () => {
    DonloadFile(
        '正在下载MongoDB...',
        'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-5.0.8.zip',
        'mongo.zip'
    );
    UnzipAfterDownload(
        '正在安装MongoDB...',
        'mongo.zip',
        'resources'
    );
});
installEvent.Git.addEventListener('click', () => {
    DonloadFile(
        '正在下载Git...',
        'https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/Git for Windows 2.36.1/MinGit-2.36.1-busybox-64-bit.zip',
        'git.zip'
    );
    UnzipAfterDownload(
        '正在安装Git...',
        'git.zip',
        'resources/git'
    );
});
installEvent.GC.addEventListener('click', () => {
    if (installEvent.GCstat) {
        FileCommand(
            '正在从Github拉取Grasscutter dev分支...',
            config.UseGitPath ? 'git' : path.join(appPath, 'resources/git/cmd/git.exe'),
            'clone -b development https://ghproxy.com/https://github.com/Grasscutters/Grasscutter.git',
            ''
        );
    }
});
installEvent.GCR.addEventListener('click', () => {
    if (installEvent.GCstat) {
        FileCommand(
            '正在从Github下载Grasscutter所需资源...',
            config.UseGitPath ? 'git' : path.join(appPath, 'resources/git/cmd/git.exe'),
            'clone https://ghproxy.com/https://github.com/Koko-boya/Grasscutter_Resources.git',
            ''
        );
    }
});
