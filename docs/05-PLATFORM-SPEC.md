# 05 — AmpratAI: Product & Technical Spec

**Name:** AmpratAI · **AI tutor:** Amprat Assistant
**User:** one. You. Designed for one person, properly.
**Built by:** Claude. Not you.

---

## 1. Who builds this, and what you're responsible for

**Claude builds AmpratAI end to end** — the app, the content, the animations, the decks, the
practice items, the deployment. You don't write platform code, you don't author content, and
you don't maintain it.

**Your only job is to learn.** Open it, work through it, tell me what's confusing or missing,
and I fix it.

This removes what was the single biggest risk in the earlier version of this plan: spending
six months building a beautiful learning platform and learning no AI. That risk is gone.

## 2. What AmpratAI is for

You don't have a content problem — everything on this roadmap exists somewhere for free. You
have four different problems:

| Problem | How the internet fails at it | What AmpratAI does |
|---|---|---|
| **Scatter** | 40 tabs, 6 half-done courses, the same concept explained five times in five places | One path, in order, with 1–3 chosen sources per topic and a reason for each |
| **Passive watching** | A finished video feels like progress and isn't | Nothing counts as done without something that runs — a passing test, a live URL |
| **Invisible mechanism** | Talking heads describe pipelines; you never *see* the data move | An animation per concept showing the actual mechanism, that you can step through and change |
| **Losing the thread** | Come back after exams and you've forgotten where you were and why | Server-side progress on every device, plus a "where you left off" recap that takes two minutes |

**Design thesis:** AmpratAI's job is to turn hours into understanding and shipped systems.
Every feature is judged on that and nothing else.

## 3. Principles

1. **Plain language, always.** `04-CURRICULUM-MAP.md` §2 is the standard, and it's enforced by a check before anything ships.
2. **Concepts first. Code with AI.** Understanding what a system does and why matters more than typing it. About ten primitives stay hand-written because interviews probe them.
3. **Clean, uncrowded screens.** Designed for a 13.6" laptop. Two panes, not three. Anything optional is hidden until you ask for it.
4. **No deadlines, no time boxes, no quotas.** Nothing in AmpratAI tells you to hurry, and nothing expires. Exams are expected.
5. **Animations show mechanism, not decoration.** If it doesn't answer "what moves, in what order, and what changes it?", it doesn't ship.
6. **Your IDE stays your IDE.** In-browser code is for small drills. Real projects happen on your machine with your own git.
7. **Nothing is mandatory except the sequence.** Public posting, streaks, daily targets — all optional or absent.

## 4. The Concepts screen

Two panes. The left rail is gone — on a 13.6" screen three columns is too crowded, and its
content moved into tabs and a collapsible drawer.

### 4.1 Layout (desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Stage 3 › Chunking › Structure-aware chunking            ●●●○○   [focus ⛶] │
├──────────────────────────────────────────┬──────────────────────────────────┤
│  STAGE   (≈62%)                          │  ANIMATION   (≈38%)   [⛶] [→|]  │
│  ┌────────────────────────────────────┐  │  ┌────────────────────────────┐  │
│  │  ▸ Main   Visual   Deeper   Slides │  │  │                            │  │
│  │ ┌────────────────────────────────┐ │  │  │        canvas              │  │
│  │ │                                │ │  │  │                            │  │
│  │ │   YouTube  /  slide deck       │ │  │  └────────────────────────────┘  │
│  │ │                                │ │  │  ◀  ▮▮  ▶     step 3 of 7        │
│  │ │                          [⛶]   │ │  │  ─────────────────────────────   │
│  │ └────────────────────────────────┘ │  │  chunk size   [═══════|───]      │
│  │  chapters · 1.25× · A–B loop       │  │  overlap      [═══|───────]      │
│  └────────────────────────────────────┘  │  ─────────────────────────────   │
│  ┌────────────────────────────────────┐  │  Headings keep the section       │
│  │ Notes  Outline  Transcript          │  │  title attached to every chunk,  │
│  │ Ask Amprat  Check  Docs             │  │  so the search still knows       │
│  │                                     │  │  where the text came from.       │
│  │  (system-written notes, plain       │  │                                  │
│  │   language, scrolls with the video) │  │                                  │
│  └────────────────────────────────────┘  │                                  │
├──────────────────────────────────────────┴──────────────────────────────────┤
│  ← previous        [ mark complete ]        next →          🖨 print page    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Space controls, because 13.6" is tight:**
- `[⛶]` on the player → **fullscreen video or slides**
- `[⛶]` on the animation → **fullscreen animation**
- `[→|]` → collapse the animation pane; the stage expands to full width
- `[focus ⛶]` → hide all chrome; just the player and the notes
- `⇄` (keyboard `s`) → swap panes, putting the animation in the big pane
- Below 1100px the panes stack: player, then tabs, then animation

