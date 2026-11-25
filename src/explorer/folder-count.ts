import type { ExplorerItem, FileExplorerView } from './file-explorer';

const COUNT_CLASS = 'zimwiki-folder-count';

/** Shows how many sub-pages a folder has, next to its name in the explorer. */
export function setFolderCount(item: ExplorerItem, count: number): void {
	let countEl = item.selfEl.querySelector<HTMLElement>(`.${COUNT_CLASS}`);
	if (count === 0) {
		countEl?.remove();
		return;
	}
	if (!countEl) countEl = item.selfEl.createDiv({ cls: COUNT_CLASS });
	countEl.setText(String(count));
	countEl.setAttribute('aria-label', `${count} sub-page${count === 1 ? '' : 's'}`);
}

/** Removes all sub-page counts from an explorer (on plugin unload). */
export function clearFolderCounts(view: FileExplorerView): void {
	for (const item of Object.values(view.fileItems)) {
		item?.selfEl.querySelector(`.${COUNT_CLASS}`)?.remove();
	}
}
