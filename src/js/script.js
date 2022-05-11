var $ = mdui.$;
var Drawer = new mdui.Drawer('#drawer');
var ipc = require('electron').ipcRenderer;

document.getElementById('close').addEventListener('click', () => {
    ipc.send('window-close');
})
document.getElementById('maxi').addEventListener('click', () => {
    ipc.send('window-max');
})
document.getElementById('mini').addEventListener('click', () => {
    ipc.send('window-min');
})

document.getElementById('link-main-page').addEventListener('click', () => {
    window.location.href = './index.html';
})
document.getElementById('link-download').addEventListener('click', () => {
    window.location.href = './download.html';
})
document.getElementById('link-config').addEventListener('click', () => {
    window.location.href = './config.html';
})


$('#menu').on('click', function () {
    Drawer.toggle();
});

