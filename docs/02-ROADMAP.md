# 02 — The Roadmap

**For:** MERN full stack · Python low–medium · SQL via MySQL · 300+ DSA · basic RAG shipped
**Goal:** full-stack AI engineer, competitive for the roles in `09-JOB-STRATEGY.md`
**Shape:** 7 stages, ~650–800 focused hours, **no deadlines**

---

## How this works

**Stages are content units, not calendar months.** There is no schedule, no weekly quota
and no time box anywhere in this plan. Exams happen, semesters happen, motivation varies.
The *order* matters — each stage assumes the one before it. The *pace* is entirely yours,
and AmpratAI remembers exactly where you stopped.

Each stage has:
- **What you get** — the one sentence you should be able to say afterwards
- **Modules → topics** — each topic has three checkpoints in AmpratAI:
  `Concepts` · `Practice` · `Mini-project`
- **Build** — the things that end up on your GitHub
- **Ready to move on?** — a self-check. Not a lock, not a test. Just an honest list of what
  the next stage assumes you can do. Move on when you want; come back when something bites.

`[core]` = the spine · `[optional]` = skip freely, come back if a job description asks

### How code works in this plan

You'll build with AI assistance, and that's the right call — it's how this work is actually
done now. Two things make it work rather than turn into copy-paste:

- **You must be able to explain any line in your own repo.** AmpratAI checks this: Amprat
  Assistant asks you about your own submitted code, in plain language. Not a test you can
  fail — a conversation that shows you where your understanding is thin.
- **About ten primitives stay hand-written**, because interviews probe them and because
  writing them once makes everything else legible: cosine similarity, a chunker, RRF, an
  agent loop, a retry wrapper with jitter, a token budgeter, a streaming parser, a semaphore
  pool, a tool-schema generator, a simple rate limiter. Each is 20–60 lines.

Everything else — services, UIs, pipelines, dashboards — you architect and direct, AI
types, you review and debug. Because of this, the project briefs in `07-PROJECT-BRIEFS.md`
aim much higher than a typical course's.

### Optional practices (genuinely optional)

- **DSA sharpening.** You've done 300+. No easy problems here. Occasional medium/hard when
  you feel rusty, plus the AI-flavoured implementation questions in `09-JOB-STRATEGY.md` §4.
- **Writing publicly.** One post per interesting problem is the single best portfolio
  multiplier, and it is *not* required for this path to work. AmpratAI drafts a summary of
  what you did whenever you finish something; publish it or don't.
- **Break-it drills.** Every module has one. Highly recommended — building teaches the happy
  path, breaking teaches the system — but nothing is gated on it.

---

## STAGE 1 — Python where it matters, and the backend gaps

**What you get:** "I can build, test, containerise and deploy a typed, async Python API
with Postgres and pgvector behind it."

**Why first:** You have the instincts and some Python. This stage closes the specific gaps
that AI code is built out of. It's deliberately small — skip anything you test out of.

### 1.1 Python for AI code `[core]`
> **Self-check — skip this module if you can:** write a decorator that times a function;
> explain what `yield` does; use a context manager; read a type-hinted signature with
> `Optional` and generics.
- Decorators, context managers, generators
- Type hints as you'd use TypeScript: `Optional`, unions, `Literal`, generics, `Protocol`
- `mypy`/`pyright` — same idea as `tsc`
- Dunder methods, `@property`, and why Python code uses inheritance far less than you'd expect
- The traps that catch JS developers: mutable default arguments, late binding in closures, truthiness differences, `is` vs `==`

### 1.2 Pydantic v2 `[core]` — *the most important module in this stage*
- Models, validation, `model_validate` / `model_dump`, field constraints, custom validators
- `pydantic-settings` for config
- Why this matters more than it looks: pydantic **is** the type system of the AI ecosystem.
  Tool schemas, structured outputs, FastAPI bodies, agent state — all pydantic. Get fluent
  here and Stages 2–4 get dramatically easier.

