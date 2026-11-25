import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { getNoteFolder } from './folder-notes';

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

/** Folders are shown only if they contain notes somewhere beneath them. */
export function isVisibleFolder(folder: TFolder): boolean {
	return containsNote(folder);
}

/**
 * Shown in the file explorer: folders containing notes, and notes that
 * aren't folder notes (those are represented by their folder instead).
 */
export function isVisibleInExplorer(file: TAbstractFile): boolean {
	if (file instanceof TFolder) return isVisibleFolder(file);
	return isNote(file) && getNoteFolder(file) === null;
}
