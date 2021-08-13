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
exports.withInterpreter = exports.insert = exports.isObject = exports.hasOwnProperty = exports.toLspRange = exports.fileExists = void 0;
const fs_1 = require("fs");
const url_1 = require("url");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const path = require("path");
function fileExists(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        return !!(yield fs_1.promises.stat(new url_1.URL(fileUri)).catch(() => false));
    });
}
exports.fileExists = fileExists;
function toLspRange(range, textDocument) {
    const start = textDocument.positionAt(range[0]);
    const end = textDocument.positionAt(range[1]);
    return vscode_languageserver_types_1.Range.create(start, end);
}
exports.toLspRange = toLspRange;
function hasOwnProperty(obj, prop) {
    return isObject(obj) && obj.hasOwnProperty(prop);
}
exports.hasOwnProperty = hasOwnProperty;
/**
 * Checks whether `obj` is a non-null object.
 */
function isObject(obj) {
    return obj && typeof obj === 'object';
}
exports.isObject = isObject;
function insert(str, index, val) {
    return `${str.substring(0, index)}${val}${str.substring(index)}`;
}
exports.insert = insert;
/**
 * Adjusts the command and environment in case the interpreter path is provided.
 */
function withInterpreter(executable, args, interpreterPath, activationScript) {
    let command = `${executable} ${args}`; // base case
    if (activationScript) {
        command = `bash -c 'source ${activationScript} && ${executable} ${args}'`;
        return [command, undefined];
    }
    if (interpreterPath) {
        const virtualEnv = path.resolve(interpreterPath, '../..');
        const pathEntry = path.join(virtualEnv, 'bin');
        if (path.isAbsolute(executable)) {
            // if both interpreter path and absolute command path are provided, we can
            // bolster the chances of success by letting the interpreter execute the
            // command
            command = `${interpreterPath} ${executable} ${args}`;
        }
        // emulating virtual environment activation script
        const envOverride = {
            VIRTUAL_ENV: virtualEnv,
            PATH: `${pathEntry}:${process.env.PATH}`,
        };
        const newEnv = Object.assign({}, process.env, envOverride);
        delete newEnv.PYTHONHOME;
        return [command, newEnv];
    }
    else {
        return [command, undefined];
    }
}
exports.withInterpreter = withInterpreter;
//# sourceMappingURL=misc.js.map