### 4.2 The player
- **1–3 curated YouTube segments per topic**, plus an optional slide deck, shown as a source switcher with a one-line label on each ("more visual", "goes deeper", "Hindi"). Progress tracks the *topic*, so any source completes it.
- Every source is a **segment** with start/end times — a topic can be nine minutes of a fifty-minute video.
- Chapters generated from the topic outline; clicking seeks.
- **A–B loop** for replaying a forty-second explanation until it lands.
- Speed remembered; position remembered per topic, per device.
- Slide decks: keyboard navigation, fullscreen, printable, with live React components and inline animations embedded in slides.
- If a video dies, AmpratAI detects it and promotes the deck to main until it's replaced.

### 4.3 Notes — system-written, and quiet
You take notes in a physical notebook. AmpratAI respects that completely:

- **No note-taking UI at all.** No "add note" button, no highlighting tools, no editor. Nothing to manage.
- The **Notes tab** holds a written explanation of the topic in plain language — written by AmpratAI, scrolling alongside the video. It's the textbook version, there to read, not to maintain.
- **🖨 Print page** gives you a clean one-page summary of the topic — the key points, the diagram, the terms — formatted for A4. Print it, stick it in your notebook, write on it.
- Flashcards for spaced repetition are generated automatically from the topic, not from anything you have to write. Reviewing them is optional; they appear on the home screen when due and are easy to ignore.

### 4.4 The other tabs
- **Outline** — the topic's structure; clicking a line seeks the video
- **Transcript** — searchable, click to seek, Hindi and English where both exist
- **Ask Amprat** — §5
- **Check** — five quick questions. Self-assessment. Nothing locks.
- **Docs** — the 1–3 primary links, plus this topic's glossary terms

### 4.5 When is a topic "complete"?
You press the button. That's it.

AmpratAI shows soft signals — what you've watched, whether the check went well, whether the
drills passed — but it never blocks you. If you already know a topic, mark it and move on.

## 5. Amprat Assistant

The built-in tutor. It knows the whole curriculum, the transcripts, the primary docs, your
progress, and (once you submit projects) your own code.

**Modes:**
- **Explain** — "say that again, simpler" or "explain it using React"
- **Socratic** — it asks *you* questions instead of answering, and tells you where your answer was vague
- **Gap check** — five questions from this topic, scored, with the weak areas fed into your flashcards
- **Analogy bridge** — "this is like Express middleware, except…"
- **Code conversation** — after you submit a project, it asks you about your own code in plain language. Not a test. A conversation that surfaces where your understanding is thin, which is the main safeguard when AI wrote most of the lines.

Technically it's a retrieval system over the curriculum, transcripts, docs and your
submissions, with citations back to the exact source. Built by Claude, running on the
platform's own backend.

## 6. Practice

Five modes, weighted towards understanding over typing (`04-CURRICULUM-MAP.md` §3):

1. **Core primitive** (~5%) — hand-write one small thing, no AI. About ten across the whole path.
2. **Read & predict** (~25%) — working code; what does it output, what breaks, where's the bug.
3. **Spec-then-verify** (~25%) — you write the spec, AI writes the code, you review it against the spec and find what it got wrong.
4. **Tool drill** (~30%) — use the real tool, verified for real: AmpratAI calls the Langfuse API to confirm your traces exist, fetches your published package from PyPI and calls `tools/list` on it, pings your deployed URL, checks your GitHub Action's conclusion.
5. **Decision drill** (~15%) — no code. "Pick a strategy and defend it." "Get this from ₹4 a request to ₹1." Scored against a rubric.

