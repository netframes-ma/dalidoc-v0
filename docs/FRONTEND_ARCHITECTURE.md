# Frontend Architecture

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, React Hook Form, Zod.

The web app lives in `apps/web` (Next.js 16, React 19, Tailwind CSS 4). See
`apps/web/README.md` to run it.

## Structure

```txt
apps/web/src/app                  routes (App Router)
apps/web/src/components/ui        shadcn/ui-style primitives (Radix + cva)
apps/web/src/components/layout    AppShell, AppSidebar, preference menus
apps/web/src/components/common    StatusBadge, MedicalAlertBanner, EmptyState, PermissionGate
apps/web/src/components/providers AppProviders (preferences, i18n, toasts)
apps/web/src/features/*           one folder per module (dental-chart first)
apps/web/src/lib                  utils, FDI helpers, permissions, preferences, i18n
apps/web/src/styles               engine theme bridge and the generated engine stylesheet
```

A feature folder holds `components/`, `hooks/`, `api/` (typed client),
`lib/` (pure, unit-tested logic) and `__tests__/`.

## Shared Components

```txt
AppShell, AppSidebar, ClinicSwitcher, Topbar, PageHeader, KpiCard, StatusBadge, EmptyState, DataTableCard, SearchInput, FilterBar, MedicalAlertBanner, PermissionGate
```

Built so far: AppShell (with the topbar and clinic chip), AppSidebar,
StatusBadge, MedicalAlertBanner, EmptyState, PermissionGate.

## Design Tokens

DaliDoc uses the MIRQAB token set, defined once in `apps/web/src/app/globals.css`
(Tailwind 4, CSS-first):

- colours as CSS variables on `:root` (`--bg`, `--fg`, `--card`, `--muted-fg`,
  `--border`, `--primary`, status colours, `--frame`, `--ink`, `--grid-dot`…)
  exposed to Tailwind through `@theme inline` (`bg-card`, `text-muted-fg`…);
- six brands through `data-brand` on `<html>` (teal by default);
- light/dark through `data-theme` on `<html>`, resolved before first paint;
- fonts: Inter, IBM Plex Mono, IBM Plex Sans Arabic (self-hosted with
  Fontsource);
- shapes: pill buttons, 1.25 rem cards, a grained dark bezel around one
  rounded panel, ink surfaces for what matters most.

Never hard-code colours in components; add a token instead.

## Third-party UI: the odontogram engine

React Advanced Odontogram ships a global stylesheet. It is adapted at
install/build time by `apps/web/scripts/scope-odontogram-css.mjs` into
`src/styles/vendor/odontogram.css` (git-ignored) and loaded in the
`odontogram` cascade layer, after Tailwind's base and before its utilities.
Its theme variables are mapped to DaliDoc tokens in
`src/styles/odontogram-theme.css`.

Inside the engine root, use `max-sm:hidden` rather than `hidden sm:block`: the
engine owns an `!important` `.hidden` class there.

## Internationalisation

French (default), English and Arabic (RTL). Strings live in
`src/lib/i18n/messages.ts`; French is the source and the type system makes
every other locale define every key. Use logical properties (`ms-`, `pe-`,
`start-`) so layouts mirror in Arabic. Dates and amounts (MAD) go through the
Intl formatters in `src/lib/i18n/format.ts`.

## Preferences

Locale, theme, brand (and the demo role) are stored in the
`dalidoc.prefs.v1` cookie so the server renders the right language and
direction on the first paint.

## Rules

- Pages compose feature components.
- API calls stay outside presentation components (feature `api/` + hooks).
- Use typed props.
- Add loading/error/empty states.
- Use accessible buttons and labels.
- Client-only libraries that touch `document` load through `next/dynamic`
  with `ssr: false` from a client component.
