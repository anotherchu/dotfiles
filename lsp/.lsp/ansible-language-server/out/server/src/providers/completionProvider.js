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
exports.doCompletionResolve = exports.doCompletion = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const yaml_1 = require("yaml");
const types_1 = require("yaml/types");
const ansible_1 = require("../utils/ansible");
const docsFormatter_1 = require("../utils/docsFormatter");
const misc_1 = require("../utils/misc");
const yaml_2 = require("../utils/yaml");
const priorityMap = {
    nameKeyword: 1,
    moduleName: 2,
    redirectedModuleName: 3,
    keyword: 4,
    // options
    requiredOption: 1,
    option: 2,
    aliasOption: 3,
};
function doCompletion(document, position, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let preparedText = document.getText();
        const offset = document.offsetAt(position);
        // HACK: We need to insert a dummy mapping, so that the YAML parser can properly recognize the scope.
        // This is particularly important when parser has nothing more than
        // indentation to determine the scope of the current line. `_:` is ok here,
        // since we expect to work on a Pair level
        preparedText = misc_1.insert(preparedText, offset, '_:');
        const yamlDocs = yaml_1.parseAllDocuments(preparedText);
        // We need inclusive matching, since cursor position is the position of the character right after it
        // NOTE: Might no longer be required due to the hack above
        const path = yaml_2.getPathAt(document, position, yamlDocs, true);
        if (path) {
            const node = path[path.length - 1];
            if (node) {
                const docsLibrary = yield context.docsLibrary;
                const isPlay = yaml_2.isPlayParam(path);
                if (isPlay) {
                    return getKeywordCompletion(document, position, path, ansible_1.playKeywords);
                }
                if (yaml_2.isBlockParam(path)) {
                    return getKeywordCompletion(document, position, path, ansible_1.blockKeywords);
                }
                if (yaml_2.isRoleParam(path)) {
                    return getKeywordCompletion(document, position, path, ansible_1.roleKeywords);
                }
                if (yaml_2.isTaskParam(path)) {
                    // offer basic task keywords
                    const completionItems = getKeywordCompletion(document, position, path, ansible_1.taskKeywords);
                    if (isPlay === undefined) {
                        // this can still turn into a play, so we should offer those keywords too
                        completionItems.push(...getKeywordCompletion(document, position, path, ansible_1.playWithoutTaskKeywords));
                    }
                    // incidentally, the hack mentioned above prevents finding a module in
                    // case the cursor is on it
                    const module = yield yaml_2.findProvidedModule(path, document, docsLibrary);
                    if (!module) {
                        // offer the 'block' keyword (as it is not one of taskKeywords)
                        completionItems.push(...getKeywordCompletion(document, position, path, new Map([['block', ansible_1.blockKeywords.get('block')]])));
                        const inlineCollections = yaml_2.getDeclaredCollections(path);
                        const cursorAtEndOfLine = atEndOfLine(document, position);
                        let textEdit;
                        const nodeRange = getNodeRange(node, document);
                        if (nodeRange) {
                            textEdit = {
                                range: nodeRange,
                                newText: '', // placeholder
                            };
                        }
                        // offer modules
                        const moduleCompletionItems = [...docsLibrary.moduleFqcns].map((moduleFqcn) => {
                            var _a;
                            let priority, kind;
                            if ((_a = docsLibrary.getModuleRoute(moduleFqcn)) === null || _a === void 0 ? void 0 : _a.redirect) {
                                priority = priorityMap.redirectedModuleName;
                                kind = vscode_languageserver_1.CompletionItemKind.Reference;
                            }
                            else {
                                priority = priorityMap.moduleName;
                                kind = vscode_languageserver_1.CompletionItemKind.Class;
                            }
                            const [namespace, collection, name] = moduleFqcn.split('.');
                            return {
                                label: name,
                                kind: kind,
                                detail: `${namespace}.${collection}`,
                                sortText: `${priority}_${name}`,
                                filterText: `${name} ${moduleFqcn}`,
                                data: {
                                    documentUri: document.uri,
                                    moduleFqcn: moduleFqcn,
                                    inlineCollections: inlineCollections,
                                    atEndOfLine: cursorAtEndOfLine,
                                },
                                textEdit: textEdit,
                            };
                        });
                        completionItems.push(...moduleCompletionItems);
                    }
                    return completionItems;
                }
                // Finally, check if we're looking for module options
                // In that case, the module name is a key of a map
                const parentKeyPath = new yaml_2.AncestryBuilder(path)
                    .parentOfKey()
                    .parent(types_1.YAMLMap)
                    .getKeyPath();
                if (parentKeyPath && yaml_2.isTaskParam(parentKeyPath)) {
                    const parentKeyNode = parentKeyPath[parentKeyPath.length - 1];
                    if (parentKeyNode instanceof types_1.Scalar) {
                        let module;
                        if (parentKeyNode.value === 'args') {
                            module = yield yaml_2.findProvidedModule(parentKeyPath, document, docsLibrary);
                        }
                        else {
                            [module] = yield docsLibrary.findModule(parentKeyNode.value, parentKeyPath, document.uri);
                        }
                        if (module && module.documentation) {
                            const moduleOptions = module.documentation.options;
                            const optionMap = new yaml_2.AncestryBuilder(parentKeyPath).parent(types_1.Pair).get().value;
                            // find options that have been already provided by the user
                            const providedOptions = new Set(yaml_2.getYamlMapKeys(optionMap));
                            const remainingOptions = [...moduleOptions.entries()].filter(([, specs]) => !providedOptions.has(specs.name));
                            const nodeRange = getNodeRange(node, document);
                            return remainingOptions
                                .map(([option, specs]) => {
                                return {
                                    name: option,
                                    specs: specs,
                                };
                            })
                                .map((option, index) => {
                                // translate option documentation to CompletionItem
                                const details = docsFormatter_1.getDetails(option.specs);
                                let priority;
                                if (isAlias(option)) {
                                    priority = priorityMap.aliasOption;
                                }
                                else if (option.specs.required) {
                                    priority = priorityMap.requiredOption;
                                }
                                else {
                                    priority = priorityMap.option;
                                }
                                const completionItem = {
                                    label: option.name,
                                    detail: details,
                                    // using index preserves order from the specification
                                    // except when overridden by the priority
                                    sortText: priority.toString() + index.toString().padStart(3),
                                    kind: isAlias(option)
                                        ? vscode_languageserver_1.CompletionItemKind.Reference
                                        : vscode_languageserver_1.CompletionItemKind.Property,
                                    documentation: docsFormatter_1.formatOption(option.specs),
                                    insertText: atEndOfLine(document, position)
                                        ? `${option.name}:`
                                        : undefined,
                                };
                                const insertText = atEndOfLine(document, position)
                                    ? `${option.name}:`
                                    : option.name;
                                if (nodeRange) {
                                    completionItem.textEdit = {
                                        range: nodeRange,
                                        newText: insertText,
                                    };
                                }
                                else {
                                    completionItem.insertText = insertText;
                                }
                                return completionItem;
                            });
                        }
                    }
                }
            }
        }
        return null;
    });
}
exports.doCompletion = doCompletion;
function getKeywordCompletion(document, position, path, keywords) {
    const parameterMap = new yaml_2.AncestryBuilder(path)
        .parent(types_1.YAMLMap)
        .get();
    // find options that have been already provided by the user
    const providedParams = new Set(yaml_2.getYamlMapKeys(parameterMap));
    const remainingParams = [...keywords.entries()].filter(([keyword]) => !providedParams.has(keyword));
    const nodeRange = getNodeRange(path[path.length - 1], document);
    return remainingParams.map(([keyword, description]) => {
        const priority = keyword === 'name' ? priorityMap.nameKeyword : priorityMap.keyword;
        const completionItem = {
            label: keyword,
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            sortText: `${priority}_${keyword}`,
            documentation: description,
        };
        const insertText = atEndOfLine(document, position)
            ? `${keyword}:`
            : keyword;
        if (nodeRange) {
            completionItem.textEdit = {
                range: nodeRange,
                newText: insertText,
            };
        }
        else {
            completionItem.insertText = insertText;
        }
        return completionItem;
    });
}
/**
 * Returns an LSP formatted range compensating for the `_:` hack, provided that
 * the node has range information and is a string scalar.
 */