**Prompt Arena** (for the prompting topics): you write a system prompt, AmpratAI runs it
against hidden test cases, and shows quality *and* cost *and* latency side by side across
your attempts:

```
Attempt   Quality  Grounded  Format OK   Avg tokens   ₹/call   p95
v1  0.54     0.61      72%         1,240        0.42     2.1s
v2  0.71     0.80      100%        1,480        0.51     2.4s
v3  0.88     0.91      100%          920        0.31     1.7s   ← better AND cheaper
```

That third row is the whole lesson: quality, cost and latency are one joint problem. Nothing
teaches it except feeling it.

**Debug challenges** — a small repo with a planted bug, drawn from real mistakes:
unnormalised embeddings · zero chunk overlap cutting facts in half · a tool description that
lies about units · a missing `await` blocking the whole endpoint · retries without jitter ·
**a missing tenant filter** · history never compacted, overflowing at turn 12 · a judge
prompt that rewards length · `max_tokens` too low, truncating JSON · a cache key missing the
prompt version. These ten bugs teach more than ten tutorials, and they're what senior
interviews actually probe.

Running code: small drills run in the browser (Pyodide); anything needing real packages,
network or a database runs in a sandboxed container. A spend cap applies to anything that
calls a real model, and the cost is always shown.

## 7. Mini-projects

Each brief is a work ticket, not an exercise: context, problem, constraints, non-goals,
acceptance criteria, rubric. Full set in `07-PROJECT-BRIEFS.md`.

Because you build with AI assistance, the briefs aim high — real systems with real
constraints, not toy apps.

**The animated scenario.** Before you write anything, a 60–90 second animation shows the
problem in the world: the person who has it, what they need, your architecture assembling
piece by piece with data flowing through it, and the payoff with real numbers. Same engine
as the concept animations, longer scene list.

**Building it.** A starter repo scaffolds locally (`ampratai start p-3.1`) with the brief, a
test suite, an eval harness and a README stub. You build in your own IDE, with AI. Then
`ampratai verify` runs the acceptance tests and eval thresholds locally, and `ampratai submit`
sends the results and your URLs — never your code.

**How it's judged:**
1. Acceptance tests pass
2. Eval thresholds met, where quality is the point
3. A **code conversation** with Amprat Assistant about your own repo — the safeguard that makes AI-assisted building work
4. A reachable deployed URL — AmpratAI pings it

No rubric score is shown as a grade. You get specific feedback and a list of what's not
demonstrated yet.

## 8. Progress, devices, and stopping

### Everything is saved server-side
Progress, positions, check results, flashcard state, submissions and spend all live in the
database, not the browser. Open it on your laptop, your phone, a lab machine — same state.

### Stopping is designed for, not tolerated
No streaks. No "you haven't studied in 9 days". No decay. No deadlines. No time boxes.
Nothing expires.

When you come back after exams:
- The home screen opens on exactly where you stopped
- A **"where you left off"** card: what you'd just learned, what you were building, and a two-minute refresher of the last three concepts
- Flashcards due are capped at a small number so returning doesn't feel like a backlog
- A one-screen recap of the current stage, if you want the wider context

Coming back after four weeks away should cost one session, not one week.

### What the home screen shows
Where you are. What's next. Anything you left half-built. Total spend. That's it — no
dashboards of hours watched, because hours watched isn't the point.

## 9. Design system

### Colours

**Light** — white base, beige surfaces, olive accents:
```css
--bg:            #FFFFFF;   /* page */
--surface:       #F7F3E9;   /* cards, panels — beige */
--surface-2:     #EFE8D8;   /* nested surfaces, tab bars */
--border:        #DED5C0;
--text:          #23261F;
--text-muted:    #5E6356;
--accent:        #55663B;   /* deep olive — links, buttons, active states */
--accent-hover:  #44522F;
--accent-soft:   #8FA86A;   /* fills, charts, large UI only — not small text */
--accent-wash:   #E8EEDB;   /* selected rows, highlights */
```

**Dark** — near-black with a blue cast, beige text, lighter olive accents:
```css
--bg:            #12151A;   /* page — black/grey/blue */
--surface:       #1A1F26;
--surface-2:     #232A33;
--border:        #2E3742;
--text:          #EDE3CF;   /* beige */
--text-muted:    #A79F8C;
--accent:        #9DB87A;   /* light olive */
--accent-hover:  #B0C98D;
--accent-soft:   #6E8450;
--info:          #6E93B8;   /* the blue accent */
--accent-wash:   #1E2A1C;
```

Contrast is checked: olive on white is 6.3:1, olive on beige 5.7:1, beige on near-black
14.5:1 — all comfortably past WCAG AA, including for long reading sessions.

### The rest
- Type: one humanist sans for UI and prose, one mono for code. Generous line height — this is a reading app.
- Density: roomy. Whitespace is the main defence against a crowded 13.6" screen.
- Motion: purposeful only, and it respects `prefers-reduced-motion`.
- Dark mode follows the system by default, with a manual override that persists.
- Animations use the same palette, with olive for the "active path" and the beige/blue neutrals for everything at rest.

## 10. Animations

Hand-animating 215 topics would take a year, so this is a system, not a collection.

### Four production tiers
| Tier | What | Use for |
|---|---|---|
| **T1 Diagram-morph** | Declarative JSON scenes → animated SVG. Nodes, edges, highlights, captions, step-through | ~60% of topics — pipelines, request flows, architectures |
| **T2 Explorable** | A React component with knobs; change a value, watch the outcome change | ~25% — anything with a tradeoff dial |
| **T3 Narrated film** | Rendered video for spatial intuition | ~5% — embeddings space, attention, vector search |
| **T4 Live data** | Driven by a real trace from your own projects | ~10% — debugging, observability, system design |

### One JSON format so T1 is fast to produce
```jsonc
{
  "id": "rag-pipeline-overview",
  "topicId": "s3.1.t1",
  "nodes": [
    { "id": "docs",  "label": "500-page PDF",    "shape": "doc",   "at": [40, 120] },
    { "id": "chunk", "label": "Chunker",         "shape": "proc",  "at": [180, 120] },
    { "id": "embed", "label": "Embedding model", "shape": "proc",  "at": [320, 120] },
    { "id": "store", "label": "pgvector",        "shape": "db",    "at": [460, 120] }
  ],
  "edges": [
    { "from": "docs",  "to": "chunk", "payload": "text" },
    { "from": "chunk", "to": "embed", "payload": "chunk[]" },
    { "from": "embed", "to": "store", "payload": "vector[1536]" }
  ],
  "scenes": [
    { "caption": "A 500-page document won't fit in one prompt.",
      "focus": ["docs"], "annotate": [{ "on": "docs", "text": "~250k tokens" }] },
    { "caption": "So we cut it into chunks — overlapping, so facts don't get split.",
      "animate": [{ "edge": "docs->chunk", "flow": 1.2 }] },
    { "caption": "Each chunk becomes a vector: its meaning, as coordinates.",
      "animate": [{ "edge": "chunk->embed", "flow": 1.0 }], "sideView": "vector-space-2d" }
  ],
  "knobs": [
    { "id": "chunkSize", "label": "Chunk size", "min": 128, "max": 2048, "default": 512 }
  ]
}
```

### Rules
1. **Mechanism only.** What moves, in what order, and what changes it.
2. **Always steppable.** Arrow keys. Your pace, not the animation's.
3. **One caption, one idea**, in plain language. Two sentences means two scenes.
4. **Real numbers on screen** — "~250k tokens", "₹0.31 per call" — never "many".
5. **Fullscreen available**, and readable in both themes.
6. **Reduced-motion fallback** is a labelled static diagram with the captions as a list.

Full catalogue with the "aha" for each: `06-ANIMATION-CATALOG.md`.

## 11. Architecture

