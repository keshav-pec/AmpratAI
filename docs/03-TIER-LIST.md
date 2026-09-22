# 03 — Skill Priorities, With Your Current Status

Based on the reference video's S→F tier list, adjusted for your actual starting point and
for the five deviations in `01-PROFILE-AND-GAP-ANALYSIS.md` §7 (marked **[adjusted]**).

*Your status:* `HAVE` = transfers as-is · `PARTIAL` = real head start, needs depth ·
`GAP` = from scratch

---

## Top tier — you can't be hired without these

| Skill | Your status | Stage | What "enough" looks like |
|---|---|---|---|
| **Python for AI work** | PARTIAL | 1 | Not syntax — `asyncio`, pydantic v2, generators, decorators, context managers, `httpx`, `pytest`. Your general Python is fine; these specific pieces are the gap. |
| **LLM APIs** | GAP | 2 | Anthropic + OpenAI + Gemini behind one interface. Tokens, context windows, temperature, streaming, stop reasons, pricing. |
| **Production prompting** | GAP | 2 | Not ChatGPT tricks — the same output reliably across thousands of calls. System prompt architecture, structured output contracts, versioning, A/B testing. |
| **RAG** | **PARTIAL** | 3 | You have basic RAG. Missing: messy real ingestion, chunking chosen from document shape, hybrid search, reranking, citations, and **measurement**. |

> The video: *"every AI engineer job posting I've seen in the last three months mentions
> RAG."* Stage 3 is the most important stage on this path — and you start it with a
> head start, which means you can go deeper rather than slower.

## Second tier — takes you from *hired* to *well paid*

| Skill | Your status | Stage | What "enough" looks like |
|---|---|---|---|
| **Tool use & structured outputs** | GAP | 4 | Tool schemas, parallel calls, error handling, argument validation |
| **AI agents** | GAP | 4 | Write the loop yourself once. Then LangGraph. Know the patterns — planning, reflection, router, supervisor, human-in-the-loop. Frameworks change every six months; patterns don't. |
| **MCP** | GAP | 4 | Host/client/server, tools vs resources vs prompts, stdio and HTTP transports, auth. **Build and publish one.** Most roadmaps still skip this. |
| **AI system design** | PARTIAL | 5 | API layer, caching, rate limiting, fallbacks, streaming, queues, monitoring, cost modelling. Web system design ≠ AI system design. |
| **Evals & observability** **[adjusted: promoted]** | GAP | 3 + 5 | Golden sets, retrieval metrics, LLM-as-judge with calibration, CI gates, tracing, cost dashboards |
| **Context engineering** **[adjusted: named]** | PARTIAL | 3–4 | Token budgeting, context assembly and ordering, memory architecture, compaction |

## Third tier — useful, mostly after you're employed

| Skill | Your status | Stage | Note |
|---|---|---|---|
| **FastAPI** | GAP | 1 | The video calls it third-tier because backend devs have it. For you it's urgent but small — Express maps nearly 1:1. |
| **Docker + one cloud** | GAP | 1, 5 | Vercel hid this from you. Pick **one** cloud and go deep. |
| **Postgres + pgvector** | **PARTIAL** | 1 | MySQL means you have SQL. What's new: `pgvector`, `tsvector`, `JSONB`, Postgres query plans, async SQLAlchemy. A conversion course, not a SQL course. |
| **Vector DB internals** | GAP | 5 opt | HNSW vs IVFFlat, recall/latency tuning. Know it exists and roughly how. You don't need an ANN-search PhD. |
| **Queues / workers** | GAP | 5 | Not in the video; unavoidable in practice. Ingestion, agent runs and eval suites are all long-running. |
| **Fine-tuning (SFT/LoRA/DPO)** | GAP | 7 opt | Video: *"overrated for 95% of AI engineers."* Agreed. Learn **when**; learn **how** only when a project needs it. |

## Fourth tier — specialisations, not foundations

| Skill | Verdict |
|---|---|
| Voice AI (Whisper, TTS, realtime) | Growing, but only if you target voice agents. Not a day-one need. |
| Computer use / browser agents | Demos beautifully, production adoption still early. Let it mature. |
| Graph DBs / GraphRAG / Neo4j | Powerful for linked corpora. A specialisation. |
| Every LLM framework | Actively harmful. Pick one, learn the patterns, move on. |
| **DSA grinding** **[adjusted]** | **You've done 300+. This is finished as a project.** Occasional medium/hard when rusty, plus AI-flavoured implementations. Never a daily quota, never an easy problem. |

## Avoid — if a course leads with these, it's selling you something

| Anti-pattern | Why |
|---|---|
| **Starting with linear algebra / calculus** | The video's number-one reason people quit, and it's right. You need conceptual understanding of embeddings, vectors and similarity — **[adjusted]** about 8 hours of it — not hand-derived backpropagation. |
| **PyTorch / TensorFlow for this role** | Excellent tools, wrong job. You'll write `import anthropic`, not `import torch`. |
| **Deep Learning Specialization as an entry point** | Teaches RNNs, LSTMs and CNNs. Great course, wrong role. |
| **Certificate collecting** | *"A GitHub repo with three deployed AI projects will get you the job."* Portfolio beats certificate, every time. |
| **Five courses on one topic** | You'll learn one concept five times and ship nothing. AmpratAI curates a small set of good sources per topic instead. |

---

## One screen

```
1  Python for AI · FastAPI · Postgres+pgvector · Docker      <- smaller than it looks for you
2  LLM APIs · streaming · prompting · structured output
3  RAG for real + EVALS                                      <- your basic RAG becomes v1
4  Tool use · agents · MCP
5  System design · observability · CI evals · security · cost
6  Capstone (multi-tenant) · portfolio
7  Interviews · one specialisation
```
