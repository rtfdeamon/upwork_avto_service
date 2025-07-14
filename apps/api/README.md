# API


This NestJS service exposes REST endpoints for authentication, ruleset management and Stripe billing. After building with `pnpm --filter api run build`, start it via `node dist/index.js`.

### Environment

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` – Postgres connection
- `OTEL_EXPORTER_OTLP_ENDPOINT` – optional OTLP collector (e.g. AWS X-Ray)
- `UPWORK_CLIENT_ID/SECRET/REDIRECT` – OAuth credentials

### Logging

Requests are logged with method, path and response status. Uncaught exceptions are formatted as JSON by `AllExceptionsFilter`.
