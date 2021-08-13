import { Hover } from 'vscode-languageserver';
import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import { DocsLibrary } from '../services/docsLibrary';
export declare function doHover(document: TextDocument, position: Position, docsLibrary: DocsLibrary): Promise<Hover | null>;
