import type { Topic } from '@/lib/types';

export const s5_2: Topic[] = [
  {
    id: 's5.2.t1',
    moduleId: 's5.2',
    title: 'Workers, and the sync-inside-async trap',
    outcome: `You can find and fix blocking code inside async endpoints, choose between async libraries, threads and processes, and size workers for an AI service.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `One waiter serving twenty tables works beautifully — as long as they never stand at one
table waiting for the kitchen. The moment they wait, every other table waits too. An async
worker is that waiter, and blocking code is standing at the table.`,
    notes: `## One loop, many requests

A FastAPI worker process runs **one event loop**. \`async def\` endpoints share it: while one
request awaits the model, the loop serves others. That's why one worker can hold hundreds of
streaming conversations.

Until something **blocks**:

\`\`\`python
@app.post("/answer")
async def answer(q: Question):
    docs = requests.get(SEARCH_URL, params={"q": q.text}).json()   # blocks the loop!
    time.sleep(0.2)                                                # blocks the loop!
    reply = anthropic.Anthropic().messages.create(...)             # sync client: blocks!
\`\`\`

Each of these freezes **every** request on that worker for its duration.

---

## The fixes

| Blocking thing | Fix |
|---|---|
| HTTP calls | \`httpx.AsyncClient\` |
| the Anthropic SDK | \`anthropic.AsyncAnthropic()\` |
| database | \`asyncpg\` / async SQLAlchemy |
| a sync-only library | \`await asyncio.to_thread(fn, ...)\` |
| heavy CPU (PDF parsing, big tokenising) | a **queue and worker process** (next topic) |

Or declare the endpoint with plain \`def\` — FastAPI then runs it in a thread pool, which is
safe (but a thread per request doesn't scale like async).

---

## Finding it

- Python's asyncio **debug mode** (\`PYTHONASYNCIODEBUG=1\`) logs callbacks that hold the loop
  for more than 100 ms.
- A tiny background task that measures **event-loop lag** (sleep 0.1 s, measure how late it
  wakes) and exports it as a metric. Lag spikes point straight at blocking code.
- Load-test with concurrency: a blocking endpoint's latency grows linearly with concurrent
  users.

---

## How many workers?

- **Processes:** roughly one per CPU core for CPU-bound work; for I/O-bound AI serving, a
  few processes, each handling many concurrent requests.
- **In containers:** often **one process per container**, and scale the number of
  containers — the platform (Cloud Run, ECS) handles the rest (Module 7).
- Set your platform's **concurrency per instance** from a load test, not a guess.`,
    docs: [
      {
        label: 'FastAPI — concurrency and async / await',
        url: 'https://fastapi.tiangolo.com/async/',
      },
      {
        label: 'Python — asyncio debug mode',
        url: 'https://docs.python.org/3/library/asyncio-dev.html#debug-mode',
      },
    ],
    glossary: [
      {
        term: 'event loop',
        def: 'The scheduler that runs async tasks, switching between them whenever one awaits.',
      },
      {
        term: 'blocking call',
        def: 'A call that holds the thread until it finishes, stopping the event loop.',
      },
      {
        term: 'thread pool',
        def: 'A set of threads that runs sync functions so they don\'t block the event loop.',
      },
      {
        term: 'event-loop lag',
        def: 'How late scheduled work runs — a direct measure of blocking.',
      },
    ],
    check: [
      {
        q: 'Why does one blocking call in an async endpoint hurt every user on that worker?',
        a: `All async endpoints share one event loop; a blocking call stops the loop, so every other request on that worker waits.`,
      },
      {
        q: 'What should you use for the Anthropic SDK inside async code?',
        a: 'The async client, anthropic.AsyncAnthropic(), with await.',
      },
      {
        q: 'How do you run a sync-only library call safely from async code?',
        a: 'await asyncio.to_thread(fn, ...) — or move heavy work to a separate worker process via a queue.',
      },
      {
        q: 'How can you detect blocking code in production?',
        a: `Measure event-loop lag as a metric (and use asyncio debug mode in development) — lag spikes reveal blocking.`,
      },
    ],
    practice: [
      {
        mode: 'break',
        title: 'Block the loop on purpose',
        body: `Write two endpoints: \`/good\` does \`await asyncio.sleep(1)\`, \`/bad\` does \`time.sleep(1)\`.
Run one uvicorn worker. Fire 20 concurrent requests at each (with \`httpx\` and
\`asyncio.gather\`, or \`hey\`) and record total time and p95.`,
        answer: `Expected:

- **\`/good\`:** all 20 finish in about **1 second** — they overlap on the loop.
- **\`/bad\`:** about **20 seconds** — each sleep freezes the loop, so requests run one at a
  time. p95 is terrible.

Then change \`/bad\` to \`await asyncio.to_thread(time.sleep, 1)\`: back to about a second
(up to the thread pool's size). Now imagine \`time.sleep(1)\` is a sync HTTP call to the
model provider that takes 3 s — a single sync client call can make a whole worker feel
down. This experiment is worth doing once; you'll spot the pattern in code reviews forever.`,
      },
      {
        mode: 'read',
        title: 'Find the blocking calls',
        body: `\`\`\`python
@app.post("/ingest")
async def ingest(file: UploadFile):
    data = await file.read()
    text = pymupdf.open(stream=data).get_page_text(0)       # (a)
    chunks = splitter.split_text(text)                      # (b)
    vecs = await voyage.embed(chunks, model="voyage-4")     # (c)
    with psycopg.connect(DSN) as conn:                      # (d)
        conn.execute("INSERT ...")
    return {"chunks": len(chunks)}
\`\`\`

Which lines block the event loop, and how would you restructure the endpoint?`,
        answer: `- **(a)** PDF parsing — CPU work, blocks (badly, for large files).
- **(b)** splitting — CPU work; small for one page, heavy for big documents.
- **(c)** fine — awaited async call (assuming an async client).
- **(d)** a **sync** database driver inside an async endpoint — blocks on every query.

Restructure: this endpoint shouldn't do the work at all. Store the upload (object storage),
create an ingestion job, **enqueue** it, and return \`202 Accepted\` with a job ID
(topic 3). The worker process does the parsing, splitting, embedding and inserts, where
CPU work doesn't stall anyone's chat. If some of it must stay in the web process, use
\`asyncio.to_thread\` for (a)/(b) and an async driver for (d).`,
      },
    ],
  },
  {
    id: 's5.2.t2',
    moduleId: 's5.2',
    title: 'Queues and workers',
    outcome: `You can move slow and retryable work onto a queue with workers — with retries, a dead-letter record, idempotency and backpressure — and size it from arrival rate and throughput.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-queue-backpressure'],
    analogy: `A busy restaurant takes orders at the counter and hands them to the kitchen on tickets.
The cashier never cooks. If the kitchen falls behind, the ticket rail fills up — and a
sensible manager stops taking new orders for a while, rather than promising food nobody can
cook.`,
    notes: `## What belongs on a queue

Anything **slow**, **retryable** or **bursty**:

- document ingestion (parse, embed, index)
- agent runs that take minutes or wait for approval
- eval runs, batch jobs, emails and webhooks

The web process accepts the request, enqueues a job, and returns immediately. Workers do the
work at their own pace.

---

## arq: an async queue on Redis

\`\`\`python
# worker.py
from arq import Retry
from arq.connections import RedisSettings

async def ingest_document(ctx, document_id: str):
    try:
        await run_ingestion(document_id)            # idempotent: upserts, hashes
    except ProviderOverloaded:
        raise Retry(defer=ctx["job_try"] * 30)      # back off: 30 s, 60 s, 90 s…

class WorkerSettings:
    functions = [ingest_document]
    redis_settings = RedisSettings.from_dsn(REDIS_URL)
    max_jobs = 10          # concurrent jobs per worker
    job_timeout = 600
    max_tries = 5
\`\`\`

Enqueue from the API, with a job ID that de-duplicates:

\`\`\`python
await redis.enqueue_job("ingest_document", doc_id, _job_id=f"ingest:{doc_id}")
\`\`\`

Celery is the long-established alternative (sync-first, many brokers); Stage 3's Postgres
table with \`SKIP LOCKED\` is a fine third option.

---

## Failure handling

- **Retries** with backoff for transient errors (429, 5xx, timeouts).
- **A dead-letter record** after the last try — a row with the job, the error and when, so
  failures are visible and can be re-run.
- **Idempotency** — a retried job must be safe to run twice (upserts, idempotency keys).

---

## Capacity: arrival rate vs throughput

- Arrivals: **λ** jobs per minute. Throughput: workers × jobs each per minute = **μ**.
- If λ < μ, the queue stays short. If λ > μ, it grows **without limit**: every minute adds
  λ − μ jobs.
- Near capacity (λ close to μ), waiting time climbs steeply even though nothing is "full".

Scale workers on **queue depth and age of the oldest job**, not CPU.

---

## Backpressure

An unbounded queue turns overload into hours of delay and a surprise bill. Instead:

- cap the queue (or per-tenant queue) length
- when full, answer **429 with Retry-After**, or accept with a clear "delayed" status
- prioritise: interactive work before batch

Saying "not now" early is kinder than accepting work you can't do.`,
    docs: [
      {
        label: 'arq documentation',
        url: 'https://arq-docs.helpmanual.io/',
      },
      {
        label: 'Celery documentation',
        url: 'https://docs.celeryq.dev/',
      },
    ],
    glossary: [
      {
        term: 'job queue',
        def: 'A list of work items that worker processes pick up and run.',
      },
      {
        term: 'dead-letter',
        def: 'Where jobs are recorded after their final failed attempt, for inspection.',
      },
      {
        term: 'throughput',
        def: 'How many jobs the workers complete per unit of time.',
      },
      {
        term: 'backpressure',
        def: 'Slowing or refusing new work when the system is at capacity.',
      },
    ],
    check: [
      {
        q: 'What kinds of work belong on a queue?',
        a: 'Slow, retryable or bursty work — ingestion, long agent runs, evals, batch jobs, emails and webhooks.',
      },
      {
        q: 'What happens to a queue when arrivals exceed throughput?',
        a: 'It grows without limit, by the difference every minute, until load drops or capacity is added.',
      },
      {
        q: 'What should you scale workers on?',
        a: 'Queue depth and the age of the oldest job, not CPU usage.',
      },
      {
        q: 'What is backpressure?',
        a: `Refusing or delaying new work (for example 429 with Retry-After) when the system is at capacity, instead of accepting unbounded work.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Size the workers',
        body: `Without AI: \`plan(arrivals_per_min, secs_per_job, jobs_per_worker)\` returns the minimum
number of workers so throughput exceeds arrivals by 30% headroom, plus the utilisation at
that size.

Use it for: 120 documents a minute at peak, 20 s per document, 5 concurrent jobs per
worker.`,
        answer: `\`\`\`python
import math

def plan(arrivals_per_min, secs_per_job, jobs_per_worker, headroom=1.3):
    per_worker = jobs_per_worker * 60 / secs_per_job      # jobs per minute per worker
    workers = math.ceil(arrivals_per_min * headroom / per_worker)
    utilisation = arrivals_per_min / (workers * per_worker)
    return workers, round(utilisation, 2)

print(plan(120, 20, 5))
\`\`\`

Each worker does 5 × 60 / 20 = **15 jobs a minute**. 120 × 1.3 = 156 needed →
**11 workers**, running at 120 / 165 ≈ **73%** utilisation.

Two caveats worth writing next to the number: the embedding API's rate limit may cap
throughput before workers do (check ITPM), and "20 s per document" is an average —
big PDFs take much longer, so watch the oldest job's age, not just the count.`,
      },
      {
        mode: 'decision',
        title: 'Queue it or not?',
        body: `For each, decide: handle in the request, or queue it — and what the API returns.

1. A chat answer (streamed, ~3 s).
2. Ingesting a 400-page PDF.
3. Running the 200-question eval suite.
4. Sending a password-reset email.
5. A support agent run that may wait hours for approval.`,
        answer: `1. **In the request**, streamed — interactive, and a queue would only add delay.
2. **Queue** — slow and CPU-heavy; return \`202\` with a job ID and progress.
3. **Queue** — minutes long, retryable; triggered by CI or a button, results posted later.
4. **Queue** (or a background task with retries) — the request shouldn't fail because the
   email provider is slow; return 200 immediately.
5. **Queue plus durable state** — the run pauses and resumes (Stage 4); the API returns
   the run ID, and the UI subscribes to its events.`,
      },
    ],
  },
  {
    id: 's5.2.t3',
    moduleId: 's5.2',
    title: 'Long-running work: jobs, polling, webhooks and progress',
    outcome: `You can design an API for work that takes minutes — job IDs, status endpoints, webhooks and streamed progress — and pick the right way to report back for each caller.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A dry cleaner gives you a ticket. You can come back and ask ("is it ready?" — polling), they
can call you when it's done (a webhook), or you can watch the order-status page update live
(streamed progress). The ticket number is what makes all three possible.`,
    notes: `## The pattern

\`\`\`text
POST /jobs            → 202 Accepted  {"job_id": "j_81f2", "status": "queued"}
GET  /jobs/j_81f2     → 200 {"status": "running", "progress": 0.4}
GET  /jobs/j_81f2     → 200 {"status": "done", "result_url": "/jobs/j_81f2/result"}
DELETE /jobs/j_81f2   → cancel
\`\`\`

The job ID is the ticket. Store status, progress, result and error in your database, keyed
by it.

---

## Three ways to report back

| Method | Best for | Watch out for |
|---|---|---|
| **Polling** \`GET /jobs/{id}\` | simple clients, scripts | poll with backoff (1 s, 2 s, 4 s…), not every 100 ms |
| **Webhooks** | server-to-server integrations | sign them, retry them, make receivers idempotent |
| **Streamed progress** (SSE) | your own UI | reconnects; long-lived connections |

---

## Webhooks, done properly

- **Sign** each delivery: an HMAC of the body with a shared secret, in a header. Receivers
  verify it before trusting anything.
- **Retry** on failure with backoff, for hours — receivers go down.
- Include an **event ID** so receivers can ignore duplicates (they will get some).
- Send a small payload (IDs and status); receivers fetch details with their own credentials.

---

## Streamed progress

Workers publish progress events (Redis pub/sub or Postgres \`LISTEN/NOTIFY\`); an SSE
endpoint forwards them to the browser:

\`\`\`text
event: progress
data: {"stage": "embedding", "done": 140, "total": 400}
\`\`\`

Give each event an \`id:\` — if the connection drops, the browser reconnects with
\`Last-Event-ID\` and you resume from there.

---

## Loose ends

- **Cancellation:** \`DELETE\` sets a flag the worker checks between steps.
- **Expiry:** results expire after a documented time; say so in the API.
- **Ownership:** only the job's owner (or tenant) can read it — job IDs aren't secrets.`,
    docs: [
      {
        label: 'MDN — using server-sent events',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
      },
      {
        label: 'Python — hmac.compare_digest',
        url: 'https://docs.python.org/3/library/hmac.html#hmac.compare_digest',
      },
    ],
    glossary: [
      {
        term: '202 Accepted',
        def: 'An HTTP status meaning the request was accepted for processing, which isn\'t finished yet.',
      },
      {
        term: 'webhook',
        def: 'An HTTP request your system sends to a customer\'s URL when an event happens.',
      },
      {
        term: 'HMAC',
        def: 'A signature made from a message and a shared secret, proving who sent it and that it wasn\'t changed.',
      },
      {
        term: 'Last-Event-ID',
        def: 'The header a browser sends when reconnecting an SSE stream, naming the last event it received.',
      },
    ],
    check: [
      {
        q: 'What does POST /jobs return for long work?',
        a: '202 Accepted with a job ID (and initial status), so the client can track the job.',
      },
      {
        q: 'Why sign webhooks?',
        a: 'So receivers can verify each delivery really came from you and wasn\'t altered, before acting on it.',
      },
      {
        q: 'Why must webhook receivers be idempotent?',
        a: 'Deliveries are retried, so the same event can arrive more than once.',
      },
      {
        q: 'How does SSE resume after a dropped connection?',
        a: 'Each event has an id; the browser reconnects with Last-Event-ID and the server continues from there.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Sign and verify a webhook',
        body: `Without AI: write \`sign(body: bytes, secret: bytes) -> str\` and
\`verify(body: bytes, header: str, secret: bytes) -> bool\` using HMAC-SHA256. Verification
must use a constant-time comparison. Add a timestamp to the signed content to block
replays older than 5 minutes.`,
        answer: `\`\`\`python
import hashlib, hmac, time

def sign(body: bytes, secret: bytes, ts: int | None = None) -> str:
    ts = ts or int(time.time())
    mac = hmac.new(secret, f"{ts}.".encode() + body, hashlib.sha256).hexdigest()
    return f"t={ts},v1={mac}"

def verify(body: bytes, header: str, secret: bytes, tolerance: int = 300) -> bool:
    try:
        parts = dict(p.split("=", 1) for p in header.split(","))
        ts, given = int(parts["t"]), parts["v1"]
    except (ValueError, KeyError):
        return False
    if abs(time.time() - ts) > tolerance:
        return False                                  # too old: possible replay
    expected = hmac.new(secret, f"{ts}.".encode() + body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, given)       # constant-time
\`\`\`

Why each detail matters: signing the **raw body bytes** (not re-serialised JSON, which
can change); **\`compare_digest\`** so an attacker can't learn the signature byte by byte
from timing; the **timestamp** inside the signed content so an old, valid delivery can't
be replayed later. This is the same scheme major payment providers use.`,
      },
      {
        mode: 'decision',
        title: 'Pick the reporting method',
        body: `1. Your own React app showing ingestion progress for an upload.
2. A customer's backend that wants to know when their bulk eval finishes.
3. A one-off CLI script that submits a job and waits.
4. A mobile app that may be closed while a 10-minute job runs.`,
        answer: `1. **SSE** — live progress in the UI; fall back to polling if the stream drops.
2. **Webhook** — server-to-server; signed, retried, with event IDs.
3. **Polling with backoff** — simplest possible client.
4. **A push notification** when done, plus polling (or a fresh fetch) when the app opens —
   a live stream can't survive the app closing.`,
      },
    ],
  },
  {
    id: 's5.2.t4',
    moduleId: 's5.2',
    title: 'Streaming at scale',
    outcome: `You can keep token streams working through proxies and load balancers, stop paying when users leave, and shut servers down without cutting answers off mid-sentence.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A live cricket commentary over a phone line that passes through several exchanges. If any
exchange waits to collect a full minute of audio before passing it on, you hear the wicket a
minute late. Every hop between the model and the browser can do that to a stream.`,
    notes: `## Buffering: the silent killer of streams

Streaming works on your laptop and "doesn't stream" in production. Usually something in
between is **buffering**:

- **Nginx** buffers proxied responses by default → \`proxy_buffering off;\` for the stream
  route, or send the header \`X-Accel-Buffering: no\`.
- **Compression middleware** (gzip) may wait for enough bytes to compress → exclude
  \`text/event-stream\`.
- **CDNs and some load balancers** buffer or time out long responses → check their
  streaming support.

Test streaming **through the real path** (staging, behind the real proxy), not just locally.

---

## Timeouts and heartbeats

- Load balancers close idle connections (AWS ALB's default idle timeout is 60 s).
- Platforms cap request duration (Cloud Run: 5 minutes by default, up to 60).

A long pause (the model thinking, a slow tool) can look "idle". Send an SSE **comment
heartbeat** every ~15 s — \`: ping\` — which browsers ignore and proxies count as traffic.

---

## When the user leaves, stop paying

If the browser tab closes, keep generating and you pay for tokens nobody reads. Use the SDK's
stream as a context manager inside your generator, so cancellation closes the upstream
connection:

\`\`\`python
async def events(q):
    async with client.messages.stream(model=MODEL, max_tokens=1024,
                                      messages=[{"role": "user", "content": q}]) as s:
        async for text in s.text_stream:
            yield f"data: {json.dumps(text)}\\n\\n"

@app.get("/chat")
async def chat(q: str):
    return StreamingResponse(events(q), media_type="text/event-stream")
\`\`\`

When the client disconnects, the server cancels the generator; exiting the \`async with\`
closes the stream to the provider, and generation stops.

---

## Graceful shutdown mid-stream

Deploys restart servers — while people are mid-answer.

- On SIGTERM: **stop accepting** new connections, let **in-flight streams finish** within a
  grace period (uvicorn: \`--timeout-graceful-shutdown\`; Cloud Run allows about 10 s after
  SIGTERM).
- For work longer than the grace period, don't hold it in the connection: run it as a job
  (Stage 4's durable runs) and stream **its events**, which a new server can continue after
  the client reconnects with \`Last-Event-ID\`.

---

## Capacity for long connections

Each open stream holds a connection and a little memory for its whole duration — seconds to
minutes. Size concurrency per instance for **open streams**, not requests per second, and
load-test with realistic answer lengths (Module 7).`,
    docs: [
      {
        label: 'Nginx — proxy_buffering',
        url: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering',
      },
      {
        label: 'Anthropic — streaming messages',
        url: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
      },
      {
        label: 'Uvicorn — settings (graceful shutdown)',
        url: 'https://www.uvicorn.org/settings/',
      },
    ],
    glossary: [
      {
        term: 'proxy buffering',
        def: 'A proxy collecting a response before passing it on, which breaks streaming.',
      },
      {
        term: 'idle timeout',
        def: 'The time after which a load balancer closes a connection with no traffic.',
      },
      {
        term: 'heartbeat',
        def: 'A small periodic message that keeps a connection from looking idle.',
      },
      {
        term: 'graceful shutdown',
        def: 'Stopping a server without cutting off requests already in progress.',
      },
    ],
    check: [
      {
        q: 'Name two things that commonly buffer a stream in production.',
        a: `Reverse proxies like Nginx (proxy buffering), and compression middleware — also some CDNs and load balancers.`,
      },
      {
        q: 'What is an SSE heartbeat, and why send it?',
        a: `A comment line like ': ping' sent every ~15 s; browsers ignore it, but it stops proxies and load balancers treating the connection as idle.`,
      },
      {
        q: 'How do you stop paying for tokens when a user closes the tab?',
        a: `Generate inside the SDK's stream context manager in the response generator; on disconnect the generator is cancelled and the upstream stream is closed.`,
      },
      {
        q: 'What should happen to in-flight streams on SIGTERM?',
        a: `Stop accepting new connections and let current streams finish within a grace period; longer work should run as durable jobs that can be resumed.`,
      },
    ],
    practice: [
      {
        mode: 'break',
        title: 'Find the buffer',
        body: `Put Nginx in front of your streaming endpoint with default settings (Docker makes this a
five-line config). Measure time-to-first-byte in the browser. Then add
\`proxy_buffering off;\` for that location and measure again.`,
        answer: `With default buffering, the first bytes often arrive only when the whole answer is done
(or when Nginx's buffer fills) — the UI shows nothing, then everything at once. With
buffering off (or the \`X-Accel-Buffering: no\` header from your app), tokens flow
immediately.

The config:

\`\`\`nginx
location /chat {
    proxy_pass http://app:8000;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_read_timeout 300s;
}
\`\`\`

Record both time-to-first-byte numbers. "Streaming broke behind the proxy and here's how
I proved and fixed it" is a common real-world bug and a good interview story.`,
      },
      {
        mode: 'read',
        title: 'Why is the bill higher than the traffic?',
        body: `Your dashboards show 10,000 chat sessions a day, and users read about 60% of answers to
the end (they often stop reading and leave). But billed output tokens match 100% of full
answer lengths. What's likely happening, and how do you confirm and fix it?`,
        answer: `**Generation continues after users leave.** The upstream stream isn't being closed on
disconnect — perhaps the model call runs in a separate task that isn't cancelled, or the
code collects the full response before streaming it.

Confirm: log, per request, whether the client disconnected and the number of output
tokens billed. Disconnected requests with full-length token counts prove it.

Fix: generate inside the response generator with the SDK's stream context manager, so
cancellation propagates and closes the connection to the provider; make sure no
background task keeps consuming the stream. Then the billed output for abandoned answers
drops to roughly what was actually sent — here, potentially a large share of the output
bill.`,
      },
    ],
  },
  {
    id: 's5.2.t5',
    moduleId: 's5.2',
    title: 'Rate limits: providers and tenants',
    outcome: `You can stay inside a provider's rate limits under load, and protect your service and budget with per-tenant token-bucket limits in Redis.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-token-bucket'],
    analogy: `A metro turnstile lets people through at a steady pace, and lets a small group rush through
at once when the gate's been quiet. That's a token bucket: a steady refill, plus a limited
burst.`,
    notes: `## Two kinds of limit

- **Theirs:** the provider limits you — requests, input tokens and output tokens per minute
  (RPM, ITPM, OTPM), per model class. Exceed them and you get **429** with a \`retry-after\`
  header.
- **Yours:** you limit your users and tenants — so one customer (or one abuser) can't
  starve everyone else or run up your bill.

---

## Staying inside the provider's limits

- **Cap concurrency** per model (a semaphore or connection pool), sized from your limits.
- **Respect \`retry-after\`**; retry with backoff and jitter (the SDK retries a couple of
  times for you).
- **Queue** non-urgent work instead of firing it all at once.
- **Use caching:** for most Claude models, only **uncached** input tokens count toward the
  ITPM limit — prompt caching raises your effective capacity.
- **Batch API** for non-urgent bulk work, at half price.

---

## The token bucket

Each tenant has a bucket holding up to **C** tokens (the burst), refilled at **r** per
second. A request spends tokens — 1 per request, or its estimated model tokens. Not enough
tokens → 429.

Anthropic's own API uses this algorithm: capacity is replenished continuously, not reset
once a minute.

---

## In Redis, atomically

\`\`\`lua
-- KEYS[1] = bucket; ARGV = capacity, refill_per_sec, now_ms, cost
local b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local cap, rate = tonumber(ARGV[1]), tonumber(ARGV[2])
local now, cost = tonumber(ARGV[3]), tonumber(ARGV[4])
local tokens = tonumber(b[1]) or cap
local ts = tonumber(b[2]) or now
tokens = math.min(cap, tokens + (now - ts) / 1000 * rate)
local ok = tokens >= cost
if ok then tokens = tokens - cost end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], math.ceil(cap / rate * 1000) + 1000)
return {ok and 1 or 0, tostring(tokens)}
\`\`\`

A Lua script runs atomically in Redis, so two concurrent requests can't both spend the last
token. (\`tostring\` because Redis turns Lua numbers into integers.)

---

## Using it

\`\`\`python
bucket = redis.register_script(TOKEN_BUCKET_LUA)

async def charge(tenant_id: str, cost: int):
    ok, left = await bucket(keys=[f"tb:{tenant_id}"],
                            args=[CAPACITY, RATE, int(time.time() * 1000), cost])
    if not ok:
        raise HTTPException(429, "Rate limit reached", headers={"Retry-After": "5"})
\`\`\`

Different plans get different \`CAPACITY\` and \`RATE\`. Charging by **estimated tokens**
rather than requests means one giant request can't count the same as a tiny one.`,
    docs: [
      {
        label: 'Anthropic — rate limits',
        url: 'https://platform.claude.com/docs/en/api/rate-limits',
      },
      {
        label: 'Redis — scripting with Lua',
        url: 'https://redis.io/docs/latest/develop/interact/programmability/eval-intro/',
      },
    ],
    glossary: [
      {
        term: 'rate limit',
        def: 'A cap on how many requests or tokens are allowed per unit of time.',
      },
      {
        term: 'token bucket',
        def: 'A limiter with a refilling store of tokens: the refill sets the rate, the capacity sets the burst.',
      },
      {
        term: 'retry-after',
        def: 'A response header saying how long to wait before retrying.',
      },
      {
        term: 'ITPM',
        def: 'Input tokens per minute — one of the Claude API\'s rate limits.',
      },
    ],
    check: [
      {
        q: 'What three limits does the Claude API apply per model class?',
        a: 'Requests per minute, input tokens per minute and output tokens per minute (RPM, ITPM, OTPM).',
      },
      {
        q: 'How does prompt caching help with rate limits?',
        a: `For most Claude models only uncached input tokens count toward the ITPM limit, so cached prefixes raise effective capacity.`,
      },
      {
        q: 'What do a token bucket\'s capacity and refill rate control?',
        a: 'Capacity is the largest burst allowed; the refill rate is the sustained rate.',
      },
      {
        q: 'Why implement the bucket as a Lua script in Redis?',
        a: 'It runs atomically, so concurrent requests can\'t both spend the same tokens.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'A token bucket in plain Python',
        body: `Without AI: write an in-memory \`TokenBucket(capacity, rate)\` with \`allow(cost=1, now=None)
-> bool\`. Then simulate: capacity 10, rate 1/s; 15 requests arrive at t = 0, then one per
second for 10 s. How many are allowed?`,
        answer: `\`\`\`python
import time

class TokenBucket:
    def __init__(self, capacity: float, rate: float):
        self.capacity, self.rate = capacity, rate
        self.tokens, self.ts = capacity, None

    def allow(self, cost: float = 1, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        if self.ts is not None:
            self.tokens = min(self.capacity, self.tokens + (now - self.ts) * self.rate)
        self.ts = now
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False

b = TokenBucket(10, 1)
burst = sum(b.allow(now=0) for _ in range(15))              # 10 allowed, 5 refused
later = sum(b.allow(now=t) for t in range(1, 11))           # 1 token refilled each second
print(burst, later)                                         # 10 10
\`\`\`

The burst takes the whole capacity (10 of 15); after that, the refill allows exactly one
request per second — all 10 later requests pass. The sustained rate is the refill rate;
the capacity only decides how big a burst can be.`,
      },
      {
        mode: 'decision',
        title: 'Set the limits',
        body: `Your plans: Free (hobby users), Team (up to 50 seats), Enterprise. Your provider limit for
the answer model is 400,000 input tokens per minute. A typical request uses ~6,000 input
tokens. Propose per-tenant buckets (in tokens), and say what protects you if 30 Team
tenants all peak at once.`,
        answer: `Provider capacity: 400,000 / 6,000 ≈ **66 requests a minute** before caching (more with
caching, since cached tokens don't count toward ITPM).

Per-tenant buckets, charged in estimated input tokens:

- **Free:** capacity 12,000 (two requests' burst), refill 1,000/min — a slow trickle.
- **Team:** capacity 60,000 (ten requests), refill 30,000/min (~5 a minute).
- **Enterprise:** by contract, with a dedicated share of capacity.

30 Team tenants at their sustained rates: 30 × 30,000 = 900,000 tokens a minute —
**more than the provider allows.** Per-tenant limits don't protect the shared limit, so
you also need:

- a **global** concurrency cap and queue in front of the provider, with priority by plan;
- **caching** of shared prefixes to cut counted tokens;
- a request for a **higher tier**, and a fallback model for overflow;
- graceful 429s (with Retry-After) rather than timeouts.

Per-tenant buckets give fairness; the global limit gives survival. You need both.`,
      },
    ],
  },
];
