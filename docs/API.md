# API (кратко)

Все защищённые эндпоинты требуют заголовок `Authorization: Bearer <JWT>`.
JWT выдаётся `POST /auth/login`.

База: `http://localhost:4000` (по умолчанию).

## Аутентификация

- POST `/auth/signup`
  - body: `{ email: string, password: string }`
  - 200: `{ id, email }`

- POST `/auth/login`
  - body: `{ email: string, password: string }`
  - 200: `{ access_token }`

## Я (профиль)

- GET `/me`
  - Возвращает текущего пользователя (по JWT).

## Rulesets

- GET `/rulesets/:userId`
  - Список правил пользователя.

- POST `/rulesets/:userId`
  - body: частичный `RuleSet` (в т.ч. `jsonLogic`).
  - Валидация `jsonLogic` через `jsonlogic-validator`.

- PUT `/rulesets/:id`
  - Обновление полей (при наличии `jsonLogic` — повторная валидация).

- DELETE `/rulesets/:id`

## Proposals

- GET `/proposals?status=DRAFT|SENT|ERROR`
  - Список предложений текущего пользователя.

- POST `/proposals/:id/feedback`
  - body: `{ thumb: 'UP'|'DOWN' }`

- POST `/proposals/:id/send`
  - Отправляет черновик через Upwork GraphQL (через `UpworkService`).

## Metrics

- GET `/metrics/summary?range=30d`
  - Сводка метрик за N дней.

- GET `/metrics/series?kind=sent|replies|wins&range=30d`
  - Ряды для графиков.

## Webhooks

- POST `/webhooks/...`
  - Сервис для внешних интеграций (Slack/Telegram/Zapier и т.д.).

## Upwork OAuth

- POST `/upwork-auth/...`
  - Получение/обновление токенов через `UpworkAuthService`.

## Замечания

- Реальная отправка в Upwork отключается флагом `UPWORK_MOCK=1`.
- В продакшене настраивается OTLP/Prometheus для метрик/трейсов.

