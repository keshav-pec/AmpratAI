# 05 — Learning Platform: Product & Technical Spec

**Working name:** `Forge` (a place where you build things, not a place where you watch things)
**Users:** exactly one, at first. You. Design for one user, brilliantly; generalise later.
**Status:** spec only. Build starts Month 2, Phase 1. Nothing is built in Month 1 — see §9.

---

## 1. The problem this platform actually solves

You don't have a *content* problem. Everything on this roadmap exists for free on YouTube
and in vendor docs. You have four different problems:

| Problem | How every existing platform fails | What Forge does |
|---|---|---|
| **Fragmentation** | 40 tabs, 6 courses, 3 note apps; concepts learned 5× in 5 places | One canonical path. One resource per concept. Everything at the point of use. |
| **Passive consumption** | Video completion = "progress". You feel productive and learn nothing | A topic cannot be completed without code that runs and a project that ships |
| **Invisible mechanism** | Talking heads and slides describe pipelines; you never *see* data move | An animation per concept showing the actual mechanism, interactively |
| **No forcing function** | Nothing stops you drifting for three weeks | Gates, streaks, spaced repetition, and a public weekly commitment |

**Design thesis:** the platform's job is to *convert hours into shipped artifacts*, not to
deliver content. Every feature is judged on that.

## 2. Product principles (use these to kill feature ideas)

1. **The IDE is where work happens.** Forge never replaces your local IDE for real projects. In-browser code is for drills only. Mini-projects always happen in your own editor, on your own machine, with your own git.
2. **One canonical resource per concept.** Alternates are hidden behind a "still confused?" link. Choice is the enemy here.
3. **Nothing completes without evidence.** Evidence = passing tests, a deployed URL, a committed file, or a written answer graded against a rubric.
4. **Animations must show mechanism, not decoration.** If an animation doesn't answer "what actually moves, and in what order?", it doesn't ship.
5. **Notes are yours and portable.** Plain markdown, synced to git. If Forge dies, your notes survive. Non-negotiable.
6. **The platform dogfoods the roadmap.** The AI tutor is a RAG system. The prompt arena is an eval harness. The grader is an LLM-as-judge. Building Forge *is* the curriculum.
7. **Boring where it doesn't matter.** No custom video player, no custom auth, no mobile app, no multi-tenancy (yet). Spend all novelty on the animation layer and the practice layer.

## 3. Information architecture

```
Track  (your 7-month roadmap; later: other tracks)
└── Month / Course            ×7      "Month 3 — RAG and how to know it works"
    ├── outcome, hours, gate
    └── Module                ×3–8    "M3.4 Chunking"
        └── Topic             ×3–8    "Structure-aware chunking"
            ├── ◆ CONCEPTS    checkpoint   video|slides + notes + animations
            ├── ◆ PRACTICE    checkpoint   drills, tool tasks, prompt arena, debug
            └── ◆ MINI-PROJECT checkpoint  brief + animated scenario + local build
```

Plus, at Month level: **Gate** (the pass/fail checklist from `02-ROADMAP.md`) and a
**Month Capstone** where the month's topics integrate.

Cross-cutting objects: `Note`, `Flashcard`, `Artifact` (shipped links), `DailyLog`,
`WeeklyReview`, `Glossary`, `Trace` (real traces from your own projects, reused as teaching
material — see §6.4).

### Navigation model
- **Path view** (default): vertical timeline of months → modules → topics, with gate locks and progress rings.
- **Today view**: what you're doing right now — current checkpoint, timer, due flashcards, the one DSA pair, the weekly post status.
- **Map view**: a dependency graph of all ~224 topics; shows what unlocks what. Genuinely useful for seeing *why* Month 1 exists.
- **Search**: across notes, transcripts, glossary, code. Semantic + keyword (this is your hybrid-search project, dogfooded).

## 4. `CONCEPTS` checkpoint — the three-pane learning surface

This is the layout you described, specified concretely.

