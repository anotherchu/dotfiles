import { CompletionItem } from 'vscode-languageserver';
import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import { WorkspaceFolderContext } from '../services/workspaceManager';
export declare function doCompletion(document: TextDocument, position: Position, context: WorkspaceFolderContext): Promise<CompletionItem[] | null>;
export declare function doCompletionResolve(completionItem: CompletionItem, context: WorkspaceFolderContext): Promise<CompletionItem>;
