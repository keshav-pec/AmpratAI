# 04 — Curriculum Map: How a Topic Becomes Content

`02-ROADMAP.md` says *what* to learn. This says *how each topic is instantiated* in the
platform, so content production is mechanical rather than creative-on-demand.
Machine-readable version: `content/curriculum.yaml`.

---

## 1. Conventions

```
ID scheme     m3.4          module            Month 3, module 4
              m3.4.t2       topic             2nd topic in that module
              m3.4.t2.c     concepts checkpoint
              m3.4.t2.p     practice checkpoint
              m3.4.t2.j     mini-project checkpoint (job)
              mp-3.1        mini-project      Month 3, project 1
              anim-xxx      animation
```
`priority`: `core` | `stretch` · `tier`: `S` | `A` | `B` | `C` (from `03-TIER-LIST.md`)

## 2. The checkpoint template (every topic, no exceptions)

### ◆ CONCEPTS
| Field | Required | Notes |
|---|---|---|
| `outcome` | ✓ | One sentence: "I can explain/choose/predict X" |
| `primary` | ✓ | `youtube{id,start,end}` **or** `slides{deckId}` — never both |
| `curated_notes` | ✓ | MDX. 400–900 words. The textbook version, left rail |
| `analogy` | ✓ | The MERN/JS bridge. One paragraph. Non-negotiable — this is what makes the platform *yours* |
| `animations` | ✓ (≥1) | See `06-ANIMATION-CATALOG.md` |
| `primary_docs` | ✓ | 1–3 links. Marked read after the video. Rule 3 of the roadmap |
| `glossary` | ✓ | Terms introduced, defined once, linked everywhere after |
| `check` | ✓ | 5 auto-generated questions, 80% to pass |
| `alternates` | — | Hidden behind "still confused?" |

### ◆ PRACTICE
| Field | Required | Notes |
|---|---|---|
| `drills[]` | ✓ (≥2) | `code-lab` \| `tool-drill` \| `prompt-arena` \| `debug` |
| `runtime` | ✓ | `pyodide` \| `sandbox` \| `local+verify` |
| `tests` | ✓ | visible (teach) + hidden (verify) |
| `hints[]` | ✓ (3) | Revealing marks the drill "assisted" |
| `break_it` | ✓ | The required sabotage task |
| `cost_ceiling` | if LLM | ₹ cap per attempt |

### ◆ MINI-PROJECT
Not every topic — **one per module minimum, one flagship per month.** Small topics roll up
into the module project. Fields per `05-PLATFORM-SPEC.md` §6.1; briefs in
`07-PROJECT-BRIEFS.md`.

### 🚪 MONTH GATE
The checklist from `02-ROADMAP.md`, machine-checked where possible (URL ping, GitHub API,
test results), self-attested where not (with a timestamp and a note).

---

## 3. Worked example A — a concept-heavy topic

**`m3.4.t3` — Structure-aware chunking** · tier S · core · est 55 min

**◆ CONCEPTS** (`m3.4.t3.c`)
- `outcome`: "I can pick a chunking strategy from the *shape* of a document, and predict what it will do to recall."
- `primary`: **slides** — `deck:chunking-strategies` (14 slides). *Decision rationale: no single YouTube video covers structure-aware + parent-document + contextual retrieval at production depth; the good material is in Anthropic's contextual-retrieval post and practitioner blogs. See `08-RESOURCES.md` §3.*
- `curated_notes`: `content/concepts/m3.4.t3.mdx` — the six strategies, when each wins, the metadata you must carry on every chunk.
- `analogy`: "You already split React apps by component boundaries, not by line count, because boundaries carry meaning. A markdown `##` header is a component boundary. Splitting a doc every 512 characters is like splitting a codebase every 512 characters."
- `animations`: `anim-chunk-strategies` (T2 explorable — drag a chunk-size slider across a real 40-page doc and watch chunk boundaries move and recall@5 change), `anim-parent-doc-retrieval` (T1 — retrieve small, return big)
- `primary_docs`: LangChain text-splitter docs · Anthropic "Contextual Retrieval" · `pgvector` README
- `glossary`: chunk, overlap, parent-document retrieval, sentence window, contextual retrieval, propositional chunking
- `check`: 5 Qs incl. "A 900-page PDF of RBI circulars with numbered sections and tables — which strategy, and what metadata do you attach?"

**◆ PRACTICE** (`m3.4.t3.p`)
1. `code-lab` (pyodide): implement recursive character splitting with overlap; hidden tests assert no sentence is cut mid-word and overlap is exact.
2. `code-lab` (sandbox): implement markdown-header-aware splitting that carries the header path as metadata.
3. `tool-drill` (local+verify): chunk a real 200-page PDF at 4 sizes, embed into pgvector, run the 20-question eval set, submit the recall@5 table. *Verified by result shape + a metrics fingerprint.*
4. `break_it`: set overlap to 0 and chunk size to 128; find a question that now fails; explain why in 3 sentences.

**◆ MINI-PROJECT**: rolls up into `mp-3.1`.

## 4. Worked example B — a tool-heavy topic

**`m4.6.t4` — Building an MCP server** · tier A · core · est 3 h

**◆ CONCEPTS** (`m4.6.t4.c`)
- `outcome`: "I can build, test and publish an MCP server, and explain its security boundary."
- `primary`: **slides** — `deck:mcp-build` (18 slides, code-forward). *YouTube coverage of MCP is mostly 2025-era and already stale; the spec + SDK docs are the truth.*
- `analogy`: "An MCP server is an Express app whose routes are typed, self-describing, and discovered at runtime by a client that decides which to call. You've written the routes; the new part is that the *caller is a model*, so the route description is a prompt."
- `animations`: `anim-mcp-handshake` (T1 — host↔client↔server, initialize → tools/list → tools/call, with the JSON-RPC frames visible), `anim-mcp-vs-bespoke` (T1 — N×M bespoke integrations collapsing into N+M via the protocol)
- `primary_docs`: MCP spec (Architecture, Tools, Transports) · Python SDK README
- `glossary`: host, client, server, tool, resource, prompt, sampling, roots, stdio, streamable HTTP, confused deputy

**◆ PRACTICE** (`m4.6.t4.p`)
1. `code-lab`: write a tool schema from a Python function signature + docstring; hidden tests check the JSON Schema is valid and the description is non-empty and unit-explicit.
2. `tool-drill` (local+verify): run a reference MCP server over stdio, list tools, call one, paste the frames. *Verified by frame shape.*
3. `tool-drill` (local+verify): **publish your own server**; Forge fetches the package and calls `tools/list` against it. *Verified by live protocol call — this is the highest-quality verification in the platform.*
4. `break_it`: return a 60k-token blob from a tool; observe the agent's context overflow; implement truncation with a "truncated, call again with a filter" hint.

**◆ MINI-PROJECT**: `mp-4.2` — Your MCP Server.

---

## 5. Topic inventory (production budget)

| Month | Modules | Topics | Concept units | Animations | Drills (est.) | Projects |
|---|---|---|---|---|---|---|
| M1 Python & backend | 8 | 47 | 47 | 6 | ~94 | 2 |
| M2 LLM APIs & prompting | 6 | 33 | 33 | 9 | ~66 | 2 |
| M3 RAG & evals | 8 | 44 | 44 | 12 | ~88 | 2 |
| M4 Tools, agents, MCP | 7 | 34 | 34 | 10 | ~68 | 2 |
| M5 System design & LLMOps | 8 | 37 | 37 | 8 | ~60 | 3 |
| M6 Capstone & portfolio | 5 | 17 | 17 | 2 | ~14 | 1 + capstone |
| M7 Specialisation | 4 | 12 | 12 | 2 | ~10 | 1 |
| **Total** | **46** | **224** | **224** | **49** | **~400** | **13 + capstone** |

Counts are generated from `content/curriculum.yaml`, which is the source of truth — if they
disagree, the YAML wins and this table is stale.

**Authoring rule: never more than 2 weeks ahead of yourself.** 224 topics authored up front
is a six-month content job and a guaranteed roadmap failure. You author Month 3's content
during Month 2's slack hours — and the tutor drafts from transcripts, you edit. Editing a
draft is itself an excellent form of study; batch-authoring is not.

## 6. Animation coverage policy

Not every topic needs a bespoke animation. Coverage targets:
- **Always animate**: anything with data flow (pipelines, request paths, agent loops), anything with a tradeoff dial (chunk size, temperature, top-k, recall/latency), anything spatial (embeddings, vector search, context window).
- **Never animate**: syntax, CLI usage, config files, library APIs. A code block is better. Animating `uv add` would be a decorative animation, which rule 1 in `05-PLATFORM-SPEC.md` §7.3 forbids.
- **Reuse**: one parameterised "pipeline" animation covers ~15 topics with different node sets. That's how 49 animations cover 224 topics.

## 7. Content-source decision rule (summary — full version in `08-RESOURCES.md`)

```
Is there ONE video that teaches this at production depth in < 30 min?
├── YES → YouTube segment + curated notes
└── NO  → Is the authoritative source a doc/blog/spec?
          ├── YES → author SLIDES from primary sources (cite them)
          └── NO  → author slides + build a T2 explorable, because if nobody has
                    explained it well, an interactive model is the best teacher
```
Expect roughly **55% YouTube / 45% slides**. Slides dominate Months 4–5 (MCP, evals,
observability, AI system design, security) — the material is newer than good video
coverage. That is exactly the gap this platform fills.
