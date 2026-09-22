# 08 — Where the Content Comes From

> **On links.** This names channels, authors, books, docs and specs — things that are stable
> and checkable. It deliberately doesn't list exact video URLs, because those rot. When
> AmpratAI builds a topic, the current best segments are found, verified as playing, and
> pinned with start and end times. That verification is what separates a curated path from a
> link graveyard, and it's re-run periodically.

---

## 1. The principle

**Video builds intuition. Docs are truth. Building is proof.**

For every topic, in order:
1. One video segment — or a slide deck where that's better
2. The primary doc, to get it *right*
3. A drill, to get it into your hands
4. A project, to find out what you actually didn't understand

Skipping step 2 is the most common failure. Videos run six to eighteen months behind on this
subject, and in AI tooling that's a generation.

## 2. How sources are chosen

```
Is there a good video segment that teaches this clearly?
├── YES → use it as the main source, and add 1–2 labelled alternatives
│         ("more visual", "goes deeper", "Hindi") where they genuinely differ
└── NO  → is the authoritative source a spec, doc or engineering blog?
          ├── YES → AmpratAI writes the slide deck from primary sources, cited
          └── NO  → deck plus an interactive animation, because if nobody has
                    explained it well, a model you can poke is the best teacher
```

**Up to three videos plus one deck per topic.** Each alternative carries a one-line reason
for existing; no reason, no slot. Progress tracks the topic, not the source — any one of
them completes it. Details in `04-CURRICULUM-MAP.md` §4.

Expected split: roughly **55% video-led, 45% deck-led.**

| Video-led | Deck-led |
|---|---|
| Python async, decorators, generators | Production prompt engineering |
| FastAPI | MCP (the spec is newer than good video coverage) |
| Postgres query plans, indexes | Evals, LLM-as-judge, judge calibration |
| Docker, containers, deployment | Observability and tracing in practice |
| Transformers and attention *intuition* | AI system design |
| Embeddings *intuition* | LLM security and the OWASP LLM Top 10 |
| Chunking basics, vector DB basics | Context engineering and token budgeting |
| LangGraph walkthroughs | Cost and latency engineering, model routing |
| Git, Linux, tooling | Multi-tenancy for AI apps |

The right-hand column is where the internet is weakest — and it's Stages 4 and 5, the ones
that get you *paid* rather than just hired. **That column is the reason this platform is
worth building.**

## 3. Sources by area

### Python — you have the basics, so this is narrow
Skip the "learn Python" content entirely. What's needed:
- **ArjanCodes** — Python design, typing, architecture. The closest thing to "senior Python" on video.
- **mCoding** — short and deep; corrects the misconceptions a JS developer arrives with
- **Corey Schafer** — if you ever need a fundamentals refresher on decorators or OOP specifically
- Docs to actually read: **FastAPI** (the tutorial is genuinely excellent — do all of it), **Pydantic v2**, `uv`, `asyncio` (the "Developing with asyncio" page), SQLAlchemy 2.0 async, Alembic
- **Book:** *Fluent Python* — the data model, decorators and async chapters. Skim the rest.

### Postgres — you know MySQL, so this is a conversion, not a course
- The Postgres manual's chapters on indexes and `EXPLAIN` — read these properly, the output format is different from MySQL's
- **Use The Index, Luke** (free web book) — the indexing intuition transfers both ways
- `pgvector` README — short, read all of it
- Skip every "SQL for beginners" resource. You'd be re-learning what you have.

### AI intuition — the 8-hour budget
- **3Blue1Brown** — the neural networks and transformers series. Watch. No exercises.
- **Andrej Karpathy** — his LLM deep-dive talks, for the "what is this thing" model. His build-from-scratch series is excellent and **out of scope** — bookmark it for after you're employed.
- **Jay Alammar** — *The Illustrated Transformer* and the embeddings posts. The best static explanations there are.
- Stop when you can explain tokens, embeddings, similarity, temperature and hallucination to a non-technical friend.

### LLM APIs and prompting
- **The Anthropic docs are the main source** — prompt engineering, tool use, structured outputs, prompt caching, extended thinking — plus the **Anthropic Cookbook**. This is the best free material for Stage 2, and it's written, not filmed.
- OpenAI and Gemini docs — read the differences, they matter when you build the provider abstraction
- **Anthropic's engineering blog** — "Building effective agents", contextual retrieval, prompting posts. Short and unusually honest.
- **"What We've Learned From A Year of Building with LLMs"** — the best single document about this job. Read it now, and again after Stage 5; it means different things.
- **Book:** *AI Engineering* by Chip Huyen — closest thing to a textbook for this exact role.
- **Simon Willison's blog** — the best running commentary on what actually changed, and the clearest writing anywhere on prompt injection.

