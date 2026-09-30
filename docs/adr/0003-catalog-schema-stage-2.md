# ADR-0003: Схема каталога этапа 2

## Статус

Принято 28 сентября 2026 года после разрешения владельца начать этап 2.

## Контекст

Foundation (ADR-0001) подготовил PostgreSQL и `node-pg-migrate`, но не создавал
таблиц каталога. [CATALOG_RFC.md](../CATALOG_RFC.md) описывает сущности.
Этап 3 (Excel import) и этап 6 (публичный каталог) не могут стартовать без
зафиксированной схемы с immutable product/offer ID.

Часть product-политик ещё в [OPEN_DECISIONS.md](../OPEN_DECISIONS.md). Без
рабочих defaults схема блокируется. Владелец разрешил продолжить этап 2:
defaults зафиксированы в [MIGRATION_DESIGN.md](../catalog/MIGRATION_DESIGN.md)
и могут смениться только новой migration.

## Рассмотренные варианты

1. Отложить таблицы до полного закрытия OPEN_DECISIONS. Отклонено: этап 3 и
   staging DB стоят, а схема сама по себе не публикует товары.
2. Схема + сразу import apply. Отклонено: нарушает roadmap, нет auth.
3. Только entities RFC + interim policy в constraints. Выбрано.

## Решение

- Миграция `catalog-foundation` создаёт таблицы из CATALOG_RFC с колонками
  ownership/availability из MIGRATION_DESIGN.
- Local/dev PostgreSQL: отдельный `docker-compose.dev.yml`, порт `55434`,
  не смешивать с `greenmarket-core` на `55433`.
- `actor_ref TEXT` до этапа 4 вместо FK на staff.
- Money как `BIGINT` копейки. Slug format check. Один cover на product.
- Один confirmed mapping на fingerprint источника.
- Seed только синтетический, отдельным шагом; реальный прайс не в миграции.

## Границы данных и доступа

- Миграция не открывает публичный API каталога и не читает Excel.
- Fixtures UI остаются fixtures до этапа 6.
- Staging/production migration только через CI/deploy и `DATABASE_URL` из
  secret storage.
- WordPress не получает доступ к этим таблицам.

## Последствия

- Можно писать schema tests и готовить import preview на этапе 3.
- Смена availability/description/photo policy потребует ADR + migration.
- `db:down` допустим только local/test на пустых или disposable данных.

## Откат

До появления данных: `db:down` на disposable DB. После данных на staging или
production: только forward corrective migration.
