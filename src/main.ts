import { Plugin } from 'obsidian';
import { registerExplorerPatches } from './explorer';

export default class ZimWikiLayoutPlugin extends Plugin {
	onload() {
		registerExplorerPatches(this);
	}
}
