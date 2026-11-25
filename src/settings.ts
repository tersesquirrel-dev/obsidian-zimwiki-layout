import { App, normalizePath, PluginSettingTab, Setting, TFolder } from 'obsidian';
import type ZimWikiLayoutPlugin from './main';
import { FolderSuggest } from './ui/folder-suggest';

export interface ZimWikiLayoutSettings {
	/** Vault-relative folder paths hidden from the file explorer. */
	hiddenFolders: string[];
}

export const DEFAULT_SETTINGS: ZimWikiLayoutSettings = {
	hiddenFolders: ['Templates'],
};

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

		new Setting(containerEl)
			.setName('Hidden folders')
			.setDesc(
				'Folders hidden from the file explorer, along with everything inside them. Their notes still work for templates, links and search.',
			)
			.setHeading();

		this.renderHiddenFolders(containerEl);
		this.renderAddFolder(containerEl);
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
