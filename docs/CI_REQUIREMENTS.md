# Требования к Git и CI

## Текущий статус

В рабочей папке на момент передачи нет Git-репозитория и не выбран CI provider.
Поэтому этот документ задаёт обязательный minimum до первой прикладной функции
и любого deployment.

## Git policy

- Основная ветка защищена от прямого push.
- Каждый change проходит review хотя бы одним другим разработчиком.
- CI обязателен для merge.
- Lockfile коммитится вместе с намеренным изменением dependencies.
- Secrets, `.env`, imports и generated build artifacts не коммитятся.
- `data/import/**` остаётся локальным исходным материалом и не используется
  как test fixture.

## Required CI jobs

В environment с Node.js 24.x:

```bash
npm ci
npm run check
npm audit --audit-level=high --engine-strict
```

До подключения базы обязательны unit tests foundation. После появления базы,
imports, auth или integrations добавляются отдельные:

- migration tests against disposable PostgreSQL;
- integration tests;
- security-negative tests;
- E2E checks critical public and admin flows;
- secret scan;
- dependency license and vulnerability review.

## Required branch gates

- lint;
- TypeScript strict typecheck;
- unit and integration tests;
- production build;
- startup configuration validation;
- health check;
- dependency audit;
- migration check, если меняется `db/migrations`;
- secret scan;
- review approval.

## Release policy

- Package создаётся повторяемо из lockfile.
- Версия Node.js в CI, staging и production совпадает с `.node-version`.
- Сначала deploy и smoke test staging, затем production.
- Database migration и application rollout имеют documented order.
- Release без прошедших checks невозможен.
- Emergency change не отменяет security, backup, audit и post-release checks.
