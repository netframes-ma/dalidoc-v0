# API Specification

## Patients

```http
GET /api/patients
POST /api/patients
GET /api/patients/:id
PATCH /api/patients/:id
```

## Appointments

```http
GET /api/appointments
POST /api/appointments
POST /api/appointments/:id/confirm
POST /api/appointments/:id/reschedule
POST /api/appointments/:id/cancel
POST /api/appointments/:id/mark-arrived
POST /api/appointments/:id/complete
```

## Odontogram

```http
GET /api/patients/:patientId/odontogram
GET /api/patients/:patientId/teeth/:toothNumber
POST /api/patients/:patientId/tooth-events
POST /api/tooth-events/:id/validate
POST /api/tooth-events/:id/reject
POST /api/tooth-events/:id/amend
```

## Billing

```http
GET /api/invoices
POST /api/invoices
POST /api/invoices/from-treatment
POST /api/invoices/:id/payments
```

## Response Shape

```json
{ "data": {} }
```

Error:

```json
{ "error": { "code": "NOT_FOUND", "message": "Resource not found" } }
```