### 4.1 Layout (desktop ≥ 1280px)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Month 3 › M3.4 Chunking › Structure-aware chunking      ◷ 24:10  🔥 18  [S]   │
├───────────────────┬────────────────────────────────┬───────────────────────────┤
│ LEFT RAIL  (22%)  │  STAGE  (48%)                  │  ANIMATION LAB  (30%)     │
│                   │                                │                           │
│ ▸ Topic outline   │  ┌──────────────────────────┐  │  ┌─────────────────────┐  │
│   (jumps video)   │  │  YouTube embed  OR       │  │  │                     │  │
│ ─────────────     │  │  slide deck (MDX)        │  │  │   canvas / SVG      │  │
│ ▸ Curated notes   │  │                          │  │  │                     │  │
│   (the "textbook" │  │  chapters · 1.25× ·      │  │  └─────────────────────┘  │
│   version, always │  │  A–B loop · captions     │  │  ◀ ▮▮ ▶  step 3 of 7     │
│   visible while   │  └──────────────────────────┘  │  ── knobs ──              │
│   the video plays)│  ┌──────────────────────────┐  │  chunk size  [====|--]    │
│ ─────────────     │  │ TABS                     │  │  overlap     [==|----]    │
│ ▸ Prereqs         │  │ My Notes | Curated |     │  │  ── caption ──            │
│ ▸ Glossary terms  │  │ Transcript | Diagram |   │  │  "Headers keep the        │
│ ▸ Primary docs    │  │ Ask Forge (AI) | Quiz    │  │   section title attached  │
│   (read after)    │  │                          │  │   to every chunk, so the  │
│                   │  │ timestamp-anchored notes │  │   retriever still knows   │
│                   │  │ + code blocks + images   │  │   where it came from."    │
│                   │  └──────────────────────────┘  │  [open fullscreen]        │
├───────────────────┴────────────────────────────────┴───────────────────────────┤
│ ← prev    [ mark concepts complete → unlocks Practice ]    next →   + flashcard│
└────────────────────────────────────────────────────────────────────────────────┘
```

**Why notes appear in two places** (you asked for both, and they serve different jobs):
- **Left rail = curated notes.** The canonical written explanation of this topic — read while the video plays, scannable, permanent. Authored in MDX by you (or drafted by the AI tutor from the transcript, then edited by you — *the act of editing is the learning*).
- **Below the video = your notes + transcript + AI + quiz.** Active workspace. Tabbed because you only need one at a time.

### 4.2 Player behaviour
- **YouTube** via the IFrame API with `start`/`end` so a "topic" can be a 9-minute slice of a 50-minute video. Curation at the segment level is what makes the path feel authored rather than aggregated.
- **Slides** when YouTube isn't the best source (see `08-RESOURCES.md` for the decision rule). A slide deck is an MDX file: markdown + inline SVG + embedded live React components + an optional narration track. Slides are **not** a downgrade — for MCP, prompt engineering, evals and system design they're better than any existing video.
- Chapters generated from the topic outline; clicking an outline item seeks.
- **A–B loop** for re-watching a 40-second explanation until it lands.
- Transcript with search + click-to-seek; Hindi↔English (the reference video is Hinglish — store both, search both).
- Speed memory per source; resume position per topic.

### 4.3 Notes system
- Markdown + code blocks, stored as files in `content/notes/<topic-id>.md`, **git-synced**. Postgres holds only metadata and anchors.
- `Ctrl/Cmd+N` → creates a note anchored to the current video timestamp (or slide number). Clicking the anchor later seeks back.
- "Capture frame" → screenshots the current video frame or animation state into the note.
- Every note can be promoted to a **flashcard** with one key; the tutor can draft the card's front/back from the note.
- Weekly export: all notes → one markdown digest → the seed of your public post.

### 4.4 Ask Forge (the AI tutor) — and why it's on the critical path
A chat pane scoped to *your* context: this topic's transcript + curated notes + your own
notes + the primary docs + your code from related projects. Modes:
- **Explain** — "re-explain this with a MERN analogy" (it knows your background)
- **Socratic** — it asks *you* questions and grades your answers, instead of answering
- **Gap check** — generates 5 questions from this topic; scores you; writes the weak ones back into your flashcard deck
- **Analogy bridge** — "this is like Express middleware, except…"

This is not a bonus feature. **It is your Month 3 RAG mini-project and your Month 5 eval
project, dogfooded** — a hybrid-retrieval system over a messy real corpus (transcripts,
docs, notes) with citations and an eval set. Build it when you reach Month 3, not before.

### 4.5 Completion criteria for a CONCEPTS checkpoint
Not "video watched". All of:
- ≥ 80% of the segment actually played (no scrub-skipping)
- ≥ 1 note written (enforced gently — the button is disabled with a tooltip)
- The auto-generated 5-question check passed at ≥ 80%
- The primary-doc link marked as read

## 5. `PRACTICE` checkpoint — real tools, real code

Four practice modes. Each topic uses whichever fit; most use two.

### 5.1 Code Lab (in-browser drills)
- Monaco editor, Python, split view with output.
- **Runtime tiering:** pure-Python/stdlib drills → **Pyodide** in a web worker (instant, free, offline). Anything needing real packages, network or a DB → **remote sandbox** (Docker container per run via a job queue; or E2B/Modal if you'd rather not run infra).
- Graded by hidden `pytest` cases. Visible tests teach; hidden tests verify.
- Progressive hints (3 levels) with a cost: revealing a hint marks the drill as "assisted" in your stats. Solutions unlock only after a genuine attempt.
- Example drills: implement cosine similarity; write an async fetcher with a semaphore; write a retry decorator with jitter; implement RRF; implement recursive chunking; write a pydantic model with a custom validator; implement a token-budget packer; write a tool-schema generator from a function signature.

### 5.2 Tool Drill (guided real-tool tasks, verified)
The thing no course does: make you use the actual tool and then *check that you did*.

| Drill | Verification |
|---|---|
| "Spin up pgvector in Docker, index 1,000 chunks, run a query" | Paste the output; Forge checks shape + a result fingerprint |
| "Instrument this endpoint with Langfuse, make 5 traced calls" | Forge calls the Langfuse API with your read key and confirms ≥5 traces exist |
| "Create a Qdrant collection with a payload filter" | Qdrant API check via your endpoint + key |
| "Publish your MCP server; install it in Claude Code" | Forge fetches the package from PyPI/npm and runs its tool list |
| "Deploy this container; return a public URL" | Forge pings the URL and asserts the health payload |
| "Open a PR that fails your own eval gate" | GitHub API: check the run conclusion is `failure` on that PR |

Verification is what turns a task into a checkpoint. Keys are stored server-side,
encrypted, never in the browser.

### 5.3 Prompt Arena (the feature that would make Forge genuinely novel)
For every prompting topic: you write a system prompt; Forge runs it against **N hidden
test cases**, scores it with assertions + an LLM judge, and shows you a leaderboard of your
own attempts with **cost and latency alongside quality**.

```
Attempt   Quality  Faithful  Format-valid  Avg tokens   ₹/call   p95
v1  0.54     0.61      72%           1,240        0.42     2.1s
v2  0.71     0.80      100%          1,480        0.51     2.4s
v3  0.88     0.91      100%            920        0.31     1.7s   ← better AND cheaper
```

This teaches the single hardest thing about production prompting — that quality, cost and
latency are one joint optimisation — and it teaches it in the only way that works:
by making you feel the tradeoff. It's also a ready-made Month 5 eval project.

### 5.4 Debug Challenge (break-then-fix, pre-broken)
A small repo with a deliberately planted bug; you find and fix it; hidden tests confirm.
Planted-bug library, all drawn from real-world mistakes:
unnormalised embeddings · zero chunk overlap splitting sentences mid-fact · a tool schema
whose description lies about units · missing `await` so the whole endpoint blocks ·
retry-without-jitter causing a thundering herd · `tenant_id` filter missing from the
retrieval query · history never compacted → context overflow at turn 12 · judge prompt
that rewards verbosity · `max_tokens` too low so JSON truncates mid-object · cache key
missing the prompt version so v2 serves v1's answers.

**These ten bugs are more educational than ten tutorials.** They are also the actual
content of senior interviews.

### 5.5 Practice completion criteria
- All required drills pass hidden tests
- Tool drills verified via API
- Prompt arena: beat the stated quality threshold **and** stay under the cost ceiling
- Assisted-vs-unassisted ratio recorded (not punished, but visible)

## 6. `MINI-PROJECT` checkpoint — real problems, animated, built locally

### 6.1 The brief (a work ticket, not a tutorial)
Each mini-project is presented exactly as a real task would be:

```
CONTEXT      Who has the problem, in one paragraph of real-world setting
PROBLEM      What's broken/needed, stated as the stakeholder would state it
CONSTRAINTS  Latency budget · cost ceiling · data volume · privacy rules
NON-GOALS    Explicitly what not to build (kills scope creep)
ACCEPTANCE   Checkable criteria, tests you must pass
RUBRIC       How it's graded (correctness, reliability, cost, code quality, UX, docs)
STRETCH      Optional extensions
TIME BOX     Expected hours; a hard "stop and ship" line
```

Full set of briefs: `07-PROJECT-BRIEFS.md`. Rule: **every brief must be a problem a real
person would pay to have solved.** No "build a todo app with AI".

### 6.2 The animated scenario (your "real life applications in animation format")
Before you write code, a **60–90 second animation** shows the problem in the world:

1. **The pain** — a person hits the problem (support agent drowning in tickets; a student searching 400 pages of regulations; a recruiter with 900 resumes)
2. **The ask** — what they actually need to happen
3. **The system** — your architecture appearing piece by piece, with data flowing through it, labelled with the concepts you just learned
4. **The payoff** — the same scene, solved, with the numbers (time saved, ₹ saved, accuracy)

Same `AnimationSpec` engine as the concept animations (§7), just a longer scene list with
optional narration. This is what makes a mini-project feel like *work with a purpose*
instead of an exercise — and it is the part of your idea I'd protect hardest, because it's
what no existing platform has.

### 6.3 Local build flow (the platform gets out of the way)
```bash
npx forge start mp-3.1          # scaffolds the starter repo locally
#   → README with the brief, tests/, evals/, docker-compose.yml, .env.example, TODOs
cd mp-3.1 && forge verify       # runs acceptance tests + eval thresholds locally
forge submit                    # pushes results + repo URL + demo URL to Forge
```
- `forge` CLI is a thin Python/Node tool with a signed device token. It never uploads your code — only test results, metrics and the URLs.
- Starter repos are GitHub template repos. Real git, real branches, real PRs, your own IDE.

### 6.4 Grading (four layers)
1. **Acceptance tests** — deterministic, must pass
2. **Eval thresholds** — where quality is the point (recall@5 ≥ 0.8, faithfulness ≥ 0.85)
3. **AI code review against the rubric** — structured feedback, not a score theatre; cites specific lines
4. **Self-review + reflection** — 200 words: what broke, what you'd do differently, what you still don't understand. *The reflection is mandatory and is the highest-retention part of the whole system.*

Plus a hard requirement: **a reachable deployed URL.** Forge pings it. Undeployed = incomplete.

### 6.5 Trace-to-teaching loop (the compounding feature)
Once your projects emit Langfuse traces, Forge can pull a **real trace from your own
system** and render it as an animation: your actual request flowing through your actual
architecture, with your real latencies and costs on each hop. You debug by *watching your
own system move*. No other platform can do this because no other platform has your traces.
Build in Phase 5; it's the thing that turns Forge from "an LMS" into something worth
showing people.

## 7. The animation system

The riskiest part of your idea — hand-animating ~224 topics would take a year. So it needs
to be a **system**, not a collection.

### 7.1 Four production tiers (author in the cheapest tier that works)

| Tier | What | Cost to author | Use for |
|---|---|---|---|
| **T1 Diagram-morph** | Declarative JSON scenes → animated SVG (Framer Motion / GSAP). Nodes, edges, highlights, captions, step-through | ~30–60 min | ~60% of topics. Pipelines, request flows, architectures |
| **T2 Explorable** | Custom React component with knobs; you change a parameter and watch the outcome change | ~3–6 h | ~25%. Anything with a tradeoff dial |
| **T3 Narrated film** | Motion Canvas / Manim rendered to MP4 | ~1 day | ~5%. Embeddings space, attention, vector search intuition |
| **T4 Live data** | Animation driven by a real trace or real dataset from your own projects | ~2–4 h, reusable | ~10%. Debugging, observability, system design |

### 7.2 `AnimationSpec` — one DSL so T1 is fast to author
```jsonc
{
  "id": "rag-pipeline-overview",
  "topicId": "m3.1-anatomy",
  "tier": "T1",
  "nodes": [
    { "id": "docs",  "label": "500-page PDF",   "shape": "doc",   "at": [40, 120] },
    { "id": "chunk", "label": "Chunker",        "shape": "proc",  "at": [180, 120] },
    { "id": "embed", "label": "Embedding model","shape": "proc",  "at": [320, 120] },
    { "id": "store", "label": "pgvector",       "shape": "db",    "at": [460, 120] },
    { "id": "llm",   "label": "Claude",         "shape": "model", "at": [460, 260] }
  ],
  "edges": [
    { "from": "docs", "to": "chunk", "payload": "text" },
    { "from": "chunk", "to": "embed", "payload": "chunk[]" },
    { "from": "embed", "to": "store", "payload": "vector[1536]" }
  ],
  "scenes": [
    { "id": "s1", "caption": "A 500-page document can't fit in a prompt.",
      "focus": ["docs"], "annotate": [{ "on": "docs", "text": "~250k tokens" }] },
    { "id": "s2", "caption": "So we split it into chunks — overlapping, so facts aren't cut in half.",
      "animate": [{ "edge": "docs->chunk", "flow": 1.2 }], "focus": ["chunk"] },
    { "id": "s3", "caption": "Each chunk becomes a vector: meaning as coordinates.",
      "animate": [{ "edge": "chunk->embed", "flow": 1.0 }],
      "sideView": "vector-space-2d" }
  ],
  "knobs": [
    { "id": "chunkSize", "label": "Chunk size", "min": 128, "max": 2048, "default": 512,
      "affects": "chunkCount" }
  ]
}
```
Authoring a T1 animation becomes writing ~40 lines of JSON. That's what makes 180 topics
feasible.

### 7.3 Non-negotiable animation rules
1. **Mechanism only.** Every animation answers "what moves, in what order, and what changes it?" No decorative motion.
2. **Always steppable.** Arrow keys step scenes. Learning happens at your pace, not the animation's.
3. **One caption per scene, one idea per caption.** If a caption needs two sentences, it's two scenes.
4. **Real numbers on screen.** "~250k tokens", "1536 dims", "₹0.31/call" — not "many tokens".
5. **Works in light and dark, and at phone width.**
6. **Reduced-motion fallback** = a static labelled diagram with the captions as a list. Accessibility, and also a better screenshot for your blog posts.
7. **Reuse over novelty.** A new animation must justify why an existing one can't be parameterised.

Concrete per-concept animation catalogue: **`06-ANIMATION-CATALOG.md`** (~45 specified).

## 8. Anti-tutorial-hell mechanics (the forcing functions)

These are features, not vibes. They're what make Forge beat Coursera/Udemy/YouTube for
*your* purpose.

1. **Gates.** Month N+1 is locked until Month N's gate passes. Override exists but is logged and shown on your dashboard as "gates skipped: 1". Visible shame, honestly earned.
2. **One resource per concept.** Alternates hidden behind "still confused?", which logs how often you need it (signal that your curated note needs improving).
3. **Evidence-based completion.** No "mark as done" without tests/URL/artifact.
4. **Spaced repetition (FSRS).** Flashcards from your own notes. 10 minutes daily. Month 1's Python decorators resurface in Month 4 when you're writing tool wrappers.
5. **Ship counter, front and centre.** The dashboard's biggest number is **projects deployed**, not hours watched. Hours watched is deliberately in small grey text.
6. **Weekly public commitment.** Friday: Forge drafts your week's post from your notes and shipped diffs; you edit and publish. Unpublished weeks show as a broken streak.
7. **Break-it drills.** Every module has a required "break it" task. Building teaches the happy path; breaking teaches the system.
8. **Time-boxing with a stop signal.** Each checkpoint has an expected duration. At 2× expected, Forge interrupts: "you're 2× over on this topic — ship what you have, note the gap, move on." Perfectionism is the other failure mode, and nothing on the internet protects against it.
9. **Cost meter everywhere.** Every practice run shows ₹ spent. You build the cost instinct that interviews test, just by using the platform.
10. **Monthly retro, auto-drafted.** Hours vs plan, gates, drills assisted vs solo, weakest module by quiz scores, and "things I was wrong about".

## 9. Build phases — and the rule that stops this becoming a procrastination project

> **THE RULE:** Platform work is capped at **15% of weekly hours (≈4.5 h/week)**, starts in
> **Month 2, not Month 1**, and **every phase must be a required roadmap mini-project or a
> direct extension of one.** If a phase isn't on the roadmap, it waits until Month 7.

| Phase | When | Build | Doubles as |
|---|---|---|---|
| **0** | Month 1, one weekend, ≤6 h | `curriculum.yaml` + a markdown checklist in this repo + Obsidian for notes. **No app.** Start learning immediately. | Nothing. It's a text file. That's the point. |
| **1** | Month 2, wk 8 | Next.js shell; content from MDX/YAML; three-pane concept page; YouTube player; notes to localStorage; deployed to Vercel | Uses skills you already have — cheap |
| **2** | Month 3, wk 12 | Postgres progress + timestamp-anchored notes + FSRS flashcards; animation library v1 (8 T1 animations + 2 T2) | Postgres/SQLAlchemy practice from M1.6 |
| **3** | Month 4, wk 16 | FastAPI service: **Ask Forge tutor** (hybrid RAG over transcripts + docs + your notes, with citations) + auto-quiz generation | **This *is* MP-3.1's sibling** — the RAG project with a real corpus and real users (you) |
| **4** | Month 5, wk 20 | Code Lab sandbox runner + `forge` CLI + eval-based grading + **Prompt Arena** + Langfuse tracing on Forge itself | **This *is* MP-5.x** — queues, workers, sandboxing, evals, observability |
| **5** | Month 6–7 | Trace-to-teaching animations, polish, make it public, write the build-in-public series | Flagship portfolio project #3 + possible product |

**Honest warning.** Phase 3 and 4 are each a genuine 2–3 week project if done well. They fit
*only* because they replace roadmap projects rather than adding to them. The moment you
find yourself picking a component library at 1am in Month 2, you have lost — close it and
go write a chunking experiment.

The Phase 0 text file is not a placeholder to be embarrassed about. **It is sufficient for
Month 1.** Ship the app when the app is the lesson.

## 10. Technical architecture

### 10.1 Stack (chosen to be 60% skills you have, 40% skills you need)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + TypeScript** | Your strongest ground. Ship fast. |
| Styling | Tailwind + shadcn/ui | No design-system bikeshedding |
| Animation | **Framer Motion** (T1/T2) + **Motion Canvas** (T3 renders) | SVG-native, declarative, plays well with the `AnimationSpec` DSL |
| Editor | Monaco | Familiar keybindings |
| Content | **MDX + YAML in `content/`, validated by Zod at build** | Content-as-code: git-versioned, PR-able, diffable, no CMS. Correct choice for a solo learner. |
| Charts | Recharts | Progress, eval scores, cost |
| Client state | Zustand + TanStack Query | Boring, correct |
| **AI backend** | **FastAPI (Python)** | **Deliberate:** every AI feature is written in the language you're learning. The platform is Python practice. |
| Orchestration | LangGraph (tutor agent), Langfuse (tracing) | Same tools as the roadmap |
| DB | **Postgres + pgvector** (Neon or Supabase) | One DB for progress, notes metadata, and embeddings |
| Cache/queue | Redis + Arq | Ingestion, eval runs, sandbox jobs |
| Sandbox | Pyodide (browser) + Docker runner (or E2B/Modal) | Tiered by need |
| Auth | GitHub OAuth, single user | You have the repos anyway; zero friction |
| Hosting | Vercel (web) + Fly.io/Railway (FastAPI + worker) + Neon (DB) → AWS in Month 5 | Migrating it to ECS/Cloud Run *is* a Month 5 exercise |
| Notes durability | Markdown files committed to a `forge-notes` repo | Your notes outlive the platform |

**Deliberate non-choices:** no custom video player (YouTube IFrame API), no CMS, no
microservices, no Kubernetes (until it's the lesson), no multi-tenancy, no mobile app
(responsive web only), no payments.

### 10.2 Data model (Postgres, abbreviated)

```sql
track(id, slug, title, persona_notes)
month(id, track_id, idx, title, outcome, hours_est, gate_json)
module(id, month_id, idx, code, title, priority)          -- priority: core|stretch
topic(id, module_id, idx, title, tier, est_minutes, prereq_ids[], tags[])

