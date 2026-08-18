# Передача разработчику: Green Market Core

## 1. Что нужно построить

Создать отдельный закрытый backend-репозиторий `greenmarket-core` для:

- бонусной программы;
- защищённой админки;
- Telegram-кабинета и уведомлений;
- будущего серверного каталога, Excel-import и товарных фотографий.

Public-сайт `greenmarket` и WordPress не владеют этими данными. Подробное
обоснование границы находится в
[ADR-0003](adr/0003-loyalty-core-service.md).

До создания схемы обязательно прочитать:

1. [AGENTS.md](../AGENTS.md);
2. [PROJECT_STACK.md](PROJECT_STACK.md);
3. [LOYALTY_TECHNICAL_SPEC.md](LOYALTY_TECHNICAL_SPEC.md);
4. [MIGRATION_DESIGN.md](loyalty/MIGRATION_DESIGN.md);
5. [CATALOG_RFC.md](CATALOG_RFC.md) и
   [EXCEL_IMPORT_SPEC.md](EXCEL_IMPORT_SPEC.md).

## 2. Репозитории и владельцы данных

| Система | Репозиторий и исполнение | Владеет | Не имеет права |
| --- | --- | --- | --- |
| Public-сайт | `greenmarket`, Next.js | публичные страницы и отображение | писать в PostgreSQL, выполнять бонусные операции, хранить Telegram token |
| Core API | `greenmarket-core/apps/api` | auth boundary, API, транзакции и PostgreSQL-доступ | отдавать админские credentials браузеру |
| Админка | `greenmarket-core/apps/admin` | кассовые экраны и просмотр данных через API | прямой доступ к PostgreSQL или Telegram |
| Worker | `greenmarket-core/apps/worker` | outbox и доставка Telegram-уведомлений | обработка browser-сессий, Telegram webhook или доступ к public UI |
| WordPress | отдельный контур | статьи, новости, баннеры, SEO и контентные медиа | каталог, бонусы, клиентов, заявки, PostgreSQL core |

## 3. Рекомендуемый стек Core

| Слой | Выбор | Назначение |
| --- | --- | --- |
| Runtime | Node.js 24.x LTS | единый поддерживаемый runtime |
| Язык | TypeScript strict | типы домена и API |
| Workspace | npm workspaces | `apps` и `packages` без дополнительного orchestration layer |
| HTTP API | Fastify + Zod | серверная валидация, auth boundary, rate limit |
| Админка | Next.js + React + TypeScript | защищённый web-интерфейс на отдельном origin |
| База | PostgreSQL | единственный источник истины бизнес-данных |
| Доступ к БД | `pg` | параметризованные запросы и транзакции |
| Миграции | `node-pg-migrate` | версионируемые schema changes |
| Фоновые задачи | PostgreSQL outbox и отдельный worker | Telegram после commit, без Redis в MVP |
| Тесты | Vitest, integration tests PostgreSQL, E2E админки | правила, миграции и критические сценарии |

Не использовать WooCommerce, WordPress-users, WordPress-таблицы, Excel как
runtime database, `localStorage` как источник истины или прямой browser-to-DB
доступ.

## 4. Структура Core

```text
greenmarket-core/
  apps/
    admin/                 Next.js administrative UI
    api/                   Fastify API and shared-auth gateway
    worker/                outbox delivery
  packages/
    domain/                pure loyalty calculations and policies
    contracts/             Zod schemas and API DTOs
    db/                    pg repositories, transactions, migrations
  docs/
    architecture/
    runbooks/
  docker-compose.dev.yml   local PostgreSQL only
```

`packages/domain` переносит L0 без HTTP, PostgreSQL, Telegram, secrets,
environment variables или browser APIs. Код сайта не импортирует этот пакет.

## 5. Где хранятся данные

| Данные | Хранилище | Кто читает и пишет |
| --- | --- | --- |
| Клиенты, бонусы, ledger, операции, аудит, Telegram links, outbox | PostgreSQL `greenmarket-core` | только API и worker с разными DB users |
| Сессии админки | серверная session store или PostgreSQL | только API/admin server |
| Пароль общего аккаунта | password hash в PostgreSQL, исходный пароль только в password manager | API проверяет hash, браузер не хранит пароль |
| Telegram token и webhook secret | secret storage или environment у API/worker | только соответствующий процесс |
| Фото товаров позднее | object storage | Core API, не Excel и не WordPress |
| Статьи и баннеры | отдельная WordPress database | WordPress и read-only server integration сайта |

Телефоны, Telegram ID, session identifiers, idempotency keys и технические
детали операции не попадают в URL, frontend analytics, обычные логи или
коммиты.

## 6. Общий вход в админку

В MVP есть одна человеческая учётная запись `loyalty_admin` для трёх
владельцев. Роль одна, иерархии нет. Это не заменяет отдельные технические
accounts сервисов.

В аудите хранится `performed_by_admin_account_id`, то есть общий аккаунт.
Система не должна показывать имя конкретного человека как подтверждённое
технически. Подробные ограничения и меры указаны в ADR-0003.

## 7. Критические серверные операции

### Кассовая операция

1. Админка отправляет защищённую команду с клиентом, суммой растений,
   признаком личного присутствия и idempotency key.
2. API проверяет сессию общего аккаунта, формат, rate limit, сумму и правило
   программы.
3. В одной PostgreSQL-транзакции API списывает подходящие партии, рассчитывает
   ставку и начисление, создаёт purchase, ledger, allocations, audit и outbox.
4. API возвращает безопасный server-generated operation ID и итоговый баланс.
5. Worker отправляет Telegram только после commit. Ошибка доставки не меняет
   ledger.

Номер и скан фискального чека не вводятся. Защита от дубля строится только на
idempotency key, который создаётся для одной попытки подтверждения и повторно
используется при retry.

### Telegram

- webhook принимает только API;
- проверяются HTTPS, webhook secret, допустимый update и уникальность
  `update_id`;
- контакт принимается только из личного диалога, если
  `contact.user_id === sender.id`;
- бот показывает данные только клиенту, уже связанному с `customer_id`;
- бот никогда не создаёт начисление, списание или корректировку.

## 8. Первые задачи разработчика

1. Подтвердить ADR-0003 с владельцем и создать закрытый `greenmarket-core`.
2. Поднять local/test/staging PostgreSQL, secret storage, backup и проверяемый
   restore.
3. Настроить CI: lint, typecheck, unit, PostgreSQL integration, migration
   smoke, dependency audit и secret scan.
4. Реализовать shared `loyalty_admin` authentication: password hash, secure
   sessions, rate limit, session revocation и audit account-level.
5. Провести review migration design, затем добавить только пустые,
   проверенные migrations.
6. Подключить `packages/domain`, клиентов и immutable ledger.
7. Реализовать админские кассовые сценарии без Telegram.
8. Добавить outbox, worker и Telegram после успешной staging-приёмки кассы.

## 9. Условия перехода к реальным миграциям

Нельзя создавать реальные таблицы или обрабатывать настоящие номера, пока не
готовы:

- staging PostgreSQL, backup и restore;
- secret storage;
- текст согласия, privacy policy, retention и удаление данных;
- утверждённый способ хранения и отзыва доступа к общему аккаунту;
- CI, monitoring, health checks и план forward rollback.

Возвраты и фискальные чеки не входят в MVP. Ошибки исправляются только
компенсирующей операцией с причиной. Исторические ledger-записи не редактируются
и не удаляются.
