Below is a structured ― and fairly exhaustive ― technical specification you can hand to an OpenAI Codex (or any senior engineer) to build a “never-sleep” AI auto-responder SaaS for Upwork similar to uneversleep.com.
Everything is organised so the dev team can lift sections straight into tickets or a PRD.

Executive summary
We will build a cloud-hosted SaaS that (1) continuously watches new Upwork job posts through the official GraphQL API, (2) filters them against user-defined criteria, (3) drafts personalised proposals with an LLM fine-tuned on the user’s best past messages, and (4) submits those proposals within minutes, dramatically outperforming manual bidding. Early adopters of the reference product report 20-35 calls booked and 2+ closed deals per month with zero manual labour 
LinkedIn
LinkedIn
. Our version will offer the same core flow while adding multi-account support, granular analytics, and a plug-and-play webhook/ Zapier layer for agencies.

1. Goals & KPIs
Goal	KPI	Target
Time-to-proposal	Median latency from job-posted → proposal-sent	< 3 min
Win-rate uplift	Calls booked per 100 proposals	≥ 4 %
ROI for users	Pipeline $ per $ spent on connects + subscription	≥ 100 % by month 2
System uptime	Availability of core worker + API	≥ 99.5 %

2. Functional requirements
2.1 Job discovery
Polling worker hits the Upwork GraphQL JobSearch query every 60 s per user 
Upwork
.

OAuth 2.0 flow with refresh tokens (Upwork rotates keys annually – see screenshot) must be abstracted in a auth micro-service.

Rate-limit compliance: throttle to 100 calls/10 min per key.

2.2 Validation & filtering
Users create “ideal-job rulesets” (tech stack keywords, budget ranges, client spend, etc.).

Rules engine: JSON logic (AND/OR) compiled to SQL for persistence.

2.3 Proposal generation
Fine-tune or RAG prompt on:

User’s profile / portfolio.

Best historical messages imported via Upwork “rooms & messages” scope 
LinkedIn
.

Use OpenAI / Azure OpenAI GPT-4o with structured prompt: { job_post, profile_summary, case_studies[] } → proposal.

Streaming completion to UI for transparency.

2.4 Auto-submission
Call CreateProposal mutation with connects budget logic (don’t boost unless latency > 10 min) 
LinkedIn
.

If boost is required, increment connects cost and log.

2.5 Conversation monitor
Listen to ActivityFeed endpoint to detect client replies; trigger Slack / Telegram webhook.

2.6 Dashboard & analytics
Metrics: proposals/day, open-rate, reply-rate, calls booked, contracts, ROI.

Time-series stored in Postgres + TimescaleDB; visualised in React/Next.js chart widgets.

2.7 Multi-account & team mode
Agencies attach multiple Upwork keys; each proposal tagged with account alias.

Role-based access: owner, SDR, observer.

2.8 Notifications & integrations
Webhooks, Zapier REST hooks, native Slack & Telegram bots (same as uneversleep tutorial 
U Never Sleep
).

3. Non-functional requirements
Area	Spec
Performance	Worker concurrency auto-scales on AWS Fargate; target < 500 ms cold-start.
Security	Encrypt secrets in AWS Secrets Manager; SOC 2 controls.
Compliance	Store only proposal metadata, never full job text, for Upwork ToS compliance 
Make Community
.
Reliability	At-least-once job processing; idempotent submission guard (jobId + userId unique).
Observability	OpenTelemetry traces, Prometheus metrics, Grafana dashboards.

4. Technology stack
Layer	Choice	Rationale
Backend	TypeScript + NestJS	Decorators, DI, easy GraphQL client
Job worker	Node18 on AWS Lambda / Fargate	Burstable & cost-efficient
Front-end	Next.js 14 (T3 stack)	SSR dashboard, easy auth
DB	Postgres 16 + TimescaleDB	Mixed relational + time-series
Queue	AWS SQS (FIFO)	Exactly-once semantics
AI	OpenAI GPT-4o via SDK	Best proposal quality
CI/CD	GitHub Actions → AWS CodeDeploy	Zero-downtime
Infra as Code	Terraform + Terragrunt	Multi-env

