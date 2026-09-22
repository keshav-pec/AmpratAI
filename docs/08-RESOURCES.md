# 08 — Resource Strategy: What to Watch, What to Read, What to Author

> **Honesty note on links.** This file names channels, authors, books, docs and specs —
> things that are stable and easy to verify. It deliberately does **not** list exact video
> URLs or timestamps, because those rot and because I won't hand you a link I can't check.
> When you author a topic's `primary` field in the platform, you find the current best
> video on the named channel, verify it plays, and pin the segment. That verification step
> is 2 minutes per topic and it's the difference between a curated path and a link graveyard.

---

## 1. The core principle

**Video builds intuition. Docs are truth. Code is proof.**

For every topic, in this order:
1. One video (or one authored slide deck) — 20–40 min, to get the shape of the idea
2. The primary doc — to get it *right*
3. A drill — to get it into your hands
4. A project — to find out what you actually didn't understand

Skipping step 2 is the most common failure. Videos are 6–18 months stale on this subject
matter, and in AI tooling that's a generation.

## 2. When to use YouTube vs authored slides

```
Is there ONE video teaching this at production depth in under 30 minutes?
├── YES → YouTube segment + your curated notes
└── NO  → Is the authoritative source a spec, doc or engineering blog?
          ├── YES → author SLIDES from primary sources, cite every claim
          └── NO  → slides + a T2 explorable animation, because if nobody has
                    explained it well, an interactive model is the best teacher available
```

**Expected split: ~55% video, ~45% slides.**

| Teach from **video** | Teach from **authored slides** |
|---|---|
| Python language, OOP, async | Production prompt engineering |
| FastAPI basics | MCP (spec is newer than good video coverage) |
| SQL, Postgres, indexes, query plans | Evals, LLM-as-judge, judge calibration |
| Docker, compose, deployment | Observability & tracing practice |
| Transformers/attention *intuition* | AI system design |
| Embeddings *intuition* | LLM security / OWASP LLM Top 10 |
| Chunking basics, vector DB basics | Context engineering & token budgeting |
| LangGraph walkthroughs | Cost/latency engineering, model routing |
| Git, Linux, tooling | Multi-tenancy for AI apps |

The right-hand column is exactly where the internet is weakest — and it's Months 4–5, the
months that get you *paid* rather than just hired. **That column is the actual reason your
platform is worth building.** If everything were well covered on YouTube, a playlist would do.

## 3. Curated sources by domain

