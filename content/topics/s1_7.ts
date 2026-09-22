import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_7: Topic[] = [
  {
    id: 's1.7.t1',
    moduleId: 's1.7',
    title: 'Images, layers and a good Python Dockerfile',
    outcome: 'You can containerise a Python API, and your rebuilds take seconds rather than minutes.',
    minutes: 35,
    sources: [
      deck,
      find('Visual', 'docker tutorial for beginners', 'TechWorld with Nana', 'the clearest Docker explanation on YouTube'),
    ],
    animations: ['anim-docker-layers'],
    analogy: `Vercel has been doing this for you invisibly. That is exactly why it is a gap —
you have deployed a lot of times and never had to think about what the machine actually
contains. AI workloads are long-running and stateful, so at some point you do have to think
about it.`,
    notes: `## Two words

**Image** — a filesystem plus a command to run. A template. It does not run.
**Container** — a running instance of an image.

Same relationship as a class and an object.

---

## Layers, and why your rebuild is slow

Each instruction in a Dockerfile makes a layer. Layers are cached. **When one layer changes,
every layer below it is rebuilt.**

That single sentence explains both the bad Dockerfile and the good one.

    # slow on every code change
    FROM python:3.12-slim
    COPY . .                          <- your code changes, so...
    RUN uv sync                       <- ...every dependency reinstalls

Edit one line of Python, rebuild, wait ninety seconds while forty packages reinstall.

    # fast
    FROM python:3.12-slim
    COPY pyproject.toml uv.lock ./    <- changes rarely
    RUN uv sync --frozen --no-dev     <- so this stays cached
    COPY . .                          <- only this rebuilds

Now a code change rebuilds one layer. Seconds.

**The rule: things that change rarely go first.** Step through the animation until that is
obvious, because it is the single biggest practical Docker lesson.

---

## A Dockerfile worth copying

    FROM python:3.12-slim AS base
    ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
    WORKDIR /app

    COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

    COPY pyproject.toml uv.lock ./
    RUN uv sync --frozen --no-dev

    COPY . .

    RUN useradd -m app && chown -R app /app
    USER app

    EXPOSE 8000
    CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

Three details that matter:

- \`PYTHONUNBUFFERED=1\` — without it your logs are buffered and you see nothing until the process exits. You will otherwise spend twenty minutes thinking the app is broken.
- \`--host 0.0.0.0\` — without it the server only listens inside the container and nothing can reach it. This is the most common first Docker mistake with Python.
- \`USER app\` — do not run as root. It costs one line.

---

## .dockerignore

    .git
    .venv
    __pycache__
    .env
    node_modules
    *.pdf

Without this, \`COPY . .\` copies your virtual environment, your git history and your
secrets into the image. Image size goes up, build cache breaks on every git commit, and
your \`.env\` is now inside a file you might push to a registry.

**Write this file before your first build, not after.**

---

## Slim, not alpine

Use \`python:3.12-slim\`. Alpine uses a different C library, which means many Python
packages cannot use their prebuilt wheels and must compile from source. Your build goes from
thirty seconds to ten minutes for an image that is barely smaller.`,
    docs: [
      { label: 'Docker — best practices for writing Dockerfiles', url: 'https://docs.docker.com/build/building/best-practices/' },
      { label: 'uv — Docker integration', url: 'https://docs.astral.sh/uv/guides/integration/docker/' },
    ],
    glossary: [
      { term: 'image', def: 'A filesystem plus a start command. A template that does not run.' },
      { term: 'container', def: 'A running instance of an image.' },
      { term: 'layer', def: 'The result of one Dockerfile instruction. Cached, and invalidated by anything above it changing.' },
      { term: '.dockerignore', def: 'What not to copy into the image. Write it first.' },
      { term: 'PYTHONUNBUFFERED', def: 'Makes Python write logs immediately instead of buffering them.' },
    ],
    check: [
      { q: 'Why does COPY . . before installing dependencies make builds slow?', a: 'Your code changes constantly, which invalidates that layer and every layer below it — so dependencies reinstall every time.' },
      { q: 'Your container runs but you cannot reach it. First thing to check?', a: 'Whether the server binds to 0.0.0.0 rather than 127.0.0.1.' },
      { q: 'Your container produces no logs. Why?', a: 'Python is buffering output. Set PYTHONUNBUFFERED=1.' },
      { q: 'Why slim rather than alpine for Python?', a: 'Alpine\'s C library means many packages cannot use prebuilt wheels and compile from source, making builds far slower.' },
      { q: 'What goes in .dockerignore, and why before the first build?', a: '.git, .venv, __pycache__, .env, node_modules. Otherwise you copy secrets and junk into the image and break the cache on every commit.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Containerise your FastAPI app',
        body: `Write the \`.dockerignore\` first, by hand. Then have AI write the Dockerfile from
your spec: multi-stage, layer-ordered for caching, non-root, unbuffered logs, correct host
binding.

Review it against the five details in the notes. Generated Dockerfiles very often miss the
host binding and the non-root user.`,
      },
      {
        mode: 'tool',
        title: 'Feel the cache',
        body: `Build your image and time it. Change one line of Python and rebuild — time it again.

Now move \`COPY . .\` above the dependency install, and do the same two builds. Compare all
four numbers.

The difference you just measured is the whole topic.`,
      },
      {
        mode: 'break',
        title: 'Break it three ways',
        body: `One at a time: remove \`--host 0.0.0.0\` and try to reach the app. Remove
\`PYTHONUNBUFFERED\` and look for your logs. Delete \`.dockerignore\` and compare the image
size with \`docker images\`.

Each failure is one you would otherwise meet for the first time under pressure.`,
      },
    ],
  },

  {
    id: 's1.7.t2',
    moduleId: 's1.7',
    title: 'docker compose: your whole stack in one command',
    outcome: 'Anyone — including you on a new machine — can run your entire stack with one command.',
    minutes: 30,
    sources: [deck],
    animations: [],
    analogy: `The "works on my machine" problem, solved properly. By Stage 3 your stack is an
API, Postgres with pgvector, Redis, and a worker. Starting four things by hand in four
terminals stops being funny quite quickly.`,
    notes: `## The file

    services:
      db:
        image: pgvector/pgvector:pg17
        environment:
          POSTGRES_PASSWORD: dev
          POSTGRES_DB: app
        ports: ["5432:5432"]
        volumes: ["pgdata:/var/lib/postgresql/data"]
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U postgres"]
          interval: 5s
          retries: 10

      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]

      api:
        build: .
        ports: ["8000:8000"]
        environment:
          DATABASE_URL: postgresql+asyncpg://postgres:dev@db:5432/app
          REDIS_URL: redis://redis:6379
        env_file: [.env]
        depends_on:
          db: { condition: service_healthy }
        volumes: [".:/app"]

    volumes:
      pgdata:

Then: \`docker compose up\`.

---

## Four things in there that matter

**Service names are hostnames.** The API connects to \`db:5432\`, not \`localhost:5432\`.
Inside the compose network, \`db\` resolves to that container. Using \`localhost\` in a
container means "this container", which is the second most common first-time Docker mistake.

**Named volumes keep your data.** Without \`pgdata\`, every \`docker compose down\` wipes
your database. With it, your data survives restarts.

**Healthchecks with \`condition: service_healthy\`.** \`depends_on\` alone only waits for
the container to *start*, not for Postgres to be *ready*. Without the healthcheck your API
starts, fails to connect, and exits — and you blame your connection string.

**The bind mount \`.:/app\`** puts your source into the container live, so \`--reload\`
works and you are not rebuilding to test a change. Development only — never in production.

---

## Note the image

\`pgvector/pgvector:pg17\` is Postgres with the vector extension already installed. Saves
you from installing it yourself, and means Stage 3 needs no infrastructure change.

---

## Commands worth knowing

    docker compose up -d           # background
    docker compose logs -f api     # follow one service
    docker compose exec db psql -U postgres app
    docker compose down            # stop, keep data
    docker compose down -v         # stop and DELETE the volumes

That last one deletes your database. Know which is which before you type it quickly.

---

## What this unlocks

One of your Stage 1 targets is "\`docker compose up\` brings up your stack on a clean
machine". That is not a Docker exercise for its own sake — it means you can move to a new
laptop, or hand the project to someone, or start a container in CI, and the thing just runs.`,
    docs: [
      { label: 'Docker Compose — file reference', url: 'https://docs.docker.com/reference/compose-file/' },
      { label: 'pgvector Docker image', url: 'https://hub.docker.com/r/pgvector/pgvector' },
    ],
    glossary: [
      { term: 'service', def: 'One container definition in a compose file.' },
      { term: 'named volume', def: 'Storage that survives containers being removed.' },
      { term: 'healthcheck', def: 'A command that tells compose when a service is actually ready, not just started.' },
      { term: 'bind mount', def: 'Mapping a host directory into a container, so edits show up live.' },
    ],
    check: [
      { q: 'Why does the API connect to db:5432 rather than localhost:5432?', a: 'Inside the compose network, service names are hostnames. localhost means the API\'s own container.' },
      { q: 'What does depends_on alone not guarantee?', a: 'That the database is ready to accept connections — only that the container started. You need a healthcheck.' },
      { q: 'What is the difference between down and down -v?', a: '-v deletes the named volumes, which means your database.' },
      { q: 'Why bind-mount the source in development but not production?', a: 'It gives you live reload while developing; in production the image should be immutable and self-contained.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Bring up the whole stack',
        body: `Write a compose file with API, pgvector-enabled Postgres and Redis. Include the
healthcheck and the named volume.

Then prove it: \`docker compose down\`, \`docker compose up\`, and confirm your data is
still there. Then \`down -v\` and confirm it is gone.

Knowing the difference in your fingers is worth the two minutes.`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Change the API's database host from \`db\` to \`localhost\` and read the error. Then
remove the healthcheck condition and restart repeatedly until you catch the race where the
API starts before Postgres is ready.

Both of these are errors you will otherwise meet for the first time on a deadline.`,
      },
    ],
  },

  {
    id: 's1.7.t3',
    moduleId: 's1.7',
    title: 'Environment, secrets and healthchecks',
    outcome: 'Your container gets its configuration safely, and your platform knows when it is actually ready.',
    minutes: 20,
    sources: [deck],
    animations: [],
    analogy: `Vercel gave you a settings page for environment variables. Underneath, this is
what it was doing — and now you also own the part where a secret can end up baked into an
image layer forever.`,
    notes: `## Configuration comes from the environment

Your \`Settings\` class from the pydantic module reads environment variables. In a container
those come from:

    environment:            # inline, for non-secrets
      LOG_LEVEL: info
    env_file:               # from a file, not committed
      - .env

**Never \`COPY .env\` into the image.** A layer is permanent — the file stays in the image
history even if a later instruction deletes it. Anyone who pulls that image can read it.

---

## Where secrets actually live

- **Local development** — a \`.env\` file, gitignored, loaded by \`env_file\`
- **Production** — your platform's secret store. Every platform has one.

The image itself should contain no secrets at all. It is the same image in staging and
production; only the environment differs.

---

## Healthchecks, and the distinction that matters

Two different questions:

    GET /health   -> is the process alive?              (liveness)
    GET /ready    -> can it actually serve a request?   (readiness)

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    @app.get("/ready")
    async def ready(db = Depends(get_db)):
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}

Liveness says "do not restart me". Readiness says "you may send me traffic". A container
whose database connection has died is alive but not ready — restarting it will not help, and
sending it traffic will.

Get this wrong in the obvious way — a readiness check that calls a model provider — and a
provider outage makes your platform kill and restart every one of your containers, turning a
degraded service into a dead one.

**Rule: a health check must not depend on anything you do not control.**

---

## Startup time

An AI service may load a tokenizer or warm a connection pool at startup. If your platform's
health check starts before that finishes, it will decide the container failed and kill it,
repeatedly.

Give it a start period — in compose, \`start_period\`. On a real platform, the
initial-delay setting.`,
    docs: [
      { label: 'Docker — HEALTHCHECK', url: 'https://docs.docker.com/reference/dockerfile/#healthcheck' },
      { label: 'The Twelve-Factor App — config', url: 'https://12factor.net/config' },
    ],
    glossary: [
      { term: 'liveness', def: 'Is the process alive? Failing this means restart it.' },
      { term: 'readiness', def: 'Can it serve traffic right now? Failing this means stop routing to it.' },
      { term: 'start period', def: 'Grace time before health checks count, for slow startup.' },
      { term: 'image layer history', def: 'Every layer persists in the image — a deleted secret is still recoverable.' },
    ],
    check: [
      { q: 'Why is COPY .env into an image dangerous even if you delete it later?', a: 'Layers are permanent. The file stays in the image history and anyone with the image can read it.' },
      { q: 'What is the difference between liveness and readiness?', a: 'Liveness answers "should I restart this?". Readiness answers "should I send it traffic?".' },
      { q: 'Why must a health check not call your model provider?', a: 'A provider outage would make your platform restart every container, turning a degraded service into a dead one.' },
      { q: 'What does a start period protect against?', a: 'Slow startup — loading models or warming pools — being mistaken for a crash loop.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Two endpoints, correctly split',
        body: `Add \`/health\` and \`/ready\` to your API. Spec exactly what each checks before you
write them, and justify every dependency \`/ready\` touches.

Then test it: stop Postgres while the API runs. \`/health\` should still return 200 and
\`/ready\` should fail. If both fail, your split is wrong.`,
      },
      {
        mode: 'read',
        title: 'Which of these is wrong?',
        body: `    # A
    @app.get("/health")
    async def health(db = Depends(get_db)):
        await db.execute(text("SELECT 1")); return {"ok": True}

    # B
    @app.get("/ready")
    async def ready():
        await anthropic.messages.create(model=..., max_tokens=1, messages=[...])
        return {"ok": True}

Both are wrong, for different reasons. Say what happens in production with each.`,
      },
    ],
  },

  {
    id: 's1.7.t4',
    moduleId: 's1.7',
    title: 'Deploying a container somewhere real',
    outcome: 'Your containerised API is running on the internet with a URL you can send to someone.',
    minutes: 30,
    sources: [deck],
    animations: [],
    analogy: `You have shipped to Vercel many times. This is the same act with the machine
visible. The difference you will feel immediately: no fifteen-second timeout, and a process
that keeps running between requests.`,
    notes: `## Why not just Vercel

Vercel is excellent for your React frontend and you should keep using it for that.

For an AI backend it runs out of road:

- **Execution time limits.** A long generation, a batch embedding job, or an agent run exceeds them.
- **No long-lived processes.** No background workers, no queue consumers.
- **No persistent connections.** Your database pool is rebuilt constantly.
- **Cold starts** on a Python function with heavy imports.

By Stage 4 you have an agent that runs for ninety seconds and resumes after a restart.
That needs a container that stays up.

---

## Start here, not on AWS

For Stage 1, use a platform that takes a Dockerfile and gives you a URL:
**Railway**, **Render** or **Fly.io**. All three have a free or near-free tier, and the
whole deploy is: connect the repo, set environment variables, deploy.

You do not need AWS yet. Stage 5 covers a real cloud properly, and doing it then — when you
have something worth deploying and reasons to care about the settings — is far better use of
your attention than fighting IAM now.

---

## The steps, in order

1. Push your repo with the Dockerfile
2. Create the service from the repo; the platform builds your image
3. Add a managed Postgres from the same platform (they all offer one)
4. Set your environment variables in the platform's settings — never in the repo
5. Point the health check at \`/health\`
6. Deploy, then actually open the URL

---

## The four things that go wrong the first time

**Wrong port.** The platform tells you which port to listen on, usually via a \`PORT\`
environment variable. Read it: \`--port ${'$'}{PORT:-8000}\`.

**Binding to localhost.** Same mistake as before, and it looks like "deploy succeeded, site
unreachable".

**Missing environment variables.** Your app worked locally because \`.env\` existed. It is
not in the image, correctly. Set the variables in the platform.

**Database connection string.** The internal hostname differs from your local one, and
managed databases usually require TLS.

---

## After it is up

- Open the URL. Then open \`/docs\` and make a real request from it.
- Check the logs in the platform's dashboard — this is where \`PYTHONUNBUFFERED\` pays off.
- Set a spend limit if you have one, before it is public.

Then send the link to someone. A URL another person can open is the difference between a
project and an exercise, and it is what your Stage 1 self-check is really asking for.`,
    docs: [
      { label: 'Railway — deploy a Dockerfile', url: 'https://docs.railway.com/guides/dockerfiles' },
      { label: 'Fly.io — getting started', url: 'https://fly.io/docs/getting-started/' },
      { label: 'Render — Docker deploys', url: 'https://render.com/docs/docker' },
    ],
    glossary: [
      { term: 'PaaS', def: 'A platform that takes your code or container and runs it, hiding the servers.' },
      { term: 'managed database', def: 'A database the platform runs, backs up and patches for you.' },
      { term: 'cold start', def: 'The delay when a stopped instance has to start before serving a request.' },
    ],
    check: [
      { q: 'Why is Vercel not the right home for an AI backend?', a: 'Execution time limits, no long-lived processes or workers, and no persistent connections. Agent runs and ingestion jobs need a process that stays up.' },
      { q: 'Why start on Railway or Fly rather than AWS?', a: 'You get a working URL in minutes. Stage 5 covers a real cloud when you have something worth deploying and reasons to care about the settings.' },
      { q: 'Deploy succeeded but the site is unreachable. Two likely causes?', a: 'Binding to localhost instead of 0.0.0.0, or listening on the wrong port instead of the one the platform assigned.' },
      { q: 'Why is your app missing configuration in production when it worked locally?', a: 'The .env file is correctly not in the image. The variables must be set in the platform.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Get a real URL',
        body: `Deploy your containerised API to Railway, Render or Fly. Attach a managed Postgres.
Run your migrations against it. Open \`/docs\` on the public URL and make a request.

Then send the link to one person and ask them to open it. That is the completion condition.`,
      },
      {
        mode: 'break',
        title: 'Break it on purpose, in staging',
        body: `Remove a required environment variable and redeploy. Read the startup error — this is
where the pydantic settings module pays off, because the error names the missing key
instead of failing somewhere random later.

Then put it back and confirm recovery.`,
      },
      {
        mode: 'decision',
        title: 'What would you need to debug this at 3am?',
        body: `Your deployed API starts returning 500s. You have the platform dashboard and nothing
else.

List what you would need: which logs, which fields, which endpoints, which dashboards.
Compare that list against what you actually have right now, and add the cheapest missing
item today.`,
      },
    ],
  },
];
