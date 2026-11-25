import { Plugin } from 'obsidian';
import { registerPageAttachments } from './attachments/page-attachments';
import { registerExplorerPatches } from './explorer';
import { setExplorerOptions } from './explorer/options';
import {
	DEFAULT_SETTINGS,
	ZimWikiLayoutSettings,
	ZimWikiLayoutSettingTab,
} from './settings';

export default class ZimWikiLayoutPlugin extends Plugin {
	settings!: ZimWikiLayoutSettings;
	private refreshExplorer: () => void = () => {};

	async onload() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ZimWikiLayoutSettings> | null,
		);
		this.applySettings();
		this.refreshExplorer = registerExplorerPatches(this);
		registerPageAttachments(this, () => this.settings.pageAttachmentFolder);
		this.addSettingTab(new ZimWikiLayoutSettingTab(this.app, this));
	}

	async updateSettings(changes: Partial<ZimWikiLayoutSettings>) {
		Object.assign(this.settings, changes);
		await this.saveData(this.settings);
		this.applySettings();
		this.refreshExplorer();
	}

	private applySettings() {
		setExplorerOptions(this.settings);
	}
}
