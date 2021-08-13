import { MarkupContent } from 'vscode-languageserver';
export declare const playKeywords: Map<string, string | MarkupContent>;
export declare const roleKeywords: Map<string, string | MarkupContent>;
export declare const blockKeywords: Map<string, string | MarkupContent>;
export declare const taskKeywords: Map<string, string | MarkupContent>;
export declare const playExclusiveKeywords: Map<string, string | MarkupContent>;
export declare const playWithoutTaskKeywords: Map<string, string | MarkupContent>;
export declare function isTaskKeyword(value: string): boolean;
