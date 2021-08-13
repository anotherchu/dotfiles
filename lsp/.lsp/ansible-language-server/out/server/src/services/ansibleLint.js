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
exports.AnsibleLint = void 0;
const child_process = require("child_process");
const fs_1 = require("fs");
const url_1 = require("url");
const util_1 = require("util");
const vscode_languageserver_1 = require("vscode-languageserver");
const yaml_1 = require("yaml");
const misc_1 = require("../utils/misc");
const exec = util_1.promisify(child_process.exec);
/**
 * Acts as and interface to ansible-lint and a cache of its output.
 *
 * ansible-lint may provide diagnostics for more than just the file for which
 * linting was triggered, and this is reflected in the implementation.
 */
class AnsibleLint {
    constructor(connection, context) {
        var _a;
        this.useProgressTracker = false;
        this.configCache = new Map();
        this.connection = connection;
        this.context = context;
        this.useProgressTracker =
            !!((_a = context.clientCapabilities.window) === null || _a === void 0 ? void 0 : _a.workDoneProgress);
    }
    /**
     * Perform linting for the given document.
     *
     * In case no errors are found for the current document, and linting has been
     * performed on opening the document, then only the cache is cleared, and not
     * the diagnostics on the client side. That way old diagnostics will persist
     * until the file is changed. This allows inspecting more complex errors
     * reported in other files.
     */
    doValidate(textDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            const docPath = new url_1.URL(textDocument.uri).pathname;
            let diagnostics = new Map();
            let progressTracker;
            if (this.useProgressTracker) {
                progressTracker = yield this.connection.window.createWorkDoneProgress();
            }
            const ansibleLintConfigPromise = this.getAnsibleLintConfig(textDocument.uri);
            const workingDirectory = new url_1.URL(this.context.workspaceFolder.uri).pathname;
            try {
                const settings = yield this.context.documentSettings.get(textDocument.uri);
                if (settings.ansibleLint.enabled) {
                    if (progressTracker) {
                        progressTracker.begin('ansible-lint', undefined, 'Processing files...');
                    }
                    const [command, env] = misc_1.withInterpreter(settings.ansibleLint.path, `${settings.ansibleLint.arguments} --offline --nocolor -f codeclimate ${docPath}`, settings.python.interpreterPath, settings.python.activationScript);
                    const result = yield exec(command, {
                        encoding: 'utf-8',
                        cwd: workingDirectory,
                        env: env,
                    });
                    diagnostics = this.processReport(result.stdout, yield ansibleLintConfigPromise, workingDirectory);
                    if (result.stderr) {
                        this.connection.console.info(`[ansible-lint] ${result.stderr}`);
                    }
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    const execError = error;
                    if (execError.code === 2) {
                        diagnostics = this.processReport(execError.stdout, yield ansibleLintConfigPromise, workingDirectory);
                    }
                    else {
                        this.connection.window.showErrorMessage(execError.message);
                    }
                    if (execError.stderr) {
                        this.connection.console.info(`[ansible-lint] ${execError.stderr}`);
                    }
                }
                else {
                    this.connection.console.error(`Exception in AnsibleLint service: ${JSON.stringify(error)}`);
                }
            }
            if (progressTracker) {
                progressTracker.done();
            }
            return diagnostics;
        });
    }
    processReport(result, ansibleLintConfig, workingDirectory) {
        var _a, _b;
        const diagnostics = new Map();
        if (!result) {
            this.connection.console.warn('Standard output from ansible-lint is suspiciously empty.');
            return diagnostics;
        }
        try {
            const report = JSON.parse(result);
            if (report instanceof Array) {
                for (const item of report) {
                    if (typeof item.check_name === 'string' &&
                        item.location &&
                        typeof item.location.path === 'string' &&
                        item.location.lines &&
                        (item.location.lines.begin ||
                            typeof item.location.lines.begin === 'number')) {
                        const begin_line = item.location.lines.begin.line || item.location.lines.begin || 1;
                        const begin_column = item.location.lines.begin.column || 1;
                        const start = {
                            line: begin_line - 1,
                            character: begin_column - 1,
                        };
                        const end = {
                            line: begin_line - 1,
                            character: Number.MAX_SAFE_INTEGER,
                        };
                        const range = {
                            start: start,
                            end: end,
                        };
                        let severity = vscode_languageserver_1.DiagnosticSeverity.Error;
                        if (ansibleLintConfig) {
                            const lintRuleName = (_b = (_a = item.check_name.match(/\[(?<name>[a-z\-]+)\].*/)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.name;
                            if (lintRuleName &&
                                ansibleLintConfig.warnList.has(lintRuleName)) {
                                severity = vscode_languageserver_1.DiagnosticSeverity.Warning;
                            }
                            const categories = item.categories;
                            if (categories instanceof Array) {
                                if (categories.some((c) => ansibleLintConfig.warnList.has(c))) {
                                    severity = vscode_languageserver_1.DiagnosticSeverity.Warning;
                                }
                            }
                        }
                        const locationUri = `file://${workingDirectory}/${item.location.path}`;
                        let fileDiagnostics = diagnostics.get(locationUri);
                        if (!fileDiagnostics) {
                            fileDiagnostics = [];
                            diagnostics.set(locationUri, fileDiagnostics);
                        }
                        let message = item.check_name;
                        if (item.description) {
                            message += `\nDescription: ${item.description}`;
                        }
                        fileDiagnostics.push({
                            message: message,
                            range: range || vscode_languageserver_1.Range.create(0, 0, 0, 0),
                            severity: severity,
                            source: 'Ansible',
                        });
                    }
                }
            }
        }
        catch (error) {
            this.connection.window.showErrorMessage('Could not parse ansible-lint output. Please check your ansible-lint installation & configuration.' +
                ' More info in `Ansible Server` output.');
            let message;
            if (error instanceof Error) {
                message = error.message;
            }
            else {
                message = JSON.stringify(error);
            }
            this.connection.console.error(`Exception while parsing ansible-lint output: ${message}` +
                `\nTried to parse the following:\n${result}`);
        }
        return diagnostics;
    }
    handleWatchedDocumentChange(params) {
        for (const fileEvent of params.changes) {
            // remove from cache on any change
            this.configCache.delete(fileEvent.uri);
        }
    }
    getAnsibleLintConfig(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const configPath = yield this.getAnsibleLintConfigPath(uri);
            if (configPath) {
                let config = this.configCache.get(configPath);
                if (!config) {
                    config = yield this.readAnsibleLintConfig(configPath);
                    this.configCache.set(configPath, config);
                }
                return config;
            }
        });
    }
    readAnsibleLintConfig(configPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = {
                warnList: new Set(),
            };
            try {
                const configContents = yield fs_1.promises.readFile(new url_1.URL(configPath), {
                    encoding: 'utf8',
                });
                yaml_1.parseAllDocuments(configContents).forEach((configDoc) => {
                    const configObject = configDoc.toJSON();
                    if (misc_1.hasOwnProperty(configObject, 'warn_list') &&
                        configObject.warn_list instanceof Array) {
                        for (const warn_item of configObject.warn_list) {
                            if (typeof warn_item === 'string') {
                                config.warnList.add(warn_item);
                            }
                        }
                    }
                });
            }
            catch (error) {
                this.connection.window.showErrorMessage(error);
            }
            return config;
        });
    }
    getAnsibleLintConfigPath(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            // find configuration path
            let configPath;
            const pathArray = uri.split('/');
            // Find first configuration file going up until workspace root
            for (let index = pathArray.length - 1; index >= 0; index--) {
                const candidatePath = pathArray
                    .slice(0, index)
                    .concat('.ansible-lint')
                    .join('/');
                if (!candidatePath.startsWith(this.context.workspaceFolder.uri)) {
                    // we've gone out of the workspace folder
                    break;
                }
                if (yield misc_1.fileExists(candidatePath)) {
                    configPath = candidatePath;
                    break;
                }
            }
            return configPath;
        });
    }
}
exports.AnsibleLint = AnsibleLint;
//# sourceMappingURL=ansibleLint.js.map