import { AbstractInputSuggest, App, TFolder } from 'obsidian';

/** Suggests vault folders while typing into a text input. */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	constructor(
		app: App,
		private readonly inputEl: HTMLInputElement,
		private readonly exclude: () => string[],
		private readonly onPick: (folder: TFolder) => void,
	) {
		super(app, inputEl);
	}

	getSuggestions(query: string): TFolder[] {
		const lower = query.toLowerCase();
		const excluded = new Set(this.exclude());
		return this.app.vault
			.getAllLoadedFiles()
			.filter(
				(file): file is TFolder =>
					file instanceof TFolder &&
					!file.isRoot() &&
					!excluded.has(file.path) &&
					file.path.toLowerCase().includes(lower),
			)
			.sort((a, b) => a.path.localeCompare(b.path))
			.slice(0, 50);
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.setText(folder.path);
	}

	selectSuggestion(folder: TFolder): void {
		this.inputEl.value = folder.path;
		this.onPick(folder);
		this.close();
	}
}
