"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyModuleDocumentation = exports.parseRawRouting = exports.processRawOptions = exports.processRawDocumentation = exports.processDocumentationFragments = void 0;
const _ = require("lodash");
const fs = require("fs");
const yaml_1 = require("yaml");
const misc_1 = require("./misc");
function processDocumentationFragments(module, docFragments) {
    module.fragments = [];
    if (misc_1.hasOwnProperty(module.rawDocumentation, 'extends_documentation_fragment')) {
        const docFragmentNames = module.rawDocumentation.extends_documentation_fragment instanceof Array
            ? module.rawDocumentation.extends_documentation_fragment
            : [module.rawDocumentation.extends_documentation_fragment];
        const resultContents = {};
        for (const docFragmentName of docFragmentNames) {
            const docFragment = docFragments.get(docFragmentName) ||
                docFragments.get(`ansible.builtin.${docFragmentName}`);
            if (docFragment) {
                module.fragments.push(docFragment); // currently used only as indicator
                _.mergeWith(resultContents, docFragment.rawDocumentation, docFragmentMergeCustomizer);
            }
        }
        _.mergeWith(resultContents, module.rawDocumentation, docFragmentMergeCustomizer);
        module.rawDocumentation = resultContents;
    }
}
exports.processDocumentationFragments = processDocumentationFragments;
function docFragmentMergeCustomizer(objValue, srcValue, key) {
    if (['notes', 'requirements', 'seealso'].includes(key) &&
        _.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}
function processRawDocumentation(rawDoc) {
    if (misc_1.isObject(rawDoc) && typeof rawDoc.module === 'string') {
        const moduleDoc = {
            module: rawDoc.module,
            options: processRawOptions(rawDoc.options),
            deprecated: !!rawDoc.deprecated,
        };
        if (isIDescription(rawDoc.short_description))
            moduleDoc.shortDescription = rawDoc.short_description;
        if (isIDescription(rawDoc.description))
            moduleDoc.description = rawDoc.description;
        if (typeof rawDoc.version_added === 'string')
            moduleDoc.versionAdded = rawDoc.version_added;
        if (isIDescription(rawDoc.author))
            moduleDoc.author = rawDoc.author;
        if (isIDescription(rawDoc.requirements))
            moduleDoc.requirements = rawDoc.requirements;
        if (typeof rawDoc.seealso === 'object')
            moduleDoc.seealso = rawDoc.seealso;
        if (isIDescription(rawDoc.notes))
            moduleDoc.notes = rawDoc.notes;
        return moduleDoc;
    }
}
exports.processRawDocumentation = processRawDocumentation;
function processRawOptions(rawOptions) {
    const options = new Map();
    if (misc_1.isObject(rawOptions)) {
        for (const [optionName, rawOption] of Object.entries(rawOptions)) {
            if (misc_1.isObject(rawOption)) {
                const optionDoc = {
                    name: optionName,
                    required: !!rawOption.required,
                    default: rawOption.default,
                    suboptions: rawOption.suboptions,
                };
                if (isIDescription(rawOption.description))
                    optionDoc.description = rawOption.description;
                if (rawOption.choices instanceof Array)
                    optionDoc.choices = rawOption.choices;
                if (typeof rawOption.type === 'string')
                    optionDoc.type = rawOption.type;
                if (typeof rawOption.elements === 'string')
                    optionDoc.elements = rawOption.elements;
                if (rawOption.aliases instanceof Array)
                    optionDoc.aliases = rawOption.aliases;
                if (typeof rawOption.version_added === 'string')
                    optionDoc.versionAdded = rawOption.version_added;
                options.set(optionName, optionDoc);
                if (optionDoc.aliases) {
                    for (const alias of optionDoc.aliases) {
                        options.set(alias, optionDoc);
                    }
                }
            }
        }
    }
    return options;
}
exports.processRawOptions = processRawOptions;
function isIDescription(obj) {
    return (obj instanceof Array || // won't check that all elements are string
        typeof obj === 'string');
}
function parseRawRouting(rawDoc) {
    const routesByType = new Map();
    if (misc_1.hasOwnProperty(rawDoc, 'plugin_routing') &&
        misc_1.isObject(rawDoc.plugin_routing)) {
        for (const [pluginType, rawRoutesByName] of Object.entries(rawDoc.plugin_routing)) {
            if (pluginType === 'modules' && misc_1.isObject(rawRoutesByName)) {
                routesByType.set(pluginType, parseRawRoutesByName(rawRoutesByName));
            }
        }
    }
    return routesByType;
}
exports.parseRawRouting = parseRawRouting;
function parseRawRoutesByName(rawRoutesByName) {
    const routesByName = new Map();
    for (const [moduleName, rawRoute] of Object.entries(rawRoutesByName)) {
        if (misc_1.isObject(rawRoute))
            routesByName.set(moduleName, parseRawRoute(rawRoute));
    }
    return routesByName;
}
function parseRawRoute(rawRoute) {
    const route = {};
    if (misc_1.isObject(rawRoute.deprecation)) {
        route.deprecation = parseRawDepracationOrTombstone(rawRoute.deprecation);
    }
    if (misc_1.isObject(rawRoute.tombstone)) {
        route.tombstone = parseRawDepracationOrTombstone(rawRoute.tombstone);
    }
    if (typeof rawRoute.redirect === 'string') {
        route.redirect = rawRoute.redirect;
    }
    return route;
}
function parseRawDepracationOrTombstone(rawInfo) {
    let warningText;
    let removalDate;
    let removalVersion;
    if (typeof rawInfo.warning_text === 'string') {
        warningText = rawInfo.warning_text;
    }
    if (typeof rawInfo.removal_date === 'string') {
        removalDate = rawInfo.removal_date;
    }
    if (typeof rawInfo.removal_version === 'string') {
        removalVersion = rawInfo.removal_version;
    }
    return {
        warningText: warningText,
        removalDate: removalDate,
        removalVersion: removalVersion,
    };
}
class LazyModuleDocumentation {
    constructor(source, fqcn, namespace, collection, name) {
        this.sourceLineRange = [0, 0];
        this.errors = [];
        this.source = source;
        this.fqcn = fqcn;
        this.namespace = namespace;
        this.collection = collection;
        this.name = name;
    }
    get rawDocumentation() {
        var _a, _b, _c;
        if (!this._contents) {
            const contents = fs.readFileSync(this.source, { encoding: 'utf8' });
            const m = LazyModuleDocumentation.docsRegex.exec(contents);
            if (m && m.groups && m.groups.doc && m.groups.pre) {
                // determine documentation start/end lines for definition provider
                let startLine = ((_a = contents.substr(0, m.index).match(/\n/g)) === null || _a === void 0 ? void 0 : _a.length) || 0;
                startLine += ((_b = m.groups.pre.match(/\n/g)) === null || _b === void 0 ? void 0 : _b.length) || 0;
                const endLine = startLine + (((_c = m.groups.doc.match(/\n/g)) === null || _c === void 0 ? void 0 : _c.length) || 0);
                this.sourceLineRange = [startLine, endLine];
                const document = yaml_1.parseDocument(m.groups.doc);
                // There's about 20 modules (out of ~3200) in Ansible 2.9 libs that contain YAML syntax errors
                // Still, document.toJSON() works on them
                this._contents = document.toJSON();
                this.errors = document.errors;
            }
            this._contents = this._contents || {};
        }
        return this._contents;
    }
    set rawDocumentation(value) {
        this._contents = value;
    }
}
exports.LazyModuleDocumentation = LazyModuleDocumentation;
LazyModuleDocumentation.docsRegex = /(?<pre>[ \t]*DOCUMENTATION\s*=\s*r?(?<quotes>'''|""")(?:\n---)?\n?)(?<doc>.*?)\k<quotes>/s;
//# sourceMappingURL=docsParser.js.map