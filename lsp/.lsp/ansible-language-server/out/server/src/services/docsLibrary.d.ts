import { Node } from 'yaml/types';
import { WorkspaceFolderContext } from './workspaceManager';
import { IPluginRoute } from '../interfaces/pluginRouting';
import { IModuleMetadata } from '../interfaces/module';
export declare class DocsLibrary {
    private modules;
    private _moduleFqcns;
    private docFragments;
    private context;
    private pluginRouting;
    constructor(context: WorkspaceFolderContext);
    initialize(): Promise<void>;
    /**
     * Tries to find an Ansible module for a given name or FQCN.
     *
     * Parameters `contextPath` and `documentUri` are used to obtain contextual
     * information on declared collections. Hence these are not needed when
     * searching with FQCN.
     *
     * Returns the module if found and an FQCN for which either a module or a
     * route has been found.
     */
    findModule(searchText: string, contextPath?: Node[], documentUri?: string): Promise<[IModuleMetadata | undefined, string | undefined]>;
    private getCandidateFqcns;
    getModuleRoute(fqcn: string): IPluginRoute | undefined;
    get moduleFqcns(): Set<string>;
}
