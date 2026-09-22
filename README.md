# NexHireAI

Two things live in this repo:

1. **A custom 7-month roadmap** to become a full-stack AI engineer, built for one specific
   starting point — a MERN full-stack developer with shipped, deployed projects and no
   Python or AI experience yet.
2. **The spec for a personal learning platform** ("Forge") to run that roadmap: month-wise
   courses, three checkpoints per topic (concepts / practice / mini-project), a
   three-pane concept player with per-concept animations, API-verified tool drills, and
   mini-projects built in a local IDE and graded on real acceptance tests.

Later, `NexHireAI` itself becomes the Month 6 capstone — an AI hiring product with
semantic resume↔JD matching, explainable matches and multi-tenant isolation
(`docs/07-PROJECT-BRIEFS.md`, MP-6.1).

**Planning stage. No application code yet — on purpose.** See
`docs/05-PLATFORM-SPEC.md` §9 for why the platform starts as a text file in Month 1 and
why every platform feature has to double as a roadmap project.

## Start here

→ **[`docs/00-INDEX.md`](docs/00-INDEX.md)**

## Layout

```
docs/
  00-INDEX.md                     reading order
  01-PROFILE-AND-GAP-ANALYSIS.md  honest diagnosis: strengths, gaps, traps
  02-ROADMAP.md                   the 7-month plan with monthly gates
  03-TIER-LIST.md                 skill priority S -> F
  04-CURRICULUM-MAP.md            how a topic becomes content
  05-PLATFORM-SPEC.md             the platform: UX, animations, architecture, phases
  06-ANIMATION-CATALOG.md         49 animation specs
  07-PROJECT-BRIEFS.md            13 mini-project briefs
  08-RESOURCES.md                 curated sources; video vs slides decision rule
  09-JOB-STRATEGY.md              roles, positioning, 63 interview questions, applications
content/
  curriculum.yaml                 machine-readable curriculum (source of truth)
```

## Design principles

- **70% software engineering, 30% AI.** The roadmap front-loads the software engineering
  because that's the part that transfers and the part that's missing.
- **Nothing is complete without a deployed artifact.** Watching is not learning; the
  platform enforces this rather than trusting it.
- **Evals are a first-class skill, not an afterthought.** Build the ruler before optimising.
- **Animations show mechanism, not decoration.** If it doesn't answer "what moves, and in
  what order?", it doesn't ship.
- **The platform is built *from* the curriculum it teaches** — the AI tutor is the RAG
  project, the prompt arena is the evals project. Capped at 15% of weekly hours.
