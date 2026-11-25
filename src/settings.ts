import { App, normalizePath, PluginSettingTab, Setting } from 'obsidian';
import type ZimWikiLayoutPlugin from './main';

export interface ZimWikiLayoutSettings {
	/** Vault-relative folder paths hidden from the file explorer. */
	hiddenFolders: string[];
}

export const DEFAULT_SETTINGS: ZimWikiLayoutSettings = {
	hiddenFolders: ['Templates'],
};

/** Turns free text (one path per line) into clean, unique folder paths. */
export function parseFolderList(text: string): string[] {
	const paths = text
		.split('\n')
		.map((line) => line.trim().replace(/^\/+|\/+$/g, ''))
		.filter((line) => line.length > 0)
		.map((line) => normalizePath(line));
	return [...new Set(paths)];
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
				'Folders to hide from the file explorer, one path per line. Their notes still work for templates, links and search.',
			)
			.addTextArea((text) => {
				text
					.setPlaceholder('Templates')
					.setValue(this.plugin.settings.hiddenFolders.join('\n'))
					.onChange(async (value) => {
						await this.plugin.updateSettings({
							hiddenFolders: parseFolderList(value),
						});
					});
				text.inputEl.rows = 5;
			});
	}
}
