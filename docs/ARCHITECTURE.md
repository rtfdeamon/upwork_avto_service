# Архитектура

Проект — монорепозиторий с тремя приложениями и инфраструктурой.

## Компоненты

- API (`apps/api`, NestJS)
  - Аутентификация (`/auth`), JWT-гард (`JwtAuthGuard`).
  - Управление rulesets (`/rulesets`), валидация через JSONLogic (`apps/api/src/utils/jsonlogic-validator.ts`).
  - Метрики (`/metrics`), плановые задачи Cron для агрегаций.
  - Отправка предложений (`/proposals/:id/send`) через `UpworkService`.
  - Stripe-биллинг (`/billing`).
  - Обработка вебхуков (`/webhooks`).
  - TypeORM подключение к Postgres, миграции в `apps/api/src/migrations`.

- Worker (`apps/worker`)
  - Поллинг вакансий из Upwork (`poller.ts`, `lib/upwork.ts`) → публикация задач в SQS.
  - Генерация черновиков через OpenAI (`ai/openaiClient.ts`) → сохранение в БД.
  - Обработка событий активности (`activity-feed.ts`).
  - Поддержка Redis для дедупликации и простого rate limiting по токенам OpenAI.

- Web (`apps/web`, Next.js)
  - Дашборд: обзоры, конверсии, черновики, rulesets, ключи API.
  - Использует API для получения данных; примеры страниц в `apps/web/pages/dashboard/*`.

- Infra (`infra`, Terraform/Terragrunt)
  - SQS очереди, роли/политики IAM, Lambda, EventBridge расписания.
  - RDS (Postgres), ALB для API, S3 (статические ассеты), мониторинг (Prometheus, Tempo, Grafana).

## Потоки данных (вкратце)

1. Worker-поллер по ключам пользователей обращается к Upwork JobSearch, фильтрует и выдаёт новые вакансии в SQS (`JOBS_QUEUE_URL`).
2. Handler черновиков получает сообщения из `JOBS_QUEUE_URL`, генерирует черновик через OpenAI и сохраняет в таблицу `proposal` (статус DRAFT).
3. Пользователь из веба может отправить предложение. API вызывает `UpworkService.createProposal` и помечает `proposal` как SENT.
4. Метрики агрегируются по Cron и доступны через `/metrics` для графиков.

## Сущности (упрощённо)

- `User` (роль, подписка).
- `ApiKey` (связь с `User`, OAuth/Upwork, alias, сроки годности токенов).
- `RuleSet` (JSONLogic-правила фильтрации вакансий).
- `Proposal` (черновик, статус, связь с вакансиями и ключами).
- `Conversation` (переписка; для уведомлений и мониторинга).
- `Webhook` (интеграции Slack/Telegram/Zapier и т.п.).

## Наблюдаемость

- OpenTelemetry трассировка (OTLP), Prometheus метрики, Tempo/Графана локально через `docker-compose`.

## Замечания по безопасности

- Обязательно задавайте `JWT_SECRET` в продакшене.
- Храните ключи и секреты в Secret Manager/SSM; локально — только для разработки.

