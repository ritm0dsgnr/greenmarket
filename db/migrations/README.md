# Database migrations

`node-pg-migrate` is the only supported way to change the application
PostgreSQL schema.

## Rules

- Never run a migration against production from a local workstation.
- Do not put a real database URL in a command, shell history, Git, or issue.
  Supply `DATABASE_URL` through the protected environment configuration.
- Every migration must be reviewed, tested on staging, and assessed for locks,
  data loss, backward compatibility, and rollback before production.
- A failed migration blocks deployment. Do not alter production tables manually
  to work around it.
- The migration directory is intentionally empty. The product and offer schema
  will be introduced only with the approved catalogue stage.

## Commands

```bash
npm run db:create -- add-catalog-tables
npm run db:up
npm run db:down
```

`db:down` is for controlled non-production verification only. A production
rollback plan may require a forward corrective migration instead of an
automatic down migration, especially after data has been written.
