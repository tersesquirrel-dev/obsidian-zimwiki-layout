import { App, normalizePath, PluginSettingTab, Setting, TFolder } from 'obsidian';
import type ZimWikiLayoutPlugin from './main';
import { FolderSuggest } from './ui/folder-suggest';

export interface ZimWikiLayoutSettings {
	/** Vault-relative folder paths hidden from the file explorer. */
	hiddenFolders: string[];
	/** Show how many sub-pages each folder has. */
	showFolderCount: boolean;
	/** Hide non-Markdown files and folders that contain no notes. */
	showOnlyNotes: boolean;
	/** Sort files and folders together by name instead of folders first. */
	interleavedSort: boolean;
	/** Merge a note with the same-named folder beside it into one item. */
	folderNotes: boolean;
	/** Save attachments in a folder named after the page they are added to. */
	pageAttachmentFolder: boolean;
}

export const DEFAULT_SETTINGS: ZimWikiLayoutSettings = {
	hiddenFolders: ['Templates'],
	showFolderCount: true,
	showOnlyNotes: true,
	interleavedSort: true,
	folderNotes: true,
	pageAttachmentFolder: true,
};

type ToggleKey = {
	[K in keyof ZimWikiLayoutSettings]: ZimWikiLayoutSettings[K] extends boolean
		? K
		: never;
}[keyof ZimWikiLayoutSettings];

/** Cleans a typed folder path: trims spaces and surrounding slashes. */
function cleanFolderPath(text: string): string {
	const trimmed = text.trim().replace(/^\/+|\/+$/g, '');
	return trimmed ? normalizePath(trimmed) : '';
}

export class ZimWikiLayoutSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: ZimWikiLayoutPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.addToggle(
			containerEl,
			'folderNotes',
			'Folder notes',
			'Show a note and the folder of the same name beside it as one item. Selecting the folder opens the note.',
		);
		this.addToggle(
			containerEl,
			'interleavedSort',
			'Interleaved sort',
			'Sort files and folders together by name instead of listing folders first. Applies to the file name sort orders.',
		);
		this.addToggle(
			containerEl,
			'showOnlyNotes',
			'Show only notes',
			'Hide attachments and other non-Markdown files, and folders with no notes inside them.',
		);
		this.addToggle(
			containerEl,
			'showFolderCount',
			'Show folder count',
			'Show how many sub-pages each folder has.',
		);
		this.addToggle(
			containerEl,
			'pageAttachmentFolder',
			'Store attachments with the page',
			'Save pasted and dropped attachments in a folder named after the page, beside the note. Overrides the attachment location in Files and links.',
		);

		new Setting(containerEl)
			.setName('Hidden folders')
			.setDesc(
				'Folders hidden from the file explorer, along with everything inside them. Their notes still work for templates, links and search.',
			)
			.setHeading();

		this.renderHiddenFolders(containerEl);
		this.renderAddFolder(containerEl);
	}

	private addToggle(
		containerEl: HTMLElement,
		key: ToggleKey,
		name: string,
		desc: string,
	): void {
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings[key]).onChange(async (value) => {
					await this.plugin.updateSettings({ [key]: value });
				}),
			);
	}

	private renderHiddenFolders(containerEl: HTMLElement): void {
		const { hiddenFolders } = this.plugin.settings;
		if (hiddenFolders.length === 0) {
			new Setting(containerEl).setDesc('No folders are hidden.');
			return;
		}

		for (const path of hiddenFolders) {
			const exists = this.app.vault.getAbstractFileByPath(path) instanceof TFolder;
			new Setting(containerEl)
				.setName(path)
				.setDesc(exists ? '' : 'Folder not found in this vault.')
				.addExtraButton((button) =>
					button
						.setIcon('x')
						.setTooltip('Remove')
						.onClick(async () => {
							await this.plugin.updateSettings({
								hiddenFolders: hiddenFolders.filter((p) => p !== path),
							});
							this.display();
						}),
				);
		}
	}

	private renderAddFolder(containerEl: HTMLElement): void {
		let pending = '';

		const add = async () => {
			const path = cleanFolderPath(pending);
			const { hiddenFolders } = this.plugin.settings;
			if (!path || hiddenFolders.includes(path)) return;
			await this.plugin.updateSettings({
				hiddenFolders: [...hiddenFolders, path],
			});
			this.display();
		};

		new Setting(containerEl)
			.setName('Add folder')
			.addText((text) => {
				text.setPlaceholder('Folder path').onChange((value) => {
					pending = value;
				});
				new FolderSuggest(
					this.app,
					text.inputEl,
					() => this.plugin.settings.hiddenFolders,
					(folder) => {
						pending = folder.path;
						void add();
					},
				);
				text.inputEl.addEventListener('keydown', (evt) => {
					if (evt.key === 'Enter') void add();
				});
			})
			.addButton((button) =>
				button.setButtonText('Add').setCta().onClick(() => void add()),
			);
	}
}
