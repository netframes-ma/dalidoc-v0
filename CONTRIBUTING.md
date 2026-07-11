# Contributing

## Workflow

1. Pick a task from `docs/TASKS.md`.
2. Read the related spec.
3. Create a branch.
4. Implement a small change.
5. Run checks.
6. Update docs.
7. Open a pull request.

## Branch Naming

```txt
feature/patients-list
feature/agenda-week-view
feature/odontogram-arch
fix/sidebar-active-state
docs/update-api-spec
refactor/status-badges
test/patient-api
chore/update-dependencies
```

## Commit Messages

Use Conventional Commits:

```txt
feat(patients): add patient list page
fix(agenda): correct active route matching
docs(api): document tooth event endpoints
refactor(ui): extract status badge component
test(billing): add invoice payment tests
```

## Pull Request Checklist

- [ ] Related docs read
- [ ] Small focused change
- [ ] Lint/typecheck/build run or failure documented
- [ ] Tests added where relevant
- [ ] Screenshots for UI changes
- [ ] No secrets committed
- [ ] Docs updated when behavior changed
