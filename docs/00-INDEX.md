# AmpratAI — Roadmap & Platform Plan

Planning documents. The platform gets built from these (by Claude — see
`05-PLATFORM-SPEC.md` §1).

> **A note on how these docs read.** They're dense because they're specifications — written
> for whoever builds the platform. The *learner-facing content* inside AmpratAI is held to
> the opposite standard: short sentences, plain words, every term explained the first time,
> examples before definitions. `04-CURRICULUM-MAP.md` §2 sets that standard and shows a
> side-by-side example of the same idea written badly and written well.

## Read in this order

| # | Doc | What it answers |
|---|---|---|
| 01 | [`01-PROFILE-AND-GAP-ANALYSIS.md`](01-PROFILE-AND-GAP-ANALYSIS.md) | Where you actually stand, what to skip, what's genuinely missing |
| 02 | [`02-ROADMAP.md`](02-ROADMAP.md) | The path: 7 stages, what each one gives you, how to know you're ready to move on |
| 03 | [`03-TIER-LIST.md`](03-TIER-LIST.md) | Which skills matter most, and your current status on each |
| 04 | [`04-CURRICULUM-MAP.md`](04-CURRICULUM-MAP.md) | How each topic becomes content; the plain-language standard |
| 05 | [`05-PLATFORM-SPEC.md`](05-PLATFORM-SPEC.md) | AmpratAI itself: screens, animations, colours, architecture, build order |
| 06 | [`06-ANIMATION-CATALOG.md`](06-ANIMATION-CATALOG.md) | The animation plan: what each shows and why (57 built) |
| 07 | [`07-PROJECT-BRIEFS.md`](07-PROJECT-BRIEFS.md) | 13 project briefs, written for someone building with AI assistance |
| 08 | [`08-RESOURCES.md`](08-RESOURCES.md) | Where the content comes from; how videos and decks are chosen |
| 09 | [`09-JOB-STRATEGY.md`](09-JOB-STRATEGY.md) | Roles, positioning, 63 interview questions, applications |

Machine-readable curriculum: [`../content/curriculum.yaml`](../content/curriculum.yaml).

## The whole path in eight lines

```
STAGE 1  Python where it matters for AI · FastAPI · Postgres+pgvector · Docker
STAGE 2  LLM APIs · streaming · production prompting · structured output
STAGE 3  RAG for real: ingestion, hybrid retrieval, reranking, and EVALS
STAGE 4  Tool use · agents · MCP (build and publish one)
STAGE 5  AI system design · observability · CI eval gates · security · cost
STAGE 6  Capstone (multi-tenant, explainable) · portfolio
STAGE 7  Interviews · one specialisation · negotiation
```

Stages are **content units, not calendar months.** Roughly 650 focused hours in total.
At 25–30 h/week that's about 6 months; at 12 h/week, about 12. Exam weeks count as zero
and cost you nothing but time.

**Never:** training models from scratch · math-first · certificate collecting ·
learning five frameworks.
**Always:** understand it → build it (with AI) → break it → fix it → deploy it.

## Status

- [x] Roadmap planned
- [x] Platform specified
- [x] Curriculum seeded (`content/curriculum.yaml`)
- [x] **AmpratAI built and running** — `npm install && npm run dev`
- [x] **All seven stages written** — 215 topics, 511 practice items (each with a checked
  answer), 57 animations, 13 project briefs
- [x] Home page opens on a progress summary
- [ ] Stage 1 started
