# ZimWiki Layout

An Obsidian plugin that makes the file explorer behave like a [Zim](https://zim-wiki.org) notebook tree. In Zim every page can have sub-pages and attachments, and the tree shows pages, not files. This plugin brings that layout to an Obsidian vault without changing how your notes are stored.

A Zim page with sub-pages maps onto a note and a folder of the same name beside it:

```
Projects.md          ← the page
Projects/            ← its sub-pages and attachments
    Plan.md
    Plan/
        diagram.png
    Budget.md
```

## Features

Each feature can be turned on or off in **Settings → ZimWiki Layout**. All of them are on by default.

- **Folder notes:** a note and the folder of the same name beside it appear as one item. Selecting the folder's name opens the note and expands the folder. The arrow still expands and collapses it.
- **Interleaved sort:** files and folders are sorted together by name instead of folders first. This applies to the file name sort orders. Sorting by modified or created time keeps Obsidian's default.
- **Show only notes:** attachments and other non-Markdown files are hidden, along with folders that have no notes anywhere inside them.
- **Show folder count:** each folder shows how many sub-pages it has.
- **Store attachments with the page:** pasted and dropped attachments are saved in the folder named after the page, e.g. `Projects/Plan/diagram.png` for `Projects/Plan.md`. The folder is created when needed. This overrides the attachment location in **Settings → Files and links**. Turn it off to use Obsidian's own setting again.
- **Delete empty untitled notes:** when the last tab showing an empty `Untitled` note closes, or switches to another note, the note is moved to the trash, following your setting in **Settings → Files and links → Deleted files**. A note is kept if it has any text or a folder of sub-pages beside it. Only the English default names are recognised (`Untitled`, `Untitled 1`, ...).
- **Hidden folders:** folders listed here are hidden from the file explorer with everything inside them. Their notes still work for templates, links and search. `Templates` is hidden by default.

Pages are also shown brighter than plain folders: notes and folders with a folder note use the normal text colour, while folders without one are dimmed.

The plugin only changes how the file explorer shows the vault and where new attachments are saved. It never moves, renames or edits existing files (apart from trashing empty untitled notes), and turning it off restores Obsidian's default explorer.

## Compatibility

The file explorer and attachment changes rely on undocumented Obsidian internals, so an Obsidian update may break them until the plugin is updated. If the internals it needs are missing, the plugin leaves that part of Obsidian unchanged rather than failing.

Works on desktop and mobile. Requires Obsidian 1.6.6 or later.

## Installation

The plugin isn't in the community plugin list yet. To install it manually, copy `main.js`, `manifest.json` and `styles.css` from a [release](https://github.com/tersesquirrel-dev/obsidian-zimwiki-layout/releases), or from your own build, into `<Vault>/.obsidian/plugins/zimwiki-layout/`. Then reload Obsidian and enable **ZimWiki Layout** in **Settings → Community plugins**.

## Development

Requires Node.js 18 or later.

```sh
npm install
npm run dev      # rebuild on change
npm run build    # type-check and production build
npm run lint
```

Every successful build is copied into a vault automatically. The vault defaults to `Notes`, three folders above this repository; set `OBSIDIAN_VAULT` to use a different one. The copy is skipped in CI and when no vault is found. Run `npm run deploy` to copy the current build without rebuilding. Reload the plugin in Obsidian to pick up the new build.

To release, bump the version with `npm version patch` (or `minor`/`major`), then push the commit and tag with `git push --follow-tags`. The release workflow builds the plugin and creates a draft GitHub release with the files attached; publish it from GitHub.

## License

[0BSD](LICENSE)
