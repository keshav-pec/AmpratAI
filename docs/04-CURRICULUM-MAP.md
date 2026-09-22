# 04 — How a Topic Becomes Content

`02-ROADMAP.md` says *what* to learn. This says *how each topic is built* inside AmpratAI.
Machine-readable version: `content/curriculum.yaml`.

---

## 1. Conventions

```
s3.4            module            Stage 3, module 4
s3.4.t2         topic             2nd topic in that module
s3.4.t2.c/.p/.j checkpoints       concepts / practice / mini-project
p-3.1           project           Stage 3, project 1
anim-xxx        animation
```
`priority`: `core` | `optional` · `tier`: S | A | B | C (from `03-TIER-LIST.md`)

---

## 2. The plain-language standard

**This is the most important section in this document.** Every word a learner reads inside
AmpratAI follows these rules. The specification docs in this repo are dense because they're
for whoever builds the platform. The content is not.

### Rules
1. **Short sentences.** If a sentence has three commas, split it.
2. **Define every term the first time it appears**, in one line, in the same sentence or the
   next. "Embedding — a list of numbers that captures what a piece of text means."
3. **Example before definition.** Show the thing, then name it. Not the other way round.
4. **One new idea per paragraph.** If a paragraph introduces two, split it.
5. **Concrete over abstract.** "A 500-page PDF is about 250,000 tokens — that won't fit" beats
   "documents frequently exceed context window constraints."
6. **Use the analogy bridge.** You know React, Express, Mongo and MySQL. Almost every AI
   concept has a mapping. Every topic includes one explicitly.
7. **No unexplained acronyms, ever.** First use is always expanded.
8. **Say why before how.** What problem does this solve? Then the mechanism.
9. **Name the failure.** What goes wrong if you get this wrong? That's what makes it stick.
10. **No filler.** No "in today's fast-paced world", no "it's important to note that".

### The same idea, written badly and written well

> ❌ **Bad (the way most courses write):**
> Chunking strategies must be carefully considered as they materially impact retrieval
> efficacy. Structure-aware approaches leverage document topology to preserve semantic
> coherence, whereas naive fixed-size partitioning may fragment contextually significant
> units, thereby degrading downstream recall metrics.

> ✅ **Good (the way AmpratAI writes):**
> Your document is 500 pages. The model can only read a few pages at a time. So you cut the
> document into pieces — each piece is called a **chunk**.
>
> The obvious way is to cut every 500 characters. That works until it doesn't. Here's what
> goes wrong: a sentence like *"The interest rate is 8.5% for loans under ₹10 lakh"* gets
> cut in half. Now one chunk says "The interest rate is" and the next says "8.5% for loans
> under ₹10 lakh". Neither one answers the question.
>
> A better way is to cut at places the document already has boundaries — headings, sections,
> paragraphs. You already do this in React: you split by component, not by line count,
> because components are where the meaning naturally ends.
>
> That's structure-aware chunking. Same idea, applied to documents.

The second version is longer and takes less time to understand. That's the trade AmpratAI
always makes.

### Enforced, not hoped for
Content goes through a check before it ships: average sentence length, undefined-term
detection against the glossary, "does every topic have an analogy?" and a readability score.
Anything that fails goes back. Amprat Assistant can rewrite a draft to this standard, and
that's how most content gets written — drafted from a transcript, rewritten to the standard,
then reviewed.

---

## 3. The checkpoint template

Every topic has three checkpoints.

### ◆ CONCEPTS
| Field | Required | Notes |
|---|---|---|
| `outcome` | ✓ | One plain sentence: "You'll be able to…" |
| `sources[]` | ✓ | **One or more** curated YouTube segments **and/or** a slide deck. See §4. |
| `notes` | ✓ | System-written, plain language, 400–900 words. Read alongside the video. |
| `analogy` | ✓ | The MERN/MySQL bridge. Non-negotiable. |
| `animations[]` | ✓ (≥1) | See `06-ANIMATION-CATALOG.md` |
| `docs[]` | ✓ | 1–3 primary links, for after the video |
| `glossary[]` | ✓ | Terms introduced, defined once, linked everywhere afterwards |
| `check` | ✓ | 5 quick questions. Self-assessment — nothing is locked behind it. |
| `printable` | ✓ | A one-page summary formatted for printing, because you write in a physical notebook |

### ◆ PRACTICE
Five modes. Most topics use two or three. The mix leans **concept-and-review** over
**write-it-from-scratch**, per your working style — with a deliberate exception (mode 1).

