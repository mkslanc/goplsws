# Go Language Server WebSocket Proxy

This project is a WebSocket proxy server that facilitates communication between a client (e.g., a code editor) and the Go language server (gopls). It acts as an intermediary, forwarding messages between the client and the gopls process.

## Prerequisites

- Node.js (v12 or later)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```
git clone https://github.com/mkslanc/goplsws.git
```
2. Navigate to the project directory
3. Install dependencies:
```
npm install
```

## Usage

1. Start the proxy server:
```
node index.js
```

2. The server will start listening on port 3030 for incoming WebSocket connections.

3. Configure your client (e.g., code editor) to connect to the proxy server at `ws://localhost:3030`.

## How it Works

The proxy server establishes a WebSocket connection with the client and spawns a new gopls process. It then sets up a communication channel between the client and the gopls process using the `vscode-jsonrpc` library.

Messages received from the client are processed by the `handleMessage` function, which modifies the message parameters (e.g., setting the root URI, workspace folders) before forwarding them to the gopls process.

Responses from the gopls process are processed by the `processMessage` function, which modifies the message parameters (e.g., converting file URIs to client-friendly paths) before sending them back to the client.

## Contributing

Contributions are welcome! If you find any issues or want to enhance the project, feel free to submit a pull request.

## License

This project is licensed under the MIT License.
