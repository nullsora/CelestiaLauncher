var ipc = require('electron').ipcRenderer;
var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var configDialog = new mdui.Dialog('#Config', { modal: true });

function FileCommand(title, path, other, cwd) {
    configDialog.open();
    document.getElementById('ConfigContent').innerHTML = title;
    ipc.send('DoFileCommand', {
        Path: path,
        Other: other,
        Cwd: cwd
    });
    ipc.on('FileCommandLog', (event, args) => {
        document.getElementById('ConfigLog').innerHTML = args.Log;
        console.log(args.Log);
    });
    ipc.on('FileCommandReturn', (event, args) => {
        document.getElementById('ConfigConfirm').removeAttribute('disabled');
        if (args.Return == 0) {
            document.getElementById('ConfigLog').innerHTML += 'success.'
        } else {
            document.getElementById('ConfigLog').innerHTML = 'download failed. exit with code ' + args.Return;
        }
    })
}

function SyncSysCommand(title, command, cwd) {
    configDialog.open();
    document.getElementById('ConfigContent').innerHTML = title;
    ipc.send('DoSysCommand', {
        Command: command,
        Cwd: cwd
    });
    ipc.on('SysCommandReturn', (event, args) => {
        document.getElementById('ConfigConfirm').removeAttribute('disabled');
        document.getElementById('ConfigLog').innerHTML = 'success. ' + args.Return;
        console.log(args.Return);
        console.error(args.Error);
        console.log(args.Stderr);
    })
}

document.getElementById('ConfigConfirm').addEventListener('click', () => {
    document.getElementById('ConfigConfirm').setAttribute('disabled', 'true');
    document.getElementById('ConfigLog').innerHTML = '';
})

document.getElementById('ReturnHome').addEventListener('click', () => {
    window.location.href = './index.html';
})

document.getElementById('GrasscutterUpdate').addEventListener('click', () => {
    FileCommand(
        '正在从github拉取更新...',
        'git/cmd/git.exe',
        'pull',
        'Grasscutter'
    );
})

document.getElementById('GrasscutterCompile').addEventListener('click', () => {
    let jdkPath = path.resolve('.\\resources\\jdk-17.0.3+7');
    SyncSysCommand(
        '正在编译为Jar File...如果未响应请不要关闭',
        'set JAVA_HOME=' + jdkPath + ' && .\\gradlew jar',
        'Grasscutter'
    );
    document.getElementById('ConfigConfirm').removeAttribute('disabled');
})

document.getElementById('GrasscutterPrecompile').addEventListener('click', () => {
    let jdkPath = path.resolve('.\\resources\\jdk-17.0.3+7');
    let gradlewBatPath = path.resolve('.\\resources\\Grasscutter\\gradlew.bat');
    let gradlewBatClonePath = path.resolve('.\\resources\\Grasscutter\\gradlewclone.bat');
    let gradlewBatContent;
    try {
        fs.accessSync(gradlewBatClonePath);
        gradlewBatContent = fs.readFileSync(gradlewBatClonePath);
    } catch (err) {
        gradlewBatContent = fs.readFileSync(gradlewBatPath);
        fs.writeFileSync(gradlewBatClonePath, gradlewBatContent);
    }
    fs.writeFileSync(gradlewBatPath, 'set JAVA_HOME=' + jdkPath + '\n');
    fs.appendFileSync(gradlewBatPath, gradlewBatContent);
    shell.openPath(gradlewBatPath);
})

document.getElementById('configureGC').addEventListener('click', () => {
    // possibly cause unresponsiveness
    SyncSysCommand('创建文件夹...', 'mkdir .\\Grasscutter\\resources', '');
    SyncSysCommand(
        '复制resources...如果未响应请不要关闭',
        'xcopy /S /Q .\\Grasscutter_Resources\\Resources .\\Grasscutter\\resources',
        ''
    );
    SyncSysCommand(
        '复制其他文件...',
        'xcopy /S /Q .\\src\\res\\gc\\AvatarCostumeExcelConfigData.json .\\Grasscutter\\resources\\ExcelBinOutput\\AvatarCostumeExcelConfigData.json',
        ''
    );
    SyncSysCommand(
        '复制其他文件...',
        'xcopy /S /Q .\\src\\res\\gc\\Banners.json .\\Grasscutter\\data\\Banners.json',
        ''
    );
    SyncSysCommand(
        '复制其他文件...',
        'xcopy /S /Q .\\src\\res\\gc\\config.json .\\Grasscutter\\config.json',
        ''
    );
    SyncSysCommand(
        '删除冗余文件...如果未响应请不要关闭',
        'del /S /Q .\\Grasscutter_Resources',
        ''
    );
    SyncSysCommand(
        '删除冗余文件...如果未响应请不要关闭',
        'rd /S /Q .\\Grasscutter_Resources',
        ''
    );
})
