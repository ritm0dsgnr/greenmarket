# Требования к Git и CI

## Текущий статус

Репозиторий находится в GitHub: `ritm0dsgnr/greenmarket`. Обязательные
проверки запускает GitHub Actions workflow
`.github/workflows/ci.yml`. Выпуск на staging запускается вручную через
`.github/workflows/deploy-staging.yml` только из ветки `main`.

Workflow deploy не выполняет миграции базы данных. Миграции требуют отдельной
задачи, backup, проверки rollback и явного решения о порядке развёртывания.
Production deploy намеренно не автоматизирован, пока не подготовлен отдельный
production-контур и не получено явное одобрение владельца.

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
- Staging deploy запускается вручную после успешной CI-проверки. У workflow
  нет произвольного удалённого shell-доступа: он передаёт архив через отдельную
  ограниченную SSH-учётную запись с фиксированной серверной командой.
- Database migration и application rollout имеют documented order.
- Release без прошедших checks невозможен.
- Emergency change не отменяет security, backup, audit и post-release checks.

## Как вести разработку и выпускать изменения

Обычная разработка выполняется локально. Staging нужен не для постоянной
разработки, а для проверки уже готовой версии в условиях, близких к production.

Обязательная последовательность для каждой задачи:

1. Создать отдельную ветку от актуальной `main`.
2. Реализовать изменение и проверить его локально. Минимум выполнить
   `npm run check`.
3. Открыть Pull Request в `main`.
4. Дождаться успешного workflow `quality` в GitHub Actions и пройти review.
5. Выполнить merge только после успешных обязательных проверок.
6. В GitHub Actions вручную запустить `Deploy staging` для `main`.
7. Проверить staging-сайт и `https://stage.greenmarket96.ru/api/health`,
   затем провести ручную приёмку изменения.
8. Production выпускать только отдельной будущей процедурой: на независимый
   production-сервер, после явного одобрения владельца и успешной приёмки
   staging.

Обычный staging deploy не выполняет миграции базы данных. Миграции, изменения
данных и другие необратимые операции требуют отдельной задачи, резервной копии,
плана отката и явного решения о выпуске.
