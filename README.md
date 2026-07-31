# Запис на активність

Проста форма реєстрації: людина вводить кілька букв імені чи прізвища, обирає себе зі списку і підтверджує участь. Відповіді зберігаються у Google Таблиці.

## Структура проєкту

- `index.html`, `style.css`, `script.js` — сама форма.
- `data/names.js` — список імен для автозаповнення. **Щоб додати нову людину — просто додай рядок у цей файл.**
- `config.js` — сюди вставляється посилання на Google Apps Script (крок 2 нижче).
- `apps-script/Code.gs` — код, який приймає дані з форми і записує їх у Google Таблицю.

## Крок 1. Перевір список імен

Відкрий [data/names.js](data/names.js) — там масив `CLUB_MEMBERS`. Щоб додати людину, додай новий рядок у форматі `"Ім'я Прізвище",`. Змін одразу набувають чинності після завантаження на GitHub Pages (крок 3).

## Крок 2. Підключи Google Таблицю для збереження відповідей

1. Відкрий свою Google Таблицю: https://docs.google.com/spreadsheets/d/191mT44NnOUv-ZtmWOB2m_oCNUxR3cIjtvc-07JMTk5g/edit
2. Меню **Розширення (Extensions) → Apps Script**.
3. Видали весь код-заглушку в редакторі та встав вміст файлу [apps-script/Code.gs](apps-script/Code.gs).
4. Збережи проєкт (значок дискети).
5. Натисни **Deploy → New deployment**.
   - Тип: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Натисни **Deploy**, підтверди дозволи (Authorize access) — це твій обліковий запис Google, тому все безпечно, доступ буде лише в скрипта до цієї таблиці.
7. Скопіюй отриманий **Web app URL** (виглядає як `https://script.google.com/macros/s/XXXXX/exec`).
8. Встав цей URL у файл [config.js](config.js) замість `PASTE_YOUR_WEB_APP_URL_HERE`.

Після цього кроку в таблиці автоматично з'явиться нова вкладка **Responses**, куди будуть падати записи (дата/час + ім'я).

> Якщо потім зміниш код у Apps Script — треба зробити **Deploy → Manage deployments → Edit → New version**, інакше зміни не застосуються.

## Крок 3. Публікація на GitHub Pages

1. Закоміть та запуш зміни в репозиторій `betterme-private-club` (гілка `main`).
2. На GitHub: **Settings → Pages**.
3. Source: **Deploy from a branch**, гілка `main`, папка `/ (root)`.
4. Збережи — за хвилину сайт буде доступний за адресою на кшталт:
   `https://katerynasmola.github.io/betterme-private-club/`

## Як це працює

1. Людина вводить кілька букв — `script.js` фільтрує `CLUB_MEMBERS` і показує збіги.
2. Після вибору імені та натискання «Записатися» дані відправляються на URL з `config.js` (це і є Apps Script).
3. Apps Script дописує рядок у вкладку `Responses` твоєї Google Таблиці.
