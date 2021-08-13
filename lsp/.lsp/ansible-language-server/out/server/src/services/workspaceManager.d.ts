import { ClientCapabilities, Connection, DidChangeWatchedFilesParams, WorkspaceFolder, WorkspaceFoldersChangeEvent } from 'vscode-languageserver';
import { AnsibleConfig } from './ansibleConfig';
import { AnsibleLint } from './ansibleLint';
import { DocsLibrary } from './docsLibrary';
import { MetadataLibrary } from './metadataLibrary';
import { SettingsManager } from './settingsManager';
/**
 * Holds the overall context for the whole workspace.
 */
export declare class WorkspaceManager {
    private connection;
    private sortedWorkspaceFolders;
    private folderContexts;
    clientCapabilities: ClientCapabilities;
    constructor(connection: Connection);
    setWorkspaceFolders(workspaceFolders: WorkspaceFolder[]): void;
    setCapabilities(capabilities: ClientCapabilities): void;
    /**
     * Determines the workspace folder context for the given URI.
     */
    getContext(uri: string): WorkspaceFolderContext | undefined;
    forEachContext(callbackfn: (value: WorkspaceFolderContext) => Promise<void> | void): Promise<void>;
    /**
     * Finds the inner-most workspace folder for the given URI.
     */
    getWorkspaceFolder(uri: string): WorkspaceFolder | undefined;
    handleWorkspaceChanged(event: WorkspaceFoldersChangeEvent): void;
    private sortWorkspaceFolders;
}
/**
 * Holds the context for particular workspace folder. This context is used by
 * all services to interact with the client and with each other.
 */
export declare class WorkspaceFolderContext {
    private connection;
    clientCapabilities: ClientCapabilities;
    workspaceFolder: WorkspaceFolder;
    documentMetadata: MetadataLibrary;
    documentSettings: SettingsManager;
    private _docsLibrary;
    private _ansibleConfig;
    private _ansibleLint;
    constructor(connection: Connection, workspaceFolder: WorkspaceFolder, workspaceManager: WorkspaceManager);
    handleWatchedDocumentChange(params: DidChangeWatchedFilesParams): void;
    get docsLibrary(): Thenable<DocsLibrary>;
    get ansibleConfig(): Thenable<AnsibleConfig>;
    get ansibleLint(): AnsibleLint;
}
