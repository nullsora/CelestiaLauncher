const { ipcRenderer } = require('electron');
const path = require('path');

let appPath, fileStats, launcherConf, gitPath, confPath = 'conf/config.json';

let ProgressDialog = {
    dialog: new mdui.Dialog('#ProgressDialog', { modal: true }),
    content: document.getElementById('ProgressContent'),
    progress: document.getElementById('Progress'),
    confirmBtn: document.getElementById('ProgressConfirmBtn')
};

let CmdDialog = {
    dialog: new mdui.Dialog('#CmdDialog', { modal: true }),
    content: document.getElementById('CmdContent'),
    log: document.getElementById('CmdLog'),
    confirmBtn: document.getElementById('CmdConfirmBtn')
};

let Elements = {
    installJava: document.getElementById('InstallJava'),
    installMongo: document.getElementById('InstallMongo'),
    installGit: document.getElementById('InstallGit'),
    installGC: document.getElementById('InstallGC'),
    installGCR: document.getElementById('InstallGCR'),
    canInstallGC: true
};

window.onload = function () {
    ipcRenderer.send('GetAppPath', {});
    ipcRenderer.once('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
        ipcRenderer.send('ReadJson', { Path: path.join(appPath, confPath) });
        ipcRenderer.once('JsonContent', (event, args) => {
            launcherConf = args.Obj;
            gitPath = launcherConf.UseGitPath ? 'git' : path.join(appPath, 'resources/git/cmd/git.exe');
            UpdateStats();
            setInterval(UpdateStats, 500);
        });
    });
};

function Caution(message) {
    mdui.snackbar({ message: message });
}

function UpdateStats() {
    ipcRenderer.send('GetStats', {});
    ipcRenderer.once('StatsReturn', (event, args) => {
        fileStats = args.Stats;
        Elements.canInstallGC = fileStats.hasGit || launcherConf.UseGitPath;
        if (Elements.canInstallGC) {
            Elements.installGC.setAttribute('class', 'mdui-list-item mdui-ripple');
            Elements.installGCR.setAttribute('class', 'mdui-list-item mdui-ripple');
        } else {
            Elements.installGC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
            Elements.installGCR.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
        }
    });
}

function DownloadAndUnzipFile(title, url, name, unzipPath) {
    ProgressDialog.content.innerHTML = '正在下载' + title + '...';
    ProgressDialog.dialog.open();
    ProgressDialog.progress.style.width = '0%';
    let downloadPath = path.join(appPath, 'resources');
    ipcRenderer.send('Download', {
        URL: url,
        Name: name,
        Path: downloadPath
    });
    ipcRenderer.on('DownloadProgress', (event, args) => {
        if (args.Progress <= 100) {
            ProgressDialog.progress.style.width = args.Progress + '%';
        }
        if (args.Progress >= 100) {
            ProgressDialog.progress.style.width = '0%';
            ipcRenderer.removeAllListeners('DownloadProgress');
            ProgressDialog.content.innerHTML = '正在安装' + title + '...';
            ipcRenderer.send('Unzip', {
                FilePath: path.join(downloadPath, name),
                ExPath: path.join(downloadPath, unzipPath)
            });
            ipcRenderer.on('UnzipProgress', (event, args) => {
                ProgressDialog.progress.style.width = args.Progress + '%';
            });
            ipcRenderer.once('UnzipFinish', (event, args) => {
                ProgressDialog.confirmBtn.removeAttribute('disabled');
                ProgressDialog.content.innerHTML = '已完成.';
                Caution('下载已完成');
                ipcRenderer.removeAllListeners('UnzipProgress');
            });
        }
    });
}

ProgressDialog.confirmBtn.addEventListener('click', () => {
    ProgressDialog.progress.style.width = '0%';
    ProgressDialog.confirmBtn.setAttribute('disabled', 'true');
});

function AsyncSysCmd(title, command, cwd) {
    CmdDialog.dialog.open();
    CmdDialog.content.innerHTML = title;
    let currentCwd = path.join(appPath, 'resources', cwd);
    ipcRenderer.send('DoCmd', { Cmds: command, Cwd: currentCwd });
    ipcRenderer.on('CmdLog', (event, args) => {
        console.log(args.Data);
        CmdDialog.log.innerHTML += args.Data;
    });
    ipcRenderer.once('CmdReturn', (event, args) => {
        CmdDialog.confirmBtn.removeAttribute('disabled');
        ipcRenderer.removeAllListeners('CmdLog');
        if (args.Error == null) {
            CmdDialog.log.innerHTML = args.Return + '\nSuccess.';
            Caution('执行成功');
        } else {
            CmdDialog.log.innerHTML += '\nExecute failed. Exit because of ' + args.Error;
            console.error(args.Error);
            Caution('执行失败');
        }
    });
}

CmdDialog.confirmBtn.addEventListener('click', () => {
    CmdDialog.log.innerHTML = '';
    CmdDialog.confirmBtn.setAttribute('disabled', 'true');
});

Elements.installJava.addEventListener('click', () => {
    DownloadAndUnzipFile(
        'Java',
        'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.3_7.zip',
        'jdk.zip',
        ''
    );
});

Elements.installMongo.addEventListener('click', () => {
    DownloadAndUnzipFile(
        'MongoDB',
        'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-5.0.8.zip',
        'mongo.zip',
        ''
    );
});

Elements.installGit.addEventListener('click', () => {
    DownloadAndUnzipFile(
        'Git',
        'https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/Git for Windows 2.36.1/MinGit-2.36.1-busybox-64-bit.zip',
        'git.zip',
        'git'
    );
});

Elements.installGC.addEventListener('click', () => {
    if (Elements.canInstallGC) {
        AsyncSysCmd(
            '正在从Github拉取Grasscutter dev分支...',
            [gitPath + ' clone -b development https://ghproxy.com/https://github.com/Grasscutters/Grasscutter.git'],
            ''
        );
    }
});

Elements.installGCR.addEventListener('click', () => {
    if (Elements.canInstallGC) {
        AsyncSysCmd(
            '正在从Github下载Grasscutter所需资源...',
            [gitPath + ' clone https://ghproxy.com/https://github.com/Koko-boya/Grasscutter_Resources.git'],
            ''
        );
    }
});