### RAG — you have the basics, so start at the depth layer
- **Jason Liu (`jxnl`)** — RAG writing without hype; measurement before optimisation
- **Hamel Husain** — evals and error analysis. If you read one author on evaluation, this one.
- **Eugene Yan** — patterns for LLM systems
- **Greg Kamradt** — chunking strategies, the clearest visual treatment
- Docs: `pgvector`, Qdrant, LlamaIndex (read it as a *catalogue of retrieval techniques*, even though you'll build on LangGraph), rerank APIs, Ragas
- **AI Engineer conference talks** on YouTube — the highest signal-per-minute video in this field. Practitioner talks, not marketing.

### Agents, tools, MCP
- **The MCP specification** and the Python SDK repo — this *is* the resource, and it's readable. Architecture, Tools, Resources, Transports.
- **Anthropic's docs on tool use and MCP**; Claude Code's MCP docs as a working example
- **LangGraph docs** — concepts first, then persistence/checkpointing and human-in-the-loop
- **"Building effective agents"** — the antidote to multi-agent hype. Re-read it before reaching for a multi-agent framework.
- **A2A** docs — skim for the conceptual difference
- Security: **Simon Willison's prompt-injection series** and the **OWASP Top 10 for LLM Applications** (read the actual document and map each item onto your code)

### System design, operations, evals
- **Langfuse docs** — concepts, not just the quickstart
- One competitor's docs (Phoenix, Braintrust, LangSmith) to understand what the category is solving
- **Chip Huyen's blog** and *Designing Machine Learning Systems* — the system-design framing transfers
- **Hamel Husain on evals** — worst covered on video, most valuable in interviews
- The docs for **the one cloud you pick** — do the official tutorial end to end, once
- **LiteLLM** docs — model gateways and routing as a pattern
- **k6** docs for load testing

### Interviews
- Medium and hard problems only — you've done 300+, so this is maintenance, not building
- The AI-flavoured implementations in `09-JOB-STRATEGY.md` §4 — these are what AI-role interviews actually ask
- System design: practise the framework out loud and record yourself. Brutal, and effective.

## 4. What to avoid

| Avoid | Why |
|---|---|
| "Learn AI in 30 days" / 12-hour "full course" videos | Breadth theatre. You finish having built nothing. |
| Deep Learning Specialization *as an entry point* | Teaches RNNs, LSTMs, CNNs. Excellent course, wrong role. |
| Anything leading with linear algebra or calculus | The number-one reason people quit this path. |
| PyTorch/TensorFlow tutorials for this roadmap | You'll write `import anthropic`, not `import torch`. |
| Paid AI bootcamps | You have a better version. The one real thing they sell is accountability. |
| Certificate-first paths | *"A GitHub repo with three deployed AI projects will get you the job."* |
| Beginner Python or beginner SQL content | You're past both. |
| Five tutorials on the same topic | One concept learned five times, nothing shipped. |
| Twitter threads as a primary source | Fine for discovery, terrible for learning. |
| AI-generated "top 10 RAG techniques" blog spam | Confidently wrong and everywhere. Prefer named practitioners. |

## 5. Keeping current without drowning

Fifteen minutes a day, not more:
- **Simon Willison's blog** — the best single filter on what changed
- **Provider changelogs** — release notes, not launch videos
- **Latent Space** — practitioner interviews
- **AI Engineer conference talks** — watch one when it maps to a topic you're on
- `r/LocalLLaMA` — weekly skim for the open-model picture

**One rule:** news about a new tool goes on a list, not into your week. Review the list once
a month for half an hour. This is what keeps the path from turning into a newsfeed.

## 6. Language

Hinglish content is good for fundamentals and thin on the frontier material in Stages 2–5,
where almost everything is written and in English.

AmpratAI's approach: use Hindi/Hinglish video where it genuinely exists and helps, include
it as a labelled alternative source, store transcripts in both languages so search works
either way, and write all the notes and decks in plain English — short sentences, every term
defined, which is easier to read than complicated English *or* translated Hindi.

If you ever publish your work, English is the better choice — its audience is recruiters and
engineers everywhere. That's a distribution decision, not a learning one, and it's optional.
