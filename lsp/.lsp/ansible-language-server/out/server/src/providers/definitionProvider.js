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
exports.getDefinition = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const yaml_1 = require("yaml");
const types_1 = require("yaml/types");
const misc_1 = require("../utils/misc");
const yaml_2 = require("../utils/yaml");
function getDefinition(document, position, docsLibrary) {
    return __awaiter(this, void 0, void 0, function* () {
        const yamlDocs = yaml_1.parseAllDocuments(document.getText());
        const path = yaml_2.getPathAt(document, position, yamlDocs);
        if (path) {
            const node = path[path.length - 1];
            if (node instanceof types_1.Scalar &&
                new yaml_2.AncestryBuilder(path).parentOfKey().get() // ensure we look at a key, not value of a Pair
            ) {
                if (yaml_2.isTaskParam(path)) {
                    const [module] = yield docsLibrary.findModule(node.value, path, document.uri);
                    if (module) {
                        return [
                            {
                                targetUri: module.source,
                                originSelectionRange: node.range
                                    ? misc_1.toLspRange(node.range, document)
                                    : undefined,
                                targetRange: vscode_languageserver_1.Range.create(module.sourceLineRange[0], 0, module.sourceLineRange[1], 0),
                                targetSelectionRange: vscode_languageserver_1.Range.create(module.sourceLineRange[0], 0, module.sourceLineRange[1], 0),
                            },
                        ];
                    }
                }
            }
        }
        return null;
    });
}
exports.getDefinition = getDefinition;
//# sourceMappingURL=definitionProvider.js.map