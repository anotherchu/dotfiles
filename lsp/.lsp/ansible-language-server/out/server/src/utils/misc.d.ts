/// <reference types="node" />
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Range } from 'vscode-languageserver-types';
export declare function fileExists(fileUri: string): Promise<boolean>;
export declare function toLspRange(range: [number, number], textDocument: TextDocument): Range;
export declare function hasOwnProperty<X extends unknown, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
/**
 * Checks whether `obj` is a non-null object.
 */
export declare function isObject<X extends unknown>(obj: X): obj is X & Record<PropertyKey, unknown>;
export declare function insert(str: string, index: number, val: string): string;
/**
 * Adjusts the command and environment in case the interpreter path is provided.
 */
export declare function withInterpreter(executable: string, args: string, interpreterPath: string, activationScript: string): [string, NodeJS.ProcessEnv | undefined];
