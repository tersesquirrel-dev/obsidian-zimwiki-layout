import { Plugin } from 'obsidian';
import {
	FILE_EXPLORER_VIEW_TYPE,
	FileExplorerView,
	getFileExplorerViews,
} from './file-explorer';
import { patchFolderItems } from './folder-items-patch';
import { patchActiveHighlight, patchFolderClick } from './folder-note-patch';

/**
 * Applies the ZimWiki-style changes to the file explorer once it exists,
 * and undoes them when the plugin unloads. Returns a function that
 * refreshes the explorer, e.g. after settings change.
 */
export function registerExplorerPatches(plugin: Plugin): () => void {
	const { workspace, vault } = plugin.app;
	let patchedView: FileExplorerView | null = null;
	let folderClickPatched = false;

	const views = () =>
		getFileExplorerViews(workspace.getLeavesOfType(FILE_EXPLORER_VIEW_TYPE));

	/** Re-sorts every explorer and re-applies the active-item highlight. */
	const refresh = () => {
		const active = workspace.getActiveFile();
		for (const view of views()) {
			view.requestSort();
			view.onFileOpen(active);
		}
	};

	// Folder items only exist once the vault has a folder, so retry until then.
	const tryPatchFolderClick = () => {
		if (!patchedView || folderClickPatched) return;
		const unpatch = patchFolderClick(patchedView);
		if (!unpatch) return;
		folderClickPatched = true;
		plugin.register(unpatch);
	};

	const tryPatch = () => {
		if (patchedView) return;
		const [view] = views();
		if (!view) return;

		patchedView = view;
		const unpatchItems = patchFolderItems(view);
		const unpatchHighlight = patchActiveHighlight(view);
		plugin.register(() => {
			unpatchItems();
			unpatchHighlight();
			refresh();
		});
		tryPatchFolderClick();
		refresh();
	};

	workspace.onLayoutReady(() => {
		tryPatch();
		// The file explorer may be opened later (or was closed at startup).
		plugin.registerEvent(workspace.on('layout-change', tryPatch));

		// Obsidian's own file-open handler is bound to the unpatched method,
		// so re-apply the highlight after it runs.
		plugin.registerEvent(
			workspace.on('file-open', (file) => {
				for (const view of views()) view.onFileOpen(file);
			}),
		);

		// Folder visibility and folder-note pairing depend on what is nested
		// inside folders, which Obsidian doesn't re-check on its own.
		const onVaultChange = () => {
			if (!patchedView) return;
			tryPatchFolderClick();
			refresh();
		};
		plugin.registerEvent(vault.on('create', onVaultChange));
		plugin.registerEvent(vault.on('delete', onVaultChange));
		plugin.registerEvent(vault.on('rename', onVaultChange));
	});

	return () => {
		if (patchedView) refresh();
	};
}
