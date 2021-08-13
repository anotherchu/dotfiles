import { DefinitionLink } from 'vscode-languageserver';
import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import { DocsLibrary } from '../services/docsLibrary';
export declare function getDefinition(document: TextDocument, position: Position, docsLibrary: DocsLibrary): Promise<DefinitionLink[] | null>;