### Python / backend (Month 1)
- **Corey Schafer** — the best free Python fundamentals on the internet; still accurate
- **ArjanCodes** — Python design, typing, architecture; closest thing to "senior Python"
- **mCoding** — short, deep, corrects misconceptions you'll have from JS
- **Tech With Tim / Patrick Loeber** — FastAPI walkthroughs
- **TechWorld with Nana** — Docker and containers, best-in-class
- Docs (read these, don't skim): FastAPI (the tutorial is genuinely excellent — do all of it),
  Pydantic v2, `uv`, SQLAlchemy 2.0 async, Alembic, PostgreSQL (the official manual's
  indexing and EXPLAIN chapters), `asyncio` (the "Developing with asyncio" page especially)
- **Book:** *Fluent Python* (Ramalho) — read chapters on data model, decorators, async. Skim the rest.
- Postgres specifically: **Use The Index, Luke** (free web book) for indexing intuition

### ML/AI intuition — the 8-hour budget (Month 1, M1.8)
- **3Blue1Brown** — neural networks + transformers/attention series. Watch. Do not do exercises.
- **Andrej Karpathy** — his LLM deep-dive talks for the "what is this thing actually" model. His build-from-scratch series is excellent and **out of scope for you** — bookmark it for after you're employed.
- **Jay Alammar** — *The Illustrated Transformer* and his embeddings posts; the best static explanations that exist
- **Stop condition:** when you can explain tokens, embeddings, similarity, temperature and hallucination to a non-technical friend. Then close it.

### LLM APIs & prompting (Month 2)
- **Primary and non-negotiable:** the Anthropic docs — prompt engineering guide, tool use, structured outputs, prompt caching, extended thinking — plus the **Anthropic Cookbook** on GitHub. This is the single best free resource for this month, and it's docs, not video.
- OpenAI docs (structured outputs, Responses/Chat APIs) and Google Gemini docs — read the differences, they matter when you build the provider abstraction
- **Anthropic engineering blog** — "Building effective agents", contextual retrieval, prompt-engineering posts. Read all of it; it's short and unusually honest.
- **"What We've Learned From A Year of Building with LLMs"** (Yan, Bien, Huyen, Husain, Shankar et al.) — the best single document about this job. Read it twice, once now and once after Month 5; it means different things.
- **Book:** *AI Engineering* — Chip Huyen. The closest thing to a textbook for this exact role. Worth buying.
- **Simon Willison's blog** — the best running commentary on what's actually changing, plus the clearest writing anywhere on prompt injection

### RAG & retrieval (Month 3)
- **Jason Liu** (`jxnl`) — writing on RAG that isn't hype; his "levels of RAG" framing and his insistence on measurement first
- **Hamel Husain** — evals, error analysis, "look at your data". If you read one author on evals, this one.
- **Eugene Yan** — patterns for LLM systems, RAG evaluation
- Docs: `pgvector` README (short, read all of it), Qdrant, LlamaIndex (read as a *catalogue of retrieval techniques*, even though you're using LangGraph), Cohere/Voyage rerank docs, Ragas
- **Greg Kamradt** — chunking strategies, the clearest visual treatment of the 5 levels
- **AI Engineer conference talks** (YouTube) — highest signal-per-minute video content in this field. Search for talks on RAG evals, retrieval, and agents; they're practitioner talks, not marketing.

### Agents, tools, MCP (Month 4)
- **MCP specification** + the Python SDK repo — this *is* the resource. It's readable. Read the Architecture, Tools, Resources and Transports pages properly.
- **Anthropic docs on MCP + tool use**; Claude Code's own MCP docs as a working example
- **LangGraph docs** — concepts section first, then the persistence/checkpointing and human-in-the-loop guides
- **Anthropic's "Building effective agents"** — the antidote to multi-agent hype; re-read before you reach for CrewAI
- **A2A protocol docs** — skim for the conceptual difference
- Security: **Simon Willison's prompt-injection series** and the **OWASP Top 10 for LLM Applications** (read the actual PDF, map each item to your code)

### System design, LLMOps, evals (Month 5)
- **Langfuse docs** — tracing, scores, prompt management, datasets. Read the concepts, not just the quickstart.
- **Arize Phoenix / Braintrust / LangSmith docs** — read one competitor's docs to understand what the category is trying to solve
- **Chip Huyen's blog** + *Designing Machine Learning Systems* (the AI-system-design framing transfers even though it predates LLMs)
- **Hamel Husain's eval writing** — LLM-as-judge, error analysis, "your AI product needs evals". This is the material that is worst covered on YouTube and most valuable in interviews.
- **Cloud provider docs** for the one cloud you pick — ECS/Fargate or Cloud Run. Do the official tutorial end to end, once.
- **LiteLLM docs** — model gateways/routing as a pattern
- **k6 docs** for load testing
- **Gergely Orosz / The Pragmatic Engineer** — for how engineering orgs actually work, useful for interviews and for reading JDs cynically

### Interview prep (Months 6–7)
- **NeetCode 150** in Python — 2/day, that's it, no more
- System design: practise the M5.1 framework out loud; record yourself; the recording is brutal and effective
- The ~60 questions in `09-JOB-STRATEGY.md` §4 — answer each from your own projects

## 4. Sources to actively avoid (and why)

| Avoid | Why |
|---|---|
| "Learn AI in 30 days" / "AI Engineer full course 12 hours" videos | Breadth theatre. You'll finish having built nothing. |
| Coursera Deep Learning Specialization *as your entry point* | Teaches RNNs/LSTMs/CNNs. Excellent course, wrong role, wrong decade for this path. |
| Anything leading with linear algebra or calculus | The video's F-tier, and correctly so. The #1 quit reason. |
| PyTorch/TensorFlow tutorials for this roadmap | You'll write `import anthropic`, not `import torch`. |
| Paid "AI engineer bootcamps" (₹50k–3L) | You're building the better version yourself. The one thing they sell that's real is accountability — replace it with a public weekly post. |
| Certificate-first paths (IBM/Coursera/Azure AI badges) | *"A GitHub repo with three deployed AI projects will get you the job."* Certificates teach basics; nobody hires on them. |
| Five tutorials on the same topic | You'll learn one concept five times and ship nothing. |
| Twitter/X threads as a primary source | Fine for discovery, terrible for learning. Every claim needs the doc behind it. |
| LLM-generated blog spam (most "top 10 RAG techniques" posts) | Confidently wrong, uncitable, everywhere. Prefer named practitioners. |

## 5. Keeping current without drowning

15 minutes a day, not more:
- **Simon Willison's blog** — the single best filter on what actually changed
- **Anthropic / OpenAI / Google changelogs** — read release notes, skip launch videos
- **Latent Space** (podcast/newsletter) — practitioner interviews
- **AI Engineer conference talks** — watch when a talk maps to a topic you're on
- `r/LocalLLaMA` — skim weekly for the open-model picture
- **One rule:** new tool news goes in a `someday.md` list, not into your week. You evaluate that list once a month, for 30 minutes. This rule is what keeps the roadmap from becoming a newsfeed.

## 6. The Hindi/Hinglish question

The reference video is Hinglish, and there's genuinely good Hinglish content for
fundamentals (Python, DSA, web dev). For the AI-specific material in Months 2–5, the
frontier content is English-only, and almost all of it is written, not spoken.

Practical approach: **use Hinglish video where it exists and helps** (Month 1 fundamentals),
**read English docs for everything else**, and store transcripts in both languages in the
platform so search works either way. Your notes should be in whatever language you think
in — the notes are for you, and forcing English there costs you comprehension for no gain.

One exception worth naming: your *public writing* (Month 6) should be in English, because
its audience is recruiters and engineers outside your region. That's a distribution
decision, not a learning one.
