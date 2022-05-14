var ipc = require('electron').ipcRenderer;
var shell = require('electron').shell;
var path = require('path');
var fs = require('fs');
var $ = mdui.$;
var jarSelect = new mdui.Select('#JarSelect');
var jarPath = [];

window.onload = function () {
    let filePath = path.resolve('.\\resources\\Grasscutter')
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err, "读取文件夹错误！")
        } else {
            files.forEach(function (fileName) {
                let fileDir = path.join(filePath, fileName);
                fs.stat(fileDir, function (err, stats) {
                    if (err) {
                        console.warn('获取文件stats失败');
                    } else {
                        let isFile = stats.isFile();
                        if (isFile && path.extname(fileDir) == '.jar') {
                            let value = jarPath.push(fileDir);
                            $('#JarSelect').append('<option value="' + value + '">' + fileName + '</option>');
                            jarSelect.handleUpdate();
                            console.log(jarPath.toString());
                        }
                    }
                })
            });
        }
    });
}

document.getElementById('LaunchGame').addEventListener('click', () => {
    let mongoPath = path.resolve('.\\resources\\launchmongo.bat');
    let launchPath = path.resolve('.\\resources\\launchgame.bat');
    let jdkPath = path.resolve('.\\resources\\jdk-17.0.3+7\\bin\\java.exe');
    let value = document.getElementById('JarSelect').selectedIndex;
    let launchContent = '@echo off\ncd .\\Grasscutter\\\n' + jdkPath + ' -jar ' + jarPath[value];
    fs.writeFileSync(launchPath, launchContent);
    shell.openPath(mongoPath);
    setTimeout(() => {
        shell.openPath(launchPath);
    }, 1000);
})