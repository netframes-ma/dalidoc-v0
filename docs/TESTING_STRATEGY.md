# Testing Strategy

Test status mappings, FDI generation, permissions, schemas, patient API, appointment API, tooth event flow, billing flow, and UI critical states.

E2E critical flow:

```txt
Create patient → appointment → odontogram → tooth event → dentist validation → treatment plan → invoice → payment
```

## Web Unit Tests

```bash
cd apps/web && npm run check   # typecheck + lint + Vitest
```

Covered today: tooth-event status transitions and invoiceable statuses, FDI
arch geometry and tooth names, chart diff and sparse storage, plan → act
mapping, the reference chart with pending drafts, the odontogram API rules
(roles, validation, rejection reasons, invoicing), i18n and preferences.