concept_unit(id, topic_id, primary_kind, youtube_id, start_s, end_s,
             slide_deck_id, curated_notes_path, primary_doc_urls[], analogy_md)
slide_deck(id, title, slides_path)                         -- MDX
animation(id, topic_id, tier, spec_json, asset_url, alt_static_url, caption_list[])

practice_item(id, topic_id, kind, prompt_md, starter_code, visible_tests,
              hidden_tests, hints[], solution, runtime, verify_json, cost_ceiling)
mini_project(id, month_id, code, brief_md, scenario_animation_id, template_repo,
             acceptance_json, rubric_json, eval_thresholds_json, time_box_h)

progress(id, checkpoint_type, checkpoint_id, status, seconds_spent, attempts,
         assisted, score, completed_at)                    -- status: locked|open|done
note(id, topic_id, anchor_kind, anchor_value, body_path, tags[], created_at)
flashcard(id, note_id, topic_id, front, back, fsrs_state_json, due_at)
artifact(id, checkpoint_id, kind, repo_url, demo_url, metrics_json, verified_at)
daily_log(day, hours_json, dsa_count, spend_inr, note)
weekly_review(week, shipped[], published_url, wrong_about, next_week_focus)
trace_sample(id, topic_id, source, trace_json)             -- real traces as teaching material
```

### 10.3 Content authoring flow
```
content/
  curriculum.yaml              # months → modules → topics → checkpoint refs
  concepts/m3.4-structure-aware.mdx
  slides/mcp-architecture/{01..14}.mdx
  animations/rag-pipeline-overview.json
  practice/m3.4/{drill-01.py, tests_visible.py, tests_hidden.py, meta.yaml}
  projects/mp-3.1/{brief.md, acceptance.yaml, rubric.yaml}
  notes/                       # your notes; git-synced, portable
