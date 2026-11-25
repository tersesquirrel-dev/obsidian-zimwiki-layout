import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { getNoteFolder } from './folder-notes';
import { explorerOptions } from './options';

function isInHiddenFolder(file: TAbstractFile): boolean {
	return explorerOptions().hiddenFolders.some(
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

/**
 * Folders are shown unless hidden; with "show only notes" on, they must
 * also contain notes somewhere beneath them.
 */
export function isVisibleFolder(folder: TFolder): boolean {
	if (isInHiddenFolder(folder)) return false;
	return !explorerOptions().showOnlyNotes || containsNote(folder);
}

/**
 * Whether a file or folder is shown in the file explorer. Folder notes are
 * left out because their folder represents them.
 */
export function isVisibleInExplorer(file: TAbstractFile): boolean {
	if (file instanceof TFolder) return isVisibleFolder(file);
	if (isInHiddenFolder(file)) return false;
	if (explorerOptions().showOnlyNotes && !isNote(file)) return false;
	return getNoteFolder(file) === null;
}
