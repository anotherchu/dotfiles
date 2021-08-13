import { SemanticTokenModifiers, SemanticTokens, SemanticTokenTypes } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocsLibrary } from '../services/docsLibrary';
export declare const tokenTypes: SemanticTokenTypes[];
export declare const tokenModifiers: SemanticTokenModifiers[];
export declare function doSemanticTokens(document: TextDocument, docsLibrary: DocsLibrary): Promise<SemanticTokens>;
