# react-advanced-odontogram (DaliDoc build)

[React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)
by Zoltán Dul, MIT licence (see `LICENSE`), built from upstream `main` at
`f3d80c4` plus the patches in `patches/`. DaliDoc's web app depends on this
folder instead of the npm package (`apps/web/package.json`).

Why a fork: npm only has 2.5.0, and DaliDoc needed fixes upstream did not have
yet. Each patch is a self-contained commit with tests, written to be sent
upstream as a pull request. When upstream has released them, go back to the npm
package and delete this folder.

## Patches

| # | Patch | What it fixes |
|---|---|---|
| 1 | `fix(styles): keep the stylesheet inside the odontogram` | `style.css` styled the host page (`html`/`body`/`*`, global `select`, an `!important` `.hidden`, short theme variables like `--bg`/`--card`/`--accent` on `:root`). Now private `--_odon-*` variables, `.odon-hidden`, every selector scoped to the component and its `odon-*` popups, plus `style.layer.css` (`@layer odontogram`). |
| 2 | `feat(selection): selectTeeth, getActiveTooth and onSelectionChange` | A host could not set the selection, read the active tooth, or follow the selection without reacting to every chart edit. |
| 3 | `feat(theme): material colours of the classic artwork read --odon-rest-*/--odon-fill-*` | Material colours were themeable only under the "measured" anatomy. |
| 4 | `fix(i18n): coded diagnoses in the summary use the UI language` | Tooltips and the summary showed ICD-10 titles in English in every language. |
| 5 | `fix(theme): accent tints follow --odon-accent` | ~100 tints and focus rings were hard-coded blue/green and ignored the theme accent; adds `--odon-accent-fg` for text on solid-accent controls. |

Upstream also already has, compared with npm 2.5.0: `getSelectedTeeth()`,
`setSelectionColor()` / `setSelectionBorderStyle()`, `compareExams()` and the
lazy-loaded measured anatomy.

Still open upstream (not patched here): one chart per page (the engine is a
module singleton).

## Rebuild

```bash
packages/react-advanced-odontogram/build.sh   # clone, apply patches, test, build, copy dist/
cd apps/web && rm -rf node_modules/react-advanced-odontogram && npm install   # refresh the copy
```

`SKIP_TESTS=1` skips the library's test suite (~2,300 tests, ~17 min).
Source maps are not vendored. To change a patch: clone upstream, check out
`f3d80c4`, `git am patches/*.patch`, edit, then
`git format-patch f3d80c4.. -o packages/react-advanced-odontogram/patches`,
bump `version` in `package.json` and run `build.sh`.
