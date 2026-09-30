# Migration design: каталог этапа 2

## Статус

Утверждено к реализации миграции `catalog-foundation` вместе с
[ADR-0003](../adr/0003-catalog-schema-stage-2.md) и обновлённым
[CATALOG_RFC.md](../CATALOG_RFC.md).

Импорт Excel, публичный API каталога, админка и media upload в эту миграцию
не входят.

## Цель

Создать пустую схему каталога в PostgreSQL приложения: сущности, constraints,
indexes и audit foundation. Без seed с коммерческими данными, без чтения
Excel в runtime, без FK на ещё не существующую таблицу сотрудников.

## Interim policy (закрывает OPEN_DECISIONS для схемы)

Владелец дал зелёный свет на этап 2. Пока нет отдельного product-решения,
схема фиксирует рабочие значения. Смена политики = новая migration + ADR,
не silent ALTER в проде.

| Вопрос | Working default этапа 2 |
| --- | --- |
| Товар без фото | `products.status = published` допускается при нуле `product_images`. Фильтр витрины на этапе 6. |
| Availability | `unknown` / `available` / `unavailable` / `expected`. Пустое Excel-наличие → `unknown`, не авто-publish offer. Сырой текст в `availability_note`. |
| Description | `description_owner`: `none` \| `editor` \| `import`. Черновик импорта только в `description_import_draft`. При `editor` импорт не трогает `description`. |
| Несколько offers | Один product → много `product_offers`. UX витрины на этапе 6. |
| Rename slug | `public_slug` unique. Redirect-таблица отложена. |

## Деньги, время, ID

- Деньги: `BIGINT` копейки (`price_minor`), не `float` / `money`.
- Время: `TIMESTAMPTZ`.
- Primary keys: `UUID`, `gen_random_uuid()`.
- Excel row / name / будущий GUID 1С не являются PK.

## Актор до этапа 4

Таблицы сотрудников ещё нет. Поля автора пишут opaque `actor_ref TEXT`
(например `system:seed`, `stage4:pending`). На этапе 4 заменяется FK на staff
отдельной migration.

## Таблицы

### `categories`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `parent_id` | `UUID` | NULL, FK → `categories(id)` |
| `source_key` | `TEXT` | NOT NULL, unique; ключ листа/адаптера |
| `public_slug` | `TEXT` | NOT NULL, unique |
| `name` | `TEXT` | NOT NULL |
| `sort_order` | `INTEGER` | NOT NULL, default 0 |
| `status` | `TEXT` | `active` / `archived` |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

### `products`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK, immutable |
| `category_id` | `UUID` | FK → `categories` |
| `public_slug` | `TEXT` | NOT NULL, unique |
| `name` | `TEXT` | NOT NULL |
| `latin_name` | `TEXT` | NULL |
| `description` | `TEXT` | NULL, опубликованный текст |
| `description_owner` | `TEXT` | `none` / `editor` / `import` |
| `description_import_draft` | `TEXT` | NULL |
| `status` | `TEXT` | `draft` / `published` / `archived` |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

Физическое удаление product импортом запрещено на уровне сервиса. В схеме
нет cascade delete от import jobs.

### `product_offers`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK, immutable |
| `product_id` | `UUID` | FK → `products` |
| `container_label` | `TEXT` | NULL |
| `size_label` | `TEXT` | NULL |
| `price_minor` | `BIGINT` | `>= 0` |
| `availability_status` | `TEXT` | см. interim policy |
| `availability_note` | `TEXT` | NULL |
| `active` | `BOOLEAN` | NOT NULL, default true |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

### `catalog_source_mappings`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `source` | `TEXT` | NOT NULL (`excel_greenmarket_price_v1`, позже `ones_c`) |
| `source_schema_version` | `TEXT` | NOT NULL |
| `product_id` | `UUID` | FK → `products` |
| `offer_id` | `UUID` | FK → `product_offers` |
| `source_fingerprint` | `TEXT` | NOT NULL |
| `source_sheet_name` | `TEXT` | NOT NULL |
| `source_row_number` | `INTEGER` | `> 0` |
| `mapping_status` | `TEXT` | `provisional` / `confirmed` / `conflict` / `retired` |
| `first_confirmed_at` | `TIMESTAMPTZ` | NULL |
| `last_seen_import_job_id` | `UUID` | NULL, FK → `catalog_import_jobs` |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

