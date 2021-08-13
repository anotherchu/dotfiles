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
exports.MetadataLibrary = void 0;
const fs_1 = require("fs");
const url_1 = require("url");
const yaml_1 = require("yaml");
const misc_1 = require("../utils/misc");
class MetadataLibrary {
    constructor(connection) {
        // cache of metadata contents per metadata file
        this.metadata = new Map();
        this.connection = connection;
    }
    get(uri) {
        const metadataUri = this.getAnsibleMetadataUri(uri);
        if (metadataUri) {
            let metadata = this.metadata.get(metadataUri);
            if (!metadata) {
                metadata = this.readAnsibleMetadata(metadataUri);
                this.metadata.set(metadataUri, metadata);
            }
            return metadata;
        }
    }
    handleWatchedDocumentChange(params) {
        for (const fileEvent of params.changes) {
            // remove from cache on any change
            this.metadata.delete(fileEvent.uri);
        }
    }
    /**
     * Finds a path where the metadata file for a given document should reside.
     * @returns The path or undefined in case the file cannot have any related
     * metadata file.
     */
    getAnsibleMetadataUri(uri) {
        let metaPath;
        const pathArray = uri.split('/');
        // Find first
        for (let index = pathArray.length - 1; index >= 0; index--) {
            if (pathArray[index] === 'tasks') {
                metaPath = pathArray
                    .slice(0, index)
                    .concat('meta', 'main.yml')
                    .join('/');
            }
        }
        return metaPath;
    }
    readAnsibleMetadata(metadataUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = {
                source: metadataUri,
                collections: new Array(),
            };
            if (yield misc_1.fileExists(metadataUri)) {
                try {
                    const metaContents = yield fs_1.promises.readFile(new url_1.URL(metadataUri), {
                        encoding: 'utf8',
                    });
                    yaml_1.parseAllDocuments(metaContents).forEach((metaDoc) => {
                        const metaObject = metaDoc.toJSON();
                        if (misc_1.hasOwnProperty(metaObject, 'collections') &&
                            metaObject.collections instanceof Array) {
                            metaObject.collections.forEach((collection) => {
                                if (typeof collection === 'string') {
                                    metadata.collections.push(collection);
                                }
                            });
                        }
                    });
                }
                catch (error) {
                    this.connection.window.showErrorMessage(error);
                }
            }
            return metadata;
        });
    }
}
exports.MetadataLibrary = MetadataLibrary;
//# sourceMappingURL=metadataLibrary.js.map