| Mode | What it is | Share |
|---|---|---|
| **1. Core primitive** | Hand-write one small thing, no AI. Only ~10 across the whole path (cosine similarity, a chunker, RRF, an agent loop, a retry wrapper, a token budgeter, a streaming parser, a semaphore pool, a tool-schema generator, a rate limiter). 20–60 lines each. | ~5% |
| **2. Read & predict** | Here's working code. What does it output? What breaks if the input is empty? Where's the bug? Reading code is the skill that matters when AI writes it. | ~25% |
| **3. Spec-then-verify** | You write the spec or the prompt. AI writes the implementation. You review it against the spec, find what it got wrong, and fix it. This is the actual modern workflow, practised deliberately. | ~25% |
| **4. Tool drill** | Use the real tool, with real verification. "Index 1,000 chunks in pgvector and query it" — AmpratAI checks the result shape. "Instrument this with Langfuse" — AmpratAI calls the Langfuse API and confirms the traces exist. | ~30% |
| **5. Decision drill** | No code. "Here's a corpus and a latency budget — pick a chunking strategy and defend it." "This costs ₹4 a request; get it to ₹1." Scored against a rubric by Amprat Assistant. Closest thing to a real interview. | ~15% |

Plus a **break-it** task per module: sabotage something, watch what happens, fix it.

### ◆ MINI-PROJECT
One per module minimum, one flagship per stage. Briefs in `07-PROJECT-BRIEFS.md`. Built in
your own IDE, with AI assistance, then verified by acceptance tests and a short conversation
with Amprat Assistant about your own code.

### ◆ READY TO MOVE ON?
A self-check list per stage. **Advisory, never a lock.** AmpratAI shows which items you've
demonstrated (a passing test, a reachable URL, a committed file) and which you've simply not
touched — then lets you go wherever you want.

---

## 4. Sources: multiple videos per topic

Earlier this plan said "one resource per concept". You asked for multiple videos per topic,
and that's the better call — different explanations land differently, and a single broken
link shouldn't take a topic down.

**How it works:** each topic has 1–3 curated YouTube segments plus an optional slide deck.
The player has a source switcher, and **every alternative is labelled with what it's better
at** — so it's a menu, not a pile.

```
┌───────────────────────────────────────────────────────────────┐
│  ▸ Main  (12 min · clearest overall)                          │
│    Visual  (8 min · more diagrams, less talking)              │
│    Deeper  (22 min · edge cases and internals)                │
│    Hindi   (15 min · same content, Hindi explanation)         │
│    Slides  (14 slides · written by AmpratAI, most current)    │
└───────────────────────────────────────────────────────────────┘
```

Rules that stop this becoming a link dump:
- Maximum of three videos plus one deck per topic
- Every source is a **segment**, with start and end timestamps — a topic can be nine minutes of a fifty-minute video
- Every source carries a one-line reason for existing. No reason, no slot.
- Progress tracks the topic, not the video. Watching one source completes it; the others stay available.
- Broken or removed videos are detected automatically, and the deck becomes the main source until it's replaced

### Where slide decks are used instead
Decks are fully under AmpratAI's control, which makes them the right choice wherever the
best material is written rather than filmed, or where YouTube coverage is stale.

Decks dominate Stages 4 and 5 — MCP, evals, observability, AI system design, security,
cost engineering. That's the newest material and the worst-covered on video. **That gap is
the main reason this platform is worth building**; if everything were well covered on
YouTube, a playlist would do.

Full decision rule in `08-RESOURCES.md` §2. Expected split: roughly 55% video-led, 45%
deck-led.

---

## 5. Worked example — a concept-heavy topic

**`s3.4.t3` — Structure-aware chunking** · tier S · core

**◆ CONCEPTS**
- **Outcome:** "You'll be able to look at a document and pick a chunking strategy from its
  shape — and predict what that choice does to your results."
- **Sources:** Main = a curated chunking-strategies segment · Visual = a shorter diagram-led
  one · **Deck** = `chunking-strategies` (14 slides), the current main source, because no
  single video covers structure-aware, parent-document and contextual retrieval together at
  production depth.
- **Analogy:** "You split React apps by component, not by line count, because components are
  where meaning naturally ends. A markdown heading is the same kind of boundary. Cutting a
  document every 512 characters is like cutting a codebase every 512 characters."
- **Animations:** `anim-chunk-strategies` (drag a chunk-size slider across a real document
  and watch the boundaries move and recall change) · `anim-parent-doc-retrieval`
