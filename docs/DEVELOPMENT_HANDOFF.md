# Пакет передачи Green Market в разработку

## Назначение

Этот документ является точкой входа для команды разработки. Он фиксирует
текущее состояние, границы системы, порядок работ и обязательные условия
приёмки. Цель: развивать проект как production-приложение, не заменяя
отсутствующие серверные функции временными данными, frontend-логикой или
обходами защиты.

## Что уже подготовлено

На 13 августа 2026 года локально подготовлен и проверен foundation:

- Next.js 16.3, React 19.2, TypeScript strict и Sass;
- базовые HTTP security headers и публичный `/api/health`;
- проверка production-конфигурации до старта;
- PostgreSQL migration tooling без неутверждённой схемы;
- ESLint, Vitest, production build и аудит зависимостей;
- единый SVG-спрайт и правила BEM-подобной вёрстки;
- профиль исходного Excel-прайса и план безопасного импорта;
- план миграции UI и поэтапный план разработки.

Это не готовый магазин. В репозитории нет базы данных с каталогом,
авторизации, админки, Excel-импорта, WordPress, загрузки товарных фото,
корзины, заявок, бонусов, 1С или production-развёртывания.

## Читать в таком порядке

1. [AGENTS.md](../AGENTS.md), обязательный контракт разработки.
2. [PROJECT_STACK.md](PROJECT_STACK.md), утверждённая архитектурная граница.
3. [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md), последовательность этапов и gates.
4. [UI_MIGRATION_PLAN.md](UI_MIGRATION_PLAN.md), миграция вёрстки.
5. [CATALOG_RFC.md](CATALOG_RFC.md), модель каталога до первой миграции.
6. [LOYALTY_MVP_RFC.md](LOYALTY_MVP_RFC.md), граница бонусного MVP и Telegram-кабинета.
7. [LOYALTY_TECHNICAL_SPEC.md](LOYALTY_TECHNICAL_SPEC.md), ТЗ для разработки бонусного контура.
8. [EXCEL_IMPORT_SPEC.md](EXCEL_IMPORT_SPEC.md) и [import/GREENMARKET_PRICE_V1_PROFILE.md](import/GREENMARKET_PRICE_V1_PROFILE.md), правила первого импорта.
9. [SECURITY_AND_QA_CHECKLIST.md](SECURITY_AND_QA_CHECKLIST.md), критерии проверки.
10. [OPEN_DECISIONS.md](OPEN_DECISIONS.md), решения владельца, без которых нельзя переходить к указанным этапам.
11. [DEPLOYMENT.md](DEPLOYMENT.md) и [CI_REQUIREMENTS.md](CI_REQUIREMENTS.md), условия staging и release.

## Целевая граница системы

```text
Excel .xlsx ---------------------\
                                  -> import service -> PostgreSQL -> Next.js API -> public site
Future 1C server integration ----/

WordPress headless -> Next.js server content layer -> public site

Application admin -> protected server actions/API -> PostgreSQL and product media storage
```

WordPress обслуживает только редакционный контент: статьи, новости, акции,
слайдеры, баннеры, SEO-поля и медиа этих материалов. Он не хранит каталог,
цены, остатки, товарные фото, заявки, корзину, бонусы или пользователей
приложения. WooCommerce не используется.

Excel и будущая 1С являются источниками для импорта, но не источниками данных
при открытии страниц сайта. Браузер не получает доступ к Excel, PostgreSQL,
1С, секретам или административным API.

## Неизменяемые правила

- Не подключать реальные сервисы, данные или production credentials раньше
  этапа, для которого утверждены схема, права, тесты и откат.
- Не применять моки, фиктивные успешные ответы, `localStorage`, статический
  JSON или frontend-расчёты как замену серверной бизнес-логики.
- Не допускать импорта, который автоматически присоединяет строку без названия
  к предыдущей строке, сопоставляет товары по похожему названию или удаляет
  отсутствующие позиции.
- Не передавать товарные фото через Excel или WordPress.
- Не делать схему PostgreSQL, пока не завершено согласование
  [CATALOG_RFC.md](CATALOG_RFC.md).
- Не подключаться к указанному хостингу и не выполнять deployment без
  отдельной задачи на проверку платформы или релиз.

## Как оформлять каждую задачу

До начала реализации автор задачи обязан указать:

1. Номер этапа из [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md).
2. Цель и границы изменений.
3. Какие данные входят, где хранятся, кто имеет доступ и как долго.
4. Серверные проверки прав, валидации и бизнес-расчёты.
5. Миграцию, обратную совместимость и план отката, если изменяется схема.
6. Негативные сценарии, автоматические тесты и ручную приёмку.
7. Условия staging и production release.

Если один из пунктов не определён и это влияет на безопасность, данные,
доступ или необратимые решения, реализация останавливается до решения
владельца проекта.

## Перед первым коммитом прикладной функции

- Перенести код в Git-репозиторий с защищённой основной веткой и review.
- Подключить обязательные checks из [CI_REQUIREMENTS.md](CI_REQUIREMENTS.md).
- Подготовить отдельные development, test, staging и production окружения.
- Проверить возможности хостинга по [DEPLOYMENT.md](DEPLOYMENT.md), не
  публикуя приложение.
- Закрыть решения, отмеченные как блокирующие в
  [OPEN_DECISIONS.md](OPEN_DECISIONS.md).

## Материалы, которые нельзя портить

- Исходный прайс расположен в `data/import/greenmarket-price-v1/`. Это
  read-only материал для профилирования и будущего контролируемого импорта,
  не test fixture и не файл для Git.
- `.deploy/greenmarket-dist.tgz` и `dist/` являются legacy-артефактами.
  Их нельзя удалять, распаковывать поверх текущего проекта или развёртывать
  как Next.js production-приложение.
- `public/robots.txt`, `public/sitemap.xml`, `public/verification.html` и
  `public/yandex_c06ed7d38e162ebf.html` требуют отдельной проверки при
  изменении домена, маршрутов или SEO.
