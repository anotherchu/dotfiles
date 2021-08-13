import { Connection } from 'vscode-languageserver';
import { WorkspaceFolderContext } from './workspaceManager';
export declare class AnsibleConfig {
    private connection;
    private context;
    private _collection_paths;
    private _module_locations;
    private _ansible_location;
    constructor(connection: Connection, context: WorkspaceFolderContext);
    initialize(): Promise<void>;
    get collections_paths(): string[];
    get module_locations(): string[];
    get ansible_location(): string;
}
