import { Connection } from 'vscode-languageserver';
import { DidChangeWatchedFilesParams } from 'vscode-languageserver-protocol';
import { IDocumentMetadata } from '../interfaces/documentMeta';
export declare class MetadataLibrary {
    private connection;
    private metadata;
    constructor(connection: Connection);
    get(uri: string): Thenable<IDocumentMetadata> | undefined;
    handleWatchedDocumentChange(params: DidChangeWatchedFilesParams): void;
    /**
     * Finds a path where the metadata file for a given document should reside.
     * @returns The path or undefined in case the file cannot have any related
     * metadata file.
     */
    private getAnsibleMetadataUri;
    private readAnsibleMetadata;
}
