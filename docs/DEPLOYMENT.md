# Предварительные условия развёртывания

Этот документ описывает требования к развёртыванию production-приложения. Он не
даёт разрешения на изменение хостинг-аккаунта или сервера.

## Требования к платформе

Целевое окружение должно предоставлять:

- Node.js 24.19.0 или более новый релиз ветки 24.x LTS и постоянный process
  manager;
- reverse proxy, который завершает HTTPS и перенаправляет запросы в
  приложение, не открывая Node.js-порт в интернет;
- поддерживаемый PostgreSQL, доступный только из сети приложения;
- отдельные конфигурации development, staging и production;
- шифрованные резервные копии с проверенным восстановлением;
- место для хранения секретов вне Git и архивов развёртывания;
- хранение и мониторинг логов без credentials и персональных данных.

Наличие SSH-учётной записи само по себе не подтверждает эти возможности.
Статический или shared-PHP-only тариф не может безопасно запускать это
приложение. Если существующий хостинг не соответствует требованиям, Next.js и
PostgreSQL нужно развернуть на подходящем VPS или managed-платформе, а WordPress
на этапе контента оставить отдельным.

Требуемая версия Node.js зафиксирована также в `.node-version` и проверяется
через `.npmrc`. Текущий системный Node.js 20.18.0 ниже требования проекта и не
должен использоваться для установки, сборки или релиза.

## Production-конфигурация

Для production-запуска требуются server-side переменные:

```dotenv
DATABASE_URL=postgresql://application_user:password@database-host:5432/greenmarket
APP_BASE_URL=https://example.invalid
```

Реальные значения размещаются только в secret store хостинга или защищённой
конфигурации окружения. Нельзя коммитить их, передавать в чат или помещать в
клиентские переменные. `APP_BASE_URL` должен быть финальным HTTPS-origin без
пути.

В репозитории хранится только `.env.example`. Поддерживаемый запуск production:

```bash
npm run start
```

Эта команда проверяет обязательную конфигурацию до запуска Next.js. Прямой
`next start` также проверяет конфигурацию, поэтому не может обойти требование.
Поддерживаемый startup-скрипт привязывает Next.js только к `127.0.0.1`.
Публичный HTTP(S)-доступ предоставляет reverse proxy. Нельзя открывать порт
Node.js напрямую в интернет или заменять этот reverse proxy временным
пробросом порта.

## Условия первого релиза

До первого staging- или production-релиза необходимо:

1. Провести review изменений и выполнить `npm run check`.
2. Запустить аудит зависимостей и устранить либо оценить все найденные
   проблемы.
3. Создать роль PostgreSQL с минимальными правами и проверить TLS и сетевые
   настройки выбранного провайдера базы.
4. Настроить реальные секреты только в целевом окружении.
5. Сначала выполнить проверенные миграции на staging, имея backup и план
   отката.
6. Развернуть приложение за HTTPS.
7. Проверить `/api/health`, публичную страницу, security headers и логи
   приложения.
8. Определить и протестировать Content Security Policy после утверждения
   конечных доменов WordPress и медиа. До этого не публиковать контентные
   интеграции.

Нельзя выкладывать локальную папку `dist` или архив старой статической сборки
как production-приложение Next.js.

## Staging deploy через GitHub Actions

Staging deploy запускается вручную из GitHub Actions workflow `Deploy staging`
и только из ветки `main`. Он повторно выполняет обязательные проверки, передаёт
исходный архив на staging через отдельную ограниченную SSH-учётную запись,
собирает release под непривилегированным пользователем и проверяет
`https://stage.greenmarket96.ru/api/health`.

В GitHub Environment `staging` хранятся: secret `STAGING_DEPLOY_KEY` и
нечувствительные variables `STAGING_SSH_HOST`, `STAGING_SSH_USER`,
`STAGING_SSH_KNOWN_HOSTS`. Реальные значения не хранятся в Git, workflow
логах или документации. SSH host key фиксируется в `STAGING_SSH_KNOWN_HOSTS`,
поэтому workflow не принимает новый ключ сервера автоматически.

У deploy-учётной записи нет интерактивной shell-сессии и широких sudo-прав.
Она может только передать архив в root-owned receiver script и перезапустить
конкретный staging service. Доступ к production-серверу, production-секретам и
production-базе этот workflow не получает.

Миграции не включаются в автоматический staging deploy. Отдельный workflow
`Migrate staging` применяет schema через ту же ограниченную SSH-учётную запись.

## Staging migrate через GitHub Actions

Workflow `Migrate staging` запускается вручную только из `main` и только после
того, как на сервере установлены обновлённые ops-скрипты и доступна база.

Порядок первого включения:

1. На staging VPS от root один раз: `ops/install-staging-postgres.sh`.
   Скрипт поднимает локальный PostgreSQL (если его ещё нет), создаёт роль и
   базу `greenmarket_staging`, пишет `/etc/greenmarket/staging.env` с
   `DATABASE_URL` и `APP_BASE_URL`. Пароль в Git и логи не попадает.
2. В unit `greenmarket-staging.service` указать
   `EnvironmentFile=-/etc/greenmarket/staging.env`, затем
   `systemctl daemon-reload && systemctl restart greenmarket-staging`.
3. От root: `ops/install-staging-deploy.sh '<deploy public key>'` — ставит
   migrate helper и обновляет sudoers/ForceCommand dispatcher.
4. В GitHub Actions: `Deploy staging` из `main` (в `current` должны лежать
   `db/migrations`).
5. В GitHub Actions: `Migrate staging` из `main`.

Что делает migrate на сервере:

1. Читает `DATABASE_URL` только из `/etc/greenmarket/staging.env`.
2. Проверяет доступность PostgreSQL. Если базы нет — падает с явной ошибкой
   и отсылкой к `install-staging-postgres.sh`.
3. Делает `pg_dump` в `/srv/greenmarket/backups/pre-migrate-*.dump`.
4. Проверяет restore этого dump во временную базу, затем удаляет её.
5. Запускает `npm run db:up` от пользователя приложения из
   `/srv/greenmarket/current`.
6. Проверяет наличие таблиц catalog-foundation и `pgmigrations`.
7. Не печатает connection string и не принимает произвольные remote commands:
   SSH ForceCommand допускает только пустую команду (deploy по stdin) или
   буквальную `migrate`.

Повторный `Migrate staging` идемпотентен для уже применённых миграций.
`db:down` через workflow не выполняется. После появления данных откат только
forward corrective migration или восстановление из backup вручную ops-доступом.

В GitHub Environment `staging` для migrate используются те же
`STAGING_DEPLOY_KEY`, `STAGING_SSH_HOST`, `STAGING_SSH_USER`,
`STAGING_SSH_KNOWN_HOSTS`. Отдельный `DATABASE_URL` в GitHub secrets не нужен
и не должен туда копироваться.
