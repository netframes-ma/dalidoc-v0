# DaliDoc web

Next.js App Router front end for DaliDoc. The first module built is the
**Schéma dentaire / odontogram workspace**, on top of
[React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram),
vendored with DaliDoc's patches in `packages/react-advanced-odontogram`
(see `docs/features/odontogram.md` and ADR-0005). After rebuilding that
package, refresh the copy here: `rm -rf node_modules/react-advanced-odontogram && npm install`.

## Run

```bash
cd apps/web
npm install        # copies ../../packages/react-advanced-odontogram into node_modules
npm run dev        # http://localhost:3000 → redirects to a demo patient
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript) |
| `npm test` | Vitest unit tests |
| `npm run check` | typecheck + lint + tests |

Node 20 or later.

## Demo

There is no backend yet: `src/features/dental-chart/api/mock-dental-chart.api.ts`
implements the odontogram endpoints in memory, with the backend's rules
(permissions, status transitions, invoiceable statuses). Data resets on reload.

Three fictional patients are seeded (`/patients/pt-1042/odontogram`,
`pt-0877`, `pt-1203`). Use the account menu (top right) to sign in as another
role: an assistant's charting goes to validation, a dentist validates or
rejects it, front desk and accounting read.

The language (FR / EN / AR), theme and brand colour menus sit next to it.

## Layout

```txt
src/app                       routes: / → /patients/[patientId]/odontogram
src/components                ui primitives, layout, shared components, providers
src/features/dental-chart     the odontogram workspace (components, engine, hooks, lib, api)
src/lib                       FDI, permissions, preferences, i18n, utils
src/styles                    engine theme bridge (public --odon-* variables)
```
