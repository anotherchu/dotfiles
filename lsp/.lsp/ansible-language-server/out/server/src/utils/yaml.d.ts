import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import { Document } from 'yaml';
import { Node, Pair, YAMLMap } from 'yaml/types';
import { IModuleMetadata } from '../interfaces/module';
import { DocsLibrary } from '../services/docsLibrary';
/**
 * A helper class used for building YAML path assertions and retrieving parent
 * nodes. The assertions are built up from the most nested (last in array)
 * element.
 */
export declare class AncestryBuilder<N extends Node | Pair = Node> {
    private _path;
    private _index;
    constructor(path: Node[] | null, index?: number);
    /**
     * Move up the path, optionally asserting the type of the parent.
     *
     * Unless Pair is explicitly asserted, it is ignored/skipped over when moving
     * up.
     */
    parent<X extends Node | Pair>(type?: new (...args: unknown[]) => X): AncestryBuilder<X>;
    /**
     * Move up the path, asserting that the current node was a key of a mapping
     * pair. The builder skips over the Pair to the parent YAMLMap.
     */
    parentOfKey(): AncestryBuilder<YAMLMap>;
    /**
     * Get node up to which the assertions have led.
     */
    get(): N | null;
    /**
     * Get the key of the Pair one level down the path.
     *
     * The key is returned only if it indeed is a string Scalar.
     */
    getStringKey(this: AncestryBuilder<YAMLMap>): string | null;
    /**
     * Get the value of the Pair one level down the path.
     */
    getValue(this: AncestryBuilder<YAMLMap>): Node | null;
    /**
     * Get the path to which the assertions have led.
     *
     * The path will be a subpath of the original path.
     */
    getPath(): Node[] | null;
    /**
     * Get the path to the key of the Pair one level down the path to which the
     * assertions have led.
     *
     * The path will be a subpath of the original path.
     */
    getKeyPath(this: AncestryBuilder<YAMLMap>): Node[] | null;
}
export declare function getPathAt(document: TextDocument, position: Position, docs: Document.Parsed[], inclusive?: boolean): Node[] | null;
export declare function contains(node: Node | null, offset: number, inclusive: boolean): boolean;
export declare function getPathAtOffset(path: Node[], offset: number, inclusive: boolean): Node[] | null;
export declare const tasksKey: RegExp;
/**
 * Determines whether the path points at a parameter key of an Ansible task.
 */
export declare function isTaskParam(path: Node[]): boolean;
/**
 * Tries to find the list of collections declared at the Ansible play/block/task level.
 */
export declare function getDeclaredCollections(modulePath: Node[] | null): string[];
/**
 * Heuristically determines whether the path points at an Ansible play. The
 * `fileUri` helps guessing in case the YAML tree doesn't give any clues.
 *
 * Returns `undefined` if highly uncertain.
 */
export declare function isPlayParam(path: Node[], fileUri?: string): boolean | undefined;
/**
 * Determines whether the path points at one of Ansible block parameter keys.
 */
export declare function isBlockParam(path: Node[]): boolean;
/**
 * Determines whether the path points at one of Ansible role parameter keys.
 */
export declare function isRoleParam(path: Node[]): boolean;
/**
 * For a given Ansible task parameter path, find the module if it has been
 * provided for the task.
 */
export declare function findProvidedModule(taskParamPath: Node[], document: TextDocument, docsLibrary: DocsLibrary): Promise<IModuleMetadata | undefined>;
export declare function getYamlMapKeys(mapNode: YAMLMap): Array<string>;
