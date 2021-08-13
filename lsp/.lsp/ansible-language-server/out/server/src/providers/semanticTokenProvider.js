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
exports.doSemanticTokens = exports.tokenModifiers = exports.tokenTypes = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const yaml_1 = require("yaml");
const types_1 = require("yaml/types");
const ansible_1 = require("../utils/ansible");
const yaml_2 = require("../utils/yaml");
exports.tokenTypes = [
    vscode_languageserver_1.SemanticTokenTypes.method,
    vscode_languageserver_1.SemanticTokenTypes.class,
    vscode_languageserver_1.SemanticTokenTypes.keyword,
    vscode_languageserver_1.SemanticTokenTypes.property,
];
const tokenTypesLegend = new Map(exports.tokenTypes.map((value, index) => [value, index]));
exports.tokenModifiers = [vscode_languageserver_1.SemanticTokenModifiers.definition];
const tokenModifiersLegend = new Map(exports.tokenModifiers.map((value, index) => [value, index]));
function doSemanticTokens(document, docsLibrary) {
    return __awaiter(this, void 0, void 0, function* () {
        const builder = new vscode_languageserver_1.SemanticTokensBuilder();
        const yDocuments = yaml_1.parseAllDocuments(document.getText());
        for (const yDoc of yDocuments) {
            if (yDoc.contents) {
                yield markSemanticTokens([yDoc.contents], builder, document, docsLibrary);
            }
        }
        return builder.build();
    });
}
exports.doSemanticTokens = doSemanticTokens;
function markSemanticTokens(path, builder, document, docsLibrary) {
    return __awaiter(this, void 0, void 0, function* () {
        const node = path[path.length - 1];
        if (node instanceof types_1.YAMLMap) {
            for (const pair of node.items) {
                if (pair.key instanceof types_1.Scalar) {
                    const keyPath = path.concat(pair, pair.key);
                    if (yaml_2.isPlayParam(keyPath)) {
                        if (ansible_1.playKeywords.has(pair.key.value))
                            markKeyword(pair.key, builder, document);
                        else
                            markOrdinaryKey(pair.key, builder, document);
                    }
                    else if (yaml_2.isBlockParam(keyPath)) {
                        if (ansible_1.blockKeywords.has(pair.key.value))
                            markKeyword(pair.key, builder, document);
                        else
                            markOrdinaryKey(pair.key, builder, document);
                    }
                    else if (yaml_2.isRoleParam(keyPath)) {
                        if (ansible_1.roleKeywords.has(pair.key.value))
                            markKeyword(pair.key, builder, document);
                        else
                            markOrdinaryKey(pair.key, builder, document);
                    }
                    else if (yaml_2.isTaskParam(keyPath)) {
                        if (ansible_1.isTaskKeyword(pair.key.value)) {
                            markKeyword(pair.key, builder, document);
                            if (pair.key.value === 'args') {
                                const module = yield yaml_2.findProvidedModule(path.concat(pair, pair.key), document, docsLibrary);
                                if (module && pair.value instanceof types_1.YAMLMap) {
                                    // highlight module parameters
                                    markModuleParameters(pair.value, module, builder, document);
                                }
                            }
                        }
                        else {
                            const [module] = yield docsLibrary.findModule(pair.key.value, keyPath, document.uri);
                            if (module) {
                                // highlight module name
                                markNode(pair.key, vscode_languageserver_1.SemanticTokenTypes.class, [], builder, document);
                                if (pair.value instanceof types_1.YAMLMap) {
                                    // highlight module parameters
                                    markModuleParameters(pair.value, module, builder, document);
                                }
                            }
                            else {
                                markAllNestedKeysAsOrdinary(pair, builder, document);
                            }
                        }
                        // this pair has been completely processed
                        // tasks don't have any deeper structure
                        continue;
                    }
                    else {
                        markAllNestedKeysAsOrdinary(pair, builder, document);
                        // this pair has been completely processed
                        continue;
                    }
                }
                if (pair.value instanceof types_1.Node) {
                    yield markSemanticTokens(path.concat(pair, pair.value), builder, document, docsLibrary);
                }
            }
        }
        else if (node instanceof types_1.YAMLSeq) {
            for (const item of node.items) {
                if (item instanceof types_1.Node) {
                    // the builder does not support out-of-order inserts yet, hence awaiting
                    // on each individual promise instead of using Promise.all
                    yield markSemanticTokens(path.concat(item), builder, document, docsLibrary);
                }
            }
        }
    });
}
function markModuleParameters(moduleParamMap, module, builder, document) {
    var _a;
    for (const moduleParamPair of moduleParamMap.items) {
        if (moduleParamPair.key instanceof types_1.Scalar) {
            const option = (_a = module.documentation) === null || _a === void 0 ? void 0 : _a.options.get(moduleParamPair.key.value);
            if (option) {
                markNode(moduleParamPair.key, vscode_languageserver_1.SemanticTokenTypes.method, [], builder, document);
            }
            else {
                markOrdinaryKey(moduleParamPair.key, builder, document);
            }
        }
        if (moduleParamPair.value instanceof types_1.Node) {
            markAllNestedKeysAsOrdinary(moduleParamPair.value, builder, document);
        }
    }
}
function markAllNestedKeysAsOrdinary(node, builder, document) {
    if (node instanceof types_1.Pair) {
        if (node.key instanceof types_1.Scalar) {
            markOrdinaryKey(node.key, builder, document);
        }
        if (node.value instanceof types_1.Node) {
            markAllNestedKeysAsOrdinary(node.value, builder, document);
        }
    }
    else if (node instanceof types_1.YAMLMap) {
        for (const pair of node.items) {
            markAllNestedKeysAsOrdinary(pair, builder, document);
        }
    }
    else if (node instanceof types_1.YAMLSeq) {
        for (const item of node.items) {
            if (item instanceof types_1.Node) {
                markAllNestedKeysAsOrdinary(item, builder, document);
            }
        }
    }
}
function markKeyword(node, builder, document) {
    markNode(node, vscode_languageserver_1.SemanticTokenTypes.keyword, [], builder, document);
}
function markOrdinaryKey(node, builder, document) {
    markNode(node, vscode_languageserver_1.SemanticTokenTypes.property, [vscode_languageserver_1.SemanticTokenModifiers.definition], builder, document);
}
function markNode(node, tokenType, tokenModifiers, builder, document) {
    if (node.range) {
        const startPosition = document.positionAt(node.range[0]);
        const length = node.range[1] - node.range[0];
        builder.push(startPosition.line, startPosition.character, length, encodeTokenType(tokenType), encodeTokenModifiers(tokenModifiers));
    }
}
function encodeTokenType(tokenType) {
    const tokenTypeIndex = tokenTypesLegend.get(tokenType);
    if (tokenTypeIndex === undefined) {
        throw new Error(`The '${tokenType}' token type is not in legend`);
    }
    return tokenTypeIndex;
}
function encodeTokenModifiers(tokenModifiers) {
    let encodedModifiers = 0;
    for (const tokenModifier of tokenModifiers) {
        const tokenModifierIndex = tokenModifiersLegend.get(tokenModifier);
        if (tokenModifierIndex === undefined) {
            throw new Error(`The '${tokenModifier}' token modifier is not in legend`);
        }
        encodedModifiers |= (1 << tokenModifierIndex) >>> 0;
    }
    return encodedModifiers;
}
//# sourceMappingURL=semanticTokenProvider.js.map