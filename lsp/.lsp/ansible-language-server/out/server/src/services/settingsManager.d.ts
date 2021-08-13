import { Connection } from 'vscode-languageserver';
import { DidChangeConfigurationParams } from 'vscode-languageserver-protocol';
import { ExtensionSettings } from '../interfaces/extensionSettings';
export declare class SettingsManager {
    private connection;
    private clientSupportsConfigRequests;
    private configurationChangeHandlers;
    private documentSettings;
    private defaultSettings;
    private globalSettings;
    constructor(connection: Connection, clientSupportsConfigRequests: boolean);
    /**
     * Register a handler for configuration change on particular URI.
     *
     * Change detection is cache-based. If the client does not support the
     * configuration requests, all handlers will be fired.
     */
    onConfigurationChanged(uri: string, handler: {
        (): void;
    }): void;
    get(uri: string): Thenable<ExtensionSettings>;
    handleDocumentClosed(uri: string): void;
    handleConfigurationChanged(params: DidChangeConfigurationParams): Promise<void>;
}
