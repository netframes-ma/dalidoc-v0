# Frontend Architecture

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, React Hook Form, Zod.

## Structure

```txt
apps/web/src/app
apps/web/src/components/ui
apps/web/src/components/layout
apps/web/src/components/common
apps/web/src/features/*
apps/web/src/lib
apps/web/src/hooks
```

## Shared Components

```txt
AppShell, AppSidebar, ClinicSwitcher, Topbar, PageHeader, KpiCard, StatusBadge, EmptyState, DataTableCard, SearchInput, FilterBar, MedicalAlertBanner, PermissionGate
```

## Rules

- Pages compose feature components.
- API calls stay outside presentation components.
- Use typed props.
- Add loading/error/empty states.
- Use accessible buttons and labels.
