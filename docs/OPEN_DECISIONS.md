# Решения владельца, требующиеся до реализации

Этот список не является просьбой реализовать функции заранее. Он фиксирует
решения, которые нельзя безопасно принять за владельца проекта.

| Решение | Нужен до этапа | Владелец | Почему блокирует |
| --- | ---: | --- | --- |
| Проверенная платформа hosting, staging, Node 24.x, PostgreSQL, HTTPS, backup/restore, secret storage | 2 | Владелец проекта и DevOps | Нельзя безопасно запускать приложение или миграции |
| Git host, CI provider, branch protection и reviewer policy | 1 | Владелец проекта и tech lead | Нельзя обеспечить проверяемый delivery |
| Утверждённые макеты, список страниц и контент первой очереди | 1 | Владелец проекта и дизайнер | Legacy UI не содержит нужной вёрстки |
| Product and offer policy, out-of-stock, product without photo, archive status | 2 и 6 | Владелец каталога | Влияет на schema, import и public catalog |
| Ownership descriptions and characteristics | 2 и 3 | Владелец каталога и контент-редактор | Нельзя безопасно решить, что импорт имеет право перезаписывать |
| Модель auth, сотрудники, роли и порядок выдачи доступа | 4 | Владелец проекта | Нельзя строить admin access без threat model |
| Media storage provider, retention, image formats и лимиты | 4 | Владелец проекта и tech lead | Влияет на персональные и коммерческие данные, затраты и CDN |
| WordPress domain, hosting, update owner, content types и editor roles | 5 | Владелец контента | CMS должна быть отделена и поддерживаема |
| SEO domain strategy, конечные public URLs, redirect policy и sitemap ownership | 1 и 6 | Владелец проекта и SEO | Нельзя менять canonical или URL без плана |
| Состав forms, уведомления, privacy policy, consent и retention | 7 | Владелец проекта и юрист | Это персональные данные и внешние передачи |
| Политика бонусов, чеков, возвратов и списания: формат чека, возвраты, регламент личной проверки кассиром, Telegram-уведомления | L, после этапа 2 и защищённого доступа сотрудников | Владелец бизнеса | Ставки 5% и 10%, порог 150 000 ₽, округление, лимит, сроки, день рождения, списание по номеру в физической кассе, Telegram-кабинет и копия бонусной операции зафиксированы в `LOYALTY_MVP_RFC.md`; без оставшихся правил нельзя создавать финансовый ledger по предположению |
| Контракт 1С, minimal permissions, field ownership и switch-over | 8 | Владелец 1С и техлид | Нельзя сопоставлять данные или менять source без контракта |

## Рекомендованный порядок закрытия

1. Git/CI и хостинговый capability check.
2. Макеты и список UI первой очереди.
3. Правила каталога: product, offer, availability, publication, photos.
4. Auth and admin role model.
5. WordPress content model.
6. Forms, legal policy, bonuses and external integrations.

После каждого решения нужно обновить соответствующий RFC или specification, а
не передавать решение только устно.
