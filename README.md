# BetterMe Private Club — Check-In

Форма чек-іну на два заходи (Kyiv 15 серпня, Warsaw 29 серпня). Людина вводить кілька букв імені чи прізвища, обирає себе зі списку — список підтягується напряму з Google Таблиці, тож його можна редагувати без змін коду. Після чек-іну навпроти імені в таблиці зʼявляється статус "Checked In".

## Структура проєкту

- `index.html` — сторінка чек-іну для **Kyiv** (15 серпня).
- `warsaw/index.html` — та сама форма для **Warsaw** (29 серпня), окреме посилання.
- `style.css`, `script.js` — спільні для обох сторінок.
- `config.js` — сюди вставляється посилання на Google Apps Script (крок 2 нижче), спільне для обох подій.
- `apps-script/Code.gs` — код, який віддає список імен і записує чек-іни в Google Таблицю.

## Крок 1. Структура вкладки з іменами

Вкладка **"Private Club Kyiv | Registration (landing)"** у Google Таблиці має такі колонки:

| A (Ім'я) | B (Kyiv Check-in) | C (Kyiv Timestamp) | D (Warsaw Check-in) | E (Warsaw Timestamp) |
|---|---|---|---|---|
| Kateryna Smola | Checked In | 2026-08-03 12:04 | | |

- **Щоб додати нову людину** — просто впиши її ім'я в наступний порожній рядок колонки A. Зʼявиться в автозаповненні одразу (сайт щоразу підвантажує актуальний список).
- Колонки B–E скрипт заповнює сам під час чек-іну, вручну їх чіпати не треба.
- Якщо перейменуєш вкладку — онови значення `NAMES_SHEET_NAME` на початку [apps-script/Code.gs](apps-script/Code.gs).

## Крок 2. Підключи Google Таблицю

1. Відкрий свою Google Таблицю.
2. Меню **Розширення (Extensions) → Apps Script**.
3. Видали весь код-заглушку в редакторі та встав вміст файлу [apps-script/Code.gs](apps-script/Code.gs).
4. Збережи проєкт (значок дискети).
5. Натисни **Deploy → New deployment**.
   - Тип: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Натисни **Deploy**, підтверди дозволи (Authorize access) — це твій обліковий запис Google, тому все безпечно, доступ буде лише в скрипта до цієї таблиці.
7. Скопіюй отриманий **Web app URL** (виглядає як `https://script.google.com/macros/s/XXXXX/exec`).
8. Встав цей URL у файл [config.js](config.js) замість `PASTE_YOUR_WEB_APP_URL_HERE` — він один і той самий для обох сторінок (Kyiv і Warsaw).

Автоматично з'явиться вкладка **Responses** — лог усіх чек-інів (дата/час, ім'я, подія) про всяк випадок, окрім живого статусу в колонках B–E.

> Якщо потім зміниш код у Apps Script — треба зробити **Deploy → Manage deployments → Edit → New version**, інакше зміни не застосуються. URL при цьому лишається тим самим.

## Крок 3. Публікація на GitHub Pages

Після пушу в гілку `main` GitHub Pages сам перезбирає сайт (1-2 хв). Посилання:

- Kyiv: `https://katerynasmola.github.io/betterme-private-club/`
- Warsaw: `https://katerynasmola.github.io/betterme-private-club/warsaw/`

## Як це працює

1. При завантаженні сторінки `script.js` робить GET-запит до Apps Script і отримує актуальний список імен з колонки A.
2. Людина вводить кілька букв — список фільтрується на льоту.
3. Після вибору імені та натискання «Check In» дані (ім'я + подія — kyiv або warsaw, залежно від сторінки) відправляються на той самий URL з `config.js`.
4. Apps Script знаходить рядок з цим іменем і проставляє "Checked In" + час у відповідні колонки (Kyiv або Warsaw), а також дописує рядок у лог `Responses`.
