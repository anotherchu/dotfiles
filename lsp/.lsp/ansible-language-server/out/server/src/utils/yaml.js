"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYamlMapKeys = exports.findProvidedModule = exports.isRoleParam = exports.isBlockParam = exports.isPlayParam = exports.getDeclaredCollections = exports.isTaskParam = exports.tasksKey = exports.getPathAtOffset = exports.contains = exports.getPathAt = exports.AncestryBuilder = void 0;
const _ = require("lodash");
const types_1 = require("yaml/types");
const ansible_1 = require("./ansible");
/**
 * A helper class used for building YAML path assertions and retrieving parent
 * nodes. The assertions are built up from the most nested (last in array)
 * element.
 */
class AncestryBuilder {
    constructor(path, index) {
        this._path = path || [];
        this._index = index || this._path.length - 1;
    }
    /**
     * Move up the path, optionally asserting the type of the parent.
     *
     * Unless Pair is explicitly asserted, it is ignored/skipped over when moving
     * up.
     */
    parent(type) {
        this._index--;
        if (this.get() instanceof types_1.Pair) {
            if (!type || !(type === types_1.Pair.prototype.constructor)) {
                this._index--;
            }
        }
        if (type) {
            if (!(this.get() instanceof type)) {
                this._index = Number.MIN_SAFE_INTEGER;
            }
        }
        return this;
    }
    /**
     * Move up the path, asserting that the current node was a key of a mapping
     * pair. The builder skips over the Pair to the parent YAMLMap.
     */
    parentOfKey() {
        const node = this.get();
        this.parent(types_1.Pair);
        const pairNode = this.get();
        if (pairNode instanceof types_1.Pair && pairNode.key === node) {
            this.parent(types_1.YAMLMap);
        }
        else {
            this._index = Number.MIN_SAFE_INTEGER;
        }
        return this;
    }
    /**
     * Get node up to which the assertions have led.
     */
    get() {
        return this._path[this._index] || null;
    }
    /**
     * Get the key of the Pair one level down the path.
     *
     * The key is returned only if it indeed is a string Scalar.
     */
    // The `this` argument is for generics restriction of this method.
    getStringKey() {
        const node = this._path[this._index + 1];
        if (node instanceof types_1.Pair &&
            node.key instanceof types_1.Scalar &&
            typeof node.key.value === 'string') {
            return node.key.value;
        }
        return null;
    }
    /**
     * Get the value of the Pair one level down the path.
     */
    // The `this` argument is for generics restriction of this method.
    getValue() {
        const node = this._path[this._index + 1];
        if (node instanceof types_1.Pair) {
            return node.value;
        }
        return null;
    }
    /**
     * Get the path to which the assertions have led.
     *
     * The path will be a subpath of the original path.
     */
    getPath() {
        if (this._index < 0)
            return null;
        const path = this._path.slice(0, this._index + 1);
        return path;
    }
    /**
     * Get the path to the key of the Pair one level down the path to which the
     * assertions have led.
     *
     * The path will be a subpath of the original path.
     */
    // The `this` argument is for generics restriction of this method.
    getKeyPath() {
        if (this._index < 0)
            return null;
        const path = this._path.slice(0, this._index + 1);
        const node = this._path[this._index + 1];
        if (node instanceof types_1.Pair) {
            path.push(node);
            path.push(node.key);
            return path;
        }
        return null;
    }
}
exports.AncestryBuilder = AncestryBuilder;
function getPathAt(document, position, docs, inclusive = false) {
    const offset = document.offsetAt(position);
    const doc = _.find(docs, (d) => contains(d.contents, offset, inclusive));
    if (doc && doc.contents) {
        return getPathAtOffset([doc.contents], offset, inclusive);
    }
    return null;
}
exports.getPathAt = getPathAt;
function contains(node, offset, inclusive) {
    return !!((node === null || node === void 0 ? void 0 : node.range) &&
        node.range[0] <= offset &&
        (node.range[1] > offset || (inclusive && node.range[1] >= offset)));
}
exports.contains = contains;
function getPathAtOffset(path, offset, inclusive) {
    if (path) {
        const currentNode = path[path.length - 1];
        if (currentNode instanceof types_1.YAMLMap) {
            let pair = _.find(currentNode.items, (p) => contains(p.key, offset, inclusive));
            if (pair) {
                return getPathAtOffset(path.concat(pair, pair.key), offset, inclusive);
            }
            pair = _.find(currentNode.items, (p) => contains(p.value, offset, inclusive));
            if (pair) {
                return getPathAtOffset(path.concat(pair, pair.value), offset, inclusive);
            }
            pair = _.find(currentNode.items, (p) => {
                var _a, _b, _c, _d;
                const inBetweenNode = new types_1.Node();
                const start = (_b = (_a = p.key) === null || _a === void 0 ? void 0 : _a.range) === null || _b === void 0 ? void 0 : _b[1];
                const end = (_d = (_c = p.value) === null || _c === void 0 ? void 0 : _c.range) === null || _d === void 0 ? void 0 : _d[0];
                if (start && end) {
                    inBetweenNode.range = [start, end - 1];
                    return contains(inBetweenNode, offset, inclusive);
                }
                else
                    return false;
            });
            if (pair) {
                return path.concat(pair, new types_1.Node());
            }
        }
        else if (currentNode instanceof types_1.YAMLSeq) {
            const item = _.find(currentNode.items, (n) => contains(n, offset, inclusive));
            if (item) {
                return getPathAtOffset(path.concat(item), offset, inclusive);
            }
        }
        else if (contains(currentNode, offset, inclusive)) {
            return path;
        }
        return path.concat(new types_1.Node()); // empty node as indentation marker
    }
    return null;
}
exports.getPathAtOffset = getPathAtOffset;
exports.tasksKey = /^(tasks|pre_tasks|post_tasks|block|rescue|always)$/;
/**
 * Determines whether the path points at a parameter key of an Ansible task.
 */
