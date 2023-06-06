const WebSocket = require('ws');
const {spawn} = require('child_process');
const { StreamMessageReader, StreamMessageWriter } = require('vscode-jsonrpc');

const wss = new WebSocket.Server({port: 3030});

wss.on('connection', ws => {
    let env = process.env;
    const gopls = spawn('gopls', ['-mode=stdio', '-remote=auto', 'serve','--debug=localhost:6060'], {
        env: env
    });

    const reader = new StreamMessageReader(gopls.stdout);
    const writer = new StreamMessageWriter(gopls.stdin);

    reader.listen(message => {
        console.log(message)
        ws.send(JSON.stringify(message));
    });

    ws.on('message', message => {
        console.log("Write:" + message);
        let parsed = JSON.parse(message);
        if (parsed.method && parsed.method == "initialize") {
            parsed.params.processId = process.pid;
            parsed.params.rootUri = "file://c/test"
        }
        writer.write(parsed);
    });

    gopls.stderr.on('data', data => {
        console.error(`gopls error: ${data}`);
    });

    gopls.on('exit', code => {
        console.log(`gopls exited with code ${code}`);
    });

    gopls.on('error', err => {
        console.error('Failed to start gopls:', err);
    });
});
