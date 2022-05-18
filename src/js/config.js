const { ipcRenderer } = require('electron');
const { shell } = require('electron');
const path = require('path');
const fs = require('fs');

let appPath, fileStats, launcherConf, gitPath, confPath = 'conf/config.json';

let CmdDialog = {
    dialog: new mdui.Dialog('#CmdDialog', { modal: true }),
    content: document.getElementById('CmdContent'),
    log: document.getElementById('CmdLog'),
    confirmBtn: document.getElementById('CmdConfirmBtn')
};

let Elements = {
    updateGC: document.getElementById('GrasscutterUpdate'),
    compileGC: document.getElementById('GrasscutterCompile'),
    precompileGC: document.getElementById('GrasscutterPrecompile'),
    configureGC: document.getElementById('ConfigureGC'),
    changeBranch: document.getElementById('ChangeBranch')
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
            if (launcherConf.AutoUpdate) {
                AsyncSysCmd(
                    '正在从github拉取更新...',
                    [gitPath + 'pull'],
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
        if ((fileStats.hasGit || launcherConf.UseGitPath) && fileStats.hasGC) {
            Elements.updateGC.removeAttribute('disabled');
            Elements.changeBranch.removeAttribute('disabled');
        } else {
            Elements.updateGC.setAttribute('disabled', 'true');
            Elements.changeBranch.setAttribute('disabled', 'true');
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
    });
}

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

Elements.updateGC.addEventListener('click', () => {
    AsyncSysCmd(
        '正在从github拉取更新...',
        [gitPath + ' pull'],
        'Grasscutter'
    );
});

Elements.compileGC.addEventListener('click', () => {
    let jdkPath = path.join(appPath, 'resources\\jdk-17.0.3+7');
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
        let jdkPath = path.join(appPath, 'resources/jdk-17.0.3+7');
        let gradlewBatPath = path.join(appPath, 'resources\\Grasscutter\\gradlew.bat');
        let gradlewBatClonePath = path.join(appPath, 'resources\\Grasscutter\\gradlewclone.bat');
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
        let branchName = document.getElementById('BranchInput').value;
        console.log(branchName);
        AsyncSysCmd(
            '正在切换分支到' + branchName,
            [gitPath + ' checkout ' + branchName],
            'Grasscutter'
        );
    }
});