Partial unique: один `confirmed` mapping на
`(source, source_schema_version, source_fingerprint)`.

### `catalog_import_jobs`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `adapter_key` | `TEXT` | NOT NULL |
| `adapter_version` | `TEXT` | NOT NULL |
| `status` | `TEXT` | pipeline из EXCEL_IMPORT_SPEC |
| `file_checksum_sha256` | `TEXT` | NOT NULL, 64 hex |
| `original_filename_safe` | `TEXT` | NOT NULL, без path |
| `stored_object_key` | `TEXT` | NOT NULL, server random name |
| `summary_json` | `JSONB` | NOT NULL, default `{}` |
| `created_by_actor_ref` | `TEXT` | NOT NULL |
| `confirmed_revision` | `TEXT` | NULL |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

### `catalog_import_rows`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `import_job_id` | `UUID` | FK → `catalog_import_jobs` ON DELETE CASCADE |
| `sheet_name` | `TEXT` | NOT NULL |
| `row_number` | `INTEGER` | `> 0` |
| `decision` | `TEXT` | `add` / `update` / `unchanged` / `manual_review` / `skipped` / `error` |
| `validation_status` | `TEXT` | `ok` / `error` / `skipped` |
| `fingerprint` | `TEXT` | NULL |
| `raw_cells_json` | `JSONB` | NOT NULL, default `{}` |
| `safe_error_message` | `TEXT` | NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

### `media_files`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `storage_key` | `TEXT` | NOT NULL, unique |
| `content_sha256` | `TEXT` | NOT NULL, 64 hex |
| `byte_size` | `BIGINT` | `> 0` |
| `mime_type` | `TEXT` | allowlist raster |
| `width_px`, `height_px` | `INTEGER` | NULL или `> 0` |
| `status` | `TEXT` | `pending_scan` / `ready` / `rejected` / `deleted` |
| `created_by_actor_ref` | `TEXT` | NOT NULL |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

### `product_images`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `product_id` | `UUID` | FK → `products` |
| `media_file_id` | `UUID` | FK → `media_files` |
| `sort_order` | `INTEGER` | `>= 0` |
| `is_cover` | `BOOLEAN` | NOT NULL, default false |
| `alt_text` | `TEXT` | NOT NULL, default `''` |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

- Unique `(product_id, media_file_id)`
- Unique `(product_id, sort_order)`
- Partial unique: не более одного cover на product

### `catalog_change_audit`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `entity_type` | `TEXT` | NOT NULL |
| `entity_id` | `UUID` | NOT NULL |
| `action` | `TEXT` | NOT NULL |
| `actor_ref` | `TEXT` | NOT NULL |
| `import_job_id` | `UUID` | NULL, FK → jobs |
| `safe_payload` | `JSONB` | NOT NULL, default `{}` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

Append-only: приложение не обновляет и не удаляет строки.

## Индексы (кроме PK/unique)

- `products (category_id, status)`
- `product_offers (product_id) WHERE active`
- `catalog_source_mappings (product_id, offer_id)`
- `catalog_source_mappings (last_seen_import_job_id)`
- `catalog_import_jobs (status, created_at DESC)`
- `catalog_import_rows (import_job_id, decision)`
- `product_images (product_id, sort_order)`
- `catalog_change_audit (entity_type, entity_id, created_at DESC)`

## Locks и совместимость

Первая миграция на пустой базе: CREATE TABLE / INDEX, без rewrite больших
данных. Блокировки короткие. Приложение этапа 1 базу не читает: deploy
migration до кода импорта безопасен.

`db:down` только для local/test. После появления данных на staging/production
откат только forward corrective migration.

## Rollback

Down drop в порядке зависимостей. После seed/import на staging down не
использовать без отдельного решения владельца.

## Что не в этой миграции

- Excel adapter apply / preview service
- Staff / auth FK
- Object storage upload handlers
- Public catalog routes
- Loyalty tables (отдельный контур)
- Production seed из реального прайса
