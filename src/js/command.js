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
