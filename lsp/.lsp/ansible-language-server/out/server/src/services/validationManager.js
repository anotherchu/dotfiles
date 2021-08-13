"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationManager = void 0;
const interval_tree_1 = require("@flatten-js/interval-tree");
/**
 * Provides cache for selected diagnostics.
 *
 * Keeps track of origins of diagnostics so that reported items can be cleared
 * up, when all its origins are closed. This allows the plugin to report
 * validation issues only on what is currently open, taking into account that
 * diagnostics generated for one file can have items that concern other files.
 */
class ValidationManager {
    constructor(connection, documents) {
        this.validationCache = new Map();
        /**
         * Mapping from file that generated diagnostics (origin), to files included in
         * those diagnostics.
         */
        this.referencedFilesByOrigin = new Map();
        /**
         * Mapping from file to number of distinct files (origins) for which that file
         * had diagnostics generated.
         */
        this.referencedFileRefCounter = new Map();
        this.connection = connection;
        this.documents = documents;
    }
    /**
     * Processes changes in diagnostics and sends the diagnostics to the client.
     */
    processDiagnostics(originFileUri, diagnosticsByFile) {
        if (!this.documents.get(originFileUri)) {
            // the origin file has been closed before the diagnostics were delivered
            return;
        }
        let referencedFiles = this.referencedFilesByOrigin.get(originFileUri);
        if (!referencedFiles) {
            referencedFiles = new Set();
            this.referencedFilesByOrigin.set(originFileUri, referencedFiles);
        }
        const unreferencedFiles = [...referencedFiles].filter((f) => !diagnosticsByFile.has(f));
        for (const fileUri of unreferencedFiles) {
            // this file is no longer referenced by origin
            referencedFiles.delete(fileUri);
            this.handleFileUnreferenced(fileUri);
        }
        for (const [fileUri] of diagnosticsByFile) {
            if (!referencedFiles.has(fileUri)) {
                // this file has not been referenced by origin before
                referencedFiles.add(fileUri);
                this.handleFileReferenced(fileUri);
            }
        }
        // send the diagnostics to the client
        for (const [fileUri, fileDiagnostics] of diagnosticsByFile) {
            this.connection.sendDiagnostics({
                uri: fileUri,
                diagnostics: fileDiagnostics,
            });
        }
    }
    /**
     * Saves the diagnostics in a cache for later re-use in quick validation.
     */
    cacheDiagnostics(originFileUri, cacheableDiagnostics) {
        if (!this.documents.get(originFileUri)) {
            // the origin file has been closed before the diagnostics were delivered
            return;
        }
        for (const [fileUri, fileDiagnostics] of cacheableDiagnostics) {
            // save validation cache for each impacted file
            const diagnosticTree = new interval_tree_1.default();
            this.validationCache.set(fileUri, diagnosticTree);
            for (const diagnostic of fileDiagnostics) {
                diagnosticTree.insert([diagnostic.range.start.line, diagnostic.range.end.line], diagnostic);
            }
        }
    }
    reconcileCacheItems(fileUri, changes) {
        var _a;
        const diagnosticTree = this.validationCache.get(fileUri);
        if (diagnosticTree) {
            for (const change of changes) {
                if ('range' in change) {
                    const invalidatedDiagnostics = diagnosticTree.search([
                        change.range.start.line,
                        change.range.end.line,
                    ]);
                    if (invalidatedDiagnostics) {
                        for (const diagnostic of invalidatedDiagnostics) {
                            diagnosticTree.remove([diagnostic.range.start.line, diagnostic.range.end.line], diagnostic);
                        }
                    }
                    // determine whether lines have been added or removed by subtracting
                    // change lines count from number of newline characters in the change
                    let displacement = 0;
                    displacement -= change.range.end.line - change.range.start.line;
                    displacement += ((_a = change.text.match(/\n|\r\n|\r/g)) === null || _a === void 0 ? void 0 : _a.length) || 0;
                    if (displacement) {
                        const displacedDiagnostics = diagnosticTree.search([
                            change.range.start.line,
                            Number.MAX_SAFE_INTEGER,
                        ]);
                        if (displacedDiagnostics) {
                            for (const diagnostic of displacedDiagnostics) {
                                diagnosticTree.remove([diagnostic.range.start.line, diagnostic.range.end.line], diagnostic);
                                diagnostic.range.start.line += displacement;
                                diagnostic.range.end.line += displacement;
                                diagnosticTree.insert([diagnostic.range.start.line, diagnostic.range.end.line], diagnostic);
                            }
                        }
                    }
                }
            }
        }
    }
    getValidationFromCache(fileUri) {
        const referencedFiles = this.referencedFilesByOrigin.get(fileUri);
        if (referencedFiles) {
            // hit on origin of diagnostics
            const diagnosticsByFile = new Map();
            for (const referencedFileUri of referencedFiles) {
                const diagnostics = this.validationCache.get(referencedFileUri);
                if (diagnostics) {
                    diagnosticsByFile.set(referencedFileUri, diagnostics.values);
                }
            }
            return diagnosticsByFile;
        }
        else {
            const diagnostics = this.validationCache.get(fileUri);
            if (diagnostics) {
                // direct hit on given file
                return new Map([[fileUri, diagnostics.values]]);
            }
        }
    }
    handleDocumentClosed(fileUri) {
        const referencedFiles = this.referencedFilesByOrigin.get(fileUri);
        if (referencedFiles) {
            referencedFiles.forEach((f) => this.handleFileUnreferenced(f));
            // remove the diagnostics origin file from tracking
            this.referencedFilesByOrigin.delete(fileUri);
        }
    }
    handleFileReferenced(fileUri) {
        this.referencedFileRefCounter.set(fileUri, this.getRefCounter(fileUri) + 1);
    }
    handleFileUnreferenced(fileUri) {
        const counter = this.getRefCounter(fileUri) - 1;
        if (counter <= 0) {
            // clear diagnostics of files that are no longer referenced
            this.validationCache.delete(fileUri);
            this.connection.sendDiagnostics({
                uri: fileUri,
                diagnostics: [],
            });
            // remove file from reference counter
            this.referencedFileRefCounter.delete(fileUri);
        }
        else {
            this.referencedFileRefCounter.set(fileUri, counter);
        }
    }
    getRefCounter(fileUri) {
        let counter = this.referencedFileRefCounter.get(fileUri);
        if (counter === undefined) {
            counter = 0;
            this.referencedFileRefCounter.set(fileUri, counter);
        }
        return counter;
    }
}
exports.ValidationManager = ValidationManager;
//# sourceMappingURL=validationManager.js.map