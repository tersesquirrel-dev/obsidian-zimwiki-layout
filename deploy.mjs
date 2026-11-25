// Copy the built plugin files into an Obsidian vault.
// Vault defaults to the Notes vault next to this repo in the synced tree;
// override with the OBSIDIAN_VAULT environment variable.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const repo = dirname(fileURLToPath(import.meta.url));
const vault = resolve(process.env.OBSIDIAN_VAULT ?? join(repo, '..', '..', '..', 'Notes'));

if (!existsSync(join(vault, '.obsidian'))) {
	console.error(`Not an Obsidian vault: ${vault}\nSet OBSIDIAN_VAULT to the vault folder.`);
	process.exit(1);
}

const { id } = JSON.parse(readFileSync(join(repo, 'manifest.json'), 'utf8'));
const dest = join(vault, '.obsidian', 'plugins', id);
mkdirSync(dest, { recursive: true });

for (const file of ['main.js', 'manifest.json', 'styles.css']) {
	const src = join(repo, file);
	if (!existsSync(src)) {
		if (file === 'styles.css') continue;
		console.error(`Missing ${file}; run the build first.`);
		process.exit(1);
	}
	copyFileSync(src, join(dest, file));
	console.log(`Copied ${file}`);
}

console.log(`Deployed ${id} to ${dest}`);
