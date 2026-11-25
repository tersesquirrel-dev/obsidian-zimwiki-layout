import { TAbstractFile, TFile } from 'obsidian';

/** Only Markdown notes and folders are shown in the file explorer. */
export function isVisibleInExplorer(file: TAbstractFile): boolean {
	return !(file instanceof TFile) || file.extension === 'md';
}
