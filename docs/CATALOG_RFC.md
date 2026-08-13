# RFC: модель каталога до первой миграции

## Статус

Предложение для согласования. Не является разрешением создавать таблицы или
писать import service до утверждения владельцем проекта.

## Проблема

Исходный Excel не имеет стабильного ID, меняет layout между листами и содержит
несколько offers для одного названия. Каталог должен пережить изменения
прайса, добавление ручных фотографий и будущую 1С без смены URL, корзины,
wishlist, истории заявок и внутренних связей.

## Решение

В PostgreSQL создаются отдельные сущности:

| Сущность | Назначение |
| --- | --- |
| `categories` | Дерево публичных и import-категорий |
| `products` | Стабильная карточка продукта с внутренним immutable ID |
| `product_offers` | Container, size, price, availability и другие продаваемые варианты |
| `catalog_source_mappings` | Связь internal IDs с Excel fingerprint и будущим 1С GUID |
| `catalog_import_jobs` | Статус, checksum, author, schema version и summary import |
| `catalog_import_rows` | Raw-safe evidence, validation result, preview decision и row location |
| `media_files` | Проверенный загруженный файл и его производные |
| `product_images` | Product-to-media связь, sort order, cover и alt |
| `catalog_change_audit` | Кто, когда и каким import/manual action изменил данные |

Имена таблиц являются целевым словарём. Точные columns, types, indexes и
constraints утверждаются в migration design review.

## Инварианты базы

- `products.id` и `product_offers.id` не меняются после создания.
- URL использует public slug, а не Excel row number, name или 1С GUID.
- Money хранится в `price_minor` либо точном `numeric`, не в float.
- `stock` и availability не вычисляются на клиенте.
- `product_images.product_id` ссылается только на существующий product.
- На один product есть не более одного `cover` image.
- `catalog_source_mappings` не допускает два active mappings одного источника
  и fingerprint к разным offer без явного conflict state.
- Удаление product по импорту запрещено. Допустимы archive или controlled
  deactivation.
- Каждое применённое изменение может быть связано с import job или
  авторизованным manual action.

## Предлагаемые поля

### `products`

```text
id, category_id, public_slug, name, latin_name, description,
status, created_at, updated_at
```

### `product_offers`

```text
id, product_id, container_label, size_label, price_minor,
availability_status, availability_note, active,
created_at, updated_at
```

### `catalog_source_mappings`

```text
id, source, source_schema_version, product_id, offer_id,
source_fingerprint, source_sheet_name, source_row_number,
mapping_status, first_confirmed_at, last_seen_import_job_id
```

### `product_images`

```text
id, product_id, media_file_id, sort_order, is_cover, alt_text,
created_at, updated_at
```

Raw Excel content, user-upload filename, import errors и details аудита не
должны попадать в public catalog response без отдельной необходимости.

## Миграционная стратегия

### До миграции

- Утвердить entity model, field ownership, roles, retention и public status policy.
- Создать staging PostgreSQL с отдельной минимально привилегированной role.
- Проверить backup and restore.
- Написать migration design: locks, indexes, forward rollback и совместимость
  с ещё не обновлённым приложением.

### Первая миграция

1. Создать tables, constraints, indexes и audit foundation.
2. Применить на чистой test DB.
3. Применить на staging.
4. Выполнить integration tests.
5. Только после этого разрешить код import preview.

Production rollback после появления данных обычно делается новой forward
corrective migration, а не неконтролируемым `db:down`.

## Политика field ownership

До 1С source owner для импортируемых полей: Excel adapter.
После включения 1С ownership меняется только по отдельному решению и migration
plan. WordPress никогда не получает ownership товарных цены, остатка,
container, offers или product images.

Manual product media editor может менять только media relation, cover, order
и alt. Import не может эти поля перезаписывать.

## Открытые детали для утверждения

- Публиковать ли товар без фото.
- Как именно показывать `нет в наличии`, ожидаемую поставку и архивные товары.
- Какие description and characteristics принадлежат Excel, а какие редактору.
- Нужны ли варианты товара на public page как отдельные purchasable offers.
- Правила slug при переименовании и допустимый redirect lifetime.

Эти вопросы перечислены также в [OPEN_DECISIONS.md](OPEN_DECISIONS.md).
