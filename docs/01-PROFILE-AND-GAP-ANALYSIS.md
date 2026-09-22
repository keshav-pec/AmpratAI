# 01 — Profile & Honest Gap Analysis

> Read this once before touching the roadmap. If the diagnosis is wrong, the treatment is wrong.

## 1. Your actual starting position

The reference video splits learners into three personas:

| Persona | Who | Timeline in video |
|---|---|---|
| Rahul | Backend engineer, 3 yrs Java/Spring, prod deploys, SQL, Docker | 3–6 months |
| Priya | Frontend engineer, 2 yrs React, no Python, no backend | 6–9 months |
| Arjun | Final-year student, DSA only, no shipped software | 8–12 months |

You said you are **Rahul and Priya at the same time**: MERN full stack, a completed
course, many projects shipped to GitHub + Vercel.

That is a **fourth persona the video does not cover**, and it is the most interesting one.
Call it **Keshav — the full-stack JS engineer**.

```
                    frontend depth      backend depth      Python      prod ops      ships things
Rahul (BE)               low               high            medium        high            yes
Priya (FE)               high              none            none          none            yes
Arjun (student)          low               low             low           none            no
YOU                      high              medium          none          low             yes  <-- 
```

### Why this matters
The video's core claim is correct and it is the single most important line in it:

> Production AI engineering is ~70% software engineering and ~30% AI knowledge.

You already own a large chunk of that 70% **on both sides of the stack**. Rahul owns it
only on the backend. Priya owns it only on the frontend. The video explicitly names the
full-stack AI engineer as *"the rarest and most premium profile in the market"* — and says
Priya needs 6–9 months to reach it.

**You are starting where Priya finishes her first 4 months.**

## 2. What transfers directly (do not re-learn this)

