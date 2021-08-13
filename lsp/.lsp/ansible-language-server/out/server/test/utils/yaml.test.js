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
const chai_1 = require("chai");
const fs_1 = require("fs");
const path = require("path");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const yaml_1 = require("yaml");
const types_1 = require("yaml/types");
const yaml_2 = require("../../src/utils/yaml");
function getYamlDoc(yamlFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const yaml = yield fs_1.promises.readFile(path.resolve('server', 'src', 'test', 'data', 'utils', 'yaml', yamlFile), {
            encoding: 'utf8',
        });
        return vscode_languageserver_textdocument_1.TextDocument.create('uri', 'ansible', 1, yaml);
    });
}
function getPathInFile(yamlFile, line, character) {
    return __awaiter(this, void 0, void 0, function* () {
        const textDoc = yield getYamlDoc(yamlFile);
        const parsedDocs = yaml_1.parseAllDocuments(textDoc.getText());
        return yaml_2.getPathAt(textDoc, { line: line - 1, character: character - 1 }, parsedDocs);
    });
}
describe('yaml', () => {
    describe('ancestryBuilder', () => {
        it('canGetParent', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const node = new yaml_2.AncestryBuilder(path).parent().get();
            chai_1.expect(node).to.be.an.instanceOf(types_1.YAMLMap);
        }));
        it('canGetAssertedParent', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const node = new yaml_2.AncestryBuilder(path).parent(types_1.YAMLMap).get();
            chai_1.expect(node).to.be.an.instanceOf(types_1.YAMLMap);
        }));
        it('canAssertParent', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const node = new yaml_2.AncestryBuilder(path).parent(types_1.YAMLSeq).get();
            chai_1.expect(node).to.be.null;
        }));
        it('canGetAncestor', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const node = new yaml_2.AncestryBuilder(path).parent().parent().get();
            chai_1.expect(node).to.be.an.instanceOf(types_1.YAMLSeq);
        }));
        it('canGetParentPath', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const subPath = new yaml_2.AncestryBuilder(path).parent().getPath();
            chai_1.expect(subPath)
                .to.be.an.instanceOf(Array)
                .to.have.lengthOf(((path === null || path === void 0 ? void 0 : path.length) || 0) - 2);
        }));
        it('canGetKey', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const key = new yaml_2.AncestryBuilder(path).parent(types_1.YAMLMap).getStringKey();
            chai_1.expect(key).to.be.equal('name');
        }));
        it('canGetKeyForValue', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 13);
            const key = new yaml_2.AncestryBuilder(path).parent(types_1.YAMLMap).getStringKey();
            chai_1.expect(key).to.be.equal('name');
        }));
        it('canGetKeyPath', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const subPath = new yaml_2.AncestryBuilder(path).parent(types_1.YAMLMap).getKeyPath();
            chai_1.expect(subPath)
                .to.be.an.instanceOf(Array)
                .to.have.lengthOf((path === null || path === void 0 ? void 0 : path.length) || 0);
            if (subPath)
                chai_1.expect(subPath[subPath.length - 1])
                    .to.be.an.instanceOf(types_1.Scalar)
                    .to.have.property('value', 'name');
        }));
        it('canGetAssertedParentOfKey', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 7);
            const node = new yaml_2.AncestryBuilder(path).parentOfKey().get();
            chai_1.expect(node).to.be.an.instanceOf(types_1.YAMLMap);
            chai_1.expect(node).to.have.nested.property('items[0].key.value', 'name');
        }));
        it('canAssertParentOfKey', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 4, 13);
            const node = new yaml_2.AncestryBuilder(path).parentOfKey().get();
            chai_1.expect(node).to.be.null;
        }));
        it('canGetIndentationParent', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('ancestryBuilder.yml', 7, 9);
            const node = new yaml_2.AncestryBuilder(path)
                .parent(types_1.YAMLMap)
                .parent(types_1.YAMLMap)
                .getStringKey();
            chai_1.expect(node).to.be.equal('lineinfile');
        }));
        it.skip('canGetIndentationParentAtEndOfMap', () => __awaiter(void 0, void 0, void 0, function* () {
            // skipped -> the YAML parser doesn't correctly interpret indentation in
            // otherwise empty lines; a workaround is implemented for completion
            // provider
            const path = yield getPathInFile('ancestryBuilder.yml', 9, 9);
            const node = new yaml_2.AncestryBuilder(path)
                .parent(types_1.YAMLMap)
                .parent(types_1.YAMLMap)
                .getStringKey();
            chai_1.expect(node).to.be.equal('lineinfile');
        }));
        it.skip('canGetIndentationParentAtEOF', () => __awaiter(void 0, void 0, void 0, function* () {
            // skipped -> the YAML parser doesn't correctly interpret indentation in
            // otherwise empty lines; a workaround is implemented for completion
            // provider
            const path = yield getPathInFile('ancestryBuilder.yml', 15, 9);
            const node = new yaml_2.AncestryBuilder(path)
                .parent(types_1.YAMLMap)
                .parent(types_1.YAMLMap)
                .getStringKey();
            chai_1.expect(node).to.be.equal('lineinfile');
        }));
    });
    describe('getDeclaredCollections', () => {
        it('canGetCollections', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 13, 7);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([
                'mynamespace.mycollection',
                'mynamespace2.mycollection2',
            ]);
        }));
        it('canGetCollectionsFromPreTasks', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 9, 7);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([
                'mynamespace.mycollection',
                'mynamespace2.mycollection2',
            ]);
        }));
        it('canGetCollectionsFromBlock', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 12, 11);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([
                'mynamespace.mycollection',
                'mynamespace2.mycollection2',
            ]);
        }));
        it('canGetCollectionsFromNestedBlock', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 23, 15);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([
                'mynamespace.mycollection',
                'mynamespace2.mycollection2',
            ]);
        }));
        it('canGetCollectionsFromRescue', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 27, 11);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([
                'mynamespace.mycollection',
                'mynamespace2.mycollection2',
            ]);
        }));
        it('canGetCollectionsFromAlways', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 31, 11);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([
                'mynamespace.mycollection',
                'mynamespace2.mycollection2',
            ]);
        }));
        it('canWorkWithoutCollections', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 38, 7);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([]);
        }));
        it('canWorkWithEmptyCollections', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = yield getPathInFile('getDeclaredCollections.yml', 46, 7);
            const collections = yaml_2.getDeclaredCollections(path);
            chai_1.expect(collections).to.have.members([]);
        }));
    });
    describe('isTaskParam', () => {
        it('canCorrectlyConfirmTaskParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 3, 3));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyNegateTaskParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 1, 1));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegateTaskParamForValue', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 2, 9));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegateTaskParamForPlay', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 7, 3));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegateTaskParamForBlock', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 18, 7));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegateTaskParamForRole', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 21, 7));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyConfirmTaskParamInPreTasks', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 10, 7));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyConfirmTaskParamInTasks', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 13, 7));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyConfirmTaskParamInBlock', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isTaskParam.yml', 17, 11));
            const test = yaml_2.isTaskParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
    });
    describe('isPlayParam', () => {
        it('canCorrectlyConfirmPlayParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 1, 3));
            const test = yaml_2.isPlayParam(path, 'file://test/isPlay.yml');
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyConfirmPlayParamWithoutPath', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 1, 3));
            const test = yaml_2.isPlayParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyConfirmPlayParamInStrangePath', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 1, 3));
            const test = yaml_2.isPlayParam(path, 'file:///roles/test/tasks/isPlay.yml');
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyNegatePlayParamInRolePathWithoutPlayKeywords', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 7, 3));
            const test = yaml_2.isPlayParam(path, 'file:///roles/test/tasks/isPlay.yml');
            chai_1.expect(test).to.be.eq(false);
        }));
        it('isUndecisiveWithoutPlayKeywords', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 7, 3));
            const test = yaml_2.isPlayParam(path, 'file://test/isPlay.yml');
            chai_1.expect(test).to.be.eq(undefined);
        }));
        it('isUndecisiveWithoutPlayKeywordsWithoutPath', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 7, 3));
            const test = yaml_2.isPlayParam(path);
            chai_1.expect(test).to.be.eq(undefined);
        }));
        it('canCorrectlyNegatePlayParamForNonRootSequence', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 14, 7));
            const test = yaml_2.isPlayParam(path, 'file://test/isPlay.yml');
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegatePlayParamForNonRootSequenceWithoutPath', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 14, 7));
            const test = yaml_2.isPlayParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegatePlayParamForValue', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isPlayParam.yml', 1, 9));
            const test = yaml_2.isPlayParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
    });
    describe('isBlockParam', () => {
        it('canCorrectlyConfirmBlockParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isBlockParam.yml', 2, 3));
            const test = yaml_2.isBlockParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyNegateBlockParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isBlockParam.yml', 5, 3));
            const test = yaml_2.isBlockParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegateBlockParamOnValue', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isBlockParam.yml', 2, 11));
            const test = yaml_2.isBlockParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
    });
    describe('isRoleParam', () => {
        it('canCorrectlyConfirmRoleParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isRoleParam.yml', 5, 7));
            const test = yaml_2.isRoleParam(path);
            chai_1.expect(test).to.be.eq(true);
        }));
        it('canCorrectlyNegateRoleParam', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isRoleParam.yml', 4, 3));
            const test = yaml_2.isRoleParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
        it('canCorrectlyNegateRoleParamOnValue', () => __awaiter(void 0, void 0, void 0, function* () {
            const path = (yield getPathInFile('isRoleParam.yml', 5, 13));
            const test = yaml_2.isRoleParam(path);
            chai_1.expect(test).to.be.eq(false);
        }));
    });
});
//# sourceMappingURL=yaml.test.js.map