```
Zod schemas validate every file at build time; CI fails on a broken reference. Adding a
topic is a PR. This is the right amount of process for one person.

## 11. What makes this better than what exists

Honest comparison, because "best of all the stuff on the internet" needs a definition.

| | YouTube | Coursera/Udemy | Scrimba/DataCamp | Roadmap.sh | **Forge** |
|---|---|---|---|---|---|
| Curated single path | ✗ | ~ | ~ | ✓ | ✓ |
| Segment-level curation | ✗ | ✗ | ✗ | ✗ | ✓ |
| Concept animations w/ mechanism | ✗ | ✗ | ~ | ✗ | ✓ |
| Interactive parameter exploration | ✗ | ✗ | ~ | ✗ | ✓ |
| Real-tool tasks, API-verified | ✗ | ✗ | ✗ | ✗ | ✓ |
| Prompt arena w/ cost+quality tradeoff | ✗ | ✗ | ✗ | ✗ | ✓ |
| Pre-broken debug challenges | ✗ | ✗ | ~ | ✗ | ✓ |
| Projects built in *your* IDE, auto-verified | ✗ | ✗ | ✗ | ✗ | ✓ |
| Deployment required to complete | ✗ | ✗ | ✗ | ✗ | ✓ |
| Tutor grounded in *your* notes + code | ✗ | ✗ | ✗ | ✗ | ✓ |
| Animations from your own production traces | ✗ | ✗ | ✗ | ✗ | ✓ |
| Gates you can't buy your way past | ✗ | ✗ | ✗ | ✗ | ✓ |

The four rows nobody else has — **API-verified tool drills**, the **prompt arena**,
**deployment-gated completion**, and **trace-driven animations** — are the ones worth
building. If you only ever build those four plus the three-pane concept page, Forge is
already better than anything you can buy, for you.

## 12. Risks, stated plainly

| Risk | Severity | Mitigation |
|---|---|---|
| Platform becomes the project; AI skills don't happen | **Critical** | §9 rule: 15% cap, Phase 0 is a text file, every phase is a roadmap project |
| Animation authoring is slower than estimated | High | T1 JSON DSL; only 8 animations by Month 3; a static diagram is an acceptable ship |
| YouTube videos die / get privated | Medium | Store transcript + your curated notes locally; the note is the durable asset, the video is the convenience |
| Sandbox runner is a real infra project | Medium | Pyodide covers most drills; remote sandbox deferred to Phase 4; rent E2B/Modal rather than build |
| Content authoring burnout (~224 topics) | High | Author only 2 weeks ahead of yourself. Never batch-author. The tutor drafts, you edit. |
| API costs from practice runs | Low | Cheap models for drills, hard per-checkpoint cost ceilings, mock responses in tests |
| Over-designing the data model | Medium | The §10.2 schema is already more than Phase 1–2 need. Start with 6 tables. |

## 13. Definition of done for the platform (v1, end of Month 6)

- All 7 months, ~224 topics, present with concepts + practice + project checkpoints
- ≥ 40 animations (≥ 8 interactive T2)
- ≥ 120 code drills, ≥ 30 API-verified tool drills, ≥ 10 debug challenges
- Prompt arena live for 6 prompting topics
- `forge` CLI with `start` / `verify` / `submit`
- Ask Forge tutor with citations and an eval set scoring ≥ 0.85 faithfulness
- Gates enforced; FSRS flashcards running; weekly post drafting working
- Deployed, public, with a build-in-public write-up series

And the only metric that actually matters: **you finished the roadmap and you have the
offers.** If Forge is beautiful and you didn't, it failed. Judge it on that, harshly.
