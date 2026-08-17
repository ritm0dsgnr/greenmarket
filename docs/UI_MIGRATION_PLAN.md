# План миграции вёрстки

## Зафиксированный legacy inventory

Проверены read-only артефакты:

- `.deploy/greenmarket-dist.tgz`;
- `dist/`;
- текущий `public/`;
- эталонный проект `S:\rampa\otel`.

В legacy archive и `dist` обнаружена только статическая Vite SPA-оболочка:
`index.html`, минифицированный React bundle, CSS, Manrope/Montserrat, SEO-файлы
и SVG-спрайт. React entry рендерит только `<main class="app"><h1>Green
Market</h1></main>`.

В артефактах не обнаружены готовые страницы каталога, товара, меню, слайдеры,
корзина, фильтры, формы или карточки товаров. Их нельзя реконструировать по
догадке и нельзя описывать как уже существующую вёрстку.

## Что переносится без изменения смысла

- Брендовый SVG-логотип и повторяемые UI-иконки через спрайт.
- Шрифты Manrope и Montserrat, если они остаются частью утверждённого бренда.
- Текущий canonical domain и SEO verification files после проверки владельцем.
- `robots.txt`, `sitemap.xml`, `verification.html`,
  `yandex_c06ed7d38e162ebf.html` как материалы для отдельной SEO-проверки.

`dist` и `.deploy` не являются source of truth для production-кода и не
должны публиковаться вместо Next.js приложения.

## Целевой подход к UI

Следовать подходу `S:\rampa\otel`, но не копировать его исходники:

- один смысловой React-компонент, один Sass-модуль или небольшой набор модулей
  для его изолированных состояний;
- BEM-подобные классы: `catalog-card`, `catalog-card__title`,
  `catalog-card--compact`;
- `is-*` только для визуального или интерактивного state, не для прав доступа;
- tokens, breakpoints, mixins и reset централизованы в `src/sass/assets`;
- повторяемые иконки подключаются через `<use href="/img/sprite.svg#icon-id">`;
- видимые изображения имеют размеры, осмысленный `alt` и responsive strategy;
- кнопка используется для действия, ссылка для навигации.

## Предлагаемая структура после утверждения дизайна

```text
src/
  app/
    (public)/
    catalog/
    product/
    articles/
  components/
    layout/
    navigation/
    catalog/
    content/
    ui/
  sass/
    assets/
    components/
    pages/
```

Структура является ориентиром. Новую папку или abstraction добавлять только
когда есть второй реальный потребитель, а не для гипотетического будущего.

## Порядок миграции

### 1. Подготовить входы дизайна

До реализации получить и зафиксировать:

- утверждённые desktop, tablet и mobile макеты либо явное описание экранов;
- список публичных страниц первой очереди;
- тексты, изображения, бренд-правила и SEO intent;
- поведение header, меню, модальных окон, sliders и forms;
- требования к доступности и поддерживаемым браузерам.

Если макета или поведения нет, компонент не выдумывается. Вопрос переносится в
`OPEN_DECISIONS.md` и не закрывается fake UI.

### 2. Сначала общий каркас

- Layout, container, typography, colours, focus state, header и footer.
- Mobile navigation только после описания её поведения и keyboard handling.
- Список иконок сверяется с потребителями. Повторяемая иконка добавляется в
  спрайт только после проверки SVG на активное содержимое.

### 3. Затем статические публичные страницы

- Главная и информационные блоки могут быть реализованы статически.
- Статьи, новости, акции и sliders получают реальные данные только после
  этапа WordPress. До него допустимы только утверждённые статические тексты
  и визуальные fixtures по разделу 1.3 `AGENTS.md`, не mock API и не
  вымышленные товарные данные, выдаваемые за production-каталог.
- Категории и товары создаются только после готовности публичного каталога.

### 4. Затем интерактивные элементы

- Фильтр, поиск, drawer, modal и carousel получают отдельные состояния
  loading, empty, error и keyboard interaction.
- Любое действие с данными, включая добавление в wishlist или корзину,
  ожидает серверный этап и не имитируется в frontend.

## Definition of Done для каждого UI-блока

- Сверка с утверждённым макетом на desktop, tablet и mobile.
- Semantic HTML, один понятный heading hierarchy, labels и landmarks.
- Полная keyboard navigation, видимый focus, закрытие modal по Escape и
  возврат focus к trigger.
- Нет horizontal scroll, кликабельных `div`, дублированных IDs и пустых
  интерактивных ссылок.
- Изображения не вызывают layout shift, декоративные SVG скрыты от
  accessibility tree, icon-only controls имеют accessible name.
- Sass ограничен блоком, не меняет unrelated components.
- Нет inline duplicate SVG paths, если значок повторяется в двух и более местах.
- Визуальная проверка, lint, typecheck, tests и production build пройдены.

## Отдельная SEO-приёмка

Перед публикацией нового маршрута проверить:

- стабильный URL и redirect plan, если изменяется существующий URL;
- `title`, `description`, canonical и один `h1`;
- Open Graph image и alt;
- sitemap и robots;
- response HTML без необходимости выполнить JavaScript для получения
  основного содержания страницы.