| You already have | Maps to in AI engineering |
|---|---|
| REST API design, HTTP semantics, status codes | LLM API integration, your own inference endpoints |
| `async`/`await`, promises, event loop | Python `asyncio`, concurrent LLM calls, streaming |
| Express middleware, error handling | FastAPI dependencies, retry/fallback layers |
| React state, components, hooks | Streaming chat UI, agent trace dashboards, eval dashboards |
| SSE / WebSockets in React (if you've touched them) | Token-by-token streaming, live agent status |
| MongoDB schema thinking, indexes | Metadata design for retrieval, chunk stores |
| Auth, JWT, sessions | Multi-tenant AI apps, API key + budget management |
| Vercel/GitHub deploys, CI basics | Shipping AI products (the thing 90% of AI learners never do) |
| A habit of finishing and deploying projects | **The highest-value habit on this list.** |

That last row is not a filler line. The video's closing advice — *"no course, no bootcamp;
build things, break things, read docs, deploy, fail, fix"* — describes a habit you have
already built. Most people spend six months acquiring it. You skip that.

## 3. What is genuinely missing (the honest list)

Ordered by how much it blocks you.

### Tier 1 — blocks everything downstream
1. **Python, to a real standard.** Not "I can write a for loop." You need: type hints,
   `asyncio`, decorators, context managers, generators, `pydantic` v2, virtualenvs/`uv`,
   `pytest`. Every AI library is Python-first. Budget **3 weeks**, not 3 months —
   you already know how to program; you are learning a dialect, not a craft.
2. **FastAPI.** The de facto standard for serving AI backends. Express knowledge makes
   this a ~4-day topic.
3. **Everything AI.** LLM APIs, production prompting, RAG, agents, tool use, MCP,
   evals, AI system design. This is Months 2–5.

### Tier 2 — will quietly break you later if skipped
4. **Relational data + SQL/Postgres.** MERN gave you MongoDB. The AI ecosystem runs on
   Postgres, and `pgvector` means your vector store and your app DB can be the same
   database. You need joins, indexes, transactions, query plans, migrations.
   This is also the #1 thing MERN-only candidates get caught on in interviews.
5. **Docker + a real cloud.** Vercel is excellent and it also *hides* the entire
   operational layer from you: no containers, no long-running processes, no workers,
   no queues, no GPU-adjacent concerns, hard timeouts you never had to reason about.
   AI workloads are long-running and stateful. Vercel alone cannot host them.
6. **Cost and latency as first-class engineering concerns.** Tokens are money. In web dev
   a wasteful loop costs nothing; in AI it shows up on an invoice. This is a genuinely new
   mental muscle and it is heavily interviewed.
7. **Background jobs / queues / workers.** Ingestion pipelines, agent runs, and eval
   suites are all long-running. Redis + a worker is a new pattern for a Vercel-native dev.

### Tier 3 — you have *some* of this, needs sharpening
8. **System design at production scale** — caching, rate limiting, backpressure,
   observability, graceful degradation. You've likely touched pieces; AI system design
   rounds want the whole picture.
9. **Testing discipline.** AI systems are non-deterministic, so testing becomes
   *evaluation*, which is a harder skill than unit testing. Most people arrive with no
   testing habit at all; if you have one, it converts directly.

## 4. Your three traps (specific to you, not generic)

These are the ways *your specific profile* fails. Print them.

### Trap 1: "I'll just use LangChain.js / Vercel AI SDK and stay in JavaScript."
This is the most tempting and most expensive mistake available to you. The JS AI
ecosystem is real and genuinely good for frontends and BFFs — and it is 6–12 months
behind Python on everything that matters for hiring: retrieval tooling, eval frameworks,
agent orchestration, observability SDKs, research ports. Job descriptions say Python.

**Rule:** Python for the AI backend. TypeScript for the UI and the BFF layer.
Use your JS skill as a *weapon*, never as a *hiding place*.

### Trap 2: Over-engineering before you understand model behaviour.
The video attributes this to backend devs, and it applies to you: your instinct is to
build the infrastructure first — routes, schema, deploy pipeline, monitoring. But an LLM
is **not a swappable microservice**. Switching Claude → GPT → Llama changes system
behaviour so much that your prompts break, your evals break, your output parsers break.
The model is the core, not a plugin.

**Rule:** For every new AI capability, spend the first day in a scratch script/notebook
poking the model directly. Understand its failure modes. *Then* build around it.

### Trap 3: Building the learning platform instead of learning.
You want to build a platform to follow this roadmap. That is a great idea and a perfect
procrastination vehicle. Six months from now you could have a beautiful LMS and zero AI
skills.

**Rule (hard):** platform work is capped at **15% of weekly hours**, it starts in Month 2
(not Month 1), and **every platform feature must double as a roadmap mini-project**. The
platform's AI tutor *is* your RAG project. The prompt arena *is* your evals project. See
`05-PLATFORM-SPEC.md` §9 for the enforcement mechanism.

## 5. Your timeline

The video would put you between Rahul (3–6mo) and Priya (6–9mo). Being precise:

| Pace | Hours/day | Hours/week | Duration | Realistic for |
|---|---|---|---|---|
| **Sprint** | 6–8 | 45–55 | **5 months** | Student on break, between jobs, full-time focus |
| **Standard** (assumed) | 4–5 | 30–35 | **7 months** | Final-year student, or job + serious evenings |
| **Sustainable** | 2–3 | 15–20 | **10 months** | Full-time job + other commitments |

**The roadmap in `02-ROADMAP.md` is written for the Standard lane: 7 months, ~30 h/week.**
Every month lists which items are *core* (never cut) vs *stretch* (cut first when
compressing). Sprint lane = do core + stretch, 4-week months. Sustainable lane = core
only, treat each "month" as 6 weeks.

Do not optimise the calendar. Optimise the gates in §`02-ROADMAP.md` — the calendar is a
guess, the gates are the truth.

## 6. Where I deviate from the video

The video is a good, honest tier list. Five places I'd change it for you specifically —
these are load-bearing disagreements, not nitpicks.

1. **Evals are A-tier, not B-tier.** The video says you don't need evals to get hired.
   That was true in 2024. In 2026 "how do you know your AI works?" is a standard
   interview question and eval-harness experience is a differentiator at product
   companies, because it's the thing that separates a demo from a product. **Promoted to
   A-tier, taught in Month 3 alongside RAG rather than in a late "after you're hired"
   phase.**
2. **A little ML intuition is not optional, it's just cheap.** The video is right that
   starting with linear algebra is a trap. But you do need: what a token is, what an
   embedding actually represents, why cosine similarity works, what temperature does to
   a probability distribution, roughly what attention does, and why models hallucinate.
   That's **~8 hours total**, not three months. Budgeted as a single module in Month 2.
   Skipping it entirely means you can't debug retrieval quality or explain your own system.
3. **Keep a small DSA lane.** The video ignores interviews entirely. Top product companies
   still run a coding screen. **2 problems/day, 30 min, in Python** — which doubles as
   Python practice. Non-negotiable if you're targeting the companies you said you're
   targeting. Zero extra time cost if you fold it into Python practice.
4. **Context engineering is not a separate exotic role — it's the spine of Months 3–4.**
   The video lists "Context Engineer" as a new job title. Treat it as a *skill*: deciding
   what information reaches the model at each step. That is RAG + memory + prompt
   assembly + token budgeting, and it's the most under-taught, highest-leverage thing on
   the whole map.
5. **Ship one *multi-tenant* system.** Every portfolio has a single-user RAG chatbot. The
   thing that reads as production experience is tenancy: per-tenant data isolation in
   retrieval, per-tenant budgets, per-tenant prompt config. One project in Month 6 must
   have this. Your MERN auth experience makes it cheap for you and expensive for everyone
   else.

Everything else in the video's tier list I agree with, including the spicy parts:
don't start with the math, don't learn PyTorch for this role, certificates won't get you
hired, and don't learn five agent frameworks.

## 7. What "done" looks like (define it now, before Month 1)

By the end of this roadmap you should be able to walk into an interview and say:

- Here are **3 flagship systems**, live, with architecture docs and measured numbers
  (p95 latency, cost per request, retrieval recall@5 before/after my changes).
- Here is an **eval suite in CI** that blocks my own merges on quality regression.
- Here is an **MCP server** I built and published.
- Here is a **production incident** I caused and fixed, written up.
- Here is a **multi-tenant agentic system** with human-in-the-loop approvals.
- Here are **8 technical write-ups** on problems I actually hit.
- And I can whiteboard the whole architecture, with cost and failure modes, in 40 minutes.

That profile is not "junior trying to break into AI." That profile competes for the
roles in `09-JOB-STRATEGY.md`.

---
*Next: `02-ROADMAP.md` for the month-by-month plan, or `03-TIER-LIST.md` for the skill
priority reference.*
