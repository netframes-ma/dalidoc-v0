# Backend Architecture

## Stack

Node.js, Fastify, TypeScript, Prisma, PostgreSQL, Redis, BullMQ.

## Module Structure

```txt
modules/patients/patients.routes.ts
modules/patients/patients.controller.ts
modules/patients/patients.service.ts
modules/patients/patients.repository.ts
modules/patients/patients.schemas.ts
modules/patients/patients.types.ts
```

## Responsibilities

Routes define endpoints. Controllers handle request/response. Services enforce business rules. Repositories query the database.

## Validation

Validate body, params, query, and environment variables.

## Audit

Audit sensitive actions like patient updates, appointment status changes, tooth events, prescription finalization, invoices, payments, WhatsApp messages, and calendar invites.
