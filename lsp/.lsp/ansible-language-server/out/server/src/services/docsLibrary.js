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
exports.DocsLibrary = void 0;
const yaml_1 = require("../utils/yaml");
const docsFinder_1 = require("../utils/docsFinder");
const docsParser_1 = require("../utils/docsParser");
class DocsLibrary {
    constructor(context) {
        this.modules = new Map();
        this._moduleFqcns = new Set();
        this.docFragments = new Map();
        this.pluginRouting = new Map();
        this.context = context;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const ansibleConfig = yield this.context.ansibleConfig;
            for (const modulesPath of ansibleConfig.module_locations) {
                (yield docsFinder_1.findDocumentation(modulesPath, 'builtin')).forEach((doc) => {
                    this.modules.set(doc.fqcn, doc);
                    this.moduleFqcns.add(doc.fqcn);
                });
                (yield docsFinder_1.findDocumentation(modulesPath, 'builtin_doc_fragment')).forEach((doc) => {
                    this.docFragments.set(doc.fqcn, doc);
                });
            }
            (yield docsFinder_1.findPluginRouting(ansibleConfig.ansible_location, 'builtin')).forEach((r, collection) => this.pluginRouting.set(collection, r));
            for (const collectionsPath of ansibleConfig.collections_paths) {
                (yield docsFinder_1.findDocumentation(collectionsPath, 'collection')).forEach((doc) => {
                    this.modules.set(doc.fqcn, doc);
                    this.moduleFqcns.add(doc.fqcn);
                });
                (yield docsFinder_1.findDocumentation(collectionsPath, 'collection_doc_fragment')).forEach((doc) => {
                    this.docFragments.set(doc.fqcn, doc);
                });
                (yield docsFinder_1.findPluginRouting(collectionsPath, 'collection')).forEach((r, collection) => this.pluginRouting.set(collection, r));
                // add all valid redirect routes as possible FQCNs
                for (const [collection, routesByType] of this.pluginRouting) {
                    for (const [name, route] of routesByType.get('modules') || []) {
                        if (route.redirect && !route.tombstone) {
                            this.moduleFqcns.add(`${collection}.${name}`);
                        }
                    }
                }
            }
        });
    }
    /**
     * Tries to find an Ansible module for a given name or FQCN.
     *
     * Parameters `contextPath` and `documentUri` are used to obtain contextual
     * information on declared collections. Hence these are not needed when
     * searching with FQCN.
     *
     * Returns the module if found and an FQCN for which either a module or a
     * route has been found.
     */
    findModule(searchText, contextPath, documentUri) {
        return __awaiter(this, void 0, void 0, function* () {
            let hitFqcn;
            const candidateFqcns = yield this.getCandidateFqcns(searchText, documentUri, contextPath);
            // check routing
            let moduleRoute;
            for (const fqcn of candidateFqcns) {
                moduleRoute = this.getModuleRoute(fqcn);
                if (moduleRoute) {
                    hitFqcn = fqcn;
                    break; // find first
                }
            }
            // find module
            let module;
            if (moduleRoute && moduleRoute.redirect) {
                module = this.modules.get(moduleRoute.redirect);
            }
            else {
                for (const fqcn of candidateFqcns) {
                    module = this.modules.get(fqcn);
                    if (module) {
                        if (!hitFqcn) {
                            hitFqcn = fqcn;
                        }
                        break; // find first
                    }
                }
            }
            if (module) {
                if (!module.fragments) {
                    // collect information from documentation fragments
                    docsParser_1.processDocumentationFragments(module, this.docFragments);
                }
                if (!module.documentation) {
                    // translate raw documentation into a typed structure
                    module.documentation = docsParser_1.processRawDocumentation(module.rawDocumentation);
                }
            }
            return [module, hitFqcn];
        });
    }
    getCandidateFqcns(searchText, documentUri, contextPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const candidateFqcns = [];
            if (searchText.split('.').length === 3) {
                candidateFqcns.push(searchText); // try searching as-is (FQCN match)
            }
            else {
                candidateFqcns.push(`ansible.builtin.${searchText}`); // try searching built-in
                if (documentUri) {
                    const metadata = yield this.context.documentMetadata.get(documentUri);
                    if (metadata) {
                        // try searching declared collections
                        candidateFqcns.push(...metadata.collections.map((c) => `${c}.${searchText}`));
                    }
                }
                if (contextPath) {
                    candidateFqcns.push(...yaml_1.getDeclaredCollections(contextPath).map((c) => `${c}.${searchText}`));
                }
            }
            return candidateFqcns;
        });
    }
    getModuleRoute(fqcn) {
        var _a, _b;
        const fqcn_array = fqcn.split('.');
        if (fqcn_array.length === 3) {
            const [namespace, collection, name] = fqcn_array;
            return (_b = (_a = this.pluginRouting
                .get(`${namespace}.${collection}`)) === null || _a === void 0 ? void 0 : _a.get('modules')) === null || _b === void 0 ? void 0 : _b.get(name);
        }
    }
    get moduleFqcns() {
        return this._moduleFqcns;
    }
}
exports.DocsLibrary = DocsLibrary;
//# sourceMappingURL=docsLibrary.js.map