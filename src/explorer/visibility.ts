import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { getNoteFolder } from './folder-notes';

let hiddenFolders: string[] = [];

/** Sets the folder paths that are hidden from the explorer, with everything inside. */
export function setHiddenFolders(paths: string[]): void {
	hiddenFolders = paths;
}

function isInHiddenFolder(file: TAbstractFile): boolean {
	return hiddenFolders.some(
		(folder) => file.path === folder || file.path.startsWith(`${folder}/`),
	);
}

function isNote(file: TAbstractFile): file is TFile {
	return file instanceof TFile && file.extension === 'md';
}

/** True if the folder or any folder beneath it contains a note. */
function containsNote(folder: TFolder): boolean {
	for (const child of folder.children) {
		if (isNote(child)) return true;
	}
	for (const child of folder.children) {
		if (child instanceof TFolder && containsNote(child)) return true;
	}
	return false;
}

/** Folders are shown only if they aren't hidden and contain notes beneath them. */
export function isVisibleFolder(folder: TFolder): boolean {
	return !isInHiddenFolder(folder) && containsNote(folder);
}

/**
 * Shown in the file explorer: folders containing notes, and notes that
 * aren't folder notes (those are represented by their folder instead).
 * Anything inside a hidden folder is left out.
 */
export function isVisibleInExplorer(file: TAbstractFile): boolean {
	if (file instanceof TFolder) return isVisibleFolder(file);
	return isNote(file) && !isInHiddenFolder(file) && getNoteFolder(file) === null;
}
