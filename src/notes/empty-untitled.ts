import { Plugin, TFile, TFolder, WorkspaceLeaf } from 'obsidian';

/** Names Obsidian gives new notes: "Untitled", "Untitled 1", "Untitled 2", ... */
const UNTITLED_NAME = /^Untitled( \d+)?$/;

/**
 * How long to wait after a tab closes before checking the note, so Obsidian
 * has finished saving whatever was typed just before closing.
 */
const SAVE_DELAY_MS = 1000;

function isUntitledNote(file: TFile): boolean {
	return file.extension === 'md' && UNTITLED_NAME.test(file.basename);
}

/**
 * Moves new, empty "Untitled" notes to the trash when the last tab showing
 * them is closed, while `isEnabled` returns true. Notes with any text, or
 * with a folder of sub-pages beside them, are kept.
 */
export function registerEmptyUntitledCleanup(plugin: Plugin, isEnabled: () => boolean): void {
	const { workspace, vault, fileManager } = plugin.app;
	const timers = new Set<number>();
	let openNotes = new Map<WorkspaceLeaf, TFile>();

	/** The note each Markdown tab shows, including tabs not loaded yet. */
	const snapshot = () => {
		const notes = new Map<WorkspaceLeaf, TFile>();
		workspace.iterateAllLeaves((leaf) => {
			const { type, state } = leaf.getViewState();
			const path = state?.file;
			if (type !== 'markdown' || typeof path !== 'string') return;
			const file = vault.getAbstractFileByPath(path);
			if (file instanceof TFile) notes.set(leaf, file);
		});
		return notes;
	};

	const isOpen = (file: TFile) => [...snapshot().values()].includes(file);

	const trashIfEmpty = async (file: TFile) => {
		if (!isEnabled() || !isUntitledNote(file)) return;
		if (vault.getAbstractFileByPath(file.path) !== file || isOpen(file)) return;
		const folder = vault.getAbstractFileByPath(file.path.slice(0, -'.md'.length));
		if (folder instanceof TFolder) return;
		if ((await vault.read(file)).trim() !== '') return;
		await fileManager.trashFile(file);
	};

	const onLayoutChange = () => {
		const current = snapshot();
		const closed = new Set<TFile>();
		for (const [leaf, file] of openNotes) {
			if (current.get(leaf) !== file) closed.add(file);
		}
		openNotes = current;
		if (!isEnabled()) return;

		for (const file of closed) {
			if (!isUntitledNote(file)) continue;
			const timer = window.setTimeout(() => {
				timers.delete(timer);
				trashIfEmpty(file).catch((error) => {
					console.error('ZimWiki Layout: could not delete empty note', error);
				});
			}, SAVE_DELAY_MS);
			timers.add(timer);
		}
	};

	workspace.onLayoutReady(() => {
		openNotes = snapshot();
		plugin.registerEvent(workspace.on('layout-change', onLayoutChange));
		// Switching a tab to another note doesn't always change the layout.
		plugin.registerEvent(workspace.on('file-open', onLayoutChange));
	});

	plugin.register(() => {
		for (const timer of timers) window.clearTimeout(timer);
		timers.clear();
	});
}
