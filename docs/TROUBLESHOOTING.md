# Troubleshooting

## Prisma client missing

```bash
pnpm prisma generate
```

## Tailwind not working

Check content paths and global CSS import.

## Multiple sidebar items active

Avoid weak `pathname.includes()` matching. Use explicit route matching.
