import { TAbstractFile, TFolder } from 'obsidian';
import type { FileExplorerView } from './file-explorer';
import { sortInterleaved, usesInterleavedSort } from './interleaved-sort';
import { isVisibleInExplorer } from './visibility';

type GetSortedFolderItems = FileExplorerView['getSortedFolderItems'];

/** File explorer tree items carry the vault file they represent. */
interface ExplorerItem {
	file: TAbstractFile;
}

function isExplorerItem(item: unknown): item is ExplorerItem {
	return (
		typeof item === 'object' &&
		item !== null &&
		(item as Partial<ExplorerItem>).file instanceof TAbstractFile
	);
}

/**
 * Replaces the file explorer's per-folder listing so that files and folders
 * are interleaved by name and non-Markdown files are hidden.
 * Returns a function that restores the original.
 */
export function patchFolderItems(view: FileExplorerView): () => void {
	const proto = Object.getPrototypeOf(view) as FileExplorerView;
	const original: GetSortedFolderItems = proto.getSortedFolderItems;

	const patched: GetSortedFolderItems = function (
		this: FileExplorerView,
		folder: TFolder,
	) {
		let items: unknown[];
		if (usesInterleavedSort(this.sortOrder)) {
			items = [];
			for (const child of sortInterleaved(folder.children, this.sortOrder)) {
				const item = this.fileItems[child.path];
				if (item) items.push(item);
			}
		} else {
			items = original.call(this, folder);
		}

		return items.filter(
			(item) => !isExplorerItem(item) || isVisibleInExplorer(item.file),
		);
	};

	proto.getSortedFolderItems = patched;

	return () => {
		if (proto.getSortedFolderItems === patched) {
			proto.getSortedFolderItems = original;
		}
	};
}