function isTaskParam(path) {
    const taskListPath = new AncestryBuilder(path)
        .parentOfKey()
        .parent(types_1.YAMLSeq)
        .getPath();
    if (taskListPath) {
        // basic shape of the task list has been found
        if (isPlayParam(path) || isBlockParam(path) || isRoleParam(path))
            return false;
        if (taskListPath.length === 1) {
            // case when the task list is at the top level of the document
            return true;
        }
        const taskListKey = new AncestryBuilder(taskListPath)
            .parent(types_1.YAMLMap)
            .getStringKey();
        if (taskListKey && exports.tasksKey.test(taskListKey)) {
            // case when a task list is defined explicitly by a keyword
            return true;
        }
    }
    return false;
}
exports.isTaskParam = isTaskParam;
/**
 * Tries to find the list of collections declared at the Ansible play/block/task level.
 */
function getDeclaredCollections(modulePath) {
    const declaredCollections = [];
    const taskParamsNode = new AncestryBuilder(modulePath).parent(types_1.YAMLMap).get();
    declaredCollections.push(...getDeclaredCollectionsForMap(taskParamsNode));
    let path = new AncestryBuilder(modulePath)
        .parent(types_1.YAMLMap)
        .getPath();
    while (true) {
        // traverse the YAML up through the Ansible blocks
        const builder = new AncestryBuilder(path).parent(types_1.YAMLSeq).parent(types_1.YAMLMap);
        const key = builder.getStringKey();
        if (key && /^block|rescue|always$/.test(key)) {
            declaredCollections.push(...getDeclaredCollectionsForMap(builder.get()));
            path = builder.getPath();
        }
        else {
            break;
        }
    }
    // now we should be at the tasks/pre_tasks/post_tasks level
    const playParamsNode = new AncestryBuilder(path)
        .parent(types_1.YAMLSeq)
        .parent(types_1.YAMLMap)
        .get();
    declaredCollections.push(...getDeclaredCollectionsForMap(playParamsNode));
    return [...new Set(declaredCollections)]; // deduplicate
}
exports.getDeclaredCollections = getDeclaredCollections;
function getDeclaredCollectionsForMap(playNode) {
    const declaredCollections = [];
    const collectionsPair = _.find(playNode === null || playNode === void 0 ? void 0 : playNode.items, (pair) => pair.key instanceof types_1.Scalar && pair.key.value === 'collections');
    if (collectionsPair) {
        // we've found the collections declaration
        const collectionsNode = collectionsPair.value;
        if (collectionsNode instanceof types_1.YAMLSeq) {
            for (const collectionNode of collectionsNode.items) {
                if (collectionNode instanceof types_1.Scalar) {
                    declaredCollections.push(collectionNode.value);
                }
            }
        }
    }
    return declaredCollections;
}
/**
 * Heuristically determines whether the path points at an Ansible play. The
 * `fileUri` helps guessing in case the YAML tree doesn't give any clues.
 *
 * Returns `undefined` if highly uncertain.
 */
