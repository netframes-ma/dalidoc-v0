# Security Policy

DaliDoc handles patient, billing, and health-related data. Security is mandatory.

## Never Commit

- real `.env` files
- passwords
- API keys
- OAuth tokens
- database dumps with patient data
- provider credentials

## Required Controls

- backend permissions
- clinic/tenant scoping
- input validation
- audit logs
- no sensitive data in logs
- secure file uploads
- safe calendar privacy

## Calendar Privacy Rule

Allowed external calendar title:

```txt
Rendez-vous dentaire — Cabinet Dentaire Atlas
```

Forbidden:

```txt
Root canal tooth 36
Extraction
Implant surgery
```

Frontend permissions are UX only. Backend permissions are real security.
