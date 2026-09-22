# 02 — Your Custom 7-Month Full-Stack AI Engineer Roadmap

**Profile:** MERN full stack, many deployed projects, no Python, no AI yet.
**Lane:** Standard — ~30 h/week, 4–5 h/day. (Sprint = 5 months, Sustainable = 10; see
`01-PROFILE-AND-GAP-ANALYSIS.md` §5.)
**Target:** Full-Stack AI Engineer able to compete for the roles in `09-JOB-STRATEGY.md`.

---

## How to read this

Every month has the same five parts:

- **Outcome** — the one sentence you should be able to say at the end.
- **Modules → Topics** — each topic gets three checkpoints in the platform:
  `Concepts` · `Practice` · `Mini-project` (see `04-CURRICULUM-MAP.md`).
- **Week plan** — a default schedule, not a contract.
- **Ship** — the artifacts that must exist publicly at month end.
- **🚪 GATE** — pass/fail criteria. **You do not advance on calendar. You advance on gate.**

`[CORE]` = never cut. `[STRETCH]` = cut this first when behind.

### Weekly cadence (every week, all 7 months)

| Day | Block A (2–3 h) | Block B (1.5–2 h) |
|---|---|---|
| Mon | New concepts | Practice drills |
| Tue | New concepts | Practice drills |
| Wed | New concepts | Practice drills |
| Thu | Mini-project build | Mini-project build |
| Fri | Mini-project build → ship | **Break it on purpose**, then fix it |
| Sat | Integration: fold the week into the running project | Write the week's post (400–800 words) |
| Sun | **Off**, or spaced-repetition review only (45 min) | — |

Plus, daily, all 7 months: **2 DSA problems in Python, 30 min.** This is your Python
practice *and* your interview screen insurance. It is not extra time.

### Non-negotiable rules

1. **Nothing is "done" without a deployed artifact or a passing test.** Watching ≠ learning.
2. **One resource per concept.** If you're on your third video about embeddings, you're procrastinating.
3. **Read the primary docs after the video, every time.** Video builds intuition; docs are truth.
4. **Break it on purpose every Friday.** Delete the API key. Set temperature to 2. Feed it 10k tokens of garbage. Kill the DB mid-request. Fix what breaks. This is where actual senior instinct comes from.
5. **Write weekly, publicly.** 30 posts by month 7 is a portfolio that outperforms most people's resumes.
6. **Platform work ≤ 15% of weekly hours, and only if it doubles as a roadmap project.**

---

## MONTH 1 — Become a Python backend engineer

> **Outcome:** "I can build, test, containerise and deploy a typed, async Python API with a
> Postgres database — and I understand why AI tooling chose this stack."

**Why first:** You have the instincts, not the dialect. Three weeks of focused work converts
3 years of JS experience into Python experience. Every month after this assumes it.
Skipping here is the video's Arjun mistake — turbocharger on a car with no engine.

### M1.1 — Python for the JavaScript engineer `[CORE]`
- Mental-model mapping: `const/let`→names & rebinding, truthiness differences, `None` vs `null`/`undefined`, mutable default args (the classic trap), list/dict/set comprehensions vs `map`/`filter`, f-strings, unpacking, `*args`/`**kwargs`
- Modules, packages, imports, `__init__.py`, `if __name__ == "__main__"`
- Errors & exceptions: `try/except/else/finally`, custom exception classes, `raise ... from`
- OOP the Python way: classes, `@property`, `@classmethod`/`@staticmethod`, dunder methods, why you'll barely use inheritance
- File & path IO: `pathlib`, context managers, JSON/CSV, encoding pain

### M1.2 — Typing and data modelling `[CORE]`
- Type hints: `list[str]`, `dict[str, Any]`, `Optional`, `Union`/`|`, `Literal`, `TypedDict`, generics, `Protocol`
- `mypy`/`pyright` basics — treat it like TypeScript, because it is
- `dataclasses` vs **`pydantic` v2**: validation, `model_validate`, `model_dump`, field validators, `Field` constraints, settings via `pydantic-settings`
- **Why this module matters more than it looks:** pydantic *is* the type system of the AI ecosystem. Tool schemas, structured outputs, FastAPI bodies, LangGraph state, agent I/O contracts — all pydantic. Get fluent here and Months 2–4 get dramatically easier.

### M1.3 — Async Python `[CORE]`
- `asyncio` vs the JS event loop — what's the same, what bites you (blocking calls, no implicit scheduling, sync/async colouring)
- `async def`, `await`, `asyncio.run`, `gather`, `TaskGroup`, `as_completed`, `wait_for`, cancellation
- Concurrency control: `Semaphore` for rate limiting, `Queue` for pipelines
- `httpx.AsyncClient`: connection pooling, timeouts, retries with exponential backoff + jitter
- Generators & async generators — `yield` is how every streaming AI response you write will work
- Threads vs processes vs async, and the GIL in one paragraph

### M1.4 — Tooling & testing `[CORE]`
- `uv` (use it — it replaces pip/venv/pyenv and is 10–100× faster), `pyproject.toml`, lockfiles
- `ruff` (lint + format), pre-commit hooks
- `pytest`: fixtures, parametrize, `pytest-asyncio`, mocking HTTP with `respx`, coverage
- Structured logging (`structlog` or stdlib `logging` with JSON), `.env` handling, secret hygiene

