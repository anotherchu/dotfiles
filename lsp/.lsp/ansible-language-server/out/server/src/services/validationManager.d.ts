import { Connection, Diagnostic, TextDocumentContentChangeEvent, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
/**
 * Provides cache for selected diagnostics.
 *
 * Keeps track of origins of diagnostics so that reported items can be cleared
 * up, when all its origins are closed. This allows the plugin to report
 * validation issues only on what is currently open, taking into account that
 * diagnostics generated for one file can have items that concern other files.
 */
export declare class ValidationManager {
    private connection;
    private documents;
    private validationCache;
    /**
     * Mapping from file that generated diagnostics (origin), to files included in
     * those diagnostics.
     */
    private referencedFilesByOrigin;
    /**
     * Mapping from file to number of distinct files (origins) for which that file
     * had diagnostics generated.
     */
    private referencedFileRefCounter;
    constructor(connection: Connection, documents: TextDocuments<TextDocument>);
    /**
     * Processes changes in diagnostics and sends the diagnostics to the client.
     */
    processDiagnostics(originFileUri: string, diagnosticsByFile: Map<string, Diagnostic[]>): void;
    /**
     * Saves the diagnostics in a cache for later re-use in quick validation.
     */
    cacheDiagnostics(originFileUri: string, cacheableDiagnostics: Map<string, Diagnostic[]>): void;
    reconcileCacheItems(fileUri: string, changes: TextDocumentContentChangeEvent[]): void;
    getValidationFromCache(fileUri: string): Map<string, Diagnostic[]> | undefined;
    handleDocumentClosed(fileUri: string): void;
    private handleFileReferenced;
    private handleFileUnreferenced;
    private getRefCounter;
}
