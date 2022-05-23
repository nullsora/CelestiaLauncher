const { ipcRenderer } = require('electron');
const { shell } = require('electron');
const path = require('path');
const fs = require('fs');

let appPath, resPath, fileStats, launcherConf, gitPath, confPath = 'conf/config.json';

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

    updateGC: document.getElementById('GrasscutterUpdate'),
    compileGC: document.getElementById('GrasscutterCompile'),
    precompileGC: document.getElementById('GrasscutterPrecompile'),
    configureGC: document.getElementById('ConfigureGC'),
    changeBranch: document.getElementById('ChangeBranch'),
    branchInput: document.getElementById('BranchInput'),

    canInstallGC: true
};

let Icons = {
    Java: document.getElementById('JavaStat'),
    Mongo: document.getElementById('MongoStat'),
    Git: document.getElementById('GitStat'),
    GC: document.getElementById('GCStat'),
    GCR: document.getElementById('GCRStat')
};

window.onload = function () {
    ipcRenderer.send('GetAppPath', {});
    ipcRenderer.once('ReturnAppPath', (event, args) => {
        appPath = args.ProgramPath;
        resPath = args.ResourcesPath;
        console.log(appPath);
        ipcRenderer.send('ReadJson', { Path: path.join(resPath, confPath) });
        ipcRenderer.once('JsonContent', (event, args) => {
            launcherConf = args.Obj;
            gitPath = launcherConf.UseGitPath ? 'git' : path.join(appPath, 'game/git/cmd/git.exe');
            if (launcherConf.AutoUpdate) {
                AsyncSysCmd(
                    '正在更新并编译...',
                    [
                        gitPath + ' pull',
                        '.\\gradlew jar'
                    ],
                    'Grasscutter'
                );
            }
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
        if ((fileStats.hasGit || launcherConf.UseGitPath) && fileStats.hasGC) {
            Elements.updateGC.removeAttribute('disabled');
            Elements.changeBranch.removeAttribute('disabled');
            Elements.branchInput.removeAttribute('disabled');
        } else {
            Elements.updateGC.setAttribute('disabled', 'true');
            Elements.changeBranch.setAttribute('disabled', 'true');
            Elements.branchInput.setAttribute('disabled', 'true');
        }
        if ((fileStats.hasJDK || launcherConf.UseJDKPath) && fileStats.hasGC) {
            if (fileStats.hasGCR) {
                Elements.configureGC.setAttribute('class', 'mdui-list-item mdui-ripple');
            } else {
                Elements.configureGC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
            }
            Elements.compileGC.removeAttribute('disabled');
            Elements.precompileGC.setAttribute('class', 'mdui-list-item mdui-ripple');
        } else {
            Elements.compileGC.setAttribute('disabled', 'true');
            Elements.precompileGC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
            Elements.configureGC.setAttribute('class', 'mdui-list-item mdui-text-color-grey');
        }
        if (fileStats.hasJDK || launcherConf.UseJDKPath) {
            Icons.Java.innerHTML = 'checked';
            Icons.Java.setAttribute('class', 'mdui-list-item-icon mdui-icon material-icons mdui-text-color-green');
        }
        if (fileStats.hasMongo || launcherConf.UseMongoService) {
            Icons.Mongo.innerHTML = 'checked';
            Icons.Mongo.setAttribute('class', 'mdui-list-item-icon mdui-icon material-icons mdui-text-color-green');
        }
        if (fileStats.hasGit || launcherConf.UseGitPath) {
            Icons.Git.innerHTML = 'checked';
            Icons.Git.setAttribute('class', 'mdui-list-item-icon mdui-icon material-icons mdui-text-color-green');
        }
        if (fileStats.hasGC) {
            Icons.GC.innerHTML = 'checked';
            Icons.GC.setAttribute('class', 'mdui-list-item-icon mdui-icon material-icons mdui-text-color-green');
        }
        if (fileStats.hasGCR) {
            Icons.GCR.innerHTML = 'checked';
            Icons.GCR.setAttribute('class', 'mdui-list-item-icon mdui-icon material-icons mdui-text-color-green');
        }
    });
}

function DownloadAndUnzipFile(title, url, name, unzipPath) {
    ProgressDialog.content.innerHTML = '正在下载' + title + '...';
    ProgressDialog.dialog.open();
    ProgressDialog.progress.style.width = '0%';
    let downloadPath = path.join(appPath, 'game');
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
            setTimeout(() => {
                ProgressDialog.content.innerHTML = '正在解压' + title + '...';
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
            }, 200);
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
    let currentCwd = path.join(appPath, 'game', cwd);
    ipcRenderer.send('DoCmd', { Cmds: command, Cwd: currentCwd });
    ipcRenderer.on('CmdLog', (event, args) => {
        console.log(args.Data);
        CmdDialog.log.innerHTML += args.Data;
    });
    ipcRenderer.once('CmdReturn', (event, args) => {
        CmdDialog.confirmBtn.removeAttribute('disabled');
        ipcRenderer.removeAllListeners('CmdLog');
        if (args.Error == null) {
            CmdDialog.log.innerHTML = 'Success.\n' + args.Return;
            Caution('执行成功');
        } else {
            CmdDialog.log.innerHTML += 'Execute failed. Exit because of ' + args.Error;
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

Elements.updateGC.addEventListener('click', () => {
    AsyncSysCmd(
        '正在从github拉取更新...',
        [gitPath + ' pull'],
        'Grasscutter'
    );
});

Elements.compileGC.addEventListener('click', () => {
    let jdkPath = path.join(appPath, 'game/jdk-17.0.3+7');
    AsyncSysCmd(
        '正在编译为Jar File...',
        launcherConf.UseJDKPath ?
            ['.\\gradlew jar'] :
            ['set JAVA_HOME=' + jdkPath, '.\\gradlew jar'],
        'Grasscutter'
    );
});

Elements.precompileGC.addEventListener('click', () => {
    if ((fileStats.hasJDK || launcherConf.UseJDKPath) && fileStats.hasGC) {
        let jdkPath = path.join(appPath, 'game/jdk-17.0.3+7');
        let gradlewBatPath = path.join(appPath, 'game/Grasscutter/gradlew.bat');
        let gradlewBatClonePath = path.join(appPath, 'game/Grasscutter/gradlewclone.bat');
        let gradlewBatContent;
        try {
            fs.accessSync(gradlewBatClonePath);
            gradlewBatContent = fs.readFileSync(gradlewBatClonePath);
        } catch (err) {
            gradlewBatContent = fs.readFileSync(gradlewBatPath);
            fs.writeFileSync(gradlewBatClonePath, gradlewBatContent);
        }
        fs.writeFileSync(gradlewBatPath, launcherConf.UseJDKPath ? '' : 'set JAVA_HOME=' + jdkPath + '\n');
        fs.appendFileSync(gradlewBatPath, gradlewBatContent);
        shell.openPath(gradlewBatPath);
    }
});

Elements.configureGC.addEventListener('click', () => {
    if ((fileStats.hasJDK || launcherConf.UseJDKPath) && fileStats.hasGC && fileStats.hasGCR) {
        AsyncSysCmd(
            '正在配置Grasscutter...',
            [
                'mkdir .\\Grasscutter\\resources',
                'xcopy /Q /H /E /Y .\\Grasscutter_Resources\\Resources .\\Grasscutter\\resources',
                'xcopy /H /E /Y .\\GC_res_fix\\AvatarCostumeExcelConfigData.json .\\Grasscutter\\resources\\ExcelBinOutput\\AvatarCostumeExcelConfigData.json'
            ],
            ''
        );
    }
});

Elements.changeBranch.addEventListener('click', () => {
    if ((fileStats.hasGit || launcherConf.UseGitPath) && fileStats.hasGC) {
        let branchName = Elements.branchInput.value;
        console.log(branchName);
        AsyncSysCmd(
            '正在切换分支到' + branchName,
            [gitPath + ' checkout ' + branchName],
            'Grasscutter'
        );
    }
});
