# Database Design

## Main Entities

```txt
Clinic, User, Role, Permission, Patient, MedicalAlert, Appointment, Odontogram, ToothRecord, ToothEvent, TreatmentPlan, TreatmentPlanItem, Invoice, InvoiceLine, Payment, Prescription, MessageTemplate, MessageLog, CalendarConnection, AppointmentCalendarEvent, InventoryItem, AuditLog
```

## Rules

- every clinic-owned table has `clinic_id`
- use Prisma migrations
- add indexes
- preserve clinical history
- do not hard-delete completed tooth events

## Statuses

Appointment: `requested`, `confirmed`, `arrived`, `in_chair`, `completed`, `cancelled`, `no_show`.

Tooth event: `draft`, `pending_validation`, `validated`, `rejected`, `cancelled`, `completed`, `invoiced`, `paid`.

Payment: `unpaid`, `partially_paid`, `paid`, `refunded`, `overdue`.
