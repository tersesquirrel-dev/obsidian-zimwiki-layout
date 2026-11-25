// Copy the built plugin files into an Obsidian vault.
// Vault defaults to the Notes vault next to this repo in the synced tree;
// override with the OBSIDIAN_VAULT environment variable.
// Runs after every build (see esbuild.config.mjs), or on its own via `npm run deploy`.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const repo = dirname(fileURLToPath(import.meta.url));

/** Copies the plugin into the vault. Returns an error message, or null on success. */
export function deploy() {
	const vault = resolve(process.env.OBSIDIAN_VAULT ?? join(repo, '..', '..', '..', 'Notes'));
	if (!existsSync(join(vault, '.obsidian'))) {
		return `Not an Obsidian vault: ${vault}\nSet OBSIDIAN_VAULT to the vault folder.`;
	}

	const { id } = JSON.parse(readFileSync(join(repo, 'manifest.json'), 'utf8'));
	const dest = join(vault, '.obsidian', 'plugins', id);
	mkdirSync(dest, { recursive: true });

	for (const file of ['main.js', 'manifest.json', 'styles.css']) {
		const src = join(repo, file);
		if (!existsSync(src)) {
			if (file === 'styles.css') continue;
			return `Missing ${file}; run the build first.`;
		}
		copyFileSync(src, join(dest, file));
	}

	console.log(`Deployed ${id} to ${dest}`);
	return null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const error = deploy();
	if (error) {
		console.error(error);
		process.exit(1);
	}
}
