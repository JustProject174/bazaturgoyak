# bazaturgoyak.ru — сайт базы отдыха «Золотые Пески»

Статический сайт базы отдыха на озере Тургояк (Челябинская область, г. Миасс).
Деплой: GitHub Pages. Домен: https://bazaturgoyak.ru

## Структура

- `*.html` — страницы сайта (общие шапка/футер подключаются из `header.html` / `footer.html`)
- `js/` — скрипты (`apply-config.js` — подстановка `window.CONFIG` в разметку, `booking-mode.js` — режим бронирования)
- `config.js`, `js/config.js` — сгенерированный конфиг (`scripts/generate-config.js` из `.env`)
- `images/`, `videos/`, `data/`, `docs/` — статические ресурсы
- `api/[[...path]].js` — серверлес-прокси к API бронирования (для Vercel-подобных хостингов; на GH Pages не работает)

## Режим бронирования

`CONFIG.bookingMode` (`BOOKING_MODE` в `.env` при генерации конфига):

- `placeholder` (текущий) — онлайн-бронь отключена: ссылки на виджет перехватываются,
  показывается заглушка с контактами (Telegram/MAX/телефон), вызовы API не выполняются.
- `live` — виджет и API работают как обычно.

Регенерация конфига: `node scripts/generate-config.js` (читает `.env`/`../.env.dev`).

## История

Выделено из монорепозитория `JustProject174/goldensandshotelservice`
(`services/golden-sands`) при консервации сервиса бронирования (октябрь 2026).
