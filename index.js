import * as rpc from "vscode-ws-jsonrpc";
import * as server from "vscode-ws-jsonrpc/server";
import {WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 3030})

function launch(socket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    const socketConnection = server.createConnection(reader, writer, () => socket.dispose());
    const serverConnection = server.createServerProcess('JSON', 'C:\\Users\\mks-t\\go\\bin\\gopls', ['-rpc.trace', 'serve']);
    server.forward(socketConnection, serverConnection, message => {
        if (message.method === "initialize") {
            const initializeParams = message.params;
            initializeParams.processId = process.pid;
        }
        return message;
    });
}

wss.on('connection', (client) => {
    const iWebSocket = {
        send: content => {
            console.log(content);
            client.send(content);
        },
        onMessage: cb => client.onmessage = event => {
            console.log(event)
            if (event.data !== 'ping') {
                cb(event.data);
            }
        },
        onError: cb => client.onerror = event => {
            if ('message' in event) {
                cb(event.message)
            }
        },
        onClose: cb => client.onclose = event => cb(event.code, event.reason),
        dispose: () => client.close(),
    };

    launch(iWebSocket);
});
