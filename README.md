# DaliDoc

DaliDoc is a Moroccan dental clinic SaaS MVP focused on patients, agenda, odontogram, treatment plans, billing, prescriptions, WhatsApp reminders, calendar invitations, reports, and clinic settings.

## Flagship Feature

The strongest MVP screen is the **Schéma dentaire / Odontogram Workspace**: an oval FDI dental chart where dentists and assistants document tooth-level diagnosis, planned treatment, completed treatment, assistant drafts, dentist validation, notes, timeline, linked appointment, and linked invoice.

## Recommended Stack

| Layer | Technology |
|---|---|
| Web | Next.js App Router, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui, lucide-react |
| Backend | Node.js, Fastify, TypeScript |
| ORM / DB | Prisma, PostgreSQL |
| Queue | Redis, BullMQ |
| Auth-ready | OAuth2/OIDC, Ory Hydra-ready architecture |
| Integrations | WhatsApp provider, Google Calendar, Outlook, ICS fallback |
| Deploy | Docker Compose, Coolify-ready |

## Start Here

1. `docs/START_HERE.md`
2. `docs/BEGINNER_GUIDE.md`
3. `docs/LEARNING_REFERENCES.md`
4. `docs/PRODUCT_REQUIREMENTS.md`
5. `docs/ARCHITECTURE.md`
6. `docs/ROADMAP.md`
7. `docs/TASKS.md`

## Common Naming Conventions

- Root repository files use uppercase conventional names: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- Main docs use uppercase conventional names in `docs/`: `ARCHITECTURE.md`, `ROADMAP.md`, `TASKS.md`.
- Feature docs use kebab-case in `docs/features/`: `odontogram.md`, `agenda-and-calendar.md`.
- ADRs use numbered kebab-case in `docs/adr/`: `0001-use-modular-monolith.md`.
- GitHub templates live in `.github/`.
