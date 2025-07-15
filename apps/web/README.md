# Web

Next.js dashboard built with credentials based authentication. Start the dev server with `pnpm --filter web dev`.

If you ran `./scripts/bootstrap.sh` the backend and Postgres will already be running.

### Environment

- `API_URL` – backend base URL
- `NEXTAUTH_URL` – callback URL for next-auth

### Notes

API errors are surfaced in the browser console. Charts rely on the stubbed `@tanstack/react-charts` package contained in this repo.
