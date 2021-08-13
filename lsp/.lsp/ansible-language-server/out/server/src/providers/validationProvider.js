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
exports.doValidate = void 0;
const interval_tree_1 = require("@flatten-js/interval-tree");
const _ = require("lodash");
const vscode_languageserver_1 = require("vscode-languageserver");
const yaml_1 = require("yaml");
/**
 * Validates the given document.
 * @param textDocument - the document to validate
 * @param linter - uses linter
 * @param quick - only re-evaluates YAML validation and uses lint cache
 * @returns Map of diagnostics per file.
 */
function doValidate(textDocument, validationManager, quick = true, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let diagnosticsByFile;
        if (quick || !context) {
            // get validation from cache
            diagnosticsByFile =
                validationManager.getValidationFromCache(textDocument.uri) ||
                    new Map();
        }
        else {
            // full validation with ansible-lint
            diagnosticsByFile = yield context.ansibleLint.doValidate(textDocument);
            if (!diagnosticsByFile.has(textDocument.uri)) {
                // In case there are no diagnostics for the file that triggered the
                // validation, set an empty array in order to clear the validation.
                diagnosticsByFile.set(textDocument.uri, []);
            }
            validationManager.cacheDiagnostics(textDocument.uri, diagnosticsByFile);
        }
        // attach quick validation for the inspected file
        for (const [fileUri, fileDiagnostics] of diagnosticsByFile) {
            if (textDocument.uri === fileUri) {
                fileDiagnostics.push(...getYamlValidation(textDocument));
            }
        }
        validationManager.processDiagnostics(textDocument.uri, diagnosticsByFile);
        return diagnosticsByFile;
    });
}
exports.doValidate = doValidate;
function getYamlValidation(textDocument) {
    const diagnostics = [];
    const yDocuments = yaml_1.parseAllDocuments(textDocument.getText(), {
        prettyErrors: false,
    });
    const rangeTree = new interval_tree_1.default();
    yDocuments.forEach((yDoc) => {
        yDoc.errors.forEach((error) => {
            var _a;
            const errorRange = error.range || ((_a = error.source) === null || _a === void 0 ? void 0 : _a.range);
            let range;
            if (errorRange) {
                const start = textDocument.positionAt(errorRange.start);
                const end = textDocument.positionAt(errorRange.end);
                range = vscode_languageserver_1.Range.create(start, end);
                let severity;
                switch (error.name) {
                    case 'YAMLReferenceError':
                    case 'YAMLSemanticError':
                    case 'YAMLSyntaxError':
                        severity = vscode_languageserver_1.DiagnosticSeverity.Error;
                        break;
                    case 'YAMLWarning':
                        severity = vscode_languageserver_1.DiagnosticSeverity.Warning;
                        break;
                    default:
                        severity = vscode_languageserver_1.DiagnosticSeverity.Information;
                        break;
                }
                rangeTree.insert([errorRange.start, errorRange.end], {
                    message: error.message,
                    range: range || vscode_languageserver_1.Range.create(0, 0, 0, 0),
                    severity: severity,
                    source: 'Ansible [YAML]',
                });
            }
        });
    });
    rangeTree.forEach((range, diag) => {
        const searchResult = rangeTree.search(range);
        if (searchResult) {
            const allRangesAreEqual = searchResult.every((foundDiag) => {
                // (range start == range end) in case it has already been collapsed
                return (foundDiag.range.start === foundDiag.range.end ||
                    _.isEqual(foundDiag.range, diag.range));
            });
            if (!allRangesAreEqual) {
                // Prevent large error scopes hiding/obscuring other error scopes
                // In YAML this is very common in case of syntax errors
                const range = diag.range;
                diag.relatedInformation = [
                    vscode_languageserver_1.DiagnosticRelatedInformation.create(vscode_languageserver_1.Location.create(textDocument.uri, {
                        start: range.end,
                        end: range.end,
                    }), 'the scope of this error ends here'),
                ];
                // collapse the range
                diag.range = {
                    start: range.start,
                    end: range.start,
                };
            }
        }
        diagnostics.push(diag);
    });
    return diagnostics;
}
//# sourceMappingURL=validationProvider.js.map