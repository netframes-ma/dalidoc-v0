# ADR-0005 — Use React Advanced Odontogram for the dental chart

## Status

Accepted

## Context

The odontogram is the flagship screen (ADR-0004). Drawing clinically credible
teeth — caries per surface, fillings and their materials, endodontics, crowns,
bridges, implants, periodontal charting, a status chart and a plan chart — is
a large, specialised piece of work.

[React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)
(MIT, `react-advanced-odontogram` on npm) already provides it: an SVG chart
engine with FDI numbering, a Status/Plan dual chart, a periodontal chart,
HL7 FHIR R4 export/import, 12 UI languages including French and Arabic (RTL),
read-only mode, theme variables (`--odon-*`) and composable surfaces.

## Decision

Use React Advanced Odontogram as the charting engine of the odontogram
workspace, **built from upstream `main` plus DaliDoc patches and vendored in
`packages/react-advanced-odontogram`** (version `2.6.0-dalidoc.1`). npm only
has 2.5.0, which lacks APIs DaliDoc needs, and both 2.5.0 and upstream `main`
had defects a host app has to work around (see Patches). Fixing them at the
source, with tests, and sending each patch upstream beats carrying workarounds
in the app.

DaliDoc keeps ownership of everything around the drawing:

- the clinical workflow — tooth events, assistant drafts, dentist validation,
  timeline, linked appointment and invoice (`docs/features/odontogram.md`);
- persistence — the API stores the chart as a sparse diff of the engine's
  export format, plus the tooth events that explain every change;
- permissions — the engine's read-only mode is driven by DaliDoc's RBAC;
- the look — the engine is themed from DaliDoc's design tokens through its
  public `--odon-*` variables only.

The engine is wrapped by one module, `apps/web/src/features/dental-chart/engine/engine.ts`;
no other file calls its imperative API.

## Patches

`packages/react-advanced-odontogram/patches/` (applied with `git am` by
`build.sh`; each is a self-contained commit with tests, ready for an upstream
pull request):

1. The stylesheet no longer styles the host page: private `--_odon-*`
   variables, `.odon-hidden`, every selector scoped to the component and its
   `odon-*` popups, and `style.layer.css` (`@layer odontogram`).
2. Host-driven selection: `selectTeeth()`, `getActiveTooth()`,
   `onSelectionChange()`.
3. Material colours of the classic artwork read `--odon-rest-*` / `--odon-fill-*`.
4. Coded diagnoses in the tooltip and summary use the UI language.
5. Accent tints follow `--odon-accent` (plus `--odon-accent-fg`), and the
   dark-mode perio switch keeps its active state.

## Consequences

- The chart is the engine's two-row clinical grid, not a drawn oval. The oval
  open-mouth FDI arch required by the spec is kept as DaliDoc's arch
  navigator (overview, locator, and tooth picking for read-only roles).
- The engine is a page-level singleton: one chart per page (not patched).
- DaliDoc owns a fork until upstream releases the patches: rebuilding means
  `packages/react-advanced-odontogram/build.sh`; moving to a newer upstream
  means re-applying the patches. When upstream publishes them, depend on the
  npm package again and delete the folder.
- The vendored build is ~6.6 MB of JavaScript and CSS (source maps excluded),
  most of it lazy-loaded chunks (measured anatomy, PDF fonts, languages).
- The library is MIT licensed; `LICENSE` sits next to the build.