5. Data model (simplified)
mermaid
Копировать
Редактировать
erDiagram
  users ||--o{ api_keys : owns
  users ||--o{ portfolios : has
  api_keys ||--o{ job_search_tasks : triggers
  job_posts ||--o{ proposals : responded
  proposals ||--|| conversations : starts
job_posts(jobId, title, skills[], budget, client_info, fetched_at)

proposals(propId, jobId, userId, connects_used, status, llm_version, sent_at)

6. External API design
Method	Path	Description
POST /v1/rulesets	create/modify validation rules.	
POST /v1/proposals/manual	generate & preview proposal without sending.	
GET /v1/metrics/summary	ROI & funnel stats.	
POST /v1/webhooks	register 3rd-party callback URLs.	

Auth: JWT access tokens issued by our Auth0 tenant.

7. AI prompt schema (pseudo-code)
text
Копировать
Редактировать
SYSTEM: You are an elite Upwork sales rep...
USER: {job_json}
TOOLS:
  - portfolio: {summary, cases}
  - profile: {headline, skills}
INSTRUCTIONS:
  1. Address the client by name if available.
  2. Mirror their key requirement keywords in first 2 sentences.
  3. Insert exactly 2 bullet points of relevant case studies.
  4. Close with personalised question + CTA for 15-min call.
Track prompt+completion tokens for cost reporting.

8. Deployment pipeline
dev → staging → prod environments.

PR merges run tests, build Docker images, push to ECR.

Terraform plan & apply gated by manual approval.

Blue/green Lambda alias shift.

9. Milestones & timeline (90 days)
Day	Deliverable
0-10	Upwork OAuth service + Postgres schema.
11-25	Job polling worker + rules engine.
26-40	LLM proposal generator (MVP prompt).
41-55	Auto-submission & duplicate guards.
56-70	Dashboard UI + metrics API.
71-80	Team accounts, billing (Stripe).
81-90	Security audit, load test, launch.

10. Risks & mitigations
Risk	Mitigation
Upwork API policy changes / bans	Respect rate limits, add human-in-the-loop mode, rapid key rotation.
Proposal quality drifts	Continuous RLHF loop: user thumbs-up/down stored → fine-tune monthly.
Legal (ToS)	Store minimal data, optional proxy mode where proposal is returned to user browser for final send.

Key references
Upwork official GraphQL docs (auth, JobSearch, CreateProposal) 
Upwork

Case-study post on 35 calls, 2 closed deals (workflow outline) 
LinkedIn

Client testimonial: 20 leads, 2 contracts in 1 month 
LinkedIn

Upwork API community thread (OAuth tips) 
Make Community

uneversleep webhook setup tutorial (notifications) 
U Never Sleep

LinkedIn founder post explaining validation → LLM → send pipeline 
LinkedIn

Reddit n8n automation discussion (precedent for open-source workflows) 
Реддит

n8n workflow best practices for robust automations 
Реддит

OpenTelemetry & Prometheus patterns for Node services (generic but industry standard) 
Upwork

TimescaleDB time-series suitability for SaaS metrics 
salescaptain.io

This spec should give Codex (or any engineer) enough clarity to scaffold repositories, generate boilerplate, and implement the core loops end-to-end.

## Development
### Requirements

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

1. Run `./scripts/bootstrap.sh` to install dependencies, start services and run migrations.
2. Launch the API server: `node dist/main.js` after `pnpm --filter api run build`.
3. Workers can be run locally via `pnpm poller:dev` or `pnpm draft:dev`.
4. Execute the smoke test with `npm run smoke` to verify end-to-end behaviour.
5. Start Grafana and Tempo with `make dev-observe` to collect traces locally.

Logs are printed with timestamps and all API requests are logged with status codes.
Errors are captured by a global filter and displayed in JSON format.
