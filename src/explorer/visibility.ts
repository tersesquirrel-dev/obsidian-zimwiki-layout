import { TAbstractFile, TFile, TFolder } from 'obsidian';

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
 * Only Markdown notes, and folders that contain notes somewhere beneath them,
 * are shown in the file explorer.
 */
export function isVisibleInExplorer(file: TAbstractFile): boolean {
	if (file instanceof TFolder) return containsNote(file);
	return isNote(file);
}
