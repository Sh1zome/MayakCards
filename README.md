# MayakCards

Сайт карточек для тестирования персонала **Маяк Арена** (Екатеринбург).

- Публичный список тестов и прохождение
- Вкладка **Изучение** — превью игр из [Mayak-GameList](https://sh1zome.github.io/Mayak-GameList/) (ВР / ВР Арена / Автосим)
- Скрытая админка `/#/admin` с полным редактором
- Результаты на почту через **FormToMail** (РФ)

## Запуск

```bash
npm i
cp .env.example .env   # заполните VITE_FORMTOMAIL_API_KEY
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Почта (FormToMail)

FormSubmit из РФ часто недоступен. Используется [formtomail.ru](https://formtomail.ru):

1. Зарегистрируйтесь и создайте API-ключ.
2. В настройках ключа укажите получателя `artemg.sadovnikovg.2004g@gmail.com`.
3. Добавьте в `.env`:

```env
VITE_FORMTOMAIL_API_KEY=ваш_ключ
```

4. Пересоберите / перезапустите `npm run dev`.

## Админка

1. Откройте `…/MayakCards/#/admin`.
2. Пароль по умолчанию: `MayakAdmin` (или `VITE_ADMIN_PASSWORD`).

## Публикация тестов (JSON)

1. В админке создайте/отредактируйте тесты.
2. **Экспорт JSON** → замените [`public/tests.json`](public/tests.json).
3. Закоммитьте и задеплойте GitHub Pages.

Черновик до деплоя хранится в `localStorage` браузера администратора.

## Каталог игр

Данные подтягиваются с raw GitHub Mayak-GameList:

- `client/public/vr.json` → **ВР**
- `client/public/arena.json` → **ВР Арена**
- `client/public/autosim.json` → **Автосим**

## Деплой

В [`vite.config.ts`](vite.config.ts): `base: '/MayakCards/'`.  
Маршруты через HashRouter (`/#/...`) для GitHub Pages.
