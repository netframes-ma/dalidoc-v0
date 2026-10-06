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

Use React Advanced Odontogram **2.5.0** as the charting engine of the
odontogram workspace. DaliDoc keeps ownership of everything around the
drawing:

- the clinical workflow — tooth events, assistant drafts, dentist validation,
  timeline, linked appointment and invoice (`docs/features/odontogram.md`);
- persistence — the API stores the chart as a sparse diff of the engine's
  export format, plus the tooth events that explain every change;
- permissions — the engine's read-only mode is driven by DaliDoc's RBAC;
- the look — the engine is themed from DaliDoc's design tokens.

The engine is wrapped by one module, `apps/web/src/features/dental-chart/engine/engine.ts`;
no other file calls its imperative API.

## Consequences

- The chart is the engine's two-row clinical grid, not a drawn oval. The oval
  open-mouth FDI arch required by the spec is kept as DaliDoc's arch
  navigator (overview, locator, and tooth picking for read-only roles).
- The engine is a page-level singleton: one chart per page.
- The package ships an unlayered global stylesheet. `apps/web/scripts/scope-odontogram-css.mjs`
  rewrites it at install/build time (renames its internal variables, drops
  `html`/`body`/`*` rules, scopes `select` and `.hidden`, wraps it in
  `@layer odontogram`). Upgrading the package means re-checking that script.
- 2.5.0 has no selection event, `getSelectedTeeth()` or selection-colour
  setter; DaliDoc reads the selection from the tiles' `.active` class and
  overrides the selection colour in CSS. Both have a public API from 2.6.0 —
  move to it when 2.6.0 is published on npm.
- Material colours of the classic artwork are hard-coded SVG stops; DaliDoc
  re-points the metal-ceramic ramp in CSS.
- The library is MIT licensed; its notice is kept in the generated stylesheet.
