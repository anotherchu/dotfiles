import { IModuleMetadata } from '../interfaces/module';
import { IPluginRoutingByCollection } from '../interfaces/pluginRouting';
export declare function findDocumentation(dir: string, kind: 'builtin' | 'collection' | 'builtin_doc_fragment' | 'collection_doc_fragment'): Promise<IModuleMetadata[]>;
export declare function findPluginRouting(dir: string, kind: 'builtin' | 'collection'): Promise<IPluginRoutingByCollection>;
