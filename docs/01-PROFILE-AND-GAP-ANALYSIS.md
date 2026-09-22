# 01 — Profile & Honest Gap Analysis

Read this once before anything else. If the diagnosis is wrong, the plan is wrong.

## 1. Where you actually stand

The reference video splits learners into three personas — Rahul (backend, 3–6 months),
Priya (frontend, 6–9 months), Arjun (student, 8–12 months). You said you're Rahul and
Priya at once. You're actually a **fourth profile the video doesn't cover**, and it's the
strongest starting point of the four.

| | Rahul | Priya | Arjun | **You** |
|---|---|---|---|---|
| Frontend depth | low | high | low | **high** |
| Backend depth | high | none | low | **medium–high** |
| Python | medium | none | low | **low–medium** |
| SQL | high | none | low | **medium** (MySQL) |
| Containers / prod ops | high | none | none | **low** |
| DSA | — | — | practising | **300+ solved** |
| AI / RAG | none | none | none | **basic RAG, one small project** |
| Ships & deploys things | yes | yes | no | **yes, repeatedly** |

The video's most important claim is correct:

> Production AI engineering is about 70% software engineering and 30% AI knowledge.

You already have most of that 70%, on **both** sides of the stack, plus a real head start
on the AI side. Priya needs six to nine months to reach where you're starting.

## 2. What transfers — don't spend time re-learning this

| You have | Where it's used in AI engineering |
|---|---|
| REST API design, HTTP, auth, JWT | LLM API integration, your own inference endpoints, multi-tenant AI apps |
| `async`/`await`, event loop | Python `asyncio`, concurrent LLM calls, streaming |
| Express middleware, error handling | FastAPI dependencies, retry and fallback layers |
| React state, hooks, components | Streaming chat UI, agent trace dashboards, eval dashboards |
| MySQL, joins, indexes, schema design | Postgres transfers almost fully; metadata design for retrieval |
| MongoDB modelling | Document stores, chunk metadata, flexible payloads |
| Vercel / GitHub deploys | Shipping AI products — the step most AI learners never take |
| 300+ DSA problems | Interview screens are largely handled; needs sharpening, not building |
| Basic RAG + a small RAG project | A real starting point for Stage 3, and the baseline you'll beat |
| A habit of finishing and deploying | The highest-value item here. Most people spend months acquiring it. |

## 3. What's genuinely missing

### Real gaps
1. **Python for AI work, specifically.** Low–medium general Python is a fine base. The
   specific things AI code is built out of, that you probably haven't hit: `asyncio` at
   depth (`gather`, `TaskGroup`, semaphores, cancellation), **pydantic v2** (it's the type
   system of the entire AI ecosystem — tool schemas, structured outputs, agent state),
   generators for streaming, decorators, context managers, `httpx` async, and modern
   tooling (`uv`, `ruff`, `pytest`).
2. **FastAPI.** Standard for AI backends. Express knowledge makes it fast.
3. **Containers and a real cloud.** Vercel is excellent and it hides the whole operational
   layer: no containers, no long-running processes, no workers, no queues. AI workloads are
   long-running and stateful. This is a real gap and it matters in interviews.
4. **Everything in Stages 2, 4 and 5** — LLM APIs at production quality, agents, tool use,
   MCP, evals, observability, AI system design, cost engineering.

### Partial gaps
5. **Postgres specifically.** MySQL gives you SQL, joins, indexes, transactions — so this
   isn't a from-scratch topic. What's new: `pgvector` (vector search inside Postgres),
   `tsvector` full-text search (you need it for hybrid retrieval), `EXPLAIN ANALYZE` output
   format, `JSONB`, and async SQLAlchemy 2.0 + Alembic. Treat it as a short conversion
   course, not a SQL course.
6. **RAG beyond basic.** You have a working simple RAG project. That project becomes your
   baseline in Stage 3 — the first row of the results table you'll build. What's missing is
   everything that separates a demo from production: messy real-world ingestion, chunking
   chosen from document shape, hybrid search, reranking, citations, and above all
   **measurement**. Most people who "know RAG" cannot answer *"how do you know it's
   retrieving the right thing?"* That question is the whole month.
7. **Cost and latency as engineering concerns.** Tokens are money. In web dev a wasteful
   loop costs nothing. This is a new mental muscle and it's heavily interviewed.
8. **Background jobs, queues, workers.** Ingestion, agent runs and eval suites are all
   long-running. New territory for a Vercel-native developer.

### Already handled
- **DSA.** 300+ problems across topics means the coding screen is largely covered. No
  beginner or easy problems anywhere in this plan. What's left is *sharpening*: occasional
  medium/hard problems, plus AI-flavoured implementation questions (implement RRF, a token
  budgeter, a streaming parser, a rate limiter) which are what AI-role interviews actually
  ask. Treated as optional practice, not a daily obligation.

## 4. Your unfair advantage, stated plainly

