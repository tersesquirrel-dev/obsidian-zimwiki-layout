import { TFolder } from 'obsidian';
import { ExplorerItem, FileExplorerView, replaceMethod } from './file-explorer';
import { clearFolderCounts, setFolderCount } from './folder-count';
import { sortInterleaved, usesInterleavedSort } from './interleaved-sort';
import { clearPageStyles, setPageStyle } from './page-style';
import { isVisibleInExplorer } from './visibility';

/**
 * Replaces the file explorer's per-folder listing so that files and folders
 * are interleaved by name and hidden files are left out. Also updates the
 * folder's sub-page count and its children's page styling, since this runs
 * whenever a folder is re-sorted.
 * Returns a function that restores the original.
 */
export function patchFolderItems(view: FileExplorerView): () => void {
	const proto = Object.getPrototypeOf(view) as FileExplorerView;
	const original = proto.getSortedFolderItems;

	const restore = replaceMethod(proto, 'getSortedFolderItems', function (
		this: FileExplorerView,
		folder: TFolder,
	) {
		let items: ExplorerItem[];
		if (usesInterleavedSort(this.sortOrder)) {
			items = [];
			for (const child of sortInterleaved(folder.children, this.sortOrder)) {
				if (!isVisibleInExplorer(child)) continue;
				const item = this.fileItems[child.path];
				if (item) items.push(item);
			}
		} else {
			items = original
				.call(this, folder)
				.filter((item) => isVisibleInExplorer(item.file));
		}

		const folderItem = this.fileItems[folder.path];
		if (folderItem) setFolderCount(folderItem, items.length);
		for (const item of items) setPageStyle(item);
		return items;
	});

	return () => {
		restore();
		clearFolderCounts(view);
		clearPageStyles(view);
	};
}
