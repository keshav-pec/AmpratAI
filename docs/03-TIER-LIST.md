# 03 — Skill Tier List, Calibrated To You

Source: the reference video's S→F tier list, with my adjustments from
`01-PROFILE-AND-GAP-ANALYSIS.md` §6 marked **[adjusted]**.

Legend for *Your status*: `HAVE` = transfers from MERN · `PARTIAL` = some of it ·
`GAP` = from zero.

---

## S-Tier — you cannot be hired without these

| Skill | Your status | Where | Bar you must clear |
|---|---|---|---|
| **Python (real fluency)** | GAP | M1 | async/await, decorators, context managers, generators, type hints, pydantic v2, venv/uv, pytest, file IO, OOP |
| **LLM APIs** | GAP | M2 | Call Anthropic + OpenAI + Gemini. Explain tokens, context windows, temperature, system/user/assistant roles, pricing, streaming, stop reasons |
| **Production prompt engineering** | GAP | M2 | Not ChatGPT tricks. Same output reliably across 1000s of calls: system prompt architecture, few-shot, structured output contracts, CoT, prompt versioning + A/B testing |
| **RAG** | GAP | M3 | Embeddings, chunking, one vector DB, hybrid retrieval, reranking, citations, and **retrieval evaluation** |

> The video: *"every single AI engineer job posting I've seen in the last 3 months mentions
> RAG."* Treat Month 3 as the most important month on the map.

## A-Tier — takes you from *hired* to *well paid*

| Skill | Your status | Where | Bar |
|---|---|---|---|
| **Function calling / tool use / structured outputs** | GAP | M4 | Tool schemas, parallel calls, tool error handling, arg validation, native JSON modes |
| **AI agents** | GAP | M4 | Write an agent loop **from scratch** first. Then LangGraph. Know the patterns: planning loop, reflection, router, supervisor, human-in-the-loop. Frameworks change every 6 months; patterns don't |
| **MCP (Model Context Protocol)** | GAP | M4 | Host/client/server model, tools vs resources vs prompts, stdio + streamable HTTP, auth. **Build and publish one.** Most roadmaps still don't cover this |
| **AI system design** | PARTIAL | M5 | API layer, caching, rate limiting, retries/fallbacks, streaming, queues, monitoring, prompt versioning, cost modelling. Web system design ≠ AI system design |
| **Evals & observability** **[adjusted: promoted from B]** | GAP | M3+M5 | Golden sets, retrieval metrics, LLM-as-judge with calibration, assertion tests, CI gates, Langfuse tracing, cost/latency dashboards |
| **Context engineering** **[adjusted: named explicitly]** | GAP | M3–M4 | Token budgeting, context assembly/ordering, memory architecture, compaction, "lost in the middle" |

## B-Tier — level-up material, mostly after you're employed

| Skill | Your status | Where | Note |
|---|---|---|---|
| **FastAPI** | GAP→fast | M1 | Video calls this B-tier because backend devs already have it. **For you it's S-tier-urgent but 4 days of work** — Express maps almost 1:1 |
| **Docker + one cloud** | GAP | M1, M5 | Vercel hid this from you. Pick **one** cloud. Start Railway/Render/Fly for speed, then AWS ECS or GCP Cloud Run |
| **Postgres/SQL** **[adjusted: raised for you]** | GAP | M1 | Video assumes you have it (Rahul does). You don't — MERN gave you Mongo. `pgvector` makes this double as your vector store |
| **Vector DB internals** | GAP | M5 stretch | HNSW vs IVFFlat, recall/latency tuning. Know *that* they exist and roughly how. You do **not** need an ANN-search PhD |
| **Fine-tuning (SFT / LoRA / DPO)** | GAP | M7 optional | Video: *"overrated for 95% of AI engineers."* Agreed. Learn **when** to fine-tune (prompting exhausted, very specific behaviour, latency/cost of a small model). Learn **how** only when a real project needs it |
| **Queues / workers / background jobs** **[adjusted: added]** | GAP | M5 | Not in the video; unavoidable in practice. Ingestion, agent runs, eval suites are all long-running |

## C-Tier — nice, not necessary. Specialisations, not foundations

| Skill | Verdict |
|---|---|
| Voice AI (Whisper, TTS, realtime) | Growing market. Only if you specifically target voice agents. Not a day-one need |
| Computer use / browser agents | Demos great, production adoption still early. Let it mature |
| Graph DBs / Neo4j / GraphRAG | Powerful for complex relational corpora. Specialisation, not a core requirement |
| Learning *every* LLM framework | Actively harmful. LangChain, LlamaIndex, Haystack, Semantic Kernel, CrewAI, AutoGen, Pydantic-AI… pick **one**, learn the patterns, move on |
| DSA grinding as your main activity | **[adjusted]** The video ignores interviews. Keep it to 2 problems/day in Python — a lane, never the main road |

## F-Tier — if a course leads with these in 2026, it's selling you something

| Anti-pattern | Why it fails you |
|---|---|
| **Starting with linear algebra / calculus** | The video's #1 reason people quit. 3 months of matrix multiplication leaves you no closer to a shipped AI product. You need *conceptual* understanding of embeddings, vectors, similarity — **[adjusted]** ~8 hours of it, budgeted in M2 — not hand-derived backpropagation |
| **PyTorch / TensorFlow for an AI-engineer track** | Incredible tools, wrong job. You will write `import anthropic`, not `import torch`. If you're training models from scratch, PyTorch is mandatory — you are not |
| **Coursera Deep Learning Specialization first** | You're going to build RAG apps; it teaches you RNNs and LSTMs. Wrong decade, wrong role |
| **Certificate collecting** | *"A GitHub repo with three deployed AI projects will get you the job."* Portfolio beats certificate every time. Certificates teach basics; nobody hires on them |
| **Five courses on the same topic** | You'll learn one concept five times and ship nothing. One resource per concept — enforced by the platform design in `05-PLATFORM-SPEC.md` §8 |

---

## The one-screen version

```
MONTH 1   Python + FastAPI + Postgres + Docker        <- the 70% you're missing
MONTH 2   LLM APIs + prompting + streaming + ML intuition
MONTH 3   RAG + retrieval evaluation                  <- most-hired skill
MONTH 4   Tool use + agents + MCP
MONTH 5   AI system design + LLMOps + observability + CI evals
MONTH 6   Capstone + multi-tenant + portfolio + applications
MONTH 7   Specialisation spike + interview loop
```

Never: model training, math-first, certificate farming, framework tourism.
Always: build → break → fix → deploy → write about it.
