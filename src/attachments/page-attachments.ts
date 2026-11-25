import { normalizePath, Plugin, TFile, TFolder, Vault } from 'obsidian';
import { replaceMethod } from '../explorer/file-explorer';

/*
 * ZimWiki keeps a page's attachments in the folder of the same name as the
 * page, e.g. "Projects/Plan.md" stores its images in "Projects/Plan/". That
 * folder is the same one this plugin pairs with the note as a folder note.
 */

/**
 * Internal (undocumented) Vault method that every attachment save goes
 * through, including FileManager.getAvailablePathForAttachment. Verified
 * against Obsidian's bundled app.js; may change between versions.
 */
interface AttachmentVault extends Vault {
	getAvailablePathForAttachments: (
		this: Vault,
		basename: string,
		extension: string,
		sourceFile: TFile | null,
	) => Promise<string>;
}

/** The folder a page's attachments belong in: beside the note, named after it. */
function pageFolderPath(note: TFile): string {
	const parent = note.parent?.isRoot() ? '' : `${note.parent?.path ?? ''}/`;
	return normalizePath(`${parent}${note.basename}`);
}

/** The first unused "name.ext", "name 1.ext", "name 2.ext", ... in the folder. */
function availablePath(vault: Vault, folder: string, basename: string, extension: string): string {
	const suffix = extension ? `.${extension}` : '';
	for (let n = 0; ; n++) {
		const name = n === 0 ? basename : `${basename} ${n}`;
		const path = normalizePath(`${folder}/${name}${suffix}`);
		if (!vault.getAbstractFileByPath(path)) return path;
	}
}

/**
 * Saves attachments into the folder named after the page they are added to,
 * while `isEnabled` returns true. Otherwise Obsidian's own attachment
 * location setting applies.
 */
export function registerPageAttachments(plugin: Plugin, isEnabled: () => boolean): void {
	const vault = plugin.app.vault as AttachmentVault;
	const original = vault.getAvailablePathForAttachments;
	if (typeof original !== 'function') return;

	plugin.register(
		replaceMethod(vault, 'getAvailablePathForAttachments', async function (
			this: Vault,
			basename: string,
			extension: string,
			sourceFile: TFile | null,
		) {
			if (!isEnabled() || !sourceFile || sourceFile.extension !== 'md') {
				return original.call(this, basename, extension, sourceFile);
			}

			const folder = pageFolderPath(sourceFile);
			const existing = this.getAbstractFileByPath(folder);
			if (!existing) {
				await this.createFolder(folder);
			} else if (!(existing instanceof TFolder)) {
				return original.call(this, basename, extension, sourceFile);
			}
			return availablePath(this, folder, basename, extension);
		}),
	);
}
