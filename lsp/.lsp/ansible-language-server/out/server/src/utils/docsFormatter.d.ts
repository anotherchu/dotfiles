import { MarkupContent } from 'vscode-languageserver';
import { IDescription, IModuleDocumentation, IOption } from '../interfaces/module';
import { IPluginRoute } from '../interfaces/pluginRouting';
export declare function formatModule(module: IModuleDocumentation, route?: IPluginRoute): MarkupContent;
export declare function formatTombstone(route: IPluginRoute): MarkupContent;
export declare function formatOption(option: IOption, with_details?: boolean): MarkupContent;
export declare function formatDescription(doc?: IDescription, asList?: boolean): string;
export declare function getDetails(option: IOption): string | undefined;
