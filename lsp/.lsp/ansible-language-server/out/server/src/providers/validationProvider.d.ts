import { Diagnostic } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ValidationManager } from '../services/validationManager';
import { WorkspaceFolderContext } from '../services/workspaceManager';
/**
 * Validates the given document.
 * @param textDocument - the document to validate
 * @param linter - uses linter
 * @param quick - only re-evaluates YAML validation and uses lint cache
 * @returns Map of diagnostics per file.
 */
export declare function doValidate(textDocument: TextDocument, validationManager: ValidationManager, quick?: boolean, context?: WorkspaceFolderContext): Promise<Map<string, Diagnostic[]>>;
