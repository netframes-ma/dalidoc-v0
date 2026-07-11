# Architecture

## Style

Start as a modular monolith. Do not start with microservices.

## High-Level Flow

```txt
Next.js Web → Fastify API → PostgreSQL/Prisma → Redis/BullMQ → External Providers
```

## Frontend Flow

```txt
Page → Feature Component → Hook → API Client → Backend
```

## Backend Flow

```txt
Route → Auth → Clinic Context → Permission → Controller → Service → Repository → Prisma
```

## Modules

```txt
auth, clinics, users, patients, appointments, dental-chart, treatment-plans, billing, prescriptions, communication, calendar, inventory, reports, audit, sync, backup
```

## Provider Pattern

Use interfaces for WhatsApp, Calendar, Storage, PDF, and Payment providers.

## Rules

- every clinic-owned entity is scoped by clinic ID
- backend permissions are mandatory
- clinical history is preserved
- calendar titles are privacy-safe
- secrets stay outside Git
