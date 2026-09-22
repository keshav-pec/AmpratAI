# AmpratAI

A personal learning platform and a custom roadmap for becoming a full-stack AI engineer.

**Two parts:**

1. **The roadmap** — a sequenced path from "MERN full stack with some Python and basic RAG"
   to "full-stack AI engineer who can compete for the best AI roles". Concept-first, built
   around real systems, no calendar deadlines.
2. **AmpratAI, the platform** — month-wise courses, three checkpoints per topic
   (Concepts / Practice / Mini-project), a two-pane concept player with per-concept
   animations, curated YouTube segments and custom slide decks, system-generated notes,
   API-verified practice, and ambitious project briefs built with AI assistance.

**The platform is built by Claude, not by you.** Your job is to learn. See
`docs/05-PLATFORM-SPEC.md` §1.

## Start here

→ **[`docs/00-INDEX.md`](docs/00-INDEX.md)**

## Layout

```
docs/
  00-INDEX.md                     reading order
  01-PROFILE-AND-GAP-ANALYSIS.md  where you stand, what's missing, what to skip
  02-ROADMAP.md                   the path, month by month, no deadlines
  03-TIER-LIST.md                 skill priority S -> F, with your current status
  04-CURRICULUM-MAP.md            how a topic becomes content + plain-language rules
  05-PLATFORM-SPEC.md             AmpratAI: UX, animations, architecture, build order
  06-ANIMATION-CATALOG.md         49 animation specs
  07-PROJECT-BRIEFS.md            13 project briefs, written for AI-assisted building
  08-RESOURCES.md                 what to watch and read; how sources are chosen
  09-JOB-STRATEGY.md              roles, positioning, 63 interview questions
content/
  curriculum.yaml                 machine-readable curriculum (source of truth)
```

## Principles

- **Concepts first, code with AI.** You need to know exactly what a system does and why.
  You do not need to type every line. A small set of primitives stays hand-written because
  interviews probe them.
- **No deadlines, no time boxes.** Exams happen. The order matters; the calendar doesn't.
  Pause anywhere, resume anywhere.
- **Nothing is complete without something that runs.** A deployed URL or a passing test,
  not a watched video.
- **Evals are a core skill, not an afterthought.** Build the ruler before optimising.
- **Animations show mechanism, not decoration.** Every one answers "what moves, in what
  order, and what changes it?"
- **Plain language everywhere in the learner-facing content.** Short sentences, every term
  defined the first time, examples before definitions.

## Note on the repository name

This repo is still named `NexHireAI` on GitHub. Renaming a repository needs to be done from
the GitHub UI (Settings → General → Repository name → `AmpratAI`). After you rename it:

```bash
git remote set-url origin https://github.com/keshav-pec/AmpratAI
```

GitHub redirects the old URL, so nothing breaks in the meantime. All references inside the
repo now say AmpratAI.
