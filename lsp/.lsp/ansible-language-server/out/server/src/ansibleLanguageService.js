"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnsibleLanguageService = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const completionProvider_1 = require("./providers/completionProvider");
const definitionProvider_1 = require("./providers/definitionProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const semanticTokenProvider_1 = require("./providers/semanticTokenProvider");
const validationProvider_1 = require("./providers/validationProvider");
const validationManager_1 = require("./services/validationManager");
const workspaceManager_1 = require("./services/workspaceManager");
/**
 * Initializes the connection and registers all lifecycle event handlers.
 *
 * The event handlers interact with the `WorkspaceManager` to find the relevant
 * context and service instance, and then perform the required actions.
 *
 * Providers are used here directly in the event handlers.
 */
class AnsibleLanguageService {
    constructor(connection, documents) {
        this.connection = connection;
        this.documents = documents;
        this.workspaceManager = new workspaceManager_1.WorkspaceManager(connection);
        this.validationManager = new validationManager_1.ValidationManager(connection, documents);
    }
    initialize() {
        this.initializeConnection();
        this.registerLifecycleEventHandlers();
    }
    initializeConnection() {
        this.connection.onInitialize((params) => {
            var _a;
            this.workspaceManager.setWorkspaceFolders(params.workspaceFolders || []);
            this.workspaceManager.setCapabilities(params.capabilities);
            const result = {
                capabilities: {
                    textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
                    semanticTokensProvider: {
                        documentSelector: [
                            {
                                language: 'ansible',
                            },
                        ],
                        full: true,
                        legend: {
                            tokenTypes: semanticTokenProvider_1.tokenTypes,
                            tokenModifiers: semanticTokenProvider_1.tokenModifiers,
                        },
                    },
                    hoverProvider: true,
                    completionProvider: {
                        resolveProvider: true,
                    },
                    definitionProvider: true,
                    workspace: {},
                },
            };
            if ((_a = this.workspaceManager.clientCapabilities.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders) {
                result.capabilities.workspace = {
                    workspaceFolders: {
                        supported: true,
                        changeNotifications: true,
                    },
                };
            }
            return result;
        });
        this.connection.onInitialized(() => {
            var _a, _b;
            if ((_a = this.workspaceManager.clientCapabilities.workspace) === null || _a === void 0 ? void 0 : _a.configuration) {
                // register for all configuration changes
                this.connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, {
                    section: 'ansible',
                });
            }
            if ((_b = this.workspaceManager.clientCapabilities.workspace) === null || _b === void 0 ? void 0 : _b.workspaceFolders) {
                this.connection.workspace.onDidChangeWorkspaceFolders((e) => {
                    this.workspaceManager.handleWorkspaceChanged(e);
                });
            }
            this.connection.client.register(vscode_languageserver_1.DidChangeWatchedFilesNotification.type, {
                watchers: [
                    {
                        // watch ansible configuration
                        globPattern: '**/ansible.cfg',
                    },
                    {
                        // watch ansible-lint configuration
                        globPattern: '**/.ansible-lint',
                    },
                    {
                        // watch role meta-configuration
                        globPattern: '**/meta/main.{yml,yaml}',
                    },
                ],
            });
        });
    }
    registerLifecycleEventHandlers() {
        this.connection.onDidChangeConfiguration((params) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.workspaceManager.forEachContext((context) => context.documentSettings.handleConfigurationChanged(params));
            }
            catch (error) {
                this.handleError(error, 'onDidChangeConfiguration');
            }
        }));
        this.documents.onDidOpen((e) => __awaiter(this, void 0, void 0, function* () {
            try {
                const context = this.workspaceManager.getContext(e.document.uri);
                if (context) {
                    // perform full validation
                    yield validationProvider_1.doValidate(e.document, this.validationManager, false, context);
                }
            }
            catch (error) {
                this.handleError(error, 'onDidOpen');
            }
        }));
        this.documents.onDidClose((e) => {
            try {
                this.validationManager.handleDocumentClosed(e.document.uri);
                const context = this.workspaceManager.getContext(e.document.uri);
                if (context) {
                    context.documentSettings.handleDocumentClosed(e.document.uri);
                }
            }
            catch (error) {
                this.handleError(error, 'onDidClose');
            }
        });
        this.connection.onDidChangeWatchedFiles((params) => {
            try {
                this.workspaceManager.forEachContext((context) => context.handleWatchedDocumentChange(params));
            }
            catch (error) {
                this.handleError(error, 'onDidChangeWatchedFiles');
            }
        });
        this.documents.onDidSave((e) => __awaiter(this, void 0, void 0, function* () {
            try {
                const context = this.workspaceManager.getContext(e.document.uri);
                if (context) {
                    // perform full validation
                    yield validationProvider_1.doValidate(e.document, this.validationManager, false, context);
                }
            }
            catch (error) {
                this.handleError(error, 'onDidSave');
            }
        }));
        this.connection.onDidChangeTextDocument((e) => {
            try {
                this.validationManager.reconcileCacheItems(e.textDocument.uri, e.contentChanges);
            }
            catch (error) {
                this.handleError(error, 'onDidChangeTextDocument');
            }
        });
        this.documents.onDidChangeContent((e) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield validationProvider_1.doValidate(e.document, this.validationManager, true, this.workspaceManager.getContext(e.document.uri));
            }
            catch (error) {
                this.handleError(error, 'onDidChangeContent');
            }
        }));
        this.connection.languages.semanticTokens.on((params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const document = this.documents.get(params.textDocument.uri);
                if (document) {
                    const context = this.workspaceManager.getContext(params.textDocument.uri);
                    if (context) {
                        return yield semanticTokenProvider_1.doSemanticTokens(document, yield context.docsLibrary);
                    }
                }
            }
            catch (error) {
                this.handleError(error, 'onSemanticTokens');
            }
            return {
                data: [],
            };
        }));
        this.connection.onHover((params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const document = this.documents.get(params.textDocument.uri);
                if (document) {
                    const context = this.workspaceManager.getContext(params.textDocument.uri);
                    if (context) {
                        return yield hoverProvider_1.doHover(document, params.position, yield context.docsLibrary);
                    }
                }
            }
            catch (error) {
                this.handleError(error, 'onHover');
            }
            return null;
        }));
        this.connection.onCompletion((params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const document = this.documents.get(params.textDocument.uri);
                if (document) {
                    const context = this.workspaceManager.getContext(params.textDocument.uri);
                    if (context) {
                        return yield completionProvider_1.doCompletion(document, params.position, context);
                    }
                }
            }
            catch (error) {
                this.handleError(error, 'onCompletion');
            }
            return null;
        }));
        this.connection.onCompletionResolve((completionItem) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if ((_a = completionItem.data) === null || _a === void 0 ? void 0 : _a.documentUri) {
                    const context = this.workspaceManager.getContext((_b = completionItem.data) === null || _b === void 0 ? void 0 : _b.documentUri);
                    if (context) {
                        return yield completionProvider_1.doCompletionResolve(completionItem, context);
                    }
                }
            }
            catch (error) {
                this.handleError(error, 'onCompletionResolve');
            }
            return completionItem;
        }));
        this.connection.onDefinition((params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const document = this.documents.get(params.textDocument.uri);
                if (document) {
                    const context = this.workspaceManager.getContext(params.textDocument.uri);
                    if (context) {
                        return yield definitionProvider_1.getDefinition(document, params.position, yield context.docsLibrary);
                    }
                }
            }
            catch (error) {
                this.handleError(error, 'onDefinition');
            }
            return null;
        }));
    }
    handleError(error, contextName) {
        const leadMessage = `An error occurred in '${contextName}' handler: `;
        if (error instanceof Error) {
            const stack = error.stack ? `\n${error.stack}` : '';
            this.connection.console.error(`${leadMessage}[${error.name}] ${error.message}${stack}`);
        }
        else {
            this.connection.console.error(leadMessage + JSON.stringify(error));
        }
    }
}
exports.AnsibleLanguageService = AnsibleLanguageService;
//# sourceMappingURL=ansibleLanguageService.js.map