### 1.3 Async Python `[core]`
- `asyncio` vs the JS event loop: what's identical, what bites (blocking calls freeze
  everything; most libraries have both a sync and an async face and you can pick wrong)
- `gather`, `TaskGroup`, `as_completed`, `wait_for`, cancellation
- `Semaphore` for bounded concurrency — you'll use this for every batch of LLM calls
- `httpx.AsyncClient`: pooling, timeouts, retries with exponential backoff **and jitter**
- Async generators — how every streaming response you write will work
- Threads vs processes vs async, and the GIL, in one page

### 1.4 Tooling & testing `[core]`
- `uv` (replaces pip/venv/pyenv, far faster), `pyproject.toml`
- `ruff` for lint + format
- `pytest`: fixtures, parametrize, `pytest-asyncio`, mocking HTTP with `respx`
- Structured logging, `.env` handling, secret hygiene

### 1.5 FastAPI `[core]`
- Routers, request/response models, automatic OpenAPI
- **Dependency injection** — the concept Express doesn't have; it's how you'll wire model
  clients, DB sessions and per-request budgets later
- Middleware, exception handlers, CORS, background tasks
- **Streaming**: `StreamingResponse` + Server-Sent Events → you'll use this constantly
- WebSockets, lifespan events, testing with `httpx`
- Auth: API keys, JWT (maps to what you've already done)

### 1.6 Postgres conversion `[core]` — *short, you know SQL*
> **You know MySQL, so skip the SQL fundamentals.** This module is only the differences and
> the AI-specific parts.
- MySQL → Postgres differences that actually bite: types, `SERIAL`/identity, `RETURNING`, upserts, case sensitivity, `JSONB` vs MySQL JSON
- `EXPLAIN ANALYZE`: reading Postgres's output format
- Index types you don't have in MySQL: GIN, partial, expression indexes
- **`tsvector` full-text search** — you need this for hybrid retrieval in Stage 3
- **`pgvector`** — vector columns, distance operators, HNSW and IVFFlat indexes
- Async SQLAlchemy 2.0 + Alembic migrations

### 1.7 Docker & local infrastructure `[core]`
- Images, layers, a good Python Dockerfile (multi-stage, layer caching, non-root)
- `docker compose`: api + postgres + redis, volumes, healthchecks
- Env and secrets in containers
- Deploy a container somewhere real (Railway / Render / Fly) — full cloud comes in Stage 5

### 1.8 AI intuition, the cheap 8 hours `[core]`
Conceptual only. No math homework, no exercises, no derivations.
- What a token is — watch a sentence become integers
- Why models predict the next token, and what that implies about hallucination
- What an embedding is: meaning as coordinates; cosine similarity in one picture
- What temperature does to a probability distribution
- Attention, at the level of one good video and one blog post
- Pretraining vs instruction tuning vs RLHF, in one page

**Enough is enough:** when you can explain each of these to a non-technical friend in two
minutes. If you find yourself opening a linear algebra course, this module has gone wrong.

### Build
- **P1.1 "The Port"** — rebuild one of your Express + Mongo projects as FastAPI + Postgres,
  same API surface, with tests and Docker. Fast, because you're re-expressing something you
  already understand.
- **P1.2 "Async Harvester"** — concurrent, resumable, rate-limited fetcher writing to
  Postgres. Every pattern in it is what you need for concurrent LLM calls next stage.

### Ready to move on?
- A FastAPI endpoint that streams SSE while making several concurrent async calls with a concurrency cap — you can write this without looking things up
- You can explain what pydantic is doing when validation fails, and why that error is useful
- `docker compose up` brings up your stack on a clean machine
- A `pgvector` table exists, with an HNSW index, and you know what `ef_search` changes
- Tokens, embeddings and temperature — explainable without notes

---

## STAGE 2 — LLM APIs and production prompting

**What you get:** "I can build a reliable, streaming, cost-instrumented LLM feature against
any of the three major providers, and get structured output I can trust."

**Why it matters:** This is the skill that separates an AI engineer from a software
engineer. The API call is ten lines. Everything around it — reliability, cost, structure,
streaming, failure — is the job.

### 2.1 What an LLM call actually is `[core]`
- Provider SDKs: `anthropic`, `openai`, `google-genai` — message format, system prompts, multi-turn, stop reasons, usage
- Tokens and context windows: counting before you send, truncation, input vs output pricing
- Sampling: `temperature`, `top_p`, `max_tokens`, stop sequences; determinism and its limits
- Reasoning / extended-thinking modes: when the extra tokens pay for themselves
- Choosing a model as an engineering decision — capability vs latency vs ₹ per million tokens
- Rate limits, and what a 429 storm looks like

### 2.2 Streaming, end to end `[core]` — *your advantage starts here*
- Streaming APIs: event types, deltas, accumulating the final message
- FastAPI SSE → React; `EventSource` vs `fetch` + `ReadableStream`
- Cancelling mid-stream — and actually stopping the upstream call so you stop paying
- Token-by-token rendering without layout jumping; streaming markdown and code blocks
- **TTFT** (time to first token) vs total latency, measured and displayed

### 2.3 Production prompt engineering `[core]`
- System prompt architecture: role, task, constraints, output contract, examples, and an escape hatch ("if you don't know, say NOT_FOUND")
- Structure that helps: delimiters and tags, ordering, instructions after long context
- Few-shot: how many, and how to choose them
- Chain-of-thought and when to hide the reasoning from the user
- Decomposition: one prompt doing five things → five prompts doing one thing
- **Prompt versioning** — prompts are code: git them, template them, tag versions, log which version produced which output
- A/B testing prompts in production
- Failure taxonomy: refusal, drift, format break, truncation, over-hedging, injection — and the fix for each
- Cost/quality tuning: a smaller model with a better prompt often wins

### 2.4 Structured output you can trust `[core]`
- The three mechanisms — JSON mode, schema-constrained decoding, tool-based extraction — and their tradeoffs per provider
- Pydantic models as the contract, validated at the boundary
- **Repair loops**: validation error → targeted re-prompt including the error → retry budget → honest failure
- Partial and streaming structured output
- Enums and closed vocabularies to stop invented categories

### 2.5 Reliability and cost `[core]`
- Retries with backoff and jitter; which errors are retryable and which aren't
- Timeouts at every layer; the hung-stream failure
- **Fallback chains**: primary model → cheaper model → cache → honest error
- Caching: provider prompt caching (restructure your prompt to exploit it), exact-match, semantic
- Per-request cost accounting → a usage table → a budget guard that refuses calls over a cap
- Guardrails: input caps, PII redaction before sending, output moderation, prompt injection basics

### 2.6 Multimodal basics `[optional]`
Images in prompts, PDF input, audio transcription, and when plain OCR is the better answer.

### Build
- **P2.1 "Chat, done properly"** — three providers behind one interface, real streaming with
  working cancellation, a live cost meter, prompt versions recorded per message, a fallback
  chain you can demo by revoking a key.
- **P2.2 "Structured Extraction Service"** — documents → strictly validated JSON, with a
  golden set, a repair loop, and tests that fail when accuracy drops.

### Ready to move on?
- The same feature runs against Anthropic, OpenAI and Gemini behind one interface
- Cancelling a stream actually stops upstream billing, and you can show it in logs
- You can state what one request costs, from your own instrumentation
- Killing the primary provider's key degrades gracefully instead of 500-ing
- You have a `prompts/` directory with versions, and can trace an output to a version
- You've hit at least five distinct prompt failure modes and know what fixed each

---

## STAGE 3 — RAG for real, and how to know it works

**What you get:** "I can build retrieval over a messy real corpus, measure its quality with
numbers, and improve those numbers deliberately."

**You're not starting from zero here.** You have a basic RAG project. This stage starts by
auditing it, then rebuilds it properly. Your existing project becomes **version 1** — the
first row of the results table that will end up being your best portfolio artifact.

> **Start here:** run your existing RAG project against the 12 audit questions in
> AmpratAI's Stage 3 opener. Most of them will have no answer yet. That list *is* your
> syllabus for this stage, and it makes everything below concrete instead of abstract.

### 3.1 The retrieval problem, properly `[core]`
- Why RAG: private, fresh, verifiable data
- **RAG vs long context vs fine-tuning** — the decision table, with cost, latency, freshness and provenance. A guaranteed interview question.
- The eight stages: ingest → chunk → embed → index → retrieve → rerank → assemble → generate, plus citations and evaluation around them

### 3.2 Embeddings in practice `[core]`
- Comparing embedding models: dimensions, cost, multilingual, domain fit
- Normalisation, cosine vs dot vs L2, and why the wrong choice silently ruins recall
- Batching and caching embeddings; the cost of re-embedding a corpus, and how to avoid it
- Seeing your corpus: a UMAP projection of your own documents, to spot clusters and outliers
- Truncated/Matryoshka embeddings and quantisation tradeoffs

### 3.3 Ingestion — the unglamorous 60% `[core]`
- PDF reality: text layers, two-column layouts, tables, headers, scans that need OCR
- HTML, markdown, docx, code, spreadsheets; transcription for audio and video
- Cleaning: boilerplate removal, near-duplicate detection, language detection
- **Metadata design** — the highest-return 30 minutes in RAG. Source, title, section path, page, date, tenant, permissions, version. You cannot filter on what you didn't store.
- Incremental sync: content hashing, idempotent upserts, deletes, re-index strategy
- Pipeline mechanics: queue, worker, resumability, visibility into what failed

### 3.4 Chunking `[core]`
- Fixed-size with overlap (the baseline), recursive splitting, token-aware sizing
- **Structure-aware** splitting: markdown headers, HTML sections, code structure, PDF sections
- Semantic and propositional chunking
- Parent-document / small-to-big retrieval; sentence-window retrieval
- **Contextual retrieval** — prepend a short model-written context line to each chunk; a large recall win for a small cost
- Chunk size vs recall vs precision vs cost — measured on *your* corpus, not on someone's default

### 3.5 Vector storage `[core]`
- **`pgvector` as your primary** — one database for rows, vectors and full-text is a real architectural advantage, and you get hybrid search without a second system
- **Qdrant as the contrast** — a dedicated engine: payload filtering, collections, quantisation
- Know-of only: Pinecone, Weaviate, Chroma, Milvus — one sentence each
- Index types: flat vs HNSW vs IVFFlat; `m`, `ef_construction`, `ef_search` and the recall↔latency dial
- **Do not learn four vector databases.** One deeply, one for contrast.

### 3.6 Retrieval quality `[core]`
- **Hybrid search**: full-text + vector, fused with Reciprocal Rank Fusion. Almost always beats vector-only — keyword search finds the exact product code, vectors find the paraphrase.
- **Reranking**: retrieve 50, rerank to 5. Usually the biggest quality jump per line of code.
- Metadata filters and permission-aware retrieval; pre-filter vs post-filter and the recall cliff
- Query understanding: rewriting, multi-query, HyDE, decomposition, routing
- Diversity and de-duplication of near-identical chunks

### 3.7 Context assembly `[core]`
- Token budget: system + history + retrieved + question + reserved output
- Ordering effects — "lost in the middle"; put the question after the context
- Citation formats that let the UI link back to a page and section
- Compaction: summarising history, dropping stale turns
- When *not* to retrieve at all (a router: greeting vs lookup vs calculation)

### 3.8 Evaluation `[core]` — *do this before the optimisation work*
- Build the **golden set** first: 50–100 real questions with known correct sources. Hand-written. This is the asset; the code is not.
- Retrieval metrics: recall@k, precision@k, MRR, nDCG
- Generation metrics: faithfulness, answer relevance, context precision, citation correctness
- **LLM-as-judge**: rubric design, calibrating the judge against your own labels, position and verbosity bias
- Regression gates: the eval suite runs in CI and blocks a merge on a score drop
- **Error analysis**: read 20 failures by hand, group them, fix the group. Repeat. This is the actual job, and it's the part no course teaches.

> **Order note:** AmpratAI puts 3.8 before 3.6 in the path. Building the ruler before doing
> the optimisation is the single highest-value sequencing decision in this whole roadmap.

### Build
- **P3.1 "Document Intelligence, with receipts"** — RAG over a genuinely messy 500+ page
  corpus, with verifiable citations and **a results table across 6+ pipeline versions**,
  starting from your existing project as v1.
- **P3.2 "Ask My Repo"** `[optional]` — RAG over your own GitHub repos with code-aware
  chunking and `file:line` citations.

### Ready to move on?
- Your golden set exists, hand-written, in the repo
- The eval suite runs in CI and you've watched it fail a deliberately bad change
- You have the before/after table: 6+ variants, each with recall@5, faithfulness, p95, ₹/query
- You can argue RAG vs long context vs fine-tuning using numbers from your own corpus
- You've done a hand error-analysis of 20 failures and can name the categories
- You can say how much hybrid search contributed and how much reranking contributed, separately

---

## STAGE 4 — Tool use, agents, and MCP

**What you get:** "I can build an agent that takes real actions safely, and I've published
an MCP server other people's AI tools can use."

**Why after RAG:** agents without retrieval are amnesiac, and agents without evals are
unfalsifiable. Also, per the video, RAG gets you hired and agents get you paid — so bank
the hiring skill first.

### 4.1 Tool calling, deeply `[core]`
- Tool schema design — **the description field is a prompt**, write it like one, with units
- The full loop: model requests a tool → you execute → you return the result → it continues
- Parallel tool calls; forcing tool choice; sequential dependencies
- Tool errors as first-class returns — tell the model what failed, never fail silently
- Validating arguments before executing anything
- Managing tool result size (a 50k-token database dump destroys your context budget)

### 4.2 The agent loop `[core]` — *one of the hand-written primitives*
Write this one yourself, without a framework. It's 60 lines and it's the difference between
"I used LangGraph" and "I understand agents."
- Observe → think → act → observe, and the termination condition
- Four budgets: steps, tokens, wall-clock, rupees
- Loop detection — same tool, same arguments, three times
- State and scratchpad: what the model actually sees on turn 7
- Trajectory logging so a run can be replayed
- The failures you'll meet: infinite loops, premature stops, tool thrash, context overflow, a confidently wrong plan

### 4.3 Memory and state `[core]`
- Short-term: history, windowing, summarisation, when to compact
- Long-term: vector memory, what's worth writing, what to retrieve, when to forget
- Session persistence, resumable runs, checkpointing
- User preference memory and its privacy implications

### 4.4 Orchestration patterns `[core]`
Patterns survive; frameworks don't. Learn these as architecture.
- Chain · router · parallel fan-out and reduce · evaluator–optimiser · reflection
- **Human-in-the-loop**: approval gates, interrupt and resume, edit-then-continue
- Supervisor / multi-agent — **and an honest note: multi-agent is usually the wrong answer.**
  One good agent with good tools beats five agents talking to each other more often than the
  demos suggest. Learn it, then default to not using it.

### 4.5 One framework: LangGraph `[core]`
- Graph state, nodes, conditional edges, cycles
- Checkpointers backed by Postgres → durable, resumable agents
- Interrupts for approval; replay; streaming intermediate state
- Know-of, don't learn: LlamaIndex, CrewAI, AutoGen, Pydantic-AI, OpenAI Agents SDK — one sentence each on what they're for

### 4.6 MCP `[core]`
The video calls this the big one most roadmaps skip. It's infrastructure now.
- Architecture: host ↔ client ↔ server, and why a standard beats N bespoke integrations
- Primitives: **tools** (model-invoked), **resources** (app-provided context), **prompts** (user-invoked); sampling; roots
- Transports: stdio for local, streamable HTTP for remote; auth for remote servers
- Using MCP servers from Claude Code and Claude Desktop
- **Building your own** with the Python SDK, and publishing it
- Security: a malicious server is a confused-deputy problem; tool-result injection; scoping
- **A2A** awareness: MCP wires an agent to its tools; A2A connects agents to each other

### 4.7 Agent safety and interface `[core]`
- Sandboxing, allowlists, dry-run modes, confirmation on irreversible actions
- **Prompt injection through retrieved documents and tool results** — the realistic attack. Defence: privilege separation, output filtering, and never letting retrieved text act as instructions.
- Audit logs of every action, with the reasoning that produced it
- **The agent dashboard**: live reasoning, tool timeline with arguments and costs, approval modals, an interrupt button, run replay. Almost no Python-only AI engineer can build this. It's the most impressive single thing you can put in front of an interviewer, because it proves both halves of your stack at once.

### Build
- **P4.1 "Support Ops Agent"** — reads a ticket, looks up the order, checks policy via your
  Stage 3 retrieval, drafts a reply, **pauses for human approval**, then sends. Durable,
  resumable, with a full trace dashboard and an agent eval suite.
- **P4.2 "Your MCP Server"** — published, installable in one command, genuinely useful.

### Ready to move on?
- Your own agent loop, hand-written, with budget enforcement and loop detection
- The same agent in LangGraph with Postgres checkpointing, resumable mid-run
- An MCP server a stranger can install in one command
- An approval gate that survives a server restart
- An agent eval suite over 30+ scenarios, with a pass rate you report honestly
- You can explain MCP vs A2A, and why multi-agent is usually the wrong default

---

## STAGE 5 — AI system design, operations, and security

**What you get:** "I can design, deploy, observe and defend a real AI system, and I have the
dashboards and incident write-ups to prove it."

### 5.1 AI system design as a discipline `[core]`
A repeatable framework, for interviews and for real work:
1. Requirements — who, what, how often, how accurate, how fast, how cheap
2. **Latency budget and cost budget** — always second, never last
3. Model strategy: which model per task, routing, fallbacks
4. Context strategy: retrieval, memory, token budget
5. Orchestration: sync vs async, queues, streaming
6. Guardrails: validation, injection defence, moderation, rate limits, tenancy
7. Evaluation: offline suite, online metrics, feedback capture
8. Operations: observability, alerting, rollback, cost caps

**Practice:** whiteboard eight systems end to end — enterprise document QA, a support agent,
a code assistant, semantic product search, a meeting summariser, resume↔JD matching, content
moderation, a personalised email agent. Forty minutes each, out loud, on paper.

How this differs from web system design: non-determinism, cost per call, quality as a
metric, dependency on a provider you don't control, latency you can't fully optimise.

### 5.2 Serving architecture `[core]`
- FastAPI with workers; the sync-inside-async footgun
- **Queues and workers** (Redis + Arq or Celery): ingestion, agent runs, eval runs; retries, dead-letter queues, idempotency
- Long-running work: job IDs, polling vs webhooks vs streamed progress
- Streaming at scale: proxy buffering, backpressure
- Per-provider concurrency limits; per-tenant token-bucket rate limiting
- Horizontal scaling, statelessness, graceful shutdown mid-stream

### 5.3 Caching, cost and routing `[core]`
- The cache ladder: CDN → exact match → provider prompt cache → semantic cache → embedding cache
- Semantic caching properly: threshold tuning and the false-hit problem
- **Model routing**: cheap first, escalate on complexity — and measuring the quality you're trading away
- A real cost model: ₹/request × volume. Know your unit economics.
- Budget guards, per-tenant quotas, kill switches, spend alerts
- Latency work: parallelism, prefetching, trimming prompts, smaller output formats

### 5.4 Observability `[core]`
- **Langfuse** as primary (Phoenix, Helicone, LangSmith to know of)
- OpenTelemetry so AI traces sit alongside app traces
- What to trace: every LLM call (prompt version, model, tokens, ₹, latency), every retrieval (query, candidates, scores), every tool call, every agent step
- The dashboards you need: cost per day by feature, p50/p95 by endpoint, error rate by type, cache hit rate, quality trend
- **User feedback capture** — thumbs, edits, regenerates, abandonment. The highest-signal data you'll ever collect, and the input to your next eval set.
- Alerting on cost spikes, latency regressions and quality drops

### 5.5 Evaluation as engineering `[core]`
- Offline suites per feature; dataset versioning; slicing by tenant, document type, query type
- Assertion-based tests first — cheap, fast, and they catch most regressions
- LLM-as-judge done right: rubrics, measuring judge-vs-human agreement, controlling judge cost
- Pairwise comparison for "is v2 better than v1"
- **CI gates** that block merges and post scores on the PR
- Online: sampling production traffic, shadow runs, canarying a prompt to 5%, auto-rollback
- A/B testing prompts and models; guardrail metrics vs goal metrics

### 5.6 Security `[core]`
- **OWASP Top 10 for LLM Applications**, mapped item by item onto your own projects
- Prompt injection: direct, indirect (through RAG documents and tool results), and the honest truth that there's no complete fix — only privilege separation, output filtering and least authority
- Data exfiltration through tool use and markdown image URLs
- PII handling, redaction, retention, what you log
- Secrets, key rotation, per-tenant isolation
- **Multi-tenant isolation in retrieval** — the classic bug is a forgotten tenant filter, and one customer reads another's documents
- Abuse: rate limits, cost-exhaustion attacks, jailbreak monitoring

### 5.7 Deployment and CI/CD `[core]`
- Containers → one real cloud (**AWS ECS/Fargate** or **GCP Cloud Run** — pick one, go deep)
- Managed Postgres with pgvector, Redis, object storage
- GitHub Actions: lint → typecheck → test → **eval gate** → build → staging → smoke → prod
- Staging with a copy of the eval set; migrations in the pipeline; canary and rollback
- Secrets management, light IaC, cost tagging
- Load testing with `k6` — find your real p95 and your breaking point

### 5.8 Fine-tuning: when, not how `[optional]`
- The decision: prompting exhausted → retrieval insufficient → *then* consider it
- Real reasons: rigid format, domain vocabulary, the latency/cost of a small specialised model
- SFT vs DPO vs LoRA/QLoRA, conceptually
- Why most teams don't have the data for it
- One small hands-on so you can speak from experience — then stop

### Build
- **P5.1 "Production Hardening"** — take P3.1 or P4.1 to genuine production: real cloud,
  queue and workers, caching, tracing, cost dashboard, eval gate in CI, load test, runbook.
  The deliverable is **a table of real numbers**.
- **P5.2 "Break it and write it up"** — cause a real incident in your own staging, detect it
  through your own dashboards, fix it, write a proper postmortem.
- **P5.3 "Eval harness library"** `[optional]` — extract your eval code into a small OSS library.

### Ready to move on?
- One system on AWS or GCP, in containers, with CI/CD
- Tracing across all three projects, and a cost dashboard you can screenshot
- A CI eval gate that blocks merges, demonstrated
- A load-test report with a real p95 and a documented breaking point
- Cost measurably reduced through caching and routing — you know the number
- Eight system designs whiteboarded out loud, two recorded and watched back
- OWASP LLM Top 10 reviewed against your own code, with real fixes committed
- One written postmortem

---

## STAGE 6 — Capstone and portfolio

**What you get:** "I have three flagship systems and I'm interviewing."

### 6.1 Capstone `[core]`
One substantial product combining everything: retrieval + agents + evals + streaming UI +
**multi-tenancy** + observability + CI. The recommended brief is an **AI hiring copilot**
(`07-PROJECT-BRIEFS.md`, P6.1) — a real problem, and it exercises every skill on the path.
You'll name it.

What makes it read as senior:
- Multi-tenant with **retrieval-level data isolation**, and a test proving tenant A can't reach tenant B's data
- Per-tenant budgets and rate limits
- Human-in-the-loop on at least one consequential action
- An eval suite in CI with published scores
- Full observability and a cost dashboard
- Live, with real users — even ten people counts, because usage data is the point

### 6.2 One specialisation `[core]` — pick exactly one
- **Agentic AI** — multi-step reliability, durable execution, agent evals
- **Context engineering** — advanced retrieval, GraphRAG, memory architectures
- **LLMOps** — Kubernetes, vLLM/self-hosting, autoscaling, gateways, FinOps
- **AI evals** — judge calibration, annotation tooling, red-teaming
- **Forward-deployed** — client discovery, rapid prototyping, demo craft

### 6.3 Portfolio `[core]`
- Three flagship repos: architecture diagram, **results table**, "what I'd do differently", live demo, short demo video
- A GitHub profile that reads as an engineer's, not a learner's — and archive the tutorial repos
- A personal site with the AI demos **embedded and interactive**, not screenshotted
- LinkedIn: headline *Full-Stack AI Engineer*, evidence-led About, projects pinned
- Writing — `[optional]` but the highest-leverage optional thing here. Titles that are claims with numbers beat titles that are topics.

### 6.4 Interview preparation `[core]`
- **AI system design** — the 5.1 framework, twelve mock designs, some with another person
- **Concepts** — the 63 questions in `09-JOB-STRATEGY.md` §4, answered out loud from your own projects
- **Coding** — medium/hard only, plus the AI-flavoured implementations (RRF, token budgeter, streaming parser, rate limiter, cosine similarity)
- **Take-homes** — practise a four-hour "build a RAG endpoint with evals" under pressure
- **Behavioural** — eight stories from this journey, including the postmortem
- **Cost/tradeoff** — "this costs ₹4 a request; get it to ₹1 without losing quality"

### 6.5 Applications `[core]`
Run it as a pipeline. `09-JOB-STRATEGY.md` §5–6 has targets, outreach templates and tracking.

---

## STAGE 7 — Interviews, depth, optionality

- **Run the loop.** Debrief every round in writing the same day; fix the specific gap it exposed before the next one.
- **Depth on demand.** When a job description or an interview exposes a gap, fill it then. This is when the C-tier items earn their place.
- **Optional deep dives**, now affordable: LoRA hands-on, vLLM self-hosting, GraphRAG, multimodal, realtime voice, DSPy.
- **Keep shipping** something small occasionally — an offer arrives faster when your GitHub is visibly alive.
- **Negotiation.** Know your bands (`09-JOB-STRATEGY.md` §2). Never give the first number. Screen for whether the role has real AI work — a title with no substance is a trap at any salary.

---

## Budget

API spend across the whole path: **roughly ₹12,000–20,000**, concentrated in Stages 2–4.

Keeping it there is itself part of the curriculum: use the cheapest capable model for
practice, cache aggressively, mock provider responses in tests, run local models via Ollama
for high-volume experimentation, use free tiers (Gemini, Groq, Neon, Supabase, MongoDB
Atlas, Qdrant Cloud, Langfuse), and exploit provider prompt caching.

AmpratAI shows a running spend total so this stays visible rather than surprising.

## If you need to cut

Drop in this order: `[optional]` modules → secondary projects (P*.2) → specialisation depth.

**Don't drop:** the evaluation work (3.8 and 5.5), the deploys, or the "ready to move on"
self-checks. Those three are what make the difference between finishing this path and
finishing a playlist.

## If you stop for a while

Exams, illness, a busy month — it happens and it costs you nothing. AmpratAI keeps your
exact position, and every stage opens with a **"where you left off"** recap: what you'd
just learned, what you were building, and a two-minute refresher of the last three concepts.
Coming back after four weeks should take one session, not one week.