function getNodeRange(node, document) {
    if (node.range && node instanceof types_1.Scalar && typeof node.value === 'string') {
        const start = node.range[0];
        let end = node.range[1];
        // compensate for `_:`
        if (node.value.includes('_:')) {
            end -= 2;
        }
        else {
            // colon, being at the end of the line, was excluded from the node
            end -= 1;
        }
        return misc_1.toLspRange([start, end], document);
    }
}
function doCompletionResolve(completionItem, context) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        if (((_a = completionItem.data) === null || _a === void 0 ? void 0 : _a.moduleFqcn) && ((_b = completionItem.data) === null || _b === void 0 ? void 0 : _b.documentUri)) {
            // resolve completion for a module
            const docsLibrary = yield context.docsLibrary;
            const [module] = yield docsLibrary.findModule(completionItem.data.moduleFqcn);
            if (module && module.documentation) {
                const [namespace, collection, name] = completionItem.data.moduleFqcn.split('.');
                let useFqcn = (yield context.documentSettings.get(completionItem.data.documentUri)).ansible.useFullyQualifiedCollectionNames;
                if (!useFqcn) {
                    // determine if the short name can really be used
                    const declaredCollections = ((_c = completionItem.data) === null || _c === void 0 ? void 0 : _c.inlineCollections) || [];
                    declaredCollections.push('ansible.builtin');
                    const metadata = yield context.documentMetadata.get(completionItem.data.documentUri);
                    if (metadata) {
                        declaredCollections.push(...metadata.collections);
                    }
                    const canUseShortName = declaredCollections.some((c) => c === `${namespace}.${collection}`);
                    if (!canUseShortName) {
                        // not an Ansible built-in module, and not part of the declared
                        // collections
                        useFqcn = true;
                    }
                }
                const insertName = useFqcn ? completionItem.data.moduleFqcn : name;
                const insertText = completionItem.data.atEndOfLine
                    ? `${insertName}:`
                    : insertName;
                if (completionItem.textEdit) {
                    completionItem.textEdit.newText = insertText;
                }
                else {
                    completionItem.insertText = insertText;
                }
                completionItem.documentation = docsFormatter_1.formatModule(module.documentation, docsLibrary.getModuleRoute(completionItem.data.moduleFqcn));
            }
        }
        return completionItem;
    });
}
exports.doCompletionResolve = doCompletionResolve;
function isAlias(option) {
    return option.name !== option.specs.name;
}
function atEndOfLine(document, position) {
    const charAfterCursor = `${document.getText()}\n`[document.offsetAt(position)];
    return charAfterCursor === '\n' || charAfterCursor === '\r';
}
//# sourceMappingURL=completionProvider.js.map