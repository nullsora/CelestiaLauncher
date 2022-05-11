var ipc = require('electron').ipcRenderer;
var $ = mdui.$;
var dialog = new mdui.Dialog('#Download', { modal: true });
var cmdDialog = new mdui.Dialog('#CMD', { modal: true });

function download(title, url, name) {
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

function unzip(title, name, filePath) {
    document.getElementById('Progress').style.width = '0%';
    ipc.on('Progress', (event, args) => {
        if (args.Progress >= 100) {
            document.getElementById('DialogContent').innerHTML = title;
            ipc.send('unzip', {
                fName: name,
                exFolder: filePath
            });
            ipc.on('unzipProgress', (event, args) => {
                document.getElementById('Progress').style.width = args.Progress + '%';
            });
            ipc.on('unzipFinish', (event, args) => {
                if (args.Finish == true) {
                    document.getElementById('ConfirmBtn').removeAttribute('disabled');
                }
            })
        }
    })
}

function command(path, other) {
    cmdDialog.open();
    ipc.send('DoCommand', {
        Path: path,
        Other: other
    });
    ipc.on('CommandReturn', (event, args) => {
        document.getElementById('CMDContent').innerHTML = args.stdout;
        console.log(args.stdout);
        console.error('error:' + args.error);
        console.log('stderr:' + args.stderr);
    })
}

document.getElementById('installJava').addEventListener('click', () => {
    download(
        '正在下载Java...',
        'https://mirrors.tuna.tsinghua.edu.cn/Adoptium/17/jdk/x64/windows/OpenJDK17U-jdk_x64_windows_hotspot_17.0.3_7.zip',
        'jdk.zip'
    );
    unzip(
        '正在安装Java...',
        'jdk.zip',
        'resources'
    );
})
document.getElementById('installMongo').addEventListener('click', () => {
    download(
        '正在下载MongoDB...',
        'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-5.0.8.zip',
        'mongo.zip'
    );
    unzip(
        '正在安装MongoDB...',
        'mongo.zip',
        'resources'
    );
})
document.getElementById('installGit').addEventListener('click', () => {
    download(
        '正在下载Git...',
        'https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/Git for Windows 2.36.1/MinGit-2.36.1-busybox-64-bit.zip',
        'git.zip'
    );
    unzip(
        '正在安装Git...',
        'git.zip',
        'resources/git'
    );
})
document.getElementById('installGC').addEventListener('click', () => {
    command(
        'git/cmd/git.exe',
        'clone https://ghproxy.com/https://github.com/Grasscutters/Grasscutter.git'
    );
})