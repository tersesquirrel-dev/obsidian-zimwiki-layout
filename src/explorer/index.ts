import { Plugin } from 'obsidian';
import {
	FILE_EXPLORER_VIEW_TYPE,
	FileExplorerView,
	getFileExplorerViews,
} from './file-explorer';
import { patchInterleavedSort } from './interleaved-sort';

/**
 * Applies the ZimWiki-style changes to the file explorer once it exists,
 * and undoes them when the plugin unloads.
 */
export function registerExplorerPatches(plugin: Plugin): void {
	const { workspace } = plugin.app;
	let patchedView: FileExplorerView | null = null;

	const resortAll = () => {
		for (const view of getFileExplorerViews(
			workspace.getLeavesOfType(FILE_EXPLORER_VIEW_TYPE),
		)) {
			view.requestSort();
		}
	};

	const tryPatch = () => {
		if (patchedView) return;
		const [view] = getFileExplorerViews(
			workspace.getLeavesOfType(FILE_EXPLORER_VIEW_TYPE),
		);
		if (!view) return;

		patchedView = view;
		const unpatch = patchInterleavedSort(view);
		plugin.register(() => {
			unpatch();
			resortAll();
		});
		resortAll();
	};

	workspace.onLayoutReady(() => {
		tryPatch();
		// The file explorer may be opened later (or was closed at startup).
		plugin.registerEvent(workspace.on('layout-change', tryPatch));
	});
}
