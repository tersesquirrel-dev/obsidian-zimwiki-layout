import { TAbstractFile, TFile, TFolder } from 'obsidian';
import { explorerOptions } from './options';
import { isVisibleFolder } from './visibility';

/*
 * A "folder note" is a note that sits beside a folder of the same name,
 * e.g. "Projects.md" next to "Projects/". In the explorer the pair is shown
 * as one item, like a ZimWiki page with sub-pages.
 */

/** The note paired with this folder, if the folder is shown in the explorer. */
export function getFolderNote(folder: TFolder): TFile | null {
	if (!explorerOptions().folderNotes) return null;
	if (folder.isRoot() || !isVisibleFolder(folder)) return null;
	const note = folder.vault.getAbstractFileByPath(`${folder.path}.md`);
	return note instanceof TFile ? note : null;
}

/** The visible folder this note is paired with, if any. */
export function getNoteFolder(file: TAbstractFile): TFolder | null {
	if (!explorerOptions().folderNotes) return null;
	if (!(file instanceof TFile) || file.extension !== 'md') return null;
	const folderPath = file.path.slice(0, -'.md'.length);
	const folder = file.vault.getAbstractFileByPath(folderPath);
	return folder instanceof TFolder && isVisibleFolder(folder) ? folder : null;
}
