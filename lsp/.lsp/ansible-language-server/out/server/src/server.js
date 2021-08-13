"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const node_1 = require("vscode-languageserver/node");
const ansibleLanguageService_1 = require("./ansibleLanguageService");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = node_1.createConnection(node_1.ProposedFeatures.all);
const docChangeHandlers = [];
connection.onDidChangeTextDocument((params) => {
    for (const handler of docChangeHandlers) {
        handler(params);
    }
});
// HACK: Using a connection proxy to allow multiple handlers
// This hack is necessary to simultaneously take advantage of the TextDocuments
// listener implementations and still be able to register handlers that it
// overrides, such as `onDidChangeTextDocument`.
const connectionProxy = new Proxy(connection, {
    get: (target, p, receiver) => {
        if (p === 'onDidChangeTextDocument') {
            return (handler) => {
                docChangeHandlers.push(handler);
            };
        }
        else {
            return Reflect.get(target, p, receiver);
        }
    },
});
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
const context = new ansibleLanguageService_1.AnsibleLanguageService(connectionProxy, documents);
context.initialize();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connectionProxy);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map