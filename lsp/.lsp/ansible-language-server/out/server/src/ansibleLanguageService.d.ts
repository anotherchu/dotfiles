import { Connection, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
/**
 * Initializes the connection and registers all lifecycle event handlers.
 *
 * The event handlers interact with the `WorkspaceManager` to find the relevant
 * context and service instance, and then perform the required actions.
 *
 * Providers are used here directly in the event handlers.
 */
export declare class AnsibleLanguageService {
    private connection;
    private documents;
    private workspaceManager;
    private validationManager;
    constructor(connection: Connection, documents: TextDocuments<TextDocument>);
    initialize(): void;
    private initializeConnection;
    private registerLifecycleEventHandlers;
    private handleError;
}
