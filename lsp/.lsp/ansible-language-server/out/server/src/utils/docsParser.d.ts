import { YAMLError } from 'yaml/util';
import { IModuleDocumentation, IModuleMetadata, IOption } from '../interfaces/module';
import { IPluginRoutesByType } from '../interfaces/pluginRouting';
export declare function processDocumentationFragments(module: IModuleMetadata, docFragments: Map<string, IModuleMetadata>): void;
export declare function processRawDocumentation(rawDoc: unknown): IModuleDocumentation | undefined;
export declare function processRawOptions(rawOptions: unknown): Map<string, IOption>;
export declare function parseRawRouting(rawDoc: unknown): IPluginRoutesByType;
export declare class LazyModuleDocumentation implements IModuleMetadata {
    static docsRegex: RegExp;
    source: string;
    sourceLineRange: [number, number];
    fqcn: string;
    namespace: string;
    collection: string;
    name: string;
    errors: YAMLError[];
    private _contents;
    constructor(source: string, fqcn: string, namespace: string, collection: string, name: string);
    get rawDocumentation(): Record<string, unknown>;
    set rawDocumentation(value: Record<string, unknown>);
}
