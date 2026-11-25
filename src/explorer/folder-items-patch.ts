import { TFolder } from 'obsidian';
import { FileExplorerView, replaceMethod } from './file-explorer';
import { sortInterleaved, usesInterleavedSort } from './interleaved-sort';
import { isVisibleInExplorer } from './visibility';

/**
 * Replaces the file explorer's per-folder listing so that files and folders
 * are interleaved by name and hidden files are left out.
 * Returns a function that restores the original.
 */
export function patchFolderItems(view: FileExplorerView): () => void {
	const proto = Object.getPrototypeOf(view) as FileExplorerView;
	const original = proto.getSortedFolderItems;

	return replaceMethod(proto, 'getSortedFolderItems', function (
		this: FileExplorerView,
		folder: TFolder,
	) {
		if (!usesInterleavedSort(this.sortOrder)) {
			return original
				.call(this, folder)
				.filter((item) => isVisibleInExplorer(item.file));
		}

		const items = [];
		for (const child of sortInterleaved(folder.children, this.sortOrder)) {
			if (!isVisibleInExplorer(child)) continue;
			const item = this.fileItems[child.path];
			if (item) items.push(item);
		}
		return items;
	});
}
