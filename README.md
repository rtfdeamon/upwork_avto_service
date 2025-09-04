## Обзор

Monorepo c тремя приложениями и инфраструктурой:
- `apps/api` — NestJS REST API (аутентификация, rulesets, метрики, биллинг Stripe, отправка предложений на Upwork).
- `apps/worker` — воркеры (поллинг вакансий, генерация черновиков через OpenAI, обработка событий/активности).
- `apps/web` — Next.js дашборд.
- `infra` — Terraform/Terragrunt для AWS (SQS, Lambda/Fargate, RDS, мониторинг).

Наблюдаемость: OpenTelemetry + Prometheus + Grafana (локально поднимается через Docker Compose).

Список основных endpoint’ов и архитектурная схема — см. `docs/API.md` и `docs/ARCHITECTURE.md`.

## Быстрый старт (локально)

Предустановки:
- Docker/Docker Compose, Node.js 18+, pnpm.

1) Заполните `.env` на основе `.env.example`.
2) Запустите полный локальный стек одной командой:

```
./scripts/start_all.sh
```

Скрипт:
- установит зависимости, поднимет Postgres и мониторинг,
- применит миграции,
- соберёт и запустит API, запустит dev-воркеры.

По умолчанию:
- API слушает `http://localhost:4000` (переопределить: `PORT=8080 ./scripts/start_all.sh`),
- Postgres доступен на хосте по `localhost:5434` (настроено в `docker-compose.yml`).

Полезно:
- Сбросить БД-том: `RESET_DB=1 ./scripts/start_all.sh`
- Grafana: `http://localhost:3000` (логин/пароль по умолчанию)

Подробные пошаговые инструкции и отладка — в `docs/LOCAL_DEV.md`.

## Docker (Python API/Worker)

Для локальной разработки на Python используйте docker-compose:

```
docker-compose up -d db prometheus tempo promtail grafana redis localstack py-api
# при необходимости запуск воркера:
docker-compose up -d py-worker
```

By default:
- `py-api` слушает `http://localhost:4000` и использует `UPWORK_MOCK=1`.
- `py-worker` создаёт очередь SQS, если `JOBS_QUEUE_URL` не задан (имя из `JOBS_QUEUE`).

## Переменные окружения (ключевые)

- `OPENAI_API_KEY` — ключ OpenAI.
- `OPENAI_ORG_ID` — (опционально) организация OpenAI.
- `OPENAI_MODEL_PRIMARY` — основной модельный идентификатор (напр. `gpt-4o`).
- `OPENAI_MODEL_FALLBACK` — список fallback-моделей через запятую.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` — настройки Postgres.
- `JWT_SECRET` — секрет для JWT (обязательно переопределить в проде!).
- `UPWORK_CLIENT_ID`, `UPWORK_CLIENT_SECRET`, `UPWORK_REDIRECT` — OAuth для Upwork.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PRICE_ID` — Stripe.
- `JOBS_QUEUE_URL`, `PROPOSALS_QUEUE_URL` — URL очередей SQS (для воркера).
- `REDIS_URL` — Redis для дедупликации/лимитов (воркер).

Полный список и примеры — в `.env.example` и README отдельных пакетов в `apps/*`.

## Тесты

На текущем этапе e2e-тесты для Node-версии удалены. Для Python API/Worker планируются отдельные тесты (pytest/Alembic), при необходимости добавлю.

## Деплой

См. `docs/deploy.md` (Terragrunt применяет инфраструктуру, затем `scripts/post_deploy.sh` докручивает EventBridge и DLQ; описаны сервисы Fargate/Lambda, RDS и мониторинг).

## Безопасность и замечания

- Убедитесь, что `JWT_SECRET` задан и не равен значению по умолчанию.
- Для интеграции с Upwork можно использовать `UPWORK_MOCK=1` в локальной среде, чтобы не делать реальные запросы.
- Rate limiting OpenAI реализован в воркере через Redis (см. `OPENAI_TPM`).

## Структура репозитория

- `apps/api` — NestJS API, контроллеры: `auth`, `rulesets`, `metrics`, `proposals`, `webhooks`, `members`, `upwork-auth`.
- `apps/worker` — поллинг вакансий, генерация и запись черновиков предложений через OpenAI, интеграция с SQS/Redis.
- `apps/web` — Next.js дашборд с простыми графиками и страницами `/dashboard/*`.
- `infra` — Terraform/Terragrunt модули (VPC, RDS, SQS, Lambdas/Fargate, ALB и т.д.), мониторинг.
- `docs` — дополнительная документация (архитектура, локальная разработка, деплой, API).

---

Старый секционный «спек» перенесён и упрощён в `docs/ARCHITECTURE.md` и `docs/API.md`.

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing).

- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server. On macOS Docker Desktop is started automatically if needed. Stop both
processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server. On macOS Docker Desktop is started automatically if needed. Stop both
processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server. On macOS Docker Desktop is started automatically if needed. Stop both
processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server. On macOS Docker Desktop is started automatically if needed. Stop both
processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server. On macOS Docker Desktop is started automatically if needed. Stop both
processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server. On macOS Docker Desktop is started automatically if needed. Stop both
processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server on port `4000`. On macOS Docker Desktop is started automatically if
needed. Stop both processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```
The API port defaults to `4000`; override it with `PORT=8080 ./scripts/start_all.sh` if needed.

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server on port `4000`. On macOS Docker Desktop is started automatically if
needed. Stop both processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```
The API port defaults to `4000`; override it with `PORT=8080 ./scripts/start_all.sh` if needed.

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server on port `4000`. On macOS Docker Desktop is started automatically if
needed. Stop both processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```
The API port defaults to `4000`; override it with `PORT=8080 ./scripts/start_all.sh` if needed. If migrations changed, remove the old Postgres volume by setting `RESET_DB=1`:

```bash
RESET_DB=1 ./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server on port `4000`. On macOS Docker Desktop is started automatically if
needed. Stop both processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```
The API port defaults to `4000`; override it with `PORT=8080 ./scripts/start_all.sh` if needed. If migrations changed, remove the old Postgres volume by setting `RESET_DB=1`:

```bash
RESET_DB=1 ./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server on port `4000`. On macOS Docker Desktop is started automatically if
needed. Stop both processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

### Requirements

- Docker with Docker Compose installed.
- Node.js 18+ (the script installs `pnpm` globally if missing). Install from <https://nodejs.org/> or via nvm.
- On macOS the helper script tries to start Docker Desktop automatically if the daemon isn't running.

For a single-command setup execute:

```bash
./scripts/start_all.sh
```
The API port defaults to `4000`; override it with `PORT=8080 ./scripts/start_all.sh` if needed. If migrations changed, remove the old Postgres volume by setting `RESET_DB=1`:

```bash
RESET_DB=1 ./scripts/start_all.sh
```

The helper script installs dependencies, launches Postgres and observability
containers, builds the API and runs the poller worker together with the API
server on port `4000`. On macOS Docker Desktop is started automatically if
needed. Stop both processes with `Ctrl+C`.

Manual steps if you prefer running each piece separately:

1. Run `./scripts/bootstrap.sh` to install dependencies, start services and run migrations.
2. Launch the API server: `node dist/main.js` after `pnpm --filter api run build`.
3. Workers can be run locally via `pnpm poller:dev` or `pnpm draft:dev`.
4. Execute the smoke test with `npm run smoke` to verify end-to-end behaviour.
5. Start Grafana and Tempo with `make dev-observe` to collect traces locally.

Logs are printed with timestamps and all API requests are logged with status codes.
Errors are captured by a global filter and displayed in JSON format.