function isPlayParam(path, fileUri) {
    var _a;
    const isAtRoot = ((_a = new AncestryBuilder(path).parentOfKey().parent(types_1.YAMLSeq).getPath()) === null || _a === void 0 ? void 0 : _a.length) === 1;
    if (isAtRoot) {
        const mapNode = new AncestryBuilder(path).parentOfKey().get();
        const providedKeys = getYamlMapKeys(mapNode);
        const containsPlayKeyword = providedKeys.some((p) => ansible_1.playExclusiveKeywords.has(p));
        if (containsPlayKeyword) {
            return true;
        }
        if (fileUri) {
            const isInRole = /\/roles\/[^/]+\/tasks\//.test(fileUri);
            if (isInRole) {
                return false;
            }
        }
    }
    else {
        return false;
    }
}
exports.isPlayParam = isPlayParam;
/**
 * Determines whether the path points at one of Ansible block parameter keys.
 */
function isBlockParam(path) {
    const builder = new AncestryBuilder(path).parentOfKey();
    const mapNode = builder.get();
    // the block must have a list as parent
    const isInYAMLSeq = !!builder.parent(types_1.YAMLSeq).get();
    if (mapNode && isInYAMLSeq) {
        const providedKeys = getYamlMapKeys(mapNode);
        return providedKeys.includes('block');
    }
    return false;
}
exports.isBlockParam = isBlockParam;
/**
 * Determines whether the path points at one of Ansible role parameter keys.
 */
function isRoleParam(path) {
    const rolesKey = new AncestryBuilder(path)
        .parentOfKey()
        .parent(types_1.YAMLSeq)
        .parent(types_1.YAMLMap)
        .getStringKey();
    return rolesKey === 'roles';
}
exports.isRoleParam = isRoleParam;
/**
 * For a given Ansible task parameter path, find the module if it has been
 * provided for the task.
 */
function findProvidedModule(taskParamPath, document, docsLibrary) {
    return __awaiter(this, void 0, void 0, function* () {
        const taskParameterMap = new AncestryBuilder(taskParamPath)
            .parent(types_1.YAMLMap)
            .get();
        if (taskParameterMap) {
            // find task parameters that have been provided by the user
            const providedParameters = new Set(getYamlMapKeys(taskParameterMap));
            // should usually be 0 or 1
            const providedModuleNames = [...providedParameters].filter((x) => !x || !ansible_1.isTaskKeyword(x));
            // find the module if it has been provided
            for (const m of providedModuleNames) {
                const [module] = yield docsLibrary.findModule(m, taskParamPath, document.uri);
                if (module) {
                    return module;
                }
            }
        }
    });
}
exports.findProvidedModule = findProvidedModule;
function getYamlMapKeys(mapNode) {
    return mapNode.items.map((pair) => {
        if (pair.key && pair.key instanceof types_1.Scalar) {
            return pair.key.value;
        }
    });
}
exports.getYamlMapKeys = getYamlMapKeys;
//# sourceMappingURL=yaml.js.map