- **Docs:** LangChain text splitters · Anthropic's contextual retrieval write-up · pgvector README
- **Glossary:** chunk · overlap · parent-document retrieval · sentence window · contextual retrieval
- **Printable:** one page — the six strategies, when each wins, and the metadata to attach

**◆ PRACTICE**
1. *Read & predict* — here's a recursive splitter. What happens to a 300-character document with 500-character chunks and 100 overlap? Where does it cut this specific paragraph?
2. *Spec-then-verify* — write the spec for a markdown-header-aware splitter that carries the heading path as metadata. AI implements it. Review it: does it handle a document with no headings? Nested headings? A heading at the very end?
3. *Tool drill* — chunk a real 200-page PDF at four sizes, embed into pgvector, run the 20-question eval set, submit the recall@5 table. Verified by result shape.
4. *Decision drill* — "900-page regulatory PDF, numbered sections, lots of tables, questions are usually about one specific clause. Pick a strategy and metadata set, and say what you're trading away."
5. *Break it* — set overlap to 0 and chunk size to 128. Find a question that now fails. Explain why.

**◆ MINI-PROJECT:** rolls into `p-3.1`.

## 6. Worked example — a tool-heavy topic

**`s4.6.t4` — Building an MCP server** · tier A · core

**◆ CONCEPTS**
- **Outcome:** "You'll be able to build, test and publish an MCP server, and explain exactly what it can and can't reach."
- **Sources:** **Deck** = `mcp-build` (18 slides, code-forward) as main — MCP video coverage is mostly from 2025 and already out of date. One curated overview video as the Visual alternative.
- **Analogy:** "An MCP server is an Express app whose routes describe themselves, and whose caller is a model instead of a browser. You've written the routes before. The new part is that the route description is a prompt — so it has to be written for a reader who will guess if you're vague."
- **Animations:** `anim-mcp-handshake` (the actual JSON-RPC frames, readable) · `anim-mcp-vs-bespoke` (24 tangled integrations collapsing to 10)
- **Docs:** the MCP spec — Architecture, Tools, Transports · the Python SDK README
- **Glossary:** host · client · server · tool · resource · prompt · stdio · streamable HTTP · confused deputy

**◆ PRACTICE**
1. *Core primitive* — hand-write a tool-schema generator: a Python function signature plus docstring in, valid JSON Schema out. One of the ten. It takes 30 minutes and makes every framework's magic legible afterwards.
2. *Read & predict* — here's a tool description without units. Here are ten user messages. Which calls go wrong, and how?
3. *Tool drill* — run a reference MCP server over stdio, list its tools, call one, submit the frames.
4. *Tool drill* — **publish your own server.** AmpratAI fetches your package and calls `tools/list` against it live. The strongest verification in the platform.
5. *Break it* — return a 60,000-token blob from a tool. Watch the context overflow. Add truncation with a "refine your query" hint.

**◆ MINI-PROJECT:** `p-4.2`.

---

## 7. Content inventory

| Stage | Modules | Topics | Animations | Practice items (est.) | Projects |
|---|---|---|---|---|---|
| 1 Python & backend | 8 | 38 | 6 | ~90 | 2 |
| 2 LLM APIs & prompting | 6 | 33 | 9 | ~85 | 2 |
| 3 RAG & evals | 8 | 44 | 12 | ~110 | 2 |
| 4 Tools, agents, MCP | 7 | 34 | 10 | ~85 | 2 |
| 5 System design & ops | 8 | 37 | 8 | ~80 | 3 |
| 6 Capstone & portfolio | 5 | 17 | 2 | ~20 | 1 + capstone |
| 7 Interviews & depth | 4 | 12 | 2 | ~15 | 1 |
| **Total** | **46** | **215** | **49** | **~485** | **13 + capstone** |

Generated from `content/curriculum.yaml`, which is the source of truth. If they disagree,
the YAML wins.

**Authoring approach:** content is written a stage ahead of where you are, not all at once.
215 topics written up front would be a six-month project and most of it would be stale
before you reached it.

## 8. Animation coverage policy

- **Always animate**: anything with data flowing through it (pipelines, request paths, agent loops), anything with a tradeoff dial (chunk size, temperature, top-k), anything spatial (embeddings, vector search, context windows).
- **Never animate**: syntax, CLI commands, config files, library APIs. A code block is better. An animated `uv add` would be decoration, and decoration is banned.
- **Reuse**: one parameterised "pipeline" animation covers about fifteen topics with different node sets. That's how 49 animations cover 215 topics.
