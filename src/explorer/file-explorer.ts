import { TAbstractFile, TFolder, View, WorkspaceLeaf } from 'obsidian';

/*
 * Internal (undocumented) shapes of Obsidian's file explorer.
 * Verified against Obsidian's bundled app.js; may change between versions.
 * Methods we replace are typed as function properties so they can be swapped.
 */

export interface ExplorerTree {
	/** Handles shift/alt/active-item clicks; returns true if it consumed the event. */
	handleItemSelection(evt: Event, item: ExplorerItem): boolean;
}

export interface ExplorerItem {
	file: TAbstractFile;
	selfEl: HTMLElement;
}

export interface FolderItem extends ExplorerItem {
	file: TFolder;
	view: FileExplorerView;
	collapsed: boolean;
	setCollapsed(collapsed: boolean, animate: boolean): Promise<void>;
	onSelfClick: (this: FolderItem, evt: Event) => void;
}

export interface FileExplorerView extends View {
	sortOrder: string;
	fileItems: Record<string, ExplorerItem | undefined>;
	fileBeingRenamed: TAbstractFile | null;
	tree: ExplorerTree;
	requestSort(): void;
	getSortedFolderItems: (
		this: FileExplorerView,
		folder: TFolder,
	) => ExplorerItem[];
	onFileOpen: (this: FileExplorerView, file: TAbstractFile | null) => void;
}

export const FILE_EXPLORER_VIEW_TYPE = 'file-explorer';

export function getFileExplorerViews(leaves: WorkspaceLeaf[]): FileExplorerView[] {
	return leaves.map((leaf) => leaf.view).filter(isFileExplorerView);
}

function isFileExplorerView(view: View): view is FileExplorerView {
	const candidate = view as Partial<FileExplorerView>;
	return (
		typeof candidate.getSortedFolderItems === 'function' &&
		typeof candidate.requestSort === 'function' &&
		typeof candidate.onFileOpen === 'function'
	);
}

/** Finds a folder tree item to reach the (otherwise inaccessible) folder item class. */
export function findFolderItem(view: FileExplorerView): FolderItem | null {
	for (const item of Object.values(view.fileItems)) {
		if (
			item?.file instanceof TFolder &&
			typeof (item as Partial<FolderItem>).onSelfClick === 'function'
		) {
			return item as FolderItem;
		}
	}
	return null;
}

/** Swaps a method on an object, returning a function that restores it. */
export function replaceMethod<T extends object, K extends keyof T>(
	target: T,
	key: K,
	replacement: T[K],
): () => void {
	const original = target[key];
	target[key] = replacement;
	return () => {
		if (target[key] === replacement) target[key] = original;
	};
}
