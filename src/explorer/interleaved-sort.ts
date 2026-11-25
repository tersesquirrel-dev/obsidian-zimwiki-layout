import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { explorerOptions } from './options';

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
 * Whether files and folders should be interleaved for this sort order.
 * Time-based orders keep Obsidian's default, since folders have no times.
 */
export function usesInterleavedSort(sortOrder: string): boolean {
	if (!explorerOptions().interleavedSort) return false;
	return sortOrder === 'alphabetical' || sortOrder === 'alphabeticalReverse';
}

/** Sorts files and folders together by name. */
export function sortInterleaved(
	children: TAbstractFile[],
	sortOrder: string,
): TAbstractFile[] {
	const reverse = sortOrder === 'alphabeticalReverse';
	return children
		.slice()
		.sort((a, b) => (reverse ? compareByName(b, a) : compareByName(a, b)));
}
