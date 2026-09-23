import type { Topic } from '@/lib/types';

export const s5_7: Topic[] = [
  {
    id: 's5.7.t1',
    moduleId: 's5.7',
    title: 'Containers and one cloud',
    outcome: `You can package the FastAPI service as a small, non-root container and run it on one managed platform — Cloud Run or ECS Fargate — with the settings that matter for AI traffic.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'deploy FastAPI to Google Cloud Run docker',
        channel: '',
        reason: 'a hands-on deployment walkthrough',
      },
    ],
    animations: [],
    analogy: `A standard shipping container fits every ship, train and truck. Your app in a container
runs the same on your laptop, in CI and in the cloud — and the cloud platform only has to
know how to run containers.`,
    notes: `## A lean image with uv

\`\`\`dockerfile
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:0.9 /uv /uvx /bin/     # pin the uv version you use
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project --no-dev      # dependencies: cached layer
COPY . .
RUN uv sync --locked --no-dev

RUN useradd --create-home app
USER app                                                 # never run as root
ENV PATH="/app/.venv/bin:$PATH" PORT=8080
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
\`\`\`

Dependencies are installed **before** copying the code, so a code change rebuilds in seconds.

---

## Pick one cloud and go deep

| | Google Cloud Run | AWS ECS on Fargate |
|---|---|---|
| You give it | a container | a container + task definition + load balancer |
| Scaling | automatic, by concurrent requests; can scale to zero | service auto-scaling rules |
| Long requests | request timeout up to 60 min (default 5) | load balancer idle timeout (default 60 s, configurable) |
| Effort | lowest | more pieces, more control |

**Recommendation:** Cloud Run for p-5.1 — the least infrastructure between you and a
working, streaming, auto-scaling service. ECS is a fine choice if your target companies run
AWS. Learn one properly rather than both badly.

---

## Settings that matter for AI traffic

- **Concurrency per instance** — how many requests (open streams) one container handles;
  set from a load test (topic 5), not the default.
- **Minimum instances** ≥ 1 — avoids cold starts on the first request of the morning.
- **Request timeout** — long enough for your longest stream, with heartbeats (Module 2).
- **Region** — Mumbai (\`asia-south1\`) or Delhi (\`asia-south2\`) for Indian users and data.
- **Secrets** from the platform's secret manager, not baked into the image.

\`\`\`bash
gcloud run deploy ampratai-api --source . --region asia-south1 \\
  --min-instances 1 --concurrency 40 --timeout 600 \\
  --set-secrets ANTHROPIC_API_KEY=anthropic-key:latest
\`\`\`

---

## Health checks

A \`/healthz\` endpoint that returns quickly (the process is up) and a \`/readyz\` that checks
what the app needs to serve traffic (database reachable). The platform uses them to route
traffic only to healthy instances and to restart stuck ones.`,
    docs: [
      {
        label: 'Google Cloud Run documentation',
        url: 'https://cloud.google.com/run/docs',
      },
      {
        label: 'uv — using uv in Docker',
        url: 'https://docs.astral.sh/uv/guides/integration/docker/',
      },
      {
        label: 'AWS — Amazon ECS on Fargate',
        url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html',
      },
    ],
    glossary: [
      {
        term: 'container image',
        def: 'A packaged app with its runtime and dependencies, runnable anywhere containers run.',
      },
      {
        term: 'cold start',
        def: 'The delay when a platform starts a new container for a request.',
      },
      {
        term: 'concurrency (per instance)',
        def: 'How many requests one container handles at the same time.',
      },
      {
        term: 'health check',
        def: 'An endpoint the platform calls to decide whether an instance should get traffic.',
      },
    ],
    check: [
      {
        q: 'Why copy the lockfile and install dependencies before copying the code?',
        a: 'Docker caches that layer, so code-only changes rebuild quickly without reinstalling dependencies.',
      },
      {
        q: 'Why run the container as a non-root user?',
        a: 'If the app is compromised, the attacker has fewer privileges inside the container.',
      },
      {
        q: 'Why set minimum instances to at least 1?',
        a: 'To avoid cold starts, where the first request waits for a new container to boot.',
      },
      {
        q: 'What sets the right concurrency per instance?',
        a: 'A load test with realistic, streaming requests — not the platform default.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Deploy p-3.1 to Cloud Run',
        body: `Containerise p-3.1 with the Dockerfile above (adjusted), push it, and deploy to Cloud
Run in \`asia-south1\` with secrets from Secret Manager. Check: streaming works through the
public URL, a cold start's time, and the image size.`,
        answer: `Checks and typical results:

- **Streaming through the public URL:** words appear progressively. (Cloud Run supports
  streamed responses; if it arrives all at once, look for a buffering middleware or proxy
  in your own stack.)
- **Cold start:** with \`--min-instances 0\`, the first request after idling takes several
  seconds (container boot + app import + connections). With \`--min-instances 1\`, it's
  gone — at the cost of one always-on instance.
- **Image size:** a slim Python base with only runtime dependencies is typically a few
  hundred MB; if it's over a gigabyte, you've probably included dev dependencies, model
  files or build tools.

Write the three numbers in your p-5.1 README. And set a **budget alert** on the cloud
project on day one — before anything else runs up a bill.`,
      },
      {
        mode: 'read',
        title: 'Review this Dockerfile',
        body: `\`\`\`dockerfile
FROM python:3.12
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
ENV ANTHROPIC_API_KEY=sk-ant-...
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
\`\`\`

List every problem.`,
        answer: `1. **The API key is baked into the image** — anyone who can pull the image has the key,
   and it's in every layer's history. Use the platform's secret manager at runtime, and
   rotate this key now.
2. **\`--reload\`** is a development flag: it watches files and restarts the server — wasted
   CPU and odd behaviour in production.
3. **\`COPY . /app\` before installing** — every code change reinstalls all dependencies
   (no layer caching), and it may copy \`.env\`, \`.git\` and local data into the image
   (add a \`.dockerignore\`).
4. **Full \`python:3.12\` image** — much larger than \`-slim\`.
5. **Runs as root.**
6. **Unpinned dependencies** (\`requirements.txt\` without a lockfile) — builds aren't
   reproducible.`,
      },
    ],
  },
  {
    id: 's5.7.t2',
    moduleId: 's5.7',
    title: 'Managed data services',
    outcome: `You can run Postgres with pgvector, Redis and object storage as managed services — connection pooling sized to your scaling, migrations that don't break running code, and backups you've tested.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Renting a flat with a building manager: someone else fixes the lift, the water tank and the
security. You still decide where your furniture goes. Managed databases take the plumbing
off your hands — the data model and its care are still yours.`,
    notes: `## The three stores

| Store | Holds | Managed options |
|---|---|---|
| **Postgres + pgvector** | users, documents, chunks, vectors, runs, audit | Cloud SQL, AlloyDB, RDS, Aurora, Supabase, Neon |
| **Redis** | queues, rate-limit buckets, caches | Memorystore, ElastiCache, Upstash |
| **Object storage** | uploads, parsed text, exports | Cloud Storage, S3 |

Large files go in **object storage**, with the database holding their keys and metadata.

---

## The connection-count trap

Auto-scaling multiplies connections:

> 20 instances × a pool of 10 connections = **200 connections**

A small managed Postgres may allow around 100. At peak, new instances fail to connect —
exactly when you need them.

- Size pools so **max instances × pool size** stays under the database's limit (with room
  for workers, migrations and you).
- Put a **connection pooler** in front (PgBouncer, or the platform's built-in pooling) —
  remembering Stage 3's \`SET LOCAL\` rule for transaction pooling.
- Cap **max instances** on the platform to match.

---

## Migrations without downtime: expand, then contract

During a deploy, old and new code run **at the same time**. So a migration must work with
both:

1. **Expand:** add the new column (nullable) or table. Deploy code that writes both old and
   new. Backfill.
2. **Switch:** deploy code that reads the new one.
3. **Contract:** later, in a separate release, drop the old column.

Never rename or drop something the running version still uses. Run migrations as a pipeline
step (Alembic), before the new code takes traffic.

---

## Backups you've actually restored

- Automated backups plus point-in-time recovery, turned on from day one.
- A **restore drill**: restore last night's backup to a scratch instance and run a smoke test.
  A backup you've never restored is a hope, not a backup.
- Keep the region in India if your data residency promises say so.`,
    docs: [
      {
        label: 'Cloud SQL for PostgreSQL — extensions (pgvector)',
        url: 'https://cloud.google.com/sql/docs/postgres/extensions',
      },
      {
        label: 'Alembic documentation',
        url: 'https://alembic.sqlalchemy.org/',
      },
      {
        label: 'PgBouncer',
        url: 'https://www.pgbouncer.org/',
      },
    ],
    glossary: [
      {
        term: 'connection pool',
        def: 'A set of reusable database connections held by an app instance.',
      },
      {
        term: 'connection pooler',
        def: 'A proxy that lets many clients share fewer database connections.',
      },
      {
        term: 'expand/contract',
        def: 'A migration pattern that changes schema in backward-compatible steps across releases.',
      },
      {
        term: 'point-in-time recovery',
        def: 'Restoring a database to any moment within a retention window.',
      },
    ],
    check: [
      {
        q: 'Why can auto-scaling break the database?',
        a: `Each instance opens its own connection pool; many instances multiply connections past the database's limit.`,
      },
      {
        q: 'What are the expand and contract steps of a migration?',
        a: `Expand: add the new structure and write to both; switch reads; contract: remove the old structure in a later release.`,
      },
      {
        q: 'Why must a migration work with both old and new code?',
        a: 'During a deploy both versions run at the same time.',
      },
      {
        q: 'What makes a backup trustworthy?',
        a: 'Regularly restoring it to a scratch instance and checking it works.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Size the connections',
        body: `Your API runs on Cloud Run with max 30 instances, each with an asyncpg pool of 8. An arq
worker service runs up to 6 instances with pools of 5. The managed Postgres allows 100
connections. What happens at peak, and what do you change?`,
        answer: `Peak demand: 30 × 8 + 6 × 5 = 240 + 30 = **270 connections** against a limit of 100.
At peak, instances beyond roughly the first dozen fail to connect — the outage happens
exactly under the heaviest load.

Options, usually combined:

- **Smaller pools:** async code needs fewer connections than you'd think; 3–4 per API
  instance is often enough (measure pool wait time).
- **A pooler:** PgBouncer in transaction mode lets hundreds of client connections share a
  few dozen server connections (use \`SET LOCAL\`, not \`SET\`).
- **Cap max instances** so the worst case fits: e.g. 20 API × 4 + 6 workers × 2 = 92, with
  a little headroom for migrations and admin.
- A larger database tier, if the load truly needs it.

Write the formula in the README next to the settings, so the next person who raises max
instances knows what else must change.`,
      },
      {
        mode: 'spec',
        title: 'Plan a column rename safely',
        body: `You need to rename \`chunks.text\` to \`chunks.content\` in production without downtime,
while two versions of the app are running during deploys. Write the sequence of
migrations and releases.`,
        answer: `**Release 1 (expand):**

- Migration: \`ALTER TABLE chunks ADD COLUMN content text;\`
- Code: write to **both** \`text\` and \`content\`; keep reading \`text\`.
- Backfill in batches: \`UPDATE chunks SET content = text WHERE content IS NULL AND id
  BETWEEN $1 AND $2;\` (batches keep locks short).

**Release 2 (switch):**

- Code: read \`content\`; still write both (so a rollback to release 1 still works).
- Verify: \`SELECT count(*) FROM chunks WHERE content IS DISTINCT FROM text;\` returns 0.

**Release 3 (contract):**

- Code: stop writing \`text\`.
- Migration (after release 3 is fully live): \`ALTER TABLE chunks DROP COLUMN text;\`

Three releases for a rename feels slow; it's what "no downtime, and every step can roll
back" costs. Indexes (like the full-text index on \`text\`) need the same treatment — build
the new one concurrently before switching.`,
      },
    ],
  },
  {
    id: 's5.7.t3',
    moduleId: 's5.7',
    title: 'A pipeline with an eval gate',
    outcome: `You can build a CI/CD pipeline — lint, typecheck, tests, eval gate, build, staging, smoke test, production — with keyless cloud authentication and an eval step that blocks bad releases.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-eval-ci-gate'],
    analogy: `An airport's security lanes: bags, then body scan, then passport — each stage cheap and
fast before the next, and a single failure stops you before the plane. A deployment
pipeline is the same line, with an extra scanner for AI quality.`,
    notes: `## The stages

\`\`\`text
lint → typecheck → unit tests → eval gate → build image → deploy to staging
     → smoke tests on staging → approval → deploy to production
\`\`\`

Cheap, fast checks first; each stage only runs if the previous passed.

---

## In GitHub Actions (abridged)

\`\`\`yaml
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v6
      - run: uv sync --locked
      - run: uv run ruff check . && uv run ruff format --check .
      - run: uv run pyright
      - run: uv run pytest -q

  eval:
    needs: checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v6
      - run: uv sync --locked
      - run: uv run python -m eval.run --suite pr --out results.json
        env: { ANTHROPIC_API_KEY: "\${{ secrets.ANTHROPIC_API_KEY }}" }
      - run: uv run python -m eval.gate --baseline eval/baseline.json --results results.json

  deploy-staging:
    needs: eval
    if: github.ref == 'refs/heads/main'
    permissions: { id-token: write, contents: read }     # keyless auth to the cloud
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: \${{ vars.WIF_PROVIDER }}
          service_account: \${{ vars.DEPLOY_SA }}
      - run: gcloud run deploy ampratai-api-staging --source . --region asia-south1
      - run: ./scripts/smoke.sh "$STAGING_URL"
\`\`\`

Production is a separate job using a GitHub **environment** with required reviewers — a
person clicks "approve".

---

## The eval gate, in the pipeline

Stage 3 built the gate; here it's a **stage**:

- on every PR: retrieval metrics + assertions (fast, cheap) + a judged subset
- nightly: the full suite, including agent scenarios and pass^k
- the baseline lives in the repo and moves only when a PR improves it

---

## Keyless deploys

\`id-token: write\` lets the workflow get a short-lived identity token that the cloud trusts
(Workload Identity Federation on GCP, OIDC roles on AWS). No long-lived cloud keys stored
in GitHub secrets — nothing to leak or rotate.

---

## Smoke tests

After deploying to staging, a few real requests: health check, one RAG question with a known
answer and citation, one agent scenario with mocked side effects. If they fail, production
never sees the build.`,
    docs: [
      {
        label: 'GitHub Actions documentation',
        url: 'https://docs.github.com/en/actions',
      },
      {
        label: 'google-github-actions/auth (Workload Identity Federation)',
        url: 'https://github.com/google-github-actions/auth',
      },
      {
        label: 'GitHub — using environments for deployment',
        url: `https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment`,
      },
    ],
    glossary: [
      {
        term: 'CI/CD',
        def: 'Continuous integration and delivery: automatically checking and releasing every change.',
      },
      {
        term: 'smoke test',
        def: 'A few quick end-to-end checks that a deployment basically works.',
      },
      {
        term: 'Workload Identity Federation',
        def: 'Letting CI authenticate to a cloud with short-lived tokens instead of stored keys.',
      },
      {
        term: 'environment (GitHub)',
        def: 'A deployment target in GitHub Actions that can require approval.',
      },
    ],
    check: [
      {
        q: 'Why do cheap checks run first in a pipeline?',
        a: `They fail fast and cheaply, so expensive steps like evals and deploys only run for changes that pass the basics.`,
      },
      {
        q: 'What does `id-token: write` enable?',
        a: `Keyless authentication: the workflow gets a short-lived token the cloud trusts, so no long-lived cloud keys are stored in GitHub.`,
      },
      {
        q: 'How is the production deploy gated on a person?',
        a: 'A GitHub environment with required reviewers — someone must approve the job.',
      },
      {
        q: 'What do smoke tests on staging check?',
        a: `A few real end-to-end requests — health, a known RAG answer with a citation, an agent scenario with mocked side effects — before production.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Build the pipeline for p-5.1',
        body: `Implement the pipeline for p-5.1 with keyless auth to your cloud, the eval gate, staging,
smoke tests and an approval-gated production deploy. Then open a PR that deliberately
breaks retrieval and show the pipeline stopping at the eval gate.`,
        answer: `A working pipeline shows, on the broken PR: checks green, **eval red** with the metric
that dropped, and no deploy jobs run. On a normal merge to main: every stage green,
staging updated, smoke tests passing, production waiting for your approval.

Common snags:

- **Workload Identity setup** is fiddly the first time — the provider must trust your
  repository, and the service account needs the \`run.admin\` and
  \`iam.serviceAccountUser\` roles (or AWS equivalents). Test the auth step alone first.
- **Secrets on fork PRs** aren't available — the eval job must skip cleanly there.
- **Slow evals** — split into a PR suite (minutes) and a nightly suite.

Screenshot the red eval gate on the broken PR and the approval prompt for production:
together they're the "CI eval gate blocking merges, demonstrated" readiness item.`,
      },
      {
        mode: 'read',
        title: 'What\'s risky here?',
        body: `A team's pipeline: on push to main → build → deploy straight to production; tests run in
parallel with the deploy "to save time"; the GCP service-account JSON key is stored in a
GitHub secret; evals run manually "before big releases".

List the risks and fixes.`,
        answer: `- **Tests in parallel with the deploy** — a failing test doesn't stop a broken release.
  Make deploy depend on tests (\`needs:\`).
- **Straight to production** — no staging, no smoke test, no approval. Add staging +
  smoke tests + an environment with required reviewers.
- **A long-lived service-account key in secrets** — if leaked, it grants deploy access
  until someone notices. Switch to Workload Identity Federation; delete the key.
- **Manual evals** — quality regressions ship between "big releases". Put the eval gate on
  every PR (a fast suite) and run the full suite nightly.

Each fix costs minutes of pipeline time and prevents a class of incident.`,
      },
    ],
  },
  {
    id: 's5.7.t4',
    moduleId: 's5.7',
    title: 'Staging, canary releases and rollback',
    outcome: `You can release code, prompts and models gradually — staging that mirrors production, revision-based canaries, instant rollback — and practise the rollback before you need it.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A theatre rehearses on the real stage (staging), opens with a preview night for a small
audience (canary), and keeps the old show ready in case the new one flops (rollback).
The rehearsal only helps if the stage is the same one.`,
    notes: `## Staging that's worth having

- **Same shape as production:** same platform, same services, same config — smaller.
- **Its own data**, never production's; a realistic seeded corpus.
- **The eval set runs against it** after every deploy, not just unit tests.
- Separate provider keys and spend limits.

A staging that differs from production finds different bugs.

---

## Canary releases with revisions

Cloud Run keeps each deploy as a **revision**; traffic can be split between them:

\`\`\`bash
gcloud run deploy ampratai-api --image $IMAGE --no-traffic --tag canary
gcloud run services update-traffic ampratai-api --to-tags canary=5
# watch the dashboards, compare the canary with the stable revision…
gcloud run services update-traffic ampratai-api --to-latest       # promote
\`\`\`

ECS achieves the same with weighted target groups or blue/green deployments.

---

## Rollback, three kinds

| What changed | Rollback |
|---|---|
| code | shift traffic back to the previous revision — seconds |
| prompt or model | flip the flag to the previous version — seconds, no deploy |
| database schema | only safe if the migration was backward-compatible (expand/contract) |

That last row is why schema changes follow expand/contract: it keeps the first two rollbacks
possible.

---

## Practise it

Once a quarter (or once, now, for p-5.1): deploy a deliberately bad revision to staging,
detect it from the dashboards, and roll back — timing each step. The first real incident is
a bad time to learn the commands.`,
    docs: [
      {
        label: 'Cloud Run — rollouts, rollbacks and traffic migration',
        url: 'https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration',
      },
      {
        label: 'Google SRE workbook — canarying releases',
        url: 'https://sre.google/workbook/canarying-releases/',
      },
    ],
    glossary: [
      {
        term: 'staging',
        def: 'A pre-production environment that mirrors production for testing releases.',
      },
      {
        term: 'revision',
        def: 'An immutable, deployed version of a service that traffic can be routed to.',
      },
      {
        term: 'traffic splitting',
        def: 'Sending percentages of requests to different revisions.',
      },
      {
        term: 'rollback',
        def: 'Returning to the previous working version.',
      },
    ],
    check: [
      {
        q: 'What makes a staging environment useful?',
        a: `It has the same shape as production (platform, services, config), its own realistic data, and runs the eval set after each deploy.`,
      },
      {
        q: 'How do you canary a new Cloud Run revision?',
        a: `Deploy it with no traffic and a tag, then send a small percentage of traffic to that tag while comparing metrics; promote or shift back.`,
      },
      {
        q: 'How are prompt and model changes rolled back?',
        a: 'By flipping a runtime flag back to the previous version — no deploy needed.',
      },
      {
        q: 'Why do schema changes need expand/contract for rollback to work?',
        a: 'Rolling back code only works if the old code still runs against the current schema.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Rehearse a rollback',
        body: `On your staging service: deploy a revision with a deliberate bug (a broken prompt or a
slow endpoint) as a 20% canary. Detect it from your dashboards. Roll back. Record the
time for each step.`,
        answer: `Record like this:

| Step | Time |
|---|---|
| canary starts taking 20% | 00:00 |
| first dashboard signal (errors / p95 / judged quality) | e.g. 00:04 |
| alert fires | e.g. 00:06 |
| traffic shifted back | e.g. 00:07 |
| metrics back to normal | e.g. 00:09 |

What you learn: which signal moved first (usually errors or latency, while quality takes
longer because judging is sampled); whether your alert thresholds fire fast enough; and
how long a rollback really takes with the commands in a runbook versus from memory.
Put the runbook in the repo — it's part of p-5.1's deliverables.`,
      },
      {
        mode: 'decision',
        title: 'How to release each change',
        body: `Choose the release path — straight to production, canary, or flag — for each:

1. A new CSS colour for the chat bubble.
2. A new system prompt for the RAG answers.
3. Switching the answer model to a newer version.
4. A new required column on the \`documents\` table.`,
        answer: `1. **Straight to production** after the normal pipeline — low risk, easy to revert.
2. **Flag + canary** — prompt changes alter behaviour; release to 5% by flag, compare
   judged quality and thumbs, auto-rollback rules on.
3. **Flag + canary, after offline evals** — run the full eval suite (quality, cost, latency,
   output length) first; then canary; keep the old model ID ready (Module 1's upgrade
   checklist).
4. **Expand/contract across releases** — add it as nullable, backfill, enforce later;
   never a required column in one step while the old code is still running.`,
      },
    ],
  },
  {
    id: 's5.7.t5',
    moduleId: 's5.7',
    title: 'Load testing with k6',
    outcome: `You can load-test an AI service honestly — realistic questions and think time, a mocked provider for capacity, a small real run for end-to-end — and report p95, throughput and the breaking point.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A bridge is tested with trucks of known weight until it bends measurably, and the engineers
write down the safe load. Nobody tests it by driving one car across and declaring it strong.`,
    notes: `## What you're finding out

- **p95 latency** (and time to first byte) at your expected load
- **throughput** — requests or open streams per instance before things degrade
- **the breaking point** — the load where errors or latency jump, and **which part breaks
  first** (database connections? provider rate limits? CPU? memory?)

---

## A k6 script

\`\`\`javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },     // ramp up to 20 virtual users
    { duration: '5m', target: 20 },     // hold
    { duration: '2m', target: 80 },     // push further
    { duration: '5m', target: 80 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_waiting: ['p(95)<1500'],   // time to first byte ≈ time to first token
  },
};

const QUESTIONS = JSON.parse(open('./questions.json'));

export default function () {
  const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  const res = http.post(\`\${__ENV.BASE_URL}/chat\`, JSON.stringify({ q }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '120s',
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(2 + Math.random() * 3);         // users read and think
}
\`\`\`

---

## Don't load-test your credit card

Hundreds of virtual users against the real model can cost real money — and you'll mostly
measure the provider's rate limits. Split the job:

- **Capacity tests with a mock provider** — a small server that streams realistic tokens
  with realistic delays (TTFT ~800 ms, ~60 tokens/s). This measures *your* system: the
  database, the pools, the event loop, the concurrency setting.
- **A small real run** — a few concurrent users against the real provider, to confirm
  end-to-end latency and cost per request.

---

## Find the breaking point

Keep ramping until a threshold breaks. Then look at the traces and metrics at that moment:

- pool wait time rising → database connections
- event-loop lag rising → blocking code or CPU
- 429s from the provider → rate limits (with the real provider)
- memory climbing → too many open streams per instance

---

## The report

| Metric | Value |
|---|---|
| target load | 50 concurrent users |
| p95 time to first byte at target | e.g. 1.1 s |
| max concurrent streams per instance before p95 > 1.5 s | e.g. 35 |
| breaking point | e.g. 140 users: DB pool exhausted |
| fix applied, new breaking point | e.g. pool + pooler → 260 users, now provider-bound |

That table is a p-5.1 deliverable — and one of the best things to talk through in an
interview.`,
    docs: [
      {
        label: 'Grafana k6 documentation',
        url: 'https://grafana.com/docs/k6/latest/',
      },
      {
        label: 'k6 — built-in metrics',
        url: 'https://grafana.com/docs/k6/latest/using-k6/metrics/reference/',
      },
    ],
    glossary: [
      {
        term: 'load test',
        def: 'Running a controlled amount of traffic to measure performance and limits.',
      },
      {
        term: 'virtual user',
        def: 'A simulated user in a load test, running a script in a loop.',
      },
      {
        term: 'breaking point',
        def: 'The load at which errors or latency exceed acceptable limits.',
      },
      {
        term: 'think time',
        def: 'Pauses between a simulated user\'s actions, like a real user reading.',
      },
    ],
    check: [
      {
        q: 'What three things does a load test find out?',
        a: `p95 latency at expected load, throughput per instance, and the breaking point — including which component breaks first.`,
      },
      {
        q: 'Why use a mock provider for capacity tests?',
        a: `It measures your own system (database, pools, event loop, concurrency) without paying for real model calls or hitting the provider's rate limits.`,
      },
      {
        q: 'What k6 metric approximates time to first token for a streamed response?',
        a: 'http_req_waiting — the time to first byte.',
      },
      {
        q: 'Why include think time in the script?',
        a: 'Real users pause to read and type; without it, virtual users generate unrealistic load.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'A mock streaming provider',
        body: `Without AI: write a tiny FastAPI app that imitates a streaming model endpoint: waits
~800 ms (with jitter), then streams 300 "tokens" as SSE at about 60 per second. Point your
app at it with an environment variable, so load tests never call the real provider.`,
        answer: `\`\`\`python
import asyncio, json, random
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

async def fake_stream(n_tokens: int = 300):
    await asyncio.sleep(random.uniform(0.6, 1.0))          # time to first token
    for i in range(n_tokens):
        yield f"data: {json.dumps({'text': f'tok{i} '})}\\n\\n"
        await asyncio.sleep(random.uniform(0.012, 0.022))  # ~60 tokens a second
    yield "data: [DONE]\\n\\n"

@app.post("/v1/stream")
async def stream():
    return StreamingResponse(fake_stream(), media_type="text/event-stream")
\`\`\`

In your app, the model adapter (Stage 2's interface) gets a \`MockProvider\` that calls
this endpoint when \`PROVIDER=mock\`. Because it sits behind the same interface, the rest
of your code — retrieval, pools, streaming, tracing — runs exactly as in production.
Run it as a separate service in the load-test environment with enough CPU that it's never
the bottleneck itself.`,
      },
      {
        mode: 'tool',
        title: 'Find your breaking point',
        body: `With the mock provider, run k6 against staging with ramping stages until a threshold
breaks. Identify the component that broke first, fix it, and run again. Then do a small
real-provider run (5 users, 5 minutes) for true end-to-end numbers.`,
        answer: `A typical first run: p95 fine at low load, then a sharp jump at some user count — and the
traces show **database pool waits** (too few connections per instance, or too many
instances for the database), or **event-loop lag** (a sync call somewhere), well before
the mock provider is the limit.

After the fix, the breaking point moves; repeat once more to find the next bottleneck.
The real-provider run then gives the honest TTFT and cost per request under light load.

Final report: the table from the slides, a screenshot of k6's summary with thresholds,
and one paragraph on what broke and why. "It broke at 140 users because of the DB pool;
after a pooler it handles 260 and is now limited by provider rate limits" is a strong,
concrete story.`,
      },
    ],
  },
];
