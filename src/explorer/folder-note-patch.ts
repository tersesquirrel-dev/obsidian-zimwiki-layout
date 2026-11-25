import { Keymap, TAbstractFile } from 'obsidian';
import {
	FileExplorerView,
	FolderItem,
	findFolderItem,
	replaceMethod,
} from './file-explorer';
import { getFolderNote, getNoteFolder } from './folder-notes';

/**
 * Highlights a folder as the active item when its folder note is open.
 * Returns a function that restores the original.
 */
export function patchActiveHighlight(view: FileExplorerView): () => void {
	const proto = Object.getPrototypeOf(view) as FileExplorerView;
	const original = proto.onFileOpen;

	return replaceMethod(proto, 'onFileOpen', function (
		this: FileExplorerView,
		file: TAbstractFile | null,
	) {
		original.call(this, (file && getNoteFolder(file)) ?? file);
	});
}

/**
 * Makes clicking a folder's name open its folder note and expand the folder.
 * Clicking the collapse arrow still expands/collapses (Obsidian handles that
 * click separately).
 * Returns a restore function, or null if no folder item exists yet to patch.
 */
export function patchFolderClick(view: FileExplorerView): (() => void) | null {
	const sample = findFolderItem(view);
	if (!sample) return null;

	const proto = Object.getPrototypeOf(sample) as FolderItem;
	const original = proto.onSelfClick;

	return replaceMethod(proto, 'onSelfClick', function (
		this: FolderItem,
		evt: Event,
	) {
		const note = getFolderNote(this.file);
		if (!note) return original.call(this, evt);

		if (evt instanceof MouseEvent && evt.button !== 0 && evt.button !== 1) return;
		const { view } = this;
		if (view.fileBeingRenamed === this.file) return;
		if (view.tree.handleItemSelection(evt, this)) return;

		const { workspace } = view.app;
		const newLeaf = evt instanceof MouseEvent ? Keymap.isModEvent(evt) : false;
		void workspace.getLeaf(newLeaf).openFile(note);
		// Opening also expands; only the arrow collapses.
		if (this.collapsed) void this.setCollapsed(false, true);
	});
}
