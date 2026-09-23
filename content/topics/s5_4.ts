import type { Topic } from '@/lib/types';

export const s5_4: Topic[] = [
  {
    id: 's5.4.t1',
    moduleId: 's5.4',
    title: 'What to trace',
    outcome: `You can decide exactly what to record for every model call, retrieval, tool call and agent step — so that any slow, expensive or wrong answer can be explained from its trace.`,
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
        query: 'LLM observability tracing explained',
        channel: '',
        reason: 'what a good LLM trace looks like, visually',
      },
    ],
    animations: ['anim-trace-waterfall'],
    analogy: `An aircraft's black box doesn't record everything — it records the specific signals
investigators need to reconstruct what happened. A trace is the black box for one request:
choose the signals before the incident, not after.`,
    notes: `## A trace is a tree of spans

One request → one **trace**. Each step inside it → a **span** with a start, an end and
attributes. Spans nest:

\`\`\`text
POST /chat                                  1,420 ms
├─ auth                                        20 ms
├─ route (Haiku 4.5)                          310 ms   ← in parallel with retrieval
├─ retrieve                                   290 ms
│  ├─ embed query                              80 ms
│  ├─ hybrid search                            60 ms
│  └─ rerank 30 → 6                           150 ms
└─ generate (Sonnet 5)                      1,000 ms   TTFT 780 ms
\`\`\`

---

## What each kind of span carries

| Span | Record |
|---|---|
| **Model call** | model, prompt **version**, input / output / cached tokens, cost, latency, TTFT, stop reason |
| **Retrieval** | query (or its rewrite), filters, candidate IDs with scores, what was kept |
| **Tool call** | tool, arguments (redacted as needed), duration, result size, error |
| **Agent step** | step number, stop reason, tools requested, budget left |
| **Request** | user and tenant IDs, route, feature, final status |

With these, "why was this answer wrong?" becomes "look at the retrieval span: the right chunk
was at rank 9 and got cut".

---

## Prompts and outputs: store them carefully

Full prompts and outputs are the most useful thing to debug with — and the most sensitive.
Choose deliberately:

- store them for a **sample** of traffic, or for errors and flagged answers
- **redact** personal data before storage (Module 6)
- restrict access and set **retention** (e.g. 30 days)

---

## IDs that connect everything

- A **trace ID** returned to the client (in a response header), so a support ticket can
  point straight at the trace.
- The same ID in **logs**, **audit entries** and **feedback** records.
- Propagated across services — web API → queue → worker — so a job's spans join its
  request's trace.

---

## Sampling

At high volume, keep **all** traces for errors, slow requests and negative feedback, and a
**fraction** of the rest. Cost metrics come from logs of every call (cheap), not from full
traces.`,
    docs: [
      {
        label: 'OpenTelemetry — traces concepts',
        url: 'https://opentelemetry.io/docs/concepts/signals/traces/',
      },
      {
        label: 'Langfuse — tracing',
        url: 'https://langfuse.com/docs',
      },
    ],
    glossary: [
      {
        term: 'trace',
        def: 'The record of one request as a tree of timed steps.',
      },
      {
        term: 'span',
        def: 'One timed step within a trace, with attributes.',
      },
      {
        term: 'sampling',
        def: 'Keeping full detail for only a share of traffic (plus the interesting cases).',
      },
      {
        term: 'redaction',
        def: 'Removing or masking sensitive data before it\'s stored.',
      },
    ],
    check: [
      {
        q: 'What is a span?',
        a: `One timed step inside a request's trace, with a start, an end and attributes; spans nest to form a tree.`,
      },
      {
        q: 'Name five things to record on a model-call span.',
        a: `Model, prompt version, input/output/cached tokens, cost, latency and time to first token, and the stop reason.`,
      },
      {
        q: 'Why return the trace ID to the client?',
        a: 'So a user complaint or support ticket can point straight to the exact trace.',
      },
      {
        q: 'What should a sampling policy always keep?',
        a: 'Traces for errors, slow requests and negative feedback — then a fraction of the rest.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Diagnose from the trace',
        body: `A user says an answer about the "Pune travel policy" quoted Chennai rules. The trace
shows: route → lookup; retrieve: filters \`{}\`; candidates 50, top 6 kept: 4 from
"Chennai Travel Policy 2025", 2 from "Pune Travel Policy 2025"; generate: cited [1] and
[2], both Chennai.

What went wrong, and which spans prove it?`,
        answer: `**The retrieve span proves it:** \`filters {}\` — the city in the question was never turned
into a filter, and the two cities' policies are near-identical text, so Chennai chunks
out-ranked Pune's. The generate span shows the model faithfully cited what it was given.

Fixes: extract "Pune" as an \`office\` filter (Stage 3's filters from the question, with
company-wide documents still included); add a golden-set slice of city-specific
questions; and keep the city name in each chunk's heading path so retrieval itself
favours the right document.

Without the retrieval span's filters and candidates, this would have been reported as
"the model hallucinated".`,
      },
      {
        mode: 'spec',
        title: 'Spec your trace schema',
        body: `Write the span names and attributes for p-5.1: request, route, retrieve (with children),
generate, tool calls and agent steps. Say what's recorded always, what's sampled, what's
redacted, and the retention. Have AI add the instrumentation.`,
        answer: `A solid spec:

- **Always (every request):** span tree with timings; model, prompt version, tokens,
  cost, stop reason; retrieval candidate IDs and scores; tool names, durations, sizes,
  errors; user, tenant, feature, route; trace ID returned as \`X-Trace-Id\`.
- **Sampled (10%) plus every error, slow request (> p95) and thumbs-down:** full prompts,
  retrieved text, outputs — after redaction.
- **Redacted:** phone numbers, emails, government ID numbers, payment details (a
  redaction step before export).
- **Retention:** full payloads 30 days; span metadata 90 days; cost logs 13 months (for
  year-over-year comparison).
- **Propagation:** trace context passed into queued jobs, so ingestion and agent-run
  spans join the request.

Acceptance: pick any request from yesterday by trace ID and reconstruct what was
retrieved, what it cost and why it took as long as it did — in under a minute.`,
      },
    ],
  },
  {
    id: 's5.4.t2',
    moduleId: 's5.4',
    title: 'Langfuse',
    outcome: `You can instrument an AI app with Langfuse — traces, generations with cost, sessions, users, scores and prompt versions — and use it to debug and to feed evals.`,
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
        query: 'Langfuse tutorial tracing LLM app',
        channel: 'Langfuse',
        reason: 'the official walkthrough',
      },
    ],
    animations: [],
    analogy: `Google Analytics for your website shows sessions, pages and conversions without you
building a warehouse. Langfuse does the same for LLM calls: traces, costs, sessions and
quality scores, ready to explore.`,
    notes: `## What Langfuse gives you

- **Traces** with nested observations: spans, **generations** (model calls with tokens and
  cost) and events.
- **Sessions and users** — group traces into conversations; see a user's history.
- **Scores** — attach judge results, thumbs and manual labels to traces.
- **Prompt management** — versioned prompts you can fetch at runtime and roll back.
- **Datasets and experiments** — run a prompt version over a dataset and compare scores.

It's open source and can be self-hosted, or used as a hosted service.

---

## Instrumenting with the decorator

In the current Python SDK (v3, built on OpenTelemetry):

\`\`\`python
from langfuse import get_client, observe

langfuse = get_client()          # reads LANGFUSE_PUBLIC_KEY, _SECRET_KEY, _HOST

@observe()
async def answer(question: str, user_id: str, session_id: str):
    langfuse.update_current_trace(user_id=user_id, session_id=session_id, tags=["rag"])
    chunks = await retrieve(question)                 # @observe() on it too
    return await generate(question, chunks)

@observe(as_type="generation")
async def generate(question, chunks):
    response = await client.messages.create(model=MODEL, max_tokens=800, messages=...)
    langfuse.update_current_generation(
        model=MODEL,
        usage_details={"input": response.usage.input_tokens,
                       "output": response.usage.output_tokens},
    )
    return response
\`\`\`

(Older SDK versions import \`observe\` from \`langfuse.decorators\`. Check the docs for the
version you install — these APIs move.)

---

## Scores close the loop

Every judged sample, thumbs-up or manual review becomes a **score** on its trace. Then you
can filter "faithfulness < 0.5 this week", open the traces, and read what went wrong — Stage
3's error analysis, on production data.

---

## Prompt versions

Store prompts in Langfuse (or in your repo — either works), fetch the active version at
runtime, and record the version on each generation. Then a quality drop can be traced to
"prompt v14 went live at 15:02", and rollback is a click.

---

## Others to know of

Arize **Phoenix** (open source, OpenTelemetry-based), **LangSmith** (LangChain's platform),
**Helicone** (a proxy that logs calls), **Braintrust** and **W&B Weave**. The concepts —
traces, generations, scores, datasets — carry over.`,
    docs: [
      {
        label: 'Langfuse documentation',
        url: 'https://langfuse.com/docs',
      },
      {
        label: 'Arize Phoenix',
        url: 'https://arize.com/docs/phoenix',
      },
    ],
    glossary: [
      {
        term: 'observation',
        def: 'Langfuse\'s name for a step inside a trace: a span, generation or event.',
      },
      {
        term: 'score',
        def: 'A quality value attached to a trace — from a judge, a user or a reviewer.',
      },
      {
        term: 'prompt management',
        def: 'Storing prompts as versioned artifacts fetched at runtime.',
      },
      {
        term: 'session',
        def: 'A group of traces from one conversation or visit.',
      },
    ],
    check: [
      {
        q: 'What is a generation in Langfuse?',
        a: 'An observation for a model call, carrying the model, token usage and cost.',
      },
      {
        q: 'Why attach scores to traces?',
        a: `So judge results and user feedback can be filtered and read in context — error analysis on production data.`,
      },
      {
        q: 'What does recording the prompt version on each generation enable?',
        a: 'Tracing quality changes to a specific prompt release, and rolling back precisely.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Instrument p-3.1 with Langfuse',
        body: `Run Langfuse (hosted free tier, or self-hosted with Docker), instrument p-3.1's request
path with \`@observe\`, and make 30 requests. Then find: the most expensive request, the
slowest step on average, and one answer you'd score as unfaithful.`,
        answer: `What a good result looks like:

- Each request is one trace with nested observations: retrieve (with its own children if
  you decorated them) and a generation with model, tokens and cost.
- **Most expensive request:** usually one with many retrieved chunks or a long
  conversation — the generation's input tokens tell you which.
- **Slowest step on average:** often the generation's time to first token, then
  reranking. The UI's latency breakdown per observation shows it.
- **The unfaithful answer:** add a manual score (and later, your judge's automated score)
  so it's findable again.

Write down one change you'd make from what you saw. If you can't find one, instrument
more detail — the retrieval candidates and scores are usually what's missing.`,
      },
      {
        mode: 'decision',
        title: 'Langfuse, OpenTelemetry, or both?',
        body: `Your company already runs OpenTelemetry with Grafana for all services. The AI team wants
Langfuse. What do you propose?`,
        answer: `**Both, connected by OpenTelemetry.**

- Instrument AI calls once, with OpenTelemetry spans that follow the GenAI conventions
  (next topic), so AI spans sit inside the same traces as the rest of the request in
  Grafana — one timeline for "why was this request slow?".
- Export the AI spans to Langfuse as well (it accepts OpenTelemetry data), for the
  AI-specific views: generations with cost, sessions, scores, prompt versions, datasets.

That avoids two separate instrumentation layers, keeps the platform team's tooling, and
gives the AI team what they need. The thing to avoid is AI calls traced only in a tool
the rest of engineering never looks at.`,
      },
    ],
  },
  {
    id: 's5.4.t3',
    moduleId: 's5.4',
    title: 'OpenTelemetry for AI calls',
    outcome: `You can emit AI spans with OpenTelemetry using the GenAI semantic conventions, so model calls appear inside the same traces as your API, database and queue.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Railway timetables work across the country because every station writes times the same
way. OpenTelemetry is that shared format for traces — so a span from your FastAPI app, your
database driver and your model call can be read on one timeline.`,
    notes: `## Why OpenTelemetry

- **One standard** for traces, metrics and logs, supported by almost every backend
  (Grafana Tempo, Jaeger, Honeycomb, Datadog, Langfuse, Phoenix…).
- **Auto-instrumentation** for FastAPI, httpx, database drivers and more — you get most of
  the request's spans for free.
- **Context propagation**: trace IDs flow across services and into queued jobs.

Your AI spans then sit **inside** the request, next to the database query that was actually
slow.

---

## The GenAI conventions

OpenTelemetry defines standard attribute names for AI calls, such as:

| Attribute | Example |
|---|---|
| \`gen_ai.operation.name\` | \`chat\`, \`embeddings\`, \`execute_tool\` |
| \`gen_ai.request.model\` | \`claude-sonnet-5\` |
| \`gen_ai.usage.input_tokens\` | \`4300\` |
| \`gen_ai.usage.output_tokens\` | \`350\` |

Standard names mean any backend can build token and cost views without custom mapping.
These conventions are still evolving — pin your library versions.

---

## A manual span

\`\`\`python
from opentelemetry import trace

tracer = trace.get_tracer("rag")

async def generate(messages):
    with tracer.start_as_current_span(f"chat {MODEL}") as span:
        span.set_attribute("gen_ai.operation.name", "chat")
        span.set_attribute("gen_ai.request.model", MODEL)
        response = await client.messages.create(model=MODEL, max_tokens=800,
                                                messages=messages)
        span.set_attribute("gen_ai.usage.input_tokens", response.usage.input_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", response.usage.output_tokens)
        span.set_attribute("app.prompt_version", PROMPT_VERSION)
        span.set_attribute("app.cost_usd", cost_of(response.usage))
        return response
\`\`\`

Your own attributes go under your own prefix (\`app.\`).

---

## Wiring it up

1. \`opentelemetry-sdk\` plus the OTLP exporter; auto-instrument FastAPI and httpx.
2. Export to an **OpenTelemetry Collector**, which forwards to one or more backends.
3. Put the trace ID in logs and in the \`X-Trace-Id\` response header.
4. For queued jobs, pass the trace context in the job payload and continue it in the worker.`,
    docs: [
      {
        label: 'OpenTelemetry — GenAI semantic conventions',
        url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
      },
      {
        label: 'OpenTelemetry — Python',
        url: 'https://opentelemetry.io/docs/languages/python/',
      },
    ],
    glossary: [
      {
        term: 'OpenTelemetry',
        def: 'An open standard and toolkit for traces, metrics and logs.',
      },
      {
        term: 'semantic conventions',
        def: 'Agreed attribute names so every tool reads spans the same way.',
      },
      {
        term: 'OTLP',
        def: 'The OpenTelemetry protocol for exporting telemetry data.',
      },
      {
        term: 'context propagation',
        def: 'Passing trace IDs between services so their spans join one trace.',
      },
    ],
    check: [
      {
        q: 'What does context propagation give you?',
        a: 'Trace IDs flow across services and into queued jobs, so all of a request\'s work joins one trace.',
      },
      {
        q: 'Name three GenAI semantic-convention attributes.',
        a: `gen_ai.operation.name, gen_ai.request.model, gen_ai.usage.input_tokens and gen_ai.usage.output_tokens.`,
      },
      {
        q: 'Why export through an OpenTelemetry Collector?',
        a: `It decouples the app from backends: one export point that can forward to several tools, with sampling and redaction in one place.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'One timeline',
        body: `Add OpenTelemetry to p-3.1: auto-instrument FastAPI and httpx, add manual spans for
retrieval and the model call with GenAI attributes, and export to a local Jaeger (or
Grafana Tempo) in Docker. Find one request where something other than the model was the
slowest part.`,
        answer: `Once it works you'll see, in one trace: the HTTP request span, your retrieve span with
the database query spans nested inside (from the driver's instrumentation), the embedding
API call (httpx), and the model call span with token attributes.

Common finding: a request where the **database** or the **embedding call** took longer
than the model's time to first token — a missing index, a cold connection pool, or no
connection reuse to the embedding API. Invisible in a model-only tool, obvious on one
timeline.

Keep the Docker Compose file in the repo; p-5.1 needs tracing across all three projects,
and this is the template.`,
      },
      {
        mode: 'primitive',
        title: 'Propagate context through a queue',
        body: `Without AI: write \`enqueue_with_context(queue, job_name, payload)\` that injects the
current trace context into the payload, and \`run_with_context(payload, fn)\` that the
worker uses to continue the trace. Use \`opentelemetry.propagate.inject\` and \`extract\`.`,
        answer: `\`\`\`python
from opentelemetry import context, trace
from opentelemetry.propagate import extract, inject

tracer = trace.get_tracer("jobs")

async def enqueue_with_context(queue, job_name: str, payload: dict):
    carrier: dict[str, str] = {}
    inject(carrier)                          # writes the traceparent header into carrier
    await queue.enqueue_job(job_name, {**payload, "_otel": carrier})

async def run_with_context(payload: dict, fn):
    ctx = extract(payload.get("_otel", {}))  # rebuild the parent context
    token = context.attach(ctx)
    try:
        with tracer.start_as_current_span(f"job {fn.__name__}"):
            return await fn(payload)
    finally:
        context.detach(token)
\`\`\`

Now the worker's span is a child of the request that enqueued it: an ingestion job's
parsing and embedding spans appear under the upload request's trace, even minutes later
and in another process. \`inject\`/\`extract\` use the standard W3C \`traceparent\` format, so
this works across languages and tools.`,
      },
    ],
  },
  {
    id: 's5.4.t4',
    moduleId: 's5.4',
    title: 'The dashboards you need',
    outcome: `You can build the handful of dashboards that run an AI product — cost, latency, errors, cache and quality — and read them for problems before users report them.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A car's dashboard shows speed, fuel, temperature and a few warning lights — not every
sensor. It's designed so a glance tells you whether anything needs attention. Five panels
can do that for an AI system.`,
    notes: `## The five panels

1. **Cost** — spend per day, split by feature and by tenant; cost per request trend.
2. **Latency** — p50 and p95 per endpoint; time to first token for streamed routes.
3. **Errors** — rate by type: provider 429 / 529 / 5xx, validation failures, refusals,
   timeouts, budget stops.
4. **Cache** — hit rates per rung (prompt cache reads, response cache, semantic cache).
5. **Quality** — judge scores on sampled traffic, thumbs-down rate, citation rate, "not in
   the documents" rate — as trends.

Plus traffic volume, so every other number has context.

---

## Read them together

| You see | Likely cause |
|---|---|
| cost ↑, traffic flat | longer prompts or outputs; cache broken; new prompt version |
| p95 ↑, median flat | a slow tool or step on some requests |
| "not in the documents" ↑ | ingestion broke, or a filter is wrong |
| thumbs-down ↑ after a deploy | the deploy — roll it back first, investigate second |
| 429s ↑ | traffic spike or a lost cache pushing counted tokens up |

---

## Annotate deploys

Mark every deploy and prompt change on the charts. Half of all "what happened at 3 p.m.?"
questions are answered by a vertical line saying "prompt v14".

---

## Tools

Grafana over your metrics and traces, Metabase or plain SQL over your cost logs, and
Langfuse's built-in views for generations and scores. The tool matters less than having the
five panels **before** you need them.`,
    docs: [
      {
        label: 'Grafana documentation',
        url: 'https://grafana.com/docs/grafana/latest/',
      },
      {
        label: 'Anthropic — prompt caching',
        url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      },
    ],
    glossary: [
      {
        term: 'dashboard',
        def: 'A set of charts showing a system\'s health at a glance.',
      },
      {
        term: 'deploy annotation',
        def: 'A marker on charts showing when a release or change happened.',
      },
      {
        term: 'RED metrics',
        def: 'Rate, errors and duration: the classic service health signals.',
      },
    ],
    check: [
      {
        q: 'Name the five dashboard panels.',
        a: 'Cost, latency, errors, cache hit rates, and quality — plus traffic for context.',
      },
      {
        q: 'Cost is up but traffic is flat. What do you check?',
        a: 'Prompt or output length, a broken cache, and a new prompt version or model.',
      },
      {
        q: 'Why annotate deploys and prompt changes on charts?',
        a: 'Most sudden changes line up with a release; the annotation makes the cause visible immediately.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Build the five panels',
        body: `From your cost logs and traces, build the five panels for p-5.1 (Grafana or Metabase).
Add deploy annotations. Then take a screenshot — it's one of Stage 5's readiness items.`,
        answer: `Queries you'll need, sketched against a \`model_calls\` log table:

\`\`\`sql
-- cost per day by feature
SELECT date_trunc('day', at) AS day, feature, sum(cost_usd) AS usd
FROM model_calls GROUP BY 1, 2 ORDER BY 1;

-- p95 latency per endpoint, hourly
SELECT date_trunc('hour', at) AS hour, endpoint,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95
FROM requests GROUP BY 1, 2;

-- prompt-cache read share per day
SELECT date_trunc('day', at) AS day,
       sum(cache_read_tokens)::float / nullif(sum(input_tokens + cache_read_tokens), 0) AS share
FROM model_calls GROUP BY 1;
\`\`\`

A good screenshot shows a week of data with at least one annotated deploy and something
you can explain from the panels. If everything is flat, cause something (next module's
incident exercise) — dashboards prove themselves when something moves.`,
      },
      {
        mode: 'read',
        title: 'Read the dashboard',
        body: `Tuesday 14:00 onward: cost per request +45%; p50 latency +30%; cache-read share fell from
62% to 4%; thumbs-down unchanged; a deploy at 13:55 changed the system prompt to include
"Today's date is {date} {time}".

What happened, and what's the fix?`,
        answer: `**The prompt cache broke.** Putting the current **time** in the system prompt makes the
prefix different on every request, so nothing is ever read from the cache — the cache-read
share collapsed at exactly the deploy. Every request now pays full price for the whole
system prompt and tool definitions, and takes longer to process them (latency up).

Fix: move the timestamp **after** the stable prefix (for example into the user message),
or reduce it to the date if that's all the model needs. Deploy, and watch the cache-read
share recover.

This is Stage 2's "timestamp at the top" lesson, found from the dashboard in minutes — the
deploy annotation and the cache panel together make it obvious.`,
      },
    ],
  },
  {
    id: 's5.4.t5',
    moduleId: 's5.4',
    title: 'Feedback capture and alerting',
    outcome: `You can collect explicit and implicit user feedback tied to traces, turn it into eval cases, and alert on cost, latency, errors and quality without drowning in alerts.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A restaurant that reads every review, notices which dishes come back half-eaten, and
updates the menu — versus one that only counts customers. User feedback is the highest-
signal data an AI product ever gets.`,
    notes: `## Explicit feedback

- **Thumbs up/down** on each answer, with an optional reason ("wrong", "incomplete",
  "outdated", "didn't cite").
- Stored with the **trace ID**, so every rating links to exactly what the system did.

Only a small share of users click. That's fine — the ones who do are pointing at real
problems.

---

## Implicit feedback — often more honest

- **Edits:** how much a user changed a drafted reply before sending (edit distance).
- **Regenerate** clicks.
- **Copy** — a good sign for answers meant to be used.
- **Follow-ups** like "that's wrong" or re-asking the same question.
- **Abandonment** — leaving mid-answer.

For p-4.1, the edit distance on drafted replies is the single best quality signal you have.

---

## From feedback to evals

1. Thumbs-down and heavily edited answers go to a **review queue**.
2. Someone reads each with its trace and labels the failure (Stage 3's error analysis).
3. Good cases become **golden-set items** with the correct answer.

Your eval set then grows from real failures, not imagined ones.

---

## Alerts worth waking up for

| Alert | Signal |
|---|---|
| cost spike | spend this hour > 2× the same hour last week |
| latency regression | p95 above target for 10 minutes |
| error burst | provider errors or 5xx above a threshold |
| quality drop | judged faithfulness (rolling) or thumbs-down rate moves sharply |
| safety | any "claimed but not done", any cross-tenant access, any approval bypass |

---

## Without alert fatigue

- Alert on **symptoms users feel**, not every internal wobble.
- Each alert links to a **runbook**: what to check, how to roll back.
- Page people only for urgent ones; the rest go to a daily digest.
- Delete alerts nobody acts on.`,
    docs: [
      {
        label: 'Langfuse — user feedback and scores',
        url: 'https://langfuse.com/docs',
      },
      {
        label: 'Google SRE book — monitoring distributed systems',
        url: 'https://sre.google/sre-book/monitoring-distributed-systems/',
      },
    ],
    glossary: [
      {
        term: 'explicit feedback',
        def: 'Ratings users give on purpose, like thumbs up or down.',
      },
      {
        term: 'implicit feedback',
        def: 'Signals from behaviour — edits, regenerations, copies, abandonment.',
      },
      {
        term: 'runbook',
        def: 'Step-by-step instructions for responding to a specific alert.',
      },
      {
        term: 'alert fatigue',
        def: 'Ignoring alerts because too many of them don\'t matter.',
      },
    ],
    check: [
      {
        q: 'Why store feedback with the trace ID?',
        a: `So each rating links to exactly what the system did — retrieval, prompt version, answer — for diagnosis.`,
      },
      {
        q: 'Name three implicit feedback signals.',
        a: 'Edits to drafts, regenerate clicks, copies, follow-ups like "that\'s wrong", and abandonment.',
      },
      {
        q: 'How does feedback become eval data?',
        a: `Negative and heavily edited answers go to a review queue, get labelled, and good cases become golden-set items.`,
      },
      {
        q: 'What makes an alert worth paging for?',
        a: 'It reflects a symptom users feel or a safety breach, it\'s urgent, and it links to a runbook.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec feedback for p-4.1',
        body: `Spec feedback capture for the support agent: explicit ratings from support staff on each
drafted reply, implicit signals (edit distance, time to send, discard), how they link to
traces, the review queue, and the path into the eval suite. Have AI implement it.`,
        answer: `Spec essentials:

- **Explicit:** 👍/👎 on each draft with reason chips; stored as \`feedback(trace_id,
  run_id, rating, reason, by, at)\` and as a score in your tracing tool.
- **Implicit:** on send, compute normalised edit distance between draft and sent text
  (0 = unchanged, 1 = rewritten); record time from draft to send and discards.
- **Review queue:** 👎, discarded drafts and edit distance > 0.5 enter the queue, most
  recent first, with the trace one click away.
- **Labelling:** reviewers tag a failure category (from your error-analysis vocabulary)
  and, where possible, write the correct reply.
- **Into evals:** labelled cases become scenarios in the agent eval suite (Stage 4),
  tagged \`from_production\`, reviewed weekly.

Dashboard: weekly average edit distance and 👎 rate — the headline quality numbers for the
support lead.`,
      },
      {
        mode: 'decision',
        title: 'Which alerts page someone?',
        body: `Decide: page now, daily digest, or delete — for each proposed alert.

1. p95 latency above 3 s for 10 minutes on the chat endpoint.
2. One 529 overloaded error from the provider.
3. A tenant's spend reaches 80% of their monthly budget.
4. Any retrieval result containing another tenant's document.
5. Average answer length up 10% week over week.`,
        answer: `1. **Page** — users feel it right now; runbook: check traces, provider status, recent deploy.
2. **Delete** (as a standalone alert) — single transient errors are normal and retried;
   alert on a sustained error rate instead.
3. **Digest** (and an automatic email to the tenant's admin) — important, not urgent.
4. **Page immediately** — a potential data leak is a security incident, whatever the hour.
5. **Digest** — worth a look (cost and quality), not worth waking anyone.`,
      },
    ],
  },
];