### Stack
| Layer | Choice | Why |
|---|---|---|
| Web app | Next.js + TypeScript + Tailwind | Fast to build, deploys free on Vercel |
| Animation | Framer Motion (T1/T2), rendered video (T3) | SVG-native, fits the JSON format |
| **Database** | **MongoDB Atlas (free tier)** | Holds content *and* progress. Document-shaped data — slides, animation specs, video links, notes — fits naturally. Free, hosted, cross-device. |
| Vector search | MongoDB Atlas Vector Search | Powers Amprat Assistant without a second database |
| AI backend | FastAPI (Python) | Tutor, prompt arena, grading, eval runs |
| Assets | Object storage (R2 / Vercel Blob free tier) | Images, rendered animations, deck assets — paths stored in Mongo |
| Sandbox | Pyodide in-browser; container runner for real drills | Tiered by what the drill needs |
| Auth | GitHub sign-in, single user | You already have the account; enables cross-device |
| Hosting | Vercel (web) + Fly/Railway (API) + Atlas (DB) | All free or near-free at this size |

**Content lives in two places on purpose:** authored source (markdown decks, animation JSON,
practice definitions) is version-controlled in this repo, and a sync step publishes it to
MongoDB. Git gives history and review; Mongo gives fast reads and updates without a redeploy.

**Not building:** a custom video player, a CMS, microservices, multi-tenancy, payments, or
a mobile app (the web app is responsive).

### Data model (abbreviated)
```
stages        { idx, title, outcome, modules[] }
modules       { stageId, code, title, priority, tier }
topics        { moduleId, idx, title, estMinutes, prereqs[] }
concepts      { topicId, sources[{kind,youtubeId,start,end,label,reason}|{deckId}],
                notesMd, analogyMd, animationIds[], docUrls[], glossary[], printableMd }
decks         { id, title, slides[{md, componentRef, animationId}] }
animations    { id, topicId, tier, specJson, assetUrl, staticFallbackUrl }
practice      { topicId, mode, promptMd, starter, visibleTests, hiddenTests,
                hints[], runtime, verify, costCeiling }
projects      { id, stageId, briefMd, scenarioAnimationId, templateRepo,
                acceptance, evalThresholds }
progress      { checkpointId, status, lastPositionSec, checkScore, updatedAt }
flashcards    { topicId, front, back, fsrsState, dueAt }
submissions   { projectId, repoUrl, demoUrl, metrics, conversationNotes, verifiedAt }
spend         { day, feature, inr }
```

## 12. Build order

Claude builds this. Content stays a stage ahead of where you are, so nothing is written
long before you need it and stale by the time you arrive.

| Phase | What ships |
|---|---|
| **1** | The app: two-pane concept screen, source switcher, fullscreen, system notes, print view, tabs, MongoDB progress, GitHub sign-in, light/dark theme. **Plus all of Stage 1's content** — topics, decks, 6 animations, practice items, 2 project briefs. This is what you start on. |
| **2** | Stage 2 content · Amprat Assistant (explain, Socratic, gap check) · flashcards · the first interactive animations |
| **3** | Stage 3 content · Prompt Arena · tool drills with live API verification · `ampratai` CLI (`start` / `verify` / `submit`) |
| **4** | Stage 4 content · code conversations on submitted projects · debug challenges · trace-driven animations |
| **5** | Stage 5–7 content · remaining animations · polish |

Phase 1 is the only one that blocks you. After that, content lands ahead of where you are.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Content goes stale (AI tooling moves fast) | Decks are the main source for fast-moving topics and are updated in place; videos are segments with labelled alternates; broken links are detected automatically |
| Animation production is slower than hoped | The JSON format keeps T1 cheap; ten animations carry Stages 2–4; a labelled static diagram is an acceptable ship |
| YouTube videos disappear | Transcripts and written notes are stored; the deck takes over as main source |
| Free-tier limits (Atlas 512MB) | Text and JSON are tiny; media goes to object storage. Comfortable for years. |
| You stop for a month | Designed for — §8 |
| AI writes the code and understanding stays shallow | Code conversations, read-and-predict drills, decision drills, and ten hand-written primitives |

## 14. Done, for version 1

- All 7 stages present, every topic with concepts, practice and projects
- 49 animations, at least 8 interactive
- Amprat Assistant with citations, and code conversations on submissions
- Prompt Arena, tool drills with live verification, debug challenges
- `ampratai` CLI working
- Cross-device progress, print views, both themes
- Deployed and stable

And the only measure that actually matters: **you finished the path and you have the
offers.** If AmpratAI is beautiful and you didn't, it failed.
