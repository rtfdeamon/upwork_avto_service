# API

This NestJS service exposes REST endpoints for authentication, ruleset management and Stripe billing. After building with `pnpm --filter api run build`, start it via `node dist/main.js`.

During development the project root provides `./scripts/bootstrap.sh` which installs dependencies, starts Postgres via Docker Compose and runs migrations so the API can be launched immediately.

### Environment

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` – Postgres connection
- `OTEL_EXPORTER_OTLP_ENDPOINT` – optional OTLP collector (e.g. AWS X-Ray)
- `UPWORK_CLIENT_ID/SECRET/REDIRECT` – OAuth credentials
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` – Stripe API keys
- `PRICE_ID` – subscription price identifier

### Logging

Requests are logged with method, path and response status. Uncaught exceptions are formatted as JSON by `AllExceptionsFilter`.
