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
exports.SettingsManager = void 0;
const _ = require("lodash");
class SettingsManager {
    constructor(connection, clientSupportsConfigRequests) {
        this.configurationChangeHandlers = new Map();
        // cache of document settings per workspace file
        this.documentSettings = new Map();
        this.defaultSettings = {
            ansible: { path: 'ansible', useFullyQualifiedCollectionNames: false },
            ansibleLint: { enabled: true, path: 'ansible-lint', arguments: '' },
            python: { interpreterPath: '', activationScript: '' },
        };
        this.globalSettings = this.defaultSettings;
        this.connection = connection;
        this.clientSupportsConfigRequests = clientSupportsConfigRequests;
    }
    /**
     * Register a handler for configuration change on particular URI.
     *
     * Change detection is cache-based. If the client does not support the
     * configuration requests, all handlers will be fired.
     */
    onConfigurationChanged(uri, handler) {
        this.configurationChangeHandlers.set(uri, handler);
    }
    get(uri) {
        if (!this.clientSupportsConfigRequests) {
            return Promise.resolve(this.globalSettings);
        }
        let result = this.documentSettings.get(uri);
        if (!result) {
            result = this.connection.workspace.getConfiguration({
                scopeUri: uri,
                section: 'ansible',
            });
            this.documentSettings.set(uri, result);
        }
        return result;
    }
    handleDocumentClosed(uri) {
        this.documentSettings.delete(uri);
    }
    handleConfigurationChanged(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clientSupportsConfigRequests) {
                // find configuration change handlers to fire
                const newDocumentSettings = new Map();
                const handlersToFire = [];
                for (const [uri, handler] of this.configurationChangeHandlers) {
                    const config = yield this.documentSettings.get(uri);
                    if (config) {
                        // found cached values, now compare to the new ones
                        const newConfigPromise = this.connection.workspace.getConfiguration({
                            scopeUri: uri,
                            section: 'ansible',
                        });
                        newDocumentSettings.set(uri, newConfigPromise);
                        if (!_.isEqual(config, yield newConfigPromise)) {
                            // handlers may need to read config, so can't fire them until the
                            // cache is purged
                            handlersToFire.push(handler);
                        }
                    }
                }
                // resetting documents settings, but not wasting newly fetched values
                this.documentSettings = newDocumentSettings;
                // fire handlers
                handlersToFire.forEach((h) => h());
            }
            else {
                if (params.settings.ansible) {
                    this.configurationChangeHandlers.forEach((h) => h());
                }
                this.globalSettings = params.settings.ansible || this.defaultSettings;
            }
        });
    }
}
exports.SettingsManager = SettingsManager;
//# sourceMappingURL=settingsManager.js.map