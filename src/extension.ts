/* -------------------------------------------------------------------
 * Copyright (C) 2024 the Gwion team).
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License, see LICENSE.md in the project root.
 * ------------------------------------------------------------------ */
import * as path from 'path';
import {
	workspace as Workspace, window as Window, ExtensionContext,
    TextDocument, OutputChannel, WorkspaceFolder, Uri
} from 'vscode';

import {
	LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient/node';

let LSPClient: LanguageClient;

export function activate(context: ExtensionContext) {
	const serverbin = 'gwiond';
	const outputChannel: OutputChannel = (
        Window.createOutputChannel('gwiond')
    );

	function didOpenTextDocument(document: TextDocument): void {
		// We are only interested in language mode text
		if (document.languageId !== 'gwion' ||
                (document.uri.scheme !== 'file' &&
                document.uri.scheme !== 'untitled')) {
			return;
		}

		const uri = document.uri;
        // Set up our LSP client:
		if (!LSPClient) {
			const cmdOptions = { shell: true };
			const serverOptions = {
				run: { command: serverbin, options: cmdOptions },
				debug: { command: serverbin, options: cmdOptions}
			};
			const clientOptions: LanguageClientOptions = {
				documentSelector: [
					{ scheme: 'untitled', language: 'gwion' },
					{ scheme: 'file', language: 'gwion' }
				],
				diagnosticCollectionName: 'gwiond',
				outputChannel: outputChannel
			};
			LSPClient = new LanguageClient(
                'gwiond',
                serverOptions, clientOptions
            );
			LSPClient.start();
			return;
		}
	}

	Workspace.onDidOpenTextDocument(didOpenTextDocument);
	Workspace.textDocuments.forEach(didOpenTextDocument);
	Workspace.onDidChangeWorkspaceFolders((event) => {
		for (const folder  of event.removed) {
			
		}
	});
}

export function deactivate(): Thenable<void> {
	const promises: Thenable<void>[] = [];
	if (LSPClient) {
		promises.push(LSPClient.stop());
	}
	return Promise.all(promises).then(() => undefined);
}
