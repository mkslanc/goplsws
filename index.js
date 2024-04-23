const WebSocket = require('ws');
const {spawn} = require('child_process');
const {
    StreamMessageReader,
    StreamMessageWriter
} = require('vscode-jsonrpc');
const fs = require("fs");
const path = require("path");
const {
    formatPath,
    makeServerPath,
    makeClientPath
} = require("./paths-utility");

const wss = new WebSocket.Server({port: 3030});

wss.on('connection', ws => {
    let env = process.env;
    const gopls = spawn('gopls', ['-mode=stdio', '-remote=auto', 'serve'], {
        env: env
    });

    const reader = new StreamMessageReader(gopls.stdout);
    const writer = new StreamMessageWriter(gopls.stdin);
    const server = {
        reader,
        writer
    };

    reader.listen(message => {
        if (message.error) {
            console.error(server.nameEndsWith + ":");
            console.log(message.error);
            return;
        }
        processMessage(message, ws);
    });

    ws.on('message', message => {
        let parsed = JSON.parse(message);
        handleMessage(parsed, server);
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


function handleMessage(parsed, server) {
    if (parsed.method) {
        switch (parsed.method) {
            case "initialize":
                let rootUri = formatPath(__dirname);
                parsed.params.rootUri = rootUri;
                parsed.params.rootPath = __dirname;
                parsed.params.workspaceFolders = [
                    {
                        uri: rootUri,
                        name: __dirname
                    }
                ];
                if (!parsed.params.initializationOptions) {
                    parsed.params.initializationOptions = {};
                }
                break;
            case "textDocument/didOpen":
                if (!fs.existsSync("temp")) {
                    fs.mkdirSync("temp");
                }
                fs.writeFileSync("temp" + path.sep + parsed.params.textDocument.uri, parsed.params.textDocument.text);
                break;
        }

    }
    if (parsed.params && parsed.params.textDocument && parsed.params.textDocument.uri) {
        parsed.params.textDocument.uri = makeServerPath(parsed.params.textDocument.uri);
    }
    const writer = server?.writer;
    if (writer) {
        writer.write(parsed);
    }
}

function processMessage(message, ws) {
    if (message.params) {
        if (message.params.textDocument && message.params.textDocument.uri) {
            message.params.textDocument.uri = makeClientPath(message.params.textDocument.uri);
        }
        else if (message.params.uri) {
            message.params.uri = makeClientPath(message.params.uri);
        }
    }
    ws.send(JSON.stringify(message));
}
