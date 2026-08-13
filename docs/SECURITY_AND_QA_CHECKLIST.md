# Security и QA checklist

## Обязательный check для каждой задачи

- [ ] Задача отнесена к конкретному этапу roadmap.
- [ ] Данные, owner, server boundary и retention определены.
- [ ] Нет новых секретов, PII в logs или client bundle.
- [ ] Валидация и authorization выполняются на сервере.
- [ ] Ошибки не раскрывают paths, SQL, stack traces, credentials или внутренние IDs.
- [ ] Изменение не добавляет фиктивный успешный ответ, незавершённый workaround,
  отключённую проверку или empty catch.
- [ ] Выполнены targeted tests, `npm run check` и dependency audit.
- [ ] Diff просмотрен, temporary files и debug code удалены.

## Database и migrations

- [ ] Есть versioned migration, review, staging run и backup.
- [ ] Оценены table locks, data loss, runtime compatibility и forward rollback.
- [ ] В базе есть constraints, а не только проверки frontend или TypeScript.
- [ ] Production migration не запускается с local workstation.
- [ ] Restore backup проверен отдельно.

## Import и загрузки

- [ ] Access разрешён только import manager или product media editor по server-side role.
- [ ] Extension, MIME, signature, size, archive limits и timeout проверяются.
- [ ] Файл хранится вне public directory под server-generated name.
- [ ] Excel не исполняет formulas, macros, links, code или external references.
- [ ] Preview не меняет каталог, confirmation связана с immutable preview revision.
- [ ] Нет auto-inheritance пустого name и fuzzy matching.
- [ ] Job lock, idempotency, transaction и audit проверены.
- [ ] Изображения проверены по фактическому формату и dimensions, SVG active content отклонён.
- [ ] Product images не меняются Excel import.

## Authorization и пользовательские данные

- [ ] Deny-by-default и object ownership проверяются server-side.
- [ ] Admin roles разделены по минимальным привилегиям.
- [ ] Session cookies имеют `HttpOnly`, `Secure` и подходящий `SameSite`.
- [ ] CSRF есть для cookie-based state-changing requests.
- [ ] Rate limiting есть для login, forms, recovery, search and external APIs.
- [ ] Phone, email, address, cookie, token и request body маскируются в logs.
- [ ] Data export, backup и temporary storage защищены не слабее основной базы.

## CMS и интеграции

- [ ] WordPress отделён от PostgreSQL приложения и не имеет его credentials.
- [ ] Публичный content API отдаёт только published approved fields.
- [ ] Внешние запросы имеют allowlist, timeout, response size limits and bounded retries.
- [ ] SSRF запрещён: пользователь не задаёт произвольный server request URL.
- [ ] Webhook имеет signature, timestamp and replay protection.
- [ ] External service outage не ломает public catalog pages.

## Public UI и SEO

- [ ] Semantic markup, keyboard navigation и visible focus проверены.
- [ ] Icon-only control имеет accessible name.
- [ ] Повторяющиеся icons используют проверенный sprite.
- [ ] `title`, `description`, canonical, `h1`, Open Graph and sitemap проверены.
- [ ] Public response не отдаёт admin controls, drafts, audit, raw import data or secrets.
- [ ] CSP сформирована по фактически утверждённым доменам WordPress и media до production.

## Release gate

- [ ] Code review и required CI checks прошли.
- [ ] Staging deployment, migration и smoke test завершены.
- [ ] `/api/health`, HTTP headers, main public routes and error responses проверены.
- [ ] Monitoring и alerting получают errors без sensitive payload.
- [ ] Есть rollback decision maker и проверенный путь rollback.
- [ ] В release report перечислены проверенные и непроверенные области.