Most AI engineers are Python-only. They build a good retrieval pipeline and then put a bare
Gradio or Streamlit page in front of it. You can build:

- streaming chat interfaces that feel instant
- agent dashboards showing live reasoning, tool calls, costs and approvals
- eval dashboards that make quality visible
- anything a real user would actually touch

The video calls the full-stack AI engineer *"the rarest and most premium profile in the
market."* That's the profile you're closest to. Every project in this plan therefore ships
with a real interface — not because it's decorative, but because it's the part almost
nobody else can do.

## 5. Two traps to avoid

### Trap 1: staying in JavaScript
The tempting move is LangChain.js or the Vercel AI SDK, so you never leave the language
you're fluent in. The JS AI ecosystem is genuinely good for frontends and thin backends,
and it is well behind Python on everything that matters for hiring: retrieval tooling, eval
frameworks, agent orchestration, observability SDKs. Job descriptions say Python.

**Rule:** Python for the AI backend. TypeScript for the UI. Use your JS skill as a weapon,
not a hiding place.

### Trap 2: building infrastructure before understanding the model
Your instinct is to build the structure first — routes, schema, deploy pipeline. But an LLM
is **not a swappable service**. Moving from Claude to GPT to Llama changes behaviour enough
to break your prompts, your parsers and your evals. The model is the core, not a plugin.

**Rule:** for every new AI capability, spend the first session poking the model directly in
a scratch file. Learn how it fails. *Then* build around it.

*(The earlier version of this doc had a third trap — building the learning platform instead
of learning. That's resolved: Claude builds AmpratAI, you don't.)*

## 6. Effort, not deadlines

No calendar in this plan. Stages are content units. Rough effort, given what you already
know:

| Stage | Focus | Est. focused hours |
|---|---|---|
| 1 | Python for AI, FastAPI, Postgres+pgvector, Docker | 70–90 |
| 2 | LLM APIs, streaming, prompting, structured output | 100–120 |
| 3 | RAG for real + evaluation | 120–140 |
| 4 | Tool use, agents, MCP | 110–130 |
| 5 | AI system design, LLMOps, security, cost | 110–130 |
| 6 | Capstone + portfolio | 90–120 |
| 7 | Interviews + one specialisation | 60–90 |
| | **Total** | **≈ 650–800** |

At 25–30 h/week that's roughly 6 months. At 12 h/week, roughly a year. **Exam weeks are
zero-hour weeks and cost nothing but elapsed time** — AmpratAI is designed to be paused and
resumed (`05-PLATFORM-SPEC.md` §8).

Stage 1 is deliberately small because you already have Python basics and SQL. If you test
out of parts of it, skip them — every module lists a self-check for exactly that.

## 7. Where this plan deviates from the video

The video is a good, honest tier list. Five places I'd change it, and these are real
disagreements, not nitpicks.

1. **Evals belong in the top tier, not the "learn after you're hired" tier.** "How do you
   know your AI works?" is now a standard interview question, and an eval harness is the
   clearest signal that you've built something real rather than a demo. Moved into Stage 3,
   *before* the retrieval optimisation work — because optimising without measurement is how
   people spend a month and end up worse.
2. **A little ML intuition is not optional, it's just cheap.** The video is right that
   starting with linear algebra is a trap. But you do need to understand what a token is,
   what an embedding represents, why cosine similarity works, what temperature does, and
   why models hallucinate. That's about 8 hours, not 3 months. No derivations, no exercises.
3. **DSA: sharpen, don't grind.** The video ignores interviews entirely. With 300+ problems
   behind you, the right move is occasional medium/hard practice plus AI-system
   implementation questions — not a daily problem count.
4. **Context engineering is a skill, not an exotic job title.** The video lists "Context
   Engineer" as a new role. Treat it as the thing you're learning in Stages 3–4: deciding
   what information reaches the model at each step. It's the most under-taught,
   highest-leverage part of the whole path.
5. **Ship one multi-tenant system.** Every portfolio has a single-user RAG chatbot. Tenancy
   — per-tenant data isolation in retrieval, per-tenant budgets — is what reads as
   production experience. Your auth background makes it cheap for you and expensive for
   everyone else.

Everything else in the video I agree with, including the uncomfortable parts: don't start
with the math, don't learn PyTorch for this role, certificates won't get you hired, and
don't learn five agent frameworks.

## 8. What "ready" looks like

At the end of this path you should be able to say, with links:

- **Three flagship systems**, live, with architecture docs and real numbers — p95 latency,
  cost per request, retrieval recall@5 before and after each change you made.
- An **eval suite in CI** that blocks your own merges when quality drops.
- An **MCP server** you published, installable in one command.
- A **written postmortem** of a production failure you caused and fixed.
- A **multi-tenant agentic system** with human-in-the-loop approvals.
- And you can whiteboard any of it — with costs and failure modes — in 40 minutes.

That isn't "someone trying to break into AI". That's a candidate for the roles in
`09-JOB-STRATEGY.md`.
