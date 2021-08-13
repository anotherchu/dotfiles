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
exports.findPluginRouting = exports.findDocumentation = void 0;
const fs = require("fs");
const path = require("path");
const yaml_1 = require("yaml");
const globby = require("globby");
const docsParser_1 = require("./docsParser");
function findDocumentation(dir, kind) {
    return __awaiter(this, void 0, void 0, function* () {
        let files;
        switch (kind) {
            case 'builtin':
                files = yield globby([`${dir}/**/*.py`, '!/**/_*.py']);
                break;
            case 'builtin_doc_fragment':
                files = yield globby([
                    `${path.resolve(dir, '../')}/plugins/doc_fragments/*.py`,
                    '!/**/_*.py',
                ]);
                break;
            case 'collection':
                files = yield globby([
                    `${dir}/ansible_collections/*/*/plugins/modules/*.py`,
                    `!${dir}/ansible_collections/*/*/plugins/modules/_*.py`,
                ]);
                break;
            case 'collection_doc_fragment':
                files = yield globby([
                    `${dir}/ansible_collections/*/*/plugins/doc_fragments/*.py`,
                    `!${dir}/ansible_collections/*/*/plugins/doc_fragments/_*.py`,
                ]);
                break;
        }
        return files.map((file) => {
            const name = path.basename(file, '.py');
            let namespace;
            let collection;
            switch (kind) {
                case 'builtin':
                case 'builtin_doc_fragment':
                    namespace = 'ansible';
                    collection = 'builtin';
                    break;
                case 'collection':
                case 'collection_doc_fragment':
                    const pathArray = file.split(path.sep);
                    namespace = pathArray[pathArray.length - 5];
                    collection = pathArray[pathArray.length - 4];
                    break;
            }
            return new docsParser_1.LazyModuleDocumentation(file, `${namespace}.${collection}.${name}`, namespace, collection, name);
        });
    });
}
exports.findDocumentation = findDocumentation;
function findPluginRouting(dir, kind) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginRouting = new Map();
        let files;
        switch (kind) {
            case 'builtin':
                files = yield globby([`${dir}/config/ansible_builtin_runtime.yml`]);
                break;
            case 'collection':
                files = yield globby([`${dir}/ansible_collections/*/*/meta/runtime.yml`]);
                break;
        }
        for (const file of files) {
            let collection;
            switch (kind) {
                case 'builtin':
                    collection = 'ansible.builtin';
                    break;
                case 'collection':
                    const pathArray = file.split(path.sep);
                    collection = `${pathArray[pathArray.length - 4]}.${pathArray[pathArray.length - 3]}`;
                    break;
            }
            const runtimeContent = yield fs.promises.readFile(file, {
                encoding: 'utf8',
            });
            const document = yaml_1.parseDocument(runtimeContent).toJSON();
            pluginRouting.set(collection, docsParser_1.parseRawRouting(document));
        }
        return pluginRouting;
    });
}
exports.findPluginRouting = findPluginRouting;
//# sourceMappingURL=docsFinder.js.map