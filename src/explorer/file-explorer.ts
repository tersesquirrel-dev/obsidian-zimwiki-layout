import { TFolder, View, WorkspaceLeaf } from 'obsidian';

/**
 * Internal (undocumented) shape of Obsidian's file explorer view.
 * Verified against Obsidian's bundled app.js; may change between versions.
 */
export interface FileExplorerView extends View {
	sortOrder: string;
	fileItems: Record<string, unknown>;
	requestSort(): void;
	getSortedFolderItems: (this: FileExplorerView, folder: TFolder) => unknown[];
}

export const FILE_EXPLORER_VIEW_TYPE = 'file-explorer';

export function getFileExplorerViews(leaves: WorkspaceLeaf[]): FileExplorerView[] {
	return leaves
		.map((leaf) => leaf.view)
		.filter(isFileExplorerView);
}

function isFileExplorerView(view: View): view is FileExplorerView {
	const candidate = view as Partial<FileExplorerView>;
	return (
		typeof candidate.getSortedFolderItems === 'function' &&
		typeof candidate.requestSort === 'function'
	);
}
