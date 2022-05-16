var ipc = require('electron').ipcRenderer;
var path = require('path');
var confPath = 'conf/config.json';
var appPath, launcherConfig;
var AutoUpdate = document.getElementById('AutoUpdate'),
    UseMongoService = document.getElementById('UseMongoService'),
    UseJDKPath = document.getElementById('UseJDKPath'),
    UseGitPath = document.getElementById('UseGitPath');

function Caution(message) {
    mdui.snackbar({ message: message, position: 'left-bottom' });
}

function WriteConf() {
    ipc.send('WriteConf', { Path: confPath, Obj: launcherConfig });
}

window.onload = function () {
    ipc.send('GetAppPath', {});
    ipc.once('ReturnAppPath', (event, args) => {
        appPath = args.Path;
        console.log(appPath);
    });
    ipc.send('ReadConf', { Path: confPath });
    ipc.once('ConfContent', (event, args) => {
        launcherConfig = args.Obj;
        launcherConfig.AutoUpdate ? AutoUpdate.setAttribute('checked', true) : {};
        launcherConfig.UseMongoService ? UseMongoService.setAttribute('checked', true) : {};
        launcherConfig.UseJDKPath ? UseJDKPath.setAttribute('checked', true) : {};
        launcherConfig.UseGitPath ? UseGitPath.setAttribute('checked', true) : {};
    });
};

AutoUpdate.addEventListener('click', () => {
    if (AutoUpdate.checked) {
        Caution('请确保已经存在Git并已在启动器中设置。');
        launcherConfig.AutoUpdate = true;
        WriteConf();
    } else {
        launcherConfig.AutoUpdate = false;
        WriteConf();
    }
});

UseMongoService.addEventListener('click', () => {
    if (UseMongoService.checked) {
        Caution('请确保系统中已经设置并启用了MongoDB服务。');
        launcherConfig.UseMongoService = true;
        WriteConf();
    } else {
        launcherConfig.UseMongoService = false;
        WriteConf();
    }
});

UseJDKPath.addEventListener('click', () => {
    if (UseJDKPath.checked) {
        Caution('请确保系统中有JDK17以上的JDK环境，并且设置了Path和JAVA_HOME。');
        launcherConfig.UseJDKPath = true;
        WriteConf();
    } else {
        launcherConfig.UseJDKPath = false;
        WriteConf();
    }
});

UseGitPath.addEventListener('click', () => {
    if (UseGitPath.checked) {
        Caution('请确保设置了Git的环境变量');
        launcherConfig.UseGitPath = true;
        WriteConf();
    } else {
        launcherConfig.UseGitPath = false;
        WriteConf();
    }
});