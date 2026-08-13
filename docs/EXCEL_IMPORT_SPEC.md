# Спецификация безопасного импорта Excel

## Граница

Поддерживаемый первый источник: `greenmarket-price-v1`, профиль которого
зафиксирован в [import/GREENMARKET_PRICE_V1_PROFILE.md](import/GREENMARKET_PRICE_V1_PROFILE.md).

Excel не является базой данных, runtime API и источником для браузера. После
успешного подтверждения сайт читает только PostgreSQL приложения.

## Модель каталога, которую создаёт импорт

Одна строка прайса с container и price обычно является offer, а не обязательно
самостоятельным товаром. Импорт работает с двумя уровнями:

- `product`: стабильная внутренняя карточка, категория, name, описательные
  характеристики и фотографии;
- `offer`: конкретные container, size, price, availability и source mapping.

Товарные фото принадлежат `product` и не изменяются импортом Excel.

## Идентификация без Excel ID

Приложение создаёт собственные immutable IDs. Excel ID не требуется.

Для повторного сопоставления adapter формирует server-only fingerprint:

```text
source schema version
+ logical category
+ normalized product name
+ normalized container
+ normalized offer size
```

Price, availability, tag и description не входят в offer fingerprint, чтобы
плановое обновление этих значений не меняло техническую связь. Fingerprint не
является public ID, не попадает в URL и не должен вычисляться в браузере.

Автоматическое обновление разрешено только при всех условиях:

1. В строке есть name и корректные обязательные поля.
2. Точный fingerprint связан ровно с одной ранее подтверждённой записью.
3. Для этой записи нет unresolved conflict.
4. Обновляемое поле принадлежит источнику Excel.

Если связь отсутствует, совпадений несколько, name изменился, container или
size изменились, либо строка неполная, preview предлагает только manual
decision. Fuzzy matching по названию, автоматическое объединение и
наследование name из предыдущей строки запрещены.

## Владение полями

| Поле | Владелец | Правило |
| --- | --- | --- |
| Внутренние IDs, URL, audit | Приложение | Excel и WordPress не изменяют |
| Name, category, offer price, container, size, availability | Excel сейчас, будущая 1С после switch-over | Изменяются только подтверждённым import |
| Описание и характеристики | Утверждается до этапа 3 | Нельзя молча затирать ручные изменения |
| Product images, cover, sort order, alt | Админка приложения | Excel не изменяет |
| Статьи, новости, sliders, banners, content SEO | WordPress | Не относятся к product import |
| Public status товара | Утверждается владельцем | Не выводить из одного отсутствия строки |

## Состояния import job

```text
uploaded -> parsed -> validated -> preview_ready
preview_ready -> confirmed -> applying -> applied
preview_ready -> rejected
any non-terminal state -> failed
```

`applied`, `rejected` и `failed` terminal. Изменение каталога разрешено только
в переходе `applying -> applied`.

## Обязательный pipeline

1. Авторизованный import manager загружает `.xlsx`.
2. Сервер проверяет extension, MIME, ZIP signature, отсутствие macro project,
   лимиты archive и структуру sheets.
3. Файл сохраняется вне public directory под случайным серверным именем.
4. Parser читает только values. Формулы, external links, embedded code и
   неожиданные sheets не исполняются.
5. Adapter приводит source cells к промежуточной модели v1.
6. Нормализатор приводит whitespace, Unicode, currency, price и разрешённые
   statuses к явным типам, сохраняя raw value для audit.
7. Validator проверяет обязательные поля, длины, диапазоны и duplicates.
8. Mapping service создаёт proposal: add, update, unchanged, manual review,
   skipped или error.
9. Менеджер изучает preview и подтверждает ровно его immutable revision.
10. Application service берёт import lock, транзакционно применяет допустимые
    изменения и создаёт audit records.
11. Сервис публикует summary без персональных данных и удаляет temporary file
    по retention policy.

## Защитные лимиты v1

Лимиты задаются только server-side configuration, валидируются при startup и
не меняются без review и теста:

| Проверка | Максимум |
| --- | ---: |
| Размер загружаемого файла | 5 MiB |
| Листов | 20 |
| Строк на лист | 5 000 |
| Колонок на лист | 64 |
| Непустых ячеек во всём файле | 100 000 |
| Длина одной текстовой ячейки | 10 000 символов |
| Размер распакованного XLSX | 50 MiB |
| Время parser/validation | 30 секунд |

Текущий файл укладывается в эти лимиты. Превышение ограничений завершает job
без изменения каталога и без stack trace в пользовательском ответе.

## Preview и ручное решение

Preview обязан показать:

- checksum, schema version, автора, время и номер revision;
- added, changed, unchanged, skipped, errors и manual review;
- sheet name, row number, field and safe message для каждой ошибки;
- before/after только для полей, доступных текущей роли;
- все потенциальные deactivations отдельно от обычных обновлений;
- предупреждение, что фото, cover, image order и alt не затрагиваются.

Строки без name из текущего файла должны быть показаны как manual review.
Менеджер может вручную сопоставить их с конкретным `product` или `offer`,
либо исключить. После ручного подтверждения решение сохраняется в mapping
audit. Импорт не может выполнять такой выбор скрыто.

## Частичный и полный импорт

`greenmarket-price-v1` по умолчанию является `partial update`.
Отсутствие товара в файле ничего не удаляет и не деактивирует.

`full snapshot` допускается только отдельной явно выбранной операцией:

- должен быть подтверждён scope листов и категорий;
- preview отдельно показывает deactivation count;
- требуется второе явное подтверждение менеджера с соответствующим правом;
- операция имеет backup, transaction strategy и rollback plan.

Физическое удаление товаров import service не выполняет.

## Ошибки и откат

- Ошибка upload, parse, validation или preview не меняет каталог.
- Ошибка при записи откатывает транзакцию и помечает job как `failed`.
- Ошибка очистки temporary file создаёт безопасный operational alert.
- Применённый import не отменяется удалением audit history. Исправление
  выполняется новым контролируемым import либо forward corrective operation.
- Два concurrent jobs не могут применять изменения одновременно.

## Обязательные тесты

- Новый product и новый offer.
- Update цены без смены internal ID и public URL.
- Повтор одного файла без duplicate rows.
- Два одинаковых fingerprints.
- Пустой name, price без name, name без цены, неверная цена и слишком длинная ячейка.
- Повреждённый xlsx, ZIP bomb, macro part, external link и превышение лимита.
- Partial update и full snapshot.
- Conflict двух import jobs.
- Rollback при ошибке базы.
- Сохранность product images после import.
- Ручное mapping и повторное использование подтверждённого mapping.
