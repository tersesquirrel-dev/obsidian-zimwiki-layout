import { TAbstractFile, TFile, TFolder } from 'obsidian';
import type { FileExplorerView } from './file-explorer';

type GetSortedFolderItems = FileExplorerView['getSortedFolderItems'];

// Same collation options Obsidian uses for its alphabetical sort.
const collator = new Intl.Collator(undefined, {
	usage: 'sort',
	sensitivity: 'base',
	numeric: true,
});

/** Name used for sorting: a note's basename, so "Foo.md" sits beside folder "Foo". */
function sortName(file: TAbstractFile): string {
	return file instanceof TFile ? file.basename : file.name;
}

function compareByName(a: TAbstractFile, b: TAbstractFile): number {
	const byName = collator.compare(sortName(a), sortName(b));
	if (byName !== 0) return byName;
	// Same name: put the note ahead of its matching folder.
	if (a instanceof TFile && b instanceof TFolder) return -1;
	if (a instanceof TFolder && b instanceof TFile) return 1;
	return collator.compare(a.name, b.name);
}

/**
 * Replaces the file explorer's folder sort so files and folders are interleaved
 * by name. Only alphabetical sort orders are changed; time-based orders keep
 * Obsidian's default behaviour. Returns a function that restores the original.
 */
export function patchInterleavedSort(view: FileExplorerView): () => void {
	const proto = Object.getPrototypeOf(view) as FileExplorerView;
	const original: GetSortedFolderItems = proto.getSortedFolderItems;

	const patched: GetSortedFolderItems = function (
		this: FileExplorerView,
		folder: TFolder,
	) {
		const reverse = this.sortOrder === 'alphabeticalReverse';
		if (this.sortOrder !== 'alphabetical' && !reverse) {
			return original.call(this, folder);
		}

		const children = folder.children.slice();
		children.sort((a, b) =>
			reverse ? compareByName(b, a) : compareByName(a, b),
		);

		const items: unknown[] = [];
		for (const child of children) {
			const item = this.fileItems[child.path];
			if (item) items.push(item);
		}
		return items;
	};

	proto.getSortedFolderItems = patched;

	return () => {
		if (proto.getSortedFolderItems === patched) {
			proto.getSortedFolderItems = original;
		}
	};
}
