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
exports.AnsibleConfig = void 0;
const child_process = require("child_process");
const ini = require("ini");
const _ = require("lodash");
const path = require("path");
const url_1 = require("url");
const misc_1 = require("../utils/misc");
class AnsibleConfig {
    constructor(connection, context) {
        this._collection_paths = [];
        this._module_locations = [];
        this._ansible_location = '';
        this.connection = connection;
        this.context = context;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.context.documentSettings.get(this.context.workspaceFolder.uri);
                // get Ansible configuration
                const [ansibleConfigCommand, ansibleConfigEnv] = misc_1.withInterpreter(`${settings.ansible.path}-config`, 'dump', settings.python.interpreterPath, settings.python.activationScript);
                const ansibleConfigResult = child_process.execSync(ansibleConfigCommand, {
                    encoding: 'utf-8',
                    cwd: new url_1.URL(this.context.workspaceFolder.uri).pathname,
                    env: ansibleConfigEnv,
                });
                let config = ini.parse(ansibleConfigResult);
                config = _.mapKeys(config, (_, key) => key.substring(0, key.indexOf('(')) // remove config source in parenthesis
                );
                this._collection_paths = parsePythonStringArray(config.COLLECTIONS_PATHS);
                // get Ansible basic information
                const [ansibleCommand, ansibleEnv] = misc_1.withInterpreter(`${settings.ansible.path}`, '--version', settings.python.interpreterPath, settings.python.activationScript);
                const ansibleVersionResult = child_process.execSync(ansibleCommand, {
                    encoding: 'utf-8',
                    env: ansibleEnv,
                });
                const versionInfo = ini.parse(ansibleVersionResult);
                this._module_locations = parsePythonStringArray(versionInfo['configured module search path']);
                this._module_locations.push(path.resolve(versionInfo['ansible python module location'], 'modules'));
                this._ansible_location = versionInfo['ansible python module location'];
                // get Python sys.path
                // this is needed to get the pre-installed collections to work
                const [pythonPathCommand, pythonPathEnv] = misc_1.withInterpreter('python3', ' -c "import sys; print(sys.path, end=\\"\\")"', settings.python.interpreterPath, settings.python.activationScript);
                const pythonPathResult = child_process.execSync(pythonPathCommand, {
                    encoding: 'utf-8',
                    env: pythonPathEnv,
                });
                this._collection_paths.push(...parsePythonStringArray(pythonPathResult));
            }
            catch (error) {
                if (error instanceof Error) {
                    this.connection.window.showErrorMessage(error.message);
                }
                else {
                    this.connection.console.error(`Exception in AnsibleConfig service: ${JSON.stringify(error)}`);
                }
            }
        });
    }
    get collections_paths() {
        return this._collection_paths;
    }
    get module_locations() {
        return this._module_locations;
    }
    get ansible_location() {
        return this._ansible_location;
    }
}
exports.AnsibleConfig = AnsibleConfig;
function parsePythonStringArray(array) {
    array = array.slice(1, array.length - 1); // remove []
    const quoted_elements = array.split(',').map((e) => e.trim());
    return quoted_elements.map((e) => e.slice(1, e.length - 1));
}
//# sourceMappingURL=ansibleConfig.js.map