# Changelog

## [Unreleased]

### Added

- `packages/react-advanced-odontogram`: React Advanced Odontogram built from
  upstream `main` plus five DaliDoc patches (scoped stylesheet with a layered
  variant, host-driven selection API, themeable material colours in the classic
  artwork, localized diagnosis names, accent-following tints), with `build.sh`
  and the patches ready for upstream pull requests.
- `apps/web`: Next.js 16 / React 19 / Tailwind CSS 4 front end with the
  DaliDoc (MIRQAB) design tokens, six brands, light/dark, FR/EN/AR (RTL).
- Odontogram workspace built on React Advanced Odontogram 2.5.0: lightbox
  chart, tooth drawer, assistant draft validation, timeline, plan chart →
  priced treatment plan, mark done, invoice, perio chart, FHIR/SVG/PNG export.
- Oval FDI arch navigator, workflow markers on the chart, role-based editing.
- Typed odontogram API client with an in-memory implementation and unit tests.
- ADR-0005: use React Advanced Odontogram for the dental chart (vendored fork).

### Changed

- The web app uses the vendored engine instead of npm 2.5.0: the install-time
  stylesheet rewrite, the DOM-based selection reading and the CSS colour
  overrides are gone in favour of the engine's own APIs and theme variables.
- Initial repository documentation pack.
- Product, architecture, beginner, API, database, and feature specs.
- ADR templates and GitHub contribution templates.
