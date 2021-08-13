import { Connection, Diagnostic, DidChangeWatchedFilesParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { WorkspaceFolderContext } from './workspaceManager';
/**
 * Acts as and interface to ansible-lint and a cache of its output.
 *
 * ansible-lint may provide diagnostics for more than just the file for which
 * linting was triggered, and this is reflected in the implementation.
 */
export declare class AnsibleLint {
    private connection;
    private context;
    private useProgressTracker;
    private configCache;
    constructor(connection: Connection, context: WorkspaceFolderContext);
    /**
     * Perform linting for the given document.
     *
     * In case no errors are found for the current document, and linting has been
     * performed on opening the document, then only the cache is cleared, and not
     * the diagnostics on the client side. That way old diagnostics will persist
     * until the file is changed. This allows inspecting more complex errors
     * reported in other files.
     */
    doValidate(textDocument: TextDocument): Promise<Map<string, Diagnostic[]>>;
    private processReport;
    handleWatchedDocumentChange(params: DidChangeWatchedFilesParams): void;
    private getAnsibleLintConfig;
    private readAnsibleLintConfig;
    private getAnsibleLintConfigPath;
}
