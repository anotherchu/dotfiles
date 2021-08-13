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
exports.WorkspaceFolderContext = exports.WorkspaceManager = void 0;
const _ = require("lodash");
const ansibleConfig_1 = require("./ansibleConfig");
const ansibleLint_1 = require("./ansibleLint");
const docsLibrary_1 = require("./docsLibrary");
const metadataLibrary_1 = require("./metadataLibrary");
const settingsManager_1 = require("./settingsManager");
/**
 * Holds the overall context for the whole workspace.
 */
class WorkspaceManager {
    constructor(connection) {
        this.sortedWorkspaceFolders = [];
        this.folderContexts = new Map();
        this.clientCapabilities = {};
        this.connection = connection;
    }
    setWorkspaceFolders(workspaceFolders) {
        this.sortedWorkspaceFolders = this.sortWorkspaceFolders(workspaceFolders);
    }
    setCapabilities(capabilities) {
        this.clientCapabilities = capabilities;
    }
    /**
     * Determines the workspace folder context for the given URI.
     */
    getContext(uri) {
        const workspaceFolder = this.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            let context = this.folderContexts.get(workspaceFolder.uri);
            if (!context) {
                context = new WorkspaceFolderContext(this.connection, workspaceFolder, this);
                this.folderContexts.set(workspaceFolder.uri, context);
            }
            return context;
        }
    }
    forEachContext(callbackfn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(_.map(Array.from(this.folderContexts.values()), (folder) => callbackfn(folder)));
        });
    }
    /**
     * Finds the inner-most workspace folder for the given URI.
     */
    getWorkspaceFolder(uri) {
        for (const workspaceFolder of this.sortedWorkspaceFolders) {
            if (uri.startsWith(workspaceFolder.uri)) {
                return workspaceFolder;
            }
        }
    }
    handleWorkspaceChanged(event) {
        const removedUris = new Set(event.removed.map((folder) => folder.uri));
        // We only keep contexts of existing workspace folders
        for (const removedUri of removedUris) {
            this.folderContexts.delete(removedUri);
        }
        const newWorkspaceFolders = this.sortedWorkspaceFolders.filter((folder) => {
            return !removedUris.has(folder.uri);
        });
        newWorkspaceFolders.push(...event.added);
        this.sortedWorkspaceFolders =
            this.sortWorkspaceFolders(newWorkspaceFolders);
    }
    sortWorkspaceFolders(workspaceFolders) {
        return workspaceFolders.sort((a, b) => {
            return b.uri.length - a.uri.length;
        });
    }
}
exports.WorkspaceManager = WorkspaceManager;
/**
 * Holds the context for particular workspace folder. This context is used by
 * all services to interact with the client and with each other.
 */
class WorkspaceFolderContext {
    constructor(connection, workspaceFolder, workspaceManager) {
        var _a;
        this.connection = connection;
        this.clientCapabilities = workspaceManager.clientCapabilities;
        this.workspaceFolder = workspaceFolder;
        this.documentMetadata = new metadataLibrary_1.MetadataLibrary(connection);
        this.documentSettings = new settingsManager_1.SettingsManager(connection, !!((_a = this.clientCapabilities.workspace) === null || _a === void 0 ? void 0 : _a.configuration));
        this.documentSettings.onConfigurationChanged(this.workspaceFolder.uri, () => {
            // in case the configuration changes for this folder, we should
            // invalidate the services that rely on it in initialization
            this._ansibleConfig = undefined;
            this._docsLibrary = undefined;
        });
    }
    handleWatchedDocumentChange(params) {
        this.documentMetadata.handleWatchedDocumentChange(params);
        this.ansibleLint.handleWatchedDocumentChange(params);
        for (const fileEvent of params.changes) {
            if (fileEvent.uri.startsWith(this.workspaceFolder.uri)) {
                // in case the configuration changes for this folder, we should
                // invalidate the services that rely on it in initialization
                this._ansibleConfig = undefined;
                this._docsLibrary = undefined;
            }
        }
    }
    get docsLibrary() {
        if (!this._docsLibrary) {
            const docsLibrary = new docsLibrary_1.DocsLibrary(this);
            this._docsLibrary = docsLibrary.initialize().then(() => docsLibrary);
        }
        return this._docsLibrary;
    }
    get ansibleConfig() {
        if (!this._ansibleConfig) {
            const ansibleConfig = new ansibleConfig_1.AnsibleConfig(this.connection, this);
            this._ansibleConfig = ansibleConfig
                .initialize()
                .then(() => ansibleConfig);
        }
        return this._ansibleConfig;
    }
    get ansibleLint() {
        if (!this._ansibleLint) {
            this._ansibleLint = new ansibleLint_1.AnsibleLint(this.connection, this);
        }
        return this._ansibleLint;
    }
}
exports.WorkspaceFolderContext = WorkspaceFolderContext;
//# sourceMappingURL=workspaceManager.js.map