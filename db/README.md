# Database migrations

`node-pg-migrate` is the only supported way to change the application
PostgreSQL schema. Migration files live in `db/migrations/` (SQL only;
do not put README or other non-migration files there).

Design: [docs/catalog/MIGRATION_DESIGN.md](../docs/catalog/MIGRATION_DESIGN.md).
ADR: [docs/adr/0003-catalog-schema-stage-2.md](../docs/adr/0003-catalog-schema-stage-2.md).

## Rules

- Never run a migration against production from a local workstation.
- Do not put a real database URL in a command, shell history, Git, or issue.
  Supply `DATABASE_URL` through the protected environment configuration.
- Every migration must be reviewed, tested on staging, and assessed for locks,
  data loss, backward compatibility, and rollback before production.
- A failed migration blocks deployment. Do not alter production tables manually
  to work around it.
- After catalogue data exists on staging or production, prefer a forward
  corrective migration over `db:down`.

## Local database

```bash
docker compose -f docker-compose.dev.yml up -d
# wait until healthy, then:
export DATABASE_URL=postgresql://greenmarket:local-dev-only-change-me@127.0.0.1:55434/greenmarket
npm run db:up
```

Password above is a local placeholder from `.env.example`, not a production
secret. Change it in your private `.env` if needed.

Synthetic seed (optional, after migrate):

```bash
psql "$DATABASE_URL" -f db/seeds/catalog-synthetic.sql
```

## Staging

Schema changes are applied only through the GitHub Actions workflow
`Migrate staging` on `main`. See [DEPLOYMENT.md](../docs/DEPLOYMENT.md).

Before the first run on a host:

1. `ops/install-staging-postgres.sh` (root)
2. Point `greenmarket-staging.service` at `/etc/greenmarket/staging.env`
3. `ops/install-staging-deploy.sh` (root, updates migrate helper)
4. `Deploy staging`, then `Migrate staging`

The workflow never receives `DATABASE_URL`. The server reads it from the
EnvironmentFile, takes a pre-migrate dump, restore-probes it, then runs
`npm run db:up` from `/srv/greenmarket/current`.

## Commands

```bash
npm run db:create -- migration-name
npm run db:up
npm run db:down
```

`db:down` is for controlled non-production verification only.
