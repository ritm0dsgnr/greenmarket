# Migration design: бонусный контур L

## Статус

Черновик для review. Не разрешает создавать SQL-миграции, seed с телефонами,
подключать Telegram или запускать кассовые операции.

Основание: [LOYALTY_TECHNICAL_SPEC.md](../LOYALTY_TECHNICAL_SPEC.md), раздел 8,
и [ADR-0002](../adr/0002-loyalty-circuit-l0.md).

## Зависимости, без которых миграция не пишется

1. Staging PostgreSQL, backup/restore и secret storage.
2. Модель сотрудников и ролей: `loyalty_cashier`, `loyalty_manager`,
   `application_administrator`. `created_by_staff_id` обязан ссылаться на
   реальную таблицу сотрудников, а не на свободную строку.
3. Текст согласия, privacy policy, retention и удаление данных.
4. Формат `receipt_reference`, область уникальности, правила возврата и
   спорной операции.

## Граница схемы

Контур L не ссылается на каталог, Excel, WordPress, корзину и 1С. Таблицы
бонусов живут в той же PostgreSQL-базе приложения, но без FK на товары.

Деньги: `BIGINT` в копейках, не `float` и не `money`. Бонусные баллы:
`INTEGER`, 1 балл = 100 копеек. Telegram user/chat ID: `BIGINT`, без потери
точности. Время: `TIMESTAMPTZ`, рабочие сутки `Asia/Yekaterinburg`
вычисляются в серверном коде.

## Таблицы

### `customers`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK, неизменяемый |
| `phone_normalized` | `TEXT` | E.164 `+7` и 10 цифр |
| `birth_month` | `SMALLINT` | `NULL` или 1..12 |
| `birth_day` | `SMALLINT` | `NULL` или существующий день, 29 февраля допустим |
| `status` | `TEXT` | `active` / `disabled` |
| `consent_version` | `TEXT` | NOT NULL |
| `consent_at` | `TIMESTAMPTZ` | NOT NULL |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | NOT NULL |

- Partial unique: одна активная запись на `phone_normalized`.
- Год рождения не хранится.
- Телефон не является PK и не возвращается публичным API.

### `loyalty_receipts`

| Колонка | Тип | Ограничения |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `receipt_reference` | `TEXT` | формат утверждается владельцем |
| `purchase_amount_minor` | `BIGINT` | `>= 0` |
| `eligible_plant_amount_minor` | `BIGINT` | `> 0` |
| `redeemed_bonus_minor` | `BIGINT` | `>= 0` и `<= 50%` суммы растений |
| `net_eligible_plant_amount_minor` | `BIGINT` | `eligible - redeemed` |
| `status` | `TEXT` | `posted` / `cancelled` |
| `created_by_staff_id` | `UUID` | FK на сотрудников |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

Повторный posted-чек не становится второй начисляющей операцией. Точная
область unique (`receipt_reference` глобально, по кассе или по дню)
блокируется до решения владельца.

### `loyalty_ledger_entries`

Неизменяемые записи: `accrual`, `redemption`, `refund`, `adjustment`.
Обязательны `customer_id`, `points_delta`, `policy_version`,
`idempotency_key`, `created_by_staff_id`. Исправление только новой
компенсирующей строкой со `reverses_entry_id`. Unique на
`idempotency_key`. Баланс считается из партий и ledger в одной транзакции;
кэш баланса не является источником истины.

### `loyalty_bonus_lots`

Партии `purchase` и `birthday`. Для покупки `available_at` — начало
следующего календарного дня, `expires_at` — тот же момент через год. Для
дня рождения партия доступна сразу и истекает через 14 дней. CHECK:
`consumed_points >= 0 AND consumed_points <= issued_points`.

### `loyalty_redemption_allocations`

Связь списания с партиями. Нужна для FIFO по ближайшему `expires_at`,
возврата и показа в Telegram.

### `loyalty_staff_actions`

Аудит регистрации, просмотра, начисления, списания, возврата и смены
Telegram-связи. `safe_metadata` без полного телефона, token и сырых update.

### `telegram_customer_links`

Одна активная связь `customer_id` ↔ `telegram_user_id`. Молчаливая замена
запрещена. Отвязка только менеджером с причиной.

### `loyalty_notification_deliveries`

Outbox после commit кассовой транзакции. Состояния: `pending`, `delivered`,
`failed`, `dead`. Unique на `(ledger_entry_id, channel)` так, чтобы одна
операция не создавала второе уведомление. В таблицу не пишутся token,
полный телефон и полный ответ Telegram.

## Транзакция кассы

В одной транзакции: проверка роли и присутствия, уникальность чека и
idempotency, списание партий, расчёт ставки от накопленного итога плюс
текущий net, вставка receipt/ledger/lots/allocations/audit. Строка outbox
создаётся в той же транзакции. Вызов Telegram только после commit. Сбой
бота не откатывает ledger.

## Индексы

- `customers (phone_normalized) WHERE status = 'active'`
- `loyalty_receipts (receipt_reference) WHERE status = 'posted'` после
  утверждения области уникальности
- `loyalty_ledger_entries (customer_id, created_at)`
- `loyalty_ledger_entries (idempotency_key)` unique
- `loyalty_bonus_lots (customer_id, expires_at) WHERE consumed_points < issued_points`
- `telegram_customer_links (telegram_user_id) WHERE status = 'active'`
- `loyalty_notification_deliveries (state, created_at)`

## Backup, совместимость, откат

- Перед первой миграцией: проверенный backup и restore на копии staging.
- Пока данных нет, допустим `db:down` на non-production.
- После первой реальной операции откат только forward-миграцией. Down,
  удаляющий ledger, запрещён.
- Релиз приложения, которое пишет в новые таблицы, идёт после миграции.
  Откат приложения на версию без контура L безопасен, пока нет записи в
  таблицы; после записи старое приложение не должно молча игнорировать
  ограничения уникальности.

## Вне этой миграции

Auth-cookie, CSRF, rate limit, webhook secret, тексты бота и UI кассы.
Их нельзя подменить L0-функциями.
