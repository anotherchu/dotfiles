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
exports.doHover = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const yaml_1 = require("yaml");
const types_1 = require("yaml/types");
const ansible_1 = require("../utils/ansible");
const docsFormatter_1 = require("../utils/docsFormatter");
const misc_1 = require("../utils/misc");
const yaml_2 = require("../utils/yaml");
function doHover(document, position, docsLibrary) {
    return __awaiter(this, void 0, void 0, function* () {
        const yamlDocs = yaml_1.parseAllDocuments(document.getText());
        const path = yaml_2.getPathAt(document, position, yamlDocs);
        if (path) {
            const node = path[path.length - 1];
            if (node instanceof types_1.Scalar &&
                new yaml_2.AncestryBuilder(path).parentOfKey().get() // ensure we look at a key, not value of a Pair
            ) {
                if (yaml_2.isPlayParam(path)) {
                    return getKeywordHover(document, node, ansible_1.playKeywords);
                }
                if (yaml_2.isBlockParam(path)) {
                    return getKeywordHover(document, node, ansible_1.blockKeywords);
                }
                if (yaml_2.isRoleParam(path)) {
                    return getKeywordHover(document, node, ansible_1.roleKeywords);
                }
                if (yaml_2.isTaskParam(path)) {
                    if (ansible_1.isTaskKeyword(node.value)) {
                        return getKeywordHover(document, node, ansible_1.taskKeywords);
                    }
                    else {
                        const [module, hitFqcn] = yield docsLibrary.findModule(node.value, path, document.uri);
                        if (module && module.documentation) {
                            return {
                                contents: docsFormatter_1.formatModule(module.documentation, docsLibrary.getModuleRoute(hitFqcn || node.value)),
                                range: node.range ? misc_1.toLspRange(node.range, document) : undefined,
                            };
                        }
                        else if (hitFqcn) {
                            // check for tombstones
                            const route = docsLibrary.getModuleRoute(hitFqcn);
                            if (route) {
                                return {
                                    contents: docsFormatter_1.formatTombstone(route),
                                    range: node.range
                                        ? misc_1.toLspRange(node.range, document)
                                        : undefined,
                                };
                            }
                        }
                    }
                }
                // hovering over a module parameter
                // can either be directly under module or in 'args'
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
                            const option = module.documentation.options.get(node.value);
                            if (option) {
                                return {
                                    contents: docsFormatter_1.formatOption(option, true),
                                };
                            }
                        }
                    }
                }
            }
        }
        return null;
    });
}
exports.doHover = doHover;
function getKeywordHover(document, node, keywords) {
    const keywordDocumentation = keywords.get(node.value);
    const markupDoc = typeof keywordDocumentation === 'string'
        ? {
            kind: vscode_languageserver_1.MarkupKind.Markdown,
            value: keywordDocumentation,
        }
        : keywordDocumentation;
    if (markupDoc) {
        return {
            contents: markupDoc,
            range: node.range ? misc_1.toLspRange(node.range, document) : undefined,
        };
    }
    else
        return null;
}
//# sourceMappingURL=hoverProvider.js.map