# Worker

This directory contains Lambda handlers for polling Upwork jobs and processing proposal drafts. Run `pnpm poller:dev` or `pnpm draft:dev` to execute them locally.

The root `bootstrap.sh` script sets up the dependencies and database required for the workers as well.

### Environment

- `DB_*` variables for Postgres
- `REDIS_URL` for deduplication
- `JOBS_QUEUE_URL` and `PROPOSALS_QUEUE_URL` for SQS

### Logging

Log lines are timestamped using a small helper in `logger.ts`. Errors from network calls are captured and printed before retries.
