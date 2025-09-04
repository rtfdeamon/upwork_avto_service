# Локальная разработка

## Предустановки

- Docker + Docker Compose
- Node.js 18+
- pnpm

## Быстрый старт

1) Скопируйте `.env.example` → `.env` и заполните ключевые переменные.
2) Выполните:

```
./scripts/start_all.sh
```

Скрипт:
- установит зависимости (`pnpm install`),
- поднимет Postgres и стек наблюдаемости (`docker-compose`),
- прогонит миграции API,
- запустит API и dev-воркеры.

Адреса по умолчанию:
- API: `http://localhost:4000`
- Postgres: `localhost:5434` (hostPort 5434 → container 5432)
- Grafana: `http://localhost:3000`

Сброс БД-тома (при смене миграций):

```
RESET_DB=1 ./scripts/start_all.sh
```

Смена порта API:

```
PORT=8080 ./scripts/start_all.sh
```

## Ручной запуск (при необходимости)

1) Поднять сервисы БД/наблюдаемости:

```
docker-compose up -d db prometheus tempo promtail grafana
```

2) Установить зависимости и миграции:

```
PNPM_ENABLE_PRE_POST_INSTALL_SCRIPTS=1 pnpm install --fix-lockfile
pnpm --filter api run migration:run
```

3) Собрать и запустить API:

```
pnpm --filter api run build
DB_PORT=5434 PORT=4000 node apps/api/dist/main.js
```

4) Запустить воркер(а):

```
pnpm poller:dev
pnpm draft:dev
```

## Запуск в Docker (Python API/Worker)

Для локальной разработки сервисов на Python используйте docker-compose:

```
docker-compose up -d db prometheus tempo promtail grafana redis localstack py-api
# опционально
docker-compose up -d py-worker

### Веб (Next.js) в Docker

```
docker-compose up -d web
```

Переменные:
- `NEXT_PUBLIC_API_URL` — должен указывать на URL API, доступный из браузера (по умолчанию `http://localhost:4000`).
- `API_INTERNAL_URL` — внутренний URL API из контейнера веб (по умолчанию `http://py-api:4000`).
```

По умолчанию `py-api` слушает `:4000` и использует `UPWORK_MOCK=1`.

В `py-worker` очередь SQS создаётся автоматически, если не задан `JOBS_QUEUE_URL` (имя берётся из `JOBS_QUEUE`, по умолчанию `jobs.fifo`).


## Тестирование

- API e2e: `pnpm --filter api test`
- Smoke воркера (Localstack): `pnpm smoke`

> Примечание: для smoke-теста используется `docker-compose-localstack.yml` с Postgres на `5433` и Localstack (SQS) на `4566`.

## Траблшутинг

- Подключение к БД: убедитесь, что порт соответствует `docker-compose` (5434 локально, 5432 внутри контейнера).
- JWT: обязательно задайте `JWT_SECRET` (иначе используется небезопасное значение по умолчанию).
- Upwork: для локалки можно задать `UPWORK_MOCK=1`, чтобы не дергать реальный API.