### M1.5 — FastAPI `[CORE]`
- App/routers, path & query params, request/response models, automatic OpenAPI
- **Dependency injection** — the concept Express doesn't have; it's how you'll wire model clients, DB sessions and per-request budgets later
- Middleware, exception handlers, CORS, `BackgroundTasks`
- **Streaming**: `StreamingResponse` + Server-Sent Events (you'll use this constantly from Month 2)
- WebSockets, lifespan events, `pytest` + `httpx` integration tests
- Auth: API keys, JWT, `OAuth2PasswordBearer`

### M1.6 — Postgres & SQL `[CORE]`
- Relational vs document modelling — translate one of your existing Mongo schemas to Postgres and feel the difference
- DDL, constraints, foreign keys, normalisation (and when to denormalise), `JSONB` for the Mongo-shaped parts
- Joins, aggregates, `GROUP BY`, window functions (basics), CTEs
- Indexes: B-tree, GIN, partial, composite; `EXPLAIN ANALYZE` and reading a query plan
- Transactions, isolation levels, connection pooling
- `SQLAlchemy 2.0` async or `asyncpg` + `Alembic` migrations
- Full-text search with `tsvector` — **you'll need this for hybrid retrieval in Month 3**

### M1.7 — Docker & local infrastructure `[CORE]`
- Images vs containers, Dockerfile for Python (multi-stage, slim base, layer caching, non-root user)
- `docker compose`: api + postgres + redis, volumes, networks, healthchecks
- Env/secrets in containers, `.dockerignore`, image size discipline
- One PaaS deploy of a container (Railway / Render / Fly.io) — full cloud comes in Month 5

### M1.8 — ML/AI intuition, the cheap 8 hours `[CORE]` **[my addition]**
Deliberately time-boxed. This is the F-tier trap defused: conceptual only, zero math homework.
- What a token is; run a tokenizer and watch your sentence become integers
- Why models are next-token predictors, and what that implies about hallucination
- What an embedding *is*: meaning as coordinates; cosine similarity in one diagram
- What temperature does to a probability distribution
- Attention, at the level of one 3Blue1Brown video + one blog post. No derivations.
- Pretraining vs instruction tuning vs RLHF, in one page
- **Stop condition:** you can explain each of these to a non-technical friend in 2 minutes. Then close the tab. If you find yourself opening Khan Academy, you have failed this module.

### Week plan
| Week | Focus |
|---|---|
| 1 | M1.1 + M1.2 — Python syntax → pydantic. Daily: port small JS utilities to Python |
| 2 | M1.3 + M1.4 — async, httpx, pytest, uv/ruff. Mini-project 1.2 |
| 3 | M1.5 + M1.6 — FastAPI + Postgres. Mini-project 1.1 |
| 4 | M1.7 + M1.8 — Docker, deploy, AI intuition. Harden + ship both projects |

### Ship
- **MP-1.1 "The Port"** — take one of your existing Express+Mongo projects and rebuild it as FastAPI + Postgres + Alembic, feature-for-feature, with pytest coverage, Dockerised, deployed. Write up what was easier, harder and weirder than Express. *This single project converts your JS experience into demonstrable Python experience faster than any tutorial.*
- **MP-1.2 "Async Harvester"** — CLI that fetches 500 URLs concurrently with a semaphore, exponential-backoff retries, timeouts, structured logs, and idempotent writes to Postgres. *Every pattern here is exactly what you need for concurrent LLM calls — you're pre-building Month 2's muscle.*

Full briefs: `07-PROJECT-BRIEFS.md`.

### 🚪 GATE 1 — all must be true
- [ ] Both mini-projects deployed with public URLs and READMEs
- [ ] `ruff` clean, `pyright` clean, `pytest` ≥ 70% coverage on MP-1.1
- [ ] You can write, from a blank file and no reference, a FastAPI endpoint that streams SSE while concurrently calling 3 async functions with a concurrency cap
- [ ] You can write a 3-table schema with correct FKs and indexes, then explain an `EXPLAIN ANALYZE` output
- [ ] `docker compose up` brings up your whole stack on a fresh machine
- [ ] You can explain tokens, embeddings, and temperature without notes
- [ ] 60 DSA problems done in Python

---

## MONTH 2 — LLM APIs and production prompting

> **Outcome:** "I can build a reliable, streaming, cost-instrumented LLM feature against
> any of the three major providers, and get structured output I can trust in production."

**Why now:** This is the skill that separates an AI engineer from a software engineer. The
API call is easy — 10 lines. Everything around it (reliability, cost, structure, streaming,
failure) is the job.

### M2.1 — The anatomy of an LLM call `[CORE]`
- Provider SDKs: `anthropic`, `openai`, `google-genai` — messages format, system prompts, multi-turn, stop reasons, token usage in the response
- Tokens & context windows: counting before you send, truncation strategy, input vs output pricing, why cost ≠ characters
- Sampling: `temperature`, `top_p`, `max_tokens`, stop sequences; determinism and its limits
- Reasoning/extended-thinking modes: when the extra tokens pay for themselves and when they don't
- Model selection as an engineering decision: capability vs latency vs ₹/1M tokens; build a comparison table for your own use cases
- Rate limits, quota errors, and what a 429 storm looks like

### M2.2 — Streaming, end to end `[CORE]` ← *your unfair advantage starts here*
- Streaming APIs: event types, deltas, accumulating final messages, usage on the last event
- FastAPI SSE → React consumption; `EventSource` vs `fetch` + `ReadableStream`
- Abort/cancel mid-stream (and actually stopping the upstream call so you stop paying)
- Optimistic UI, token-by-token render without layout thrash, markdown streaming, code-block streaming
- Measuring and displaying **TTFT** (time to first token) vs total latency
- **Most AI engineers cannot do this well. You can. Every project you ship should stream.**

### M2.3 — Production prompt engineering `[CORE]`
- System prompt architecture: role, task, constraints, output contract, examples, escape hatch ("if you don't know, say X")
- Structure that actually helps: delimiters/XML tags, ordering, putting instructions after long context
- Few-shot: how many, how to choose, dynamic example selection
- Chain-of-thought and its variants; when to hide reasoning from the user
- Decomposition: one prompt doing five things → five prompts doing one thing each
- **Prompt versioning**: prompts are code. Git them, template them (Jinja2), tag versions, log which version produced which output
- A/B testing prompts in production; shadow prompts
- Failure taxonomy: refusal, drift, format break, truncation, over-hedging, injection — and the fix for each
- Cost/quality tuning: prompt compression, smaller model + better prompt vs bigger model

### M2.4 — Structured output you can trust `[CORE]`
- JSON mode / schema-constrained decoding / tool-based extraction — the three mechanisms and their tradeoffs per provider
- pydantic models as the contract; validation at the boundary
- **Repair loops**: validation error → targeted re-prompt with the error → retry budget → hard fail
- `instructor` and similar libraries: what they do for you, and writing the 40-line version yourself first
- Partial/streaming structured output
- Enums and closed vocabularies to prevent hallucinated categories

### M2.5 — Reliability & cost engineering `[CORE]`
- Retries with exponential backoff + jitter; distinguishing retryable (429, 5xx, timeout) from non-retryable (400, auth, content filter)
- Timeouts at every layer; the "hung stream" failure
- **Fallback chains**: primary model → cheaper model → cached answer → honest error
- Idempotency for expensive calls
- Caching: provider prompt caching (huge win, restructure your prompts for it), exact-match cache, semantic cache preview
- Per-request cost accounting → a `usage` table in Postgres → a budget guard that refuses calls over a cap
- Basic guardrails: input length caps, PII redaction before send, output moderation, **prompt injection 101**

### M2.6 — Multimodal basics `[STRETCH]`
- Images in prompts (vision), PDF input, audio transcription (Whisper/Gemini), and when to use OCR instead

### Week plan
| Week | Focus |
|---|---|
| 5 | M2.1 + M2.2 — first API calls, then streaming all the way to React. Build MP-2.1 skeleton |
| 6 | M2.3 — prompting deep-dive. Build a prompt evaluation scratchpad (seed of Month 3 evals) |
| 7 | M2.4 + M2.5 — structured output, repair loops, retries, cost tracking. Build MP-2.2 |
| 8 | Harden, instrument, deploy both. **Platform Phase 1 starts here** (see `05-PLATFORM-SPEC.md` §9) |

### Ship
- **MP-2.1 "Chat, done properly"** — FastAPI + React streaming chat. Not another chat clone: it has a live token+₹ cost meter per message, model switcher across all 3 providers, stop/regenerate, conversation persistence, prompt version tagged on every message, and a fallback chain you can demo by revoking a key.
- **MP-2.2 "Structured Extraction Service"** — documents → strict validated JSON (resume → structured profile is a natural fit here and feeds `NexHireAI`). Includes a 30-case golden set, validation repair loop, and a `pytest` suite that fails the build when extraction accuracy drops.

### 🚪 GATE 2
- [ ] Same feature works against Anthropic, OpenAI and Gemini behind one interface
- [ ] End-to-end streaming works, cancel actually stops upstream billing (prove it in logs)
- [ ] You can state the ₹ cost of one request in each of your projects, from your own instrumentation
- [ ] Extraction service ≥ 90% field accuracy on your golden set, with the repair loop measurably improving it
- [ ] Kill the primary provider's key → app degrades gracefully instead of 500-ing
- [ ] You have a `prompts/` directory under version control with numbered versions
- [ ] Written explanation of 5 prompt failure modes you personally hit, with fixes

---

## MONTH 3 — RAG, and how to know it works

> **Outcome:** "I can build a retrieval system over a messy real corpus, measure its
> retrieval quality with numbers, and improve those numbers deliberately."

**Why this is the most important month:** Per the video, RAG appears in effectively every
AI engineer JD. And the reason most RAG projects are worthless in interviews is that the
candidate cannot answer *"how do you know it's retrieving the right thing?"* You will
answer that with a chart.

### M3.1 — The retrieval problem `[CORE]`
- Why RAG: private/fresh/verifiable data, hallucination reduction, citation requirements
- **RAG vs long context vs fine-tuning** — the decision table (cost, latency, freshness, provenance, data volume). This is a guaranteed interview question.
- Anatomy: ingest → chunk → embed → index → retrieve → rerank → assemble → generate → cite → evaluate

### M3.2 — Embeddings in practice `[CORE]`
- Embedding models compared (OpenAI, Voyage, Gemini, `bge`/`e5` open weights); dimensions, cost, multilingual, domain fit
- Normalisation, cosine vs dot vs L2, and why the wrong one silently ruins recall
- Batching, caching embeddings, cost of re-embedding a corpus (and how to avoid it)
- Visualising your corpus: UMAP/t-SNE projection to *see* your clusters and your outliers
- Matryoshka/truncated embeddings; quantisation tradeoffs

### M3.3 — Ingestion: the unglamorous 60% `[CORE]`
- PDF reality: text layers, two-column layouts, tables, headers/footers, scans needing OCR. Tools: `pypdf`, `pdfplumber`, `unstructured`, `docling`, cloud document AI
- HTML/markdown/docx/code/spreadsheets; Whisper for audio/video sources
- Cleaning: boilerplate stripping, dedup (near-dup via minhash/simhash), language detection
- **Metadata design** — the highest-ROU 30 minutes in RAG: source, title, section path, page, date, author, tenant, permissions, version. You cannot filter on what you didn't store.
- Incremental sync: content hashing, idempotent upserts, deletes, re-index strategy
- Pipeline mechanics: queue + worker, resumability, observability on ingestion

### M3.4 — Chunking `[CORE]`
- Fixed-size + overlap (the baseline), recursive character splitting, token-aware sizing
- **Structure-aware** splitting: markdown headers, HTML sections, code AST, PDF sections
- Semantic chunking; propositional chunking
- Parent-document / small-to-big retrieval, sentence-window retrieval
- Contextual retrieval (prepend an LLM-written context blurb to each chunk) — big recall win
- Chunk size vs recall vs precision vs cost — **measure it on your own corpus, don't take anyone's default**

### M3.5 — Vector storage `[CORE]`
- **`pgvector` as primary** — you already need Postgres; one DB for rows + vectors + full-text is a real architectural advantage, and `tsvector` gives you hybrid search for free
- **Qdrant as the dedicated-engine comparison** — payload filtering, collections, quantisation
- Know-of only: Pinecone (managed), Weaviate (OSS+hybrid), Chroma (local prototyping), Milvus (scale)
- Index types conceptually: flat vs HNSW vs IVFFlat; `m`/`ef_construction`/`ef_search` and the recall↔latency dial
- **Do not learn four vector DBs.** One deeply, one for contrast.

### M3.6 — Retrieval quality `[CORE]`
- **Hybrid search**: BM25/`tsvector` + vector, fused with **Reciprocal Rank Fusion**. Nearly always beats vector-only. Keyword search finds the exact product code; vectors find the paraphrase.
- **Reranking**: cross-encoder / Cohere Rerank / Voyage Rerank — retrieve 50, rerank to 5. Usually the single biggest quality jump per line of code.
- Metadata filters + permission-aware retrieval (pre-filter vs post-filter, and the recall cliff)
- Query understanding: rewriting, multi-query expansion, HyDE, decomposition of multi-hop questions, routing to the right index
- MMR / diversity; deduplicating near-identical chunks

### M3.7 — Context assembly (context engineering) `[CORE]` **[my emphasis]**
- Token budget allocation: system + history + retrieved + question + reserved output
- Ordering effects: "lost in the middle", putting the question after the context
- Citation formats that let the UI link back to source page/section
- Compaction: summarising history, dropping stale turns, hierarchical summaries
- When to *not* retrieve (query router: greeting vs lookup vs computation)

### M3.8 — Retrieval & generation evaluation `[CORE]` **[promoted from B-tier]**
- Build the **golden set** first: 50–100 real questions with known correct source chunks and reference answers. Handwrite them. This is the asset, not the code.
- Retrieval metrics: recall@k, precision@k, MRR, nDCG, hit rate
- Generation metrics: faithfulness/groundedness, answer relevance, context precision/recall, citation correctness
- **LLM-as-judge**: rubric design, judge calibration against your own labels, position/verbosity bias, cheap-model judges
- `ragas` / `deepeval` / custom harness — write your own first so you understand the numbers
- Regression gates: eval suite in `pytest` → GitHub Actions → **blocks the merge on a score drop**
- Error analysis loop: look at 20 failures by hand, categorise, fix the category. Repeat. (This is the actual job.)

### Week plan
| Week | Focus |
|---|---|
| 9 | M3.1–M3.3 — theory, embeddings, ingest a genuinely messy corpus |
| 10 | M3.4 + M3.5 — chunking experiments, pgvector, baseline RAG working end to end |
| 11 | M3.8 first — **build the golden set + eval harness before optimising.** Then M3.6 hybrid + rerank, measured |
| 12 | M3.7 assembly + citations + UI. Ship MP-3.1. Platform Phase 2 |

> Note the order in week 11: eval harness **before** optimisation. Optimising retrieval
> without measurement is how people spend a month and end up worse. Build the ruler first.

### Ship
- **MP-3.1 "Document Intelligence with receipts"** — RAG over a real 500+ page messy corpus (Indian tax/RBI circulars, insurance policy docs, your university's academic regulations, or a company's public docs). Citations that deep-link to page+section. React UI with source highlighting. **And an eval dashboard showing recall@5 and faithfulness across your 6 pipeline versions** — baseline → chunking change → hybrid → rerank → contextual retrieval → query rewriting, each with the number it moved and what it cost.
- **MP-3.2 "Ask My Repo"** `[STRETCH]` — RAG over your own GitHub repos with AST-aware code chunking, symbol-level metadata, and answers that cite `file:line`.

### 🚪 GATE 3
- [ ] MP-3.1 live, with citations that a stranger can verify
- [ ] Golden set of ≥ 50 hand-written Q→source pairs in the repo
- [ ] Eval harness runs in CI and **fails a PR** on regression (prove it with a deliberately bad PR)
- [ ] A documented before/after table: ≥ 6 pipeline variants, each with recall@5, faithfulness, p95 latency, ₹/query
- [ ] You can explain the RAG-vs-long-context-vs-fine-tuning decision with numbers from *your* corpus
- [ ] You've done a hand error-analysis of 20 failures and written up the categories
- [ ] Hybrid + rerank implemented, and you can say how much each contributed

---

## MONTH 4 — Tool use, agents, and MCP

> **Outcome:** "I can build an agent that takes real actions safely, and I've published an
> MCP server that other people's AI tools can use."

**Why after RAG:** Agents without retrieval are amnesiac; agents without evals are
unfalsifiable. Also, per the video, RAG gets you hired and agents get you paid — so we
bank the hiring skill first.

### M4.1 — Function/tool calling, deeply `[CORE]`
- Tool schema design; **the description field is a prompt** — write it like one
- The full loop: model requests tool → you execute → you return result → model continues
- Parallel tool calls; sequential dependency; tool choice forcing
- Tool errors as first-class returns (never raise into the void — tell the model what failed)
- Argument validation with pydantic before you execute anything
- Client-side vs server-side tools; expensive/destructive tools behind confirmation
- Tool result size management (a 50k-token DB dump will destroy your context budget)

### M4.2 — Build an agent from scratch, no framework `[CORE]`
This module is deliberately framework-free. It is the difference between "I used LangGraph"
and "I understand agents."
- The loop: observe → think → act → observe, with a termination condition
- Step budgets, token budgets, wall-clock budgets, ₹ budgets — all four
- Loop detection (the same tool with the same args three times = intervene)
- Scratchpad/state management; what the model sees on turn 7
- Structured trajectory logging so a run is replayable
- Failure modes you will meet: infinite loop, premature stop, tool thrash, context overflow, confidently wrong plan

### M4.3 — Memory & state `[CORE]`
- Short-term: message history, windowing, summarisation, compaction triggers
- Long-term: vector memory, episodic vs semantic vs procedural, write policies (what's worth remembering), retrieval policies, decay/invalidation
- Session/thread persistence in Postgres; resumable runs; checkpointing
- User profile/preference memory, and its privacy implications

### M4.4 — Orchestration patterns `[CORE]`
The patterns survive; the frameworks don't. Learn these as architecture, then map them.
- Chain / pipeline · Router (classify → dispatch) · Parallel fan-out + reduce
- Evaluator–optimiser (generate → critique → revise) · Reflection & self-correction
- **Human-in-the-loop**: approval gates, interrupt/resume, edit-then-continue
- Supervisor / multi-agent with specialised roles — *and a hard honesty note: multi-agent is usually the wrong answer. One good agent with good tools beats five agents talking to each other, more often than the demos suggest. Learn it; default to not using it.*

### M4.5 — One framework: LangGraph `[CORE]`
- Graph state, nodes, edges, conditional edges, cycles
- Checkpointers (Postgres) → durable, resumable agents
- Interrupts for human approval; time-travel/replay; streaming intermediate state
- Subgraphs; `langgraph` + FastAPI integration
- Know-of, don't learn: LlamaIndex (retrieval-first), CrewAI/AutoGen (multi-agent), Pydantic-AI, OpenAI Agents SDK. Be able to say in one sentence what each is for.

### M4.6 — MCP (Model Context Protocol) `[CORE]`
The video calls this the big one most roadmaps still skip. It's now infrastructure.
- Architecture: host ↔ client ↔ server; why a standard protocol beats N bespoke integrations
- Primitives: **tools** (model-invoked) vs **resources** (app-provided context) vs **prompts** (user-invoked templates); sampling; roots
- Transports: stdio for local, streamable HTTP for remote; auth (OAuth) for remote servers
- Using MCP servers from Claude Code / Claude Desktop / other hosts
- **Building your own server** with the Python SDK: tool design, error handling, pagination, auth, tests
- Publishing it (PyPI/npm + a README that makes it installable in one line)
- Security: a malicious or compromised MCP server is a confused-deputy problem; tool-result injection; permission scoping
- **A2A (Agent-to-Agent)** awareness: MCP is the wiring from agent→tools, A2A is the phone line from agent→agent. Know the difference; you'll be asked.

### M4.7 — Agent safety & UX `[CORE]` ← *your unfair advantage again*
- Sandboxing tool execution; allowlists; dry-run modes; irreversible-action confirmation
- **Prompt injection via tool results and retrieved documents** — the realistic attack on your agent. Defence in depth: privilege separation, output filtering, never let retrieved text be instructions.
- Audit logs of every action taken, with the reasoning that led to it
- **Agent trace UI**: live reasoning stream, tool-call timeline with args/results/duration/cost, approval modals, interrupt button, run replay, diff view of proposed changes.
  *The video's line about Priya applies double to you: almost no Python-only AI engineer can build this dashboard. It is the single most impressive thing you can put in front of an interviewer, because it proves both halves of your stack at once.*

### Week plan
| Week | Focus |
|---|---|
| 13 | M4.1 + M4.2 — tool calling, then a from-scratch agent loop with budgets and logging |
| 14 | M4.3 + M4.4 — memory, then implement 5 orchestration patterns as small demos |
| 15 | M4.5 + M4.6 — LangGraph port of your scratch agent; build + publish MCP server |
| 16 | M4.7 — safety, approvals, the trace dashboard. Ship MP-4.1 + MP-4.2. Platform Phase 3 |

### Ship
- **MP-4.1 "Support Ops Agent"** — reads a support ticket → looks up the order in Postgres → checks refund policy via your Month 3 RAG → drafts a reply → **pauses for human approval** → sends. LangGraph + Postgres checkpointing, full React trace dashboard, replayable runs, per-run cost, agent eval suite (does it take the right actions on 30 scenario fixtures?).
- **MP-4.2 "Your MCP Server"** — published, installable, genuinely useful. Ideas: an MCP server over your Postgres with read-only guardrails; over your GitHub projects; over your own learning platform's content and progress data (so Claude can tutor you from your real state). Ship with tests, a README, and a demo GIF of it running inside Claude Code.

### 🚪 GATE 4
- [ ] A from-scratch agent loop **you wrote without a framework**, in the repo, with budget enforcement and loop detection
- [ ] Same agent re-implemented in LangGraph with a Postgres checkpointer, resumable mid-run
- [ ] MCP server published and installable by a stranger in one command
- [ ] Human-approval gate working: agent stops, waits, resumes on approve, aborts on reject
- [ ] Agent trace dashboard shows live reasoning, tool timeline, cost, and supports replay
- [ ] Agent eval suite over ≥ 30 scenarios with a pass rate you report honestly
- [ ] You can explain MCP vs A2A, and why multi-agent is usually the wrong default

---

## MONTH 5 — AI system design, LLMOps, and production hardening

> **Outcome:** "I can design, deploy, observe and defend a real AI system, and I have the
> dashboards and incident write-ups to prove it."

**Why now:** You have three working systems. This month turns them from projects into
products — and turns you from a builder into someone who can pass a senior system design
round.

### M5.1 — AI system design as a discipline `[CORE]`
A repeatable framework for the interview and for real work:
1. Requirements → who, what, how often, how accurate, how fast, how cheap
2. Latency budget (TTFT target, p95 total) and **cost budget (₹/request, ₹/month)** — do this second, always
3. Model strategy: which model per task, routing, fallbacks
4. Context strategy: retrieval, memory, token budget
5. Orchestration: sync vs async, queues, streaming
6. Guardrails: input/output validation, injection defence, moderation, rate limits, tenancy
7. Evaluation: offline suite, online metrics, feedback capture
8. Operations: observability, alerting, rollback, cost caps
- **Practice**: whiteboard 8 classic AI systems end to end — enterprise doc QA, support agent, code assistant, semantic product search, meeting summariser, resume↔JD matcher (your `NexHireAI`!), content moderation pipeline, personalised email agent. One per session, 40 minutes, out loud, diagram on paper.
- How AI system design differs from web system design: non-determinism, cost-per-call, quality as a metric, provider dependency, latency dominated by an upstream you don't control

### M5.2 — Serving architecture at scale `[CORE]`
- FastAPI + Uvicorn/Gunicorn workers; sync-in-async footguns
- **Queues & workers**: Celery or Arq/RQ + Redis; ingestion jobs, agent runs, eval runs; retries, dead-letter queues, idempotent tasks
- Long-running work: job IDs, polling vs webhooks vs SSE progress
- Streaming at scale: SSE vs WebSocket vs long-poll, proxy buffering gotchas, backpressure
- Concurrency limits per provider; token-bucket rate limiting per tenant
- Horizontal scaling, statelessness, sticky-session avoidance, graceful shutdown mid-stream

### M5.3 — Caching, cost and routing `[CORE]`
- Cache layers: HTTP/CDN → exact-match → **provider prompt cache** → semantic cache → embedding cache. Hit rates and invalidation for each.
- Semantic caching properly: threshold tuning, the false-hit problem, per-tenant namespacing
- **Model routing**: cheap model first, escalate on low confidence or complexity classifier; measure the quality loss you're buying
- Cost model spreadsheet: ₹/request × requests/day × margin. Know your unit economics.
- Budget guards, per-tenant quotas, kill switches, spend alerts
- Latency optimisation: parallelism, speculative retrieval, prefetching embeddings, smaller output formats, trimming system prompts

### M5.4 — Observability `[CORE]`
- **Langfuse** (recommended primary) — traces, spans, sessions, users, scores, prompt management, datasets. Alternatives to know: Arize Phoenix, Helicone, LangSmith, Braintrust.
- OpenTelemetry / OpenLLMetry so your AI traces sit alongside your app traces
- What to trace: every LLM call (prompt version, model, tokens, ₹, latency), every retrieval (query, candidates, scores, chosen), every tool call, every agent step
- Dashboards you must have: cost/day by feature, p50/p95 latency by endpoint, error rate by type, token usage trend, cache hit rate, quality score trend
- **User feedback capture**: thumbs, edits, regenerates, abandonment — the highest-signal data you will ever collect, and the input to your next eval set
- Alerting on cost spikes, latency regressions, error-rate jumps, quality drops

### M5.5 — Evaluation as engineering `[CORE]`
- Offline eval suites per feature; dataset versioning; slicing (by tenant, doc type, query type, language)
- Assertion-based tests (deterministic checks first — cheap, fast, and catch most regressions)
- LLM-as-judge done right: rubrics, few-shot judges, judge-vs-human agreement measurement, judge cost control
- Pairwise/preference comparison for "is v2 better than v1"
- **CI gates**: GitHub Actions runs the suite on every PR; thresholds block merges; results posted to the PR
- Online evals: sampling production traffic, shadow runs, canary a prompt to 5% of traffic, auto-rollback on score drop
- A/B testing prompts and models with real metrics; guardrail metrics vs goal metrics

### M5.6 — Security for AI systems `[CORE]`
- **OWASP Top 10 for LLM Applications** — go through it properly, map each item to your own projects
- Prompt injection: direct, indirect (via RAG documents and tool results), and the honest truth that there's no complete fix — only privilege separation, output filtering, and least authority
- Data exfiltration via tool use and markdown image URLs
- PII handling, redaction, data residency, retention policy, what you log
- Secrets, key rotation, per-tenant key isolation, never-trust-the-client
- Multi-tenant isolation in retrieval (the classic bug: forgetting the tenant filter, and one customer reads another's documents)
- Abuse: rate limits, cost-exhaustion attacks, jailbreak monitoring

### M5.7 — Deployment & CI/CD `[CORE]`
- Containerise everything; compose → one real cloud (**AWS ECS/Fargate** or **GCP Cloud Run** — pick one, go deep)
- Managed Postgres (Neon/Supabase/RDS) with pgvector; Redis; object storage for documents
- GitHub Actions: lint → typecheck → test → **eval gate** → build image → deploy staging → smoke test → prod
- Staging environment with a copy of the eval set; migrations in the pipeline; blue/green or canary; rollback plan
- Secrets management, IaC-light (Terraform basics or `fly.toml`/service YAML), cost tagging
- Load testing with `k6` or Locust: find your real p95 and your breaking point

### M5.8 — Fine-tuning: when, not how `[STRETCH]`
Deliberately last and deliberately small, per the video's "overrated for 95%" call.
- The decision: prompting exhausted → RAG insufficient → then consider FT
- Real reasons to fine-tune: rigid format/style, domain vocabulary, latency/cost of a small specialised model, distilling a big model's behaviour
- SFT vs preference optimisation (DPO) vs LoRA/QLoRA — conceptual only
- Data requirements and why most teams don't have them
- **One small hands-on** (LoRA on a small open model, one afternoon) so you can speak from experience, then stop.

### Week plan
| Week | Focus |
|---|---|
| 17 | M5.1 — system design framework + 4 whiteboard sessions. M5.2 queues/workers |
| 18 | M5.3 + M5.4 — caching, routing, cost model, Langfuse across all 3 projects |
| 19 | M5.5 + M5.6 — eval CI gates, OWASP LLM pass over your own code, fix what you find |
| 20 | M5.7 — real cloud deploy, load test, incident drill. Ship MP-5.1. Platform Phase 4 |

### Ship
- **MP-5.1 "Production Hardening"** — take MP-3.1 or MP-4.1 to genuine production grade: real cloud, Docker, queue + worker, Redis + semantic cache, rate limiting, Langfuse tracing, cost dashboard, eval gate in CI, load-test results, runbook. Deliverable is a README with an architecture diagram and **a table of real numbers** (p95 before/after, ₹/request before/after, cache hit rate, load-test ceiling).
- **MP-5.2 "Break it and write it up"** — deliberately cause a production incident on your own staging (retry storm, context overflow, cost spike, injection through a RAG doc, tenant filter removed). Detect it via your dashboards. Fix it. Write a real postmortem: timeline, impact, root cause, fix, prevention. **This document will get you more interview respect than any project, because almost no candidate has one.**
- **MP-5.3 "Eval harness library"** `[STRETCH]` — extract your eval code into a small open-source library with docs.

### 🚪 GATE 5
- [ ] One system running on AWS/GCP in containers, not a PaaS, with CI/CD
- [ ] Langfuse tracing across all three projects, with a cost dashboard you can screenshot
- [ ] CI eval gate blocking merges, demonstrated
- [ ] Load test report with a real p95 and a documented breaking point
- [ ] Cost cut by a measurable % via caching/routing, with the number
- [ ] 8 AI system designs whiteboarded out loud; 2 recorded and watched back
- [ ] OWASP LLM Top 10 reviewed against your own code, with at least 3 real fixes committed
- [ ] One written postmortem in the repo

---

## MONTH 6 — Capstone, tenancy, portfolio, and applications

> **Outcome:** "I have three flagship systems, a public body of writing, and I am
> interviewing."

### M6.1 — Capstone `[CORE]`
One substantial product, built for real users, combining everything: RAG + agents + evals +
streaming UI + **multi-tenancy** + observability + CI. Strong candidate: **`NexHireAI`
itself** — resume↔JD semantic matching, structured resume extraction, an agentic
application assistant, interview prep generation, employer-side search over candidates.
It's your repo, it's a real problem, and it exercises every skill on the map.

Requirements (these are what make it read as senior):
- Multi-tenant with **per-tenant data isolation in retrieval** (and a test proving tenant A can't retrieve tenant B's data)
- Per-tenant budgets and rate limits
- Human-in-the-loop on at least one consequential action
- Eval suite in CI with published scores
- Full observability + cost dashboard
- Public, live, with real users you actually recruited (even 10 friends counts — usage data is the point)

### M6.2 — Specialisation spike `[CORE]` — pick exactly one
Choose by the roles you're targeting (`09-JOB-STRATEGY.md`):
- **Agentic AI** — multi-step reliability, durable execution, computer/browser use, agent evals
- **Context engineering** — advanced retrieval, GraphRAG, memory architectures, long-context strategies
- **LLMOps** — Kubernetes, vLLM/self-hosting, GPU basics, autoscaling inference, model gateways (LiteLLM), FinOps
- **AI evals** — judge calibration research, annotation tooling, eval platforms, red-teaming
- **Forward-deployed** — client discovery, requirement translation, rapid prototyping, demo craft, consulting communication

### M6.3 — Portfolio engineering `[CORE]`
- 3 flagship repos: architecture diagram, measured results table, "what I'd do differently", live demo link, 90-second demo video
- GitHub profile README that presents you as a full-stack AI engineer, not a bootcamp graduate
- A personal site (you're a React dev — make it good, and make the AI demos embedded and interactive)
- **8–12 technical write-ups**, one per hard problem you actually solved. Titles like "Reranking moved my recall@5 from 0.61 to 0.89 — here's what it cost me in latency" outperform "My RAG chatbot project".
- LinkedIn: headline *Full-Stack AI Engineer*, About rewritten around your evidence, projects pinned
- OSS contributions: LangGraph, Langfuse, an MCP server, `pgvector` docs — even small merged PRs are strong signal

### M6.4 — Interview preparation `[CORE]`
- **AI system design rounds** — use the M5.1 framework; 12 mock designs, some with a friend
- **Conceptual rounds** — the ~60 questions in `09-JOB-STRATEGY.md` §4, answered out loud from your own projects
- **Coding rounds** — continue 2 DSA/day; plus AI-flavoured coding: implement cosine similarity, chunking, an agent loop, a retry wrapper, a token counter, RRF from scratch
- **Take-homes** — practise a 4-hour "build a RAG endpoint with evals" under time pressure
- **Behavioural/STAR** — 8 stories from these 6 months, including the postmortem and a "changed my mind based on data" story
- **Cost/tradeoff questions** — "this costs ₹4/request, get it to ₹1 without losing quality" — practise reasoning out loud

### M6.5 — Applications `[CORE]`
Run it as a pipeline, not a lottery. See `09-JOB-STRATEGY.md` §5–6 for targets, outreach
templates and tracking. Ratio guidance: **60% referral/warm outreach, 30% direct
application, 10% inbound** (recruiter-facing content, OSS visibility, demo virality).

### 🚪 GATE 6
- [ ] Capstone live, multi-tenant, with real users and a tenant-isolation test
- [ ] 3 flagship projects with architecture docs, numbers and demo videos
- [ ] 10+ technical posts published
- [ ] LinkedIn + GitHub + personal site consistent and evidence-led
- [ ] 12 mock system designs done, 3 with another human
- [ ] Applications out, pipeline tracked, first interviews booked

---

## MONTH 7 — Interview loop, depth, and optionality

> **Outcome:** Offers. And a body of work that keeps compounding whether or not this month
> produces one.

- **Interview execution**: run the loop, debrief every round in writing within 2 hours, fix the specific gap it exposed before the next one
- **Depth on demand**: when a JD or interview exposes a gap, fill it that week — this is when C-tier items earn their place (voice AI for a voice-agent role, Neo4j/GraphRAG for a knowledge-graph role, self-hosting for an LLMOps role)
- **Optional deep dives** now that they're affordable: hands-on fine-tuning (LoRA), vLLM self-hosting, GraphRAG, multimodal/vision pipelines, realtime voice, on-device models, DSPy/prompt optimisation
- **Keep shipping**: one small public thing per fortnight. An offer arrives faster when your GitHub is obviously alive.
- **Negotiation**: know your bands (`09-JOB-STRATEGY.md` §2), never give the first number, get it in writing, evaluate the AI-work-to-support-work ratio in the role — a title with no real AI work is a trap

---

## Budget & logistics

### API spend (real, and lower than people fear)
| Month | Estimate | Notes |
|---|---|---|
| M1 | ₹0 | No LLM calls yet |
| M2 | ₹1,200–2,500 | Lots of small calls; use Haiku/Flash/mini for 90% of drills |
| M3 | ₹2,000–3,500 | Embedding a corpus once + eval runs (eval runs are the sneaky cost) |
| M4 | ₹2,000–3,500 | Agent runs are multi-call; enforce your own budget guard |
| M5 | ₹1,500–3,000 | Load tests on mocked responses, not real ones |
| M6–M7 | ₹2,000–4,000/mo | Live capstone with real users |
| **Total** | **≈ ₹12,000–20,000** | Over 7 months |

Cost discipline (and it's also the skill being taught): use the cheapest capable model for
drills, cache aggressively, mock provider responses in tests, run local models via Ollama
for high-volume experimentation, claim free tiers (Gemini, Groq, Cohere trial, Neon,
Supabase, Qdrant Cloud free tier, Langfuse free tier), and use provider prompt caching.

### Tracking (weekly, 10 minutes, in `progress/`)
Hours by module · topics gated · projects shipped · posts published · evals written ·
DSA count · ₹ spent · **one thing I was wrong about this week**.

That last field is the highest-value one. Keep it honest.

### If you fall behind
Cut in this order: `[STRETCH]` items → MP-x.2 secondary projects → platform features →
specialisation depth. **Never cut:** the eval work (M3.8, M5.5), the deploys, the writing,
or the gates. A roadmap where months slip but gates hold still produces a hireable
engineer. A roadmap where gates slip to stay on schedule produces a certificate collector
with extra steps.
