import { TFolder } from 'obsidian';
import type { ExplorerItem, FileExplorerView } from './file-explorer';
import { getFolderNote } from './folder-notes';

const PAGE_CLASS = 'zimwiki-page';
const NOT_PAGE_CLASS = 'zimwiki-not-page';

/**
 * Marks an explorer item as a real page (a note, or a folder with a folder
 * note) or a plain folder, so pages can be styled brighter.
 */
export function setPageStyle(item: ExplorerItem): void {
	const isPage = !(item.file instanceof TFolder) || getFolderNote(item.file) !== null;
	item.selfEl.toggleClass(PAGE_CLASS, isPage);
	item.selfEl.toggleClass(NOT_PAGE_CLASS, !isPage);
}

/** Removes page styling from an explorer (on plugin unload). */
export function clearPageStyles(view: FileExplorerView): void {
	for (const item of Object.values(view.fileItems)) {
		item?.selfEl.removeClasses([PAGE_CLASS, NOT_PAGE_CLASS]);
	}
}
