import type { ZimWikiLayoutSettings } from '../settings';

/** The explorer features currently enabled, kept in sync with plugin settings. */
let current: Readonly<ZimWikiLayoutSettings> = {
	hiddenFolders: [],
	showFolderCount: false,
	showOnlyNotes: false,
	interleavedSort: false,
	folderNotes: false,
	pageAttachmentFolder: false,
};

export function setExplorerOptions(settings: ZimWikiLayoutSettings): void {
	current = { ...settings, hiddenFolders: [...settings.hiddenFolders] };
}

export function explorerOptions(): Readonly<ZimWikiLayoutSettings> {
	return current;
}
