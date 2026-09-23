import type { Topic } from '@/lib/types';

export const s6_3: Topic[] = [
  {
    id: 's6.3.t1',
    moduleId: 's6.3',
    title: 'The flagship README and its docs',
    outcome: `You can write a flagship repo's README and supporting docs so a reviewer understands the problem, sees the architecture and results, and trusts your numbers — within two minutes.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'how to write a great README for your github project portfolio',
        channel: '',
        reason: 'examples of READMEs that work',
      },
    ],
    animations: [],
    analogy: `A good product page on a shopping site. The photo and price are at the top, the specs sit
in a table, reviews come below, and the returns policy is one click away. A shopper
decides in seconds. A reviewer skims your README the same way — so put the decision-making
facts first.`,
    notes: `## Who reads it, and for how long

- **A recruiter:** 30 seconds. The first screen only.
- **An engineer:** 2–5 minutes. The architecture and results.
- **Your interviewer, before the round:** the trade-offs and "what I'd do differently".

So the first screen must answer three questions: *What is it? Does it work?* (a live link
and a video) *What's impressive?* (one number).

---

## The shape

\`\`\`markdown
# Name — what it does, for whom, in one line
[Live demo] · [90-second video] · [Architecture] · [Evals]

## The problem            (three sentences)
## Architecture           (a diagram and five bullets)
## Results                (the table)
## Trade-offs I made
## What I'd do differently
## Run it locally         (five commands or fewer)
\`\`\`

---

## The results table

| Change | recall@5 | p95 latency | cost / query | n |
|---|---|---|---|---|
| Baseline: vector search only | 0.61 | 1.2 s | ₹0.08 | 120 |
| + hybrid (BM25 + RRF) | 0.74 | 1.3 s | ₹0.08 | 120 |
| + reranker | 0.87 | 1.6 s | ₹0.28 | 120 |

*These numbers show the shape. Yours come from your own runs.*

The rules:
- always a **baseline** row, and **one change per row**;
- **cost and latency beside quality** — every win has a price;
- the **eval-set size** (n), linked to how it was built;
- the date, and the model versions used.

---

## Honesty rules

- **Only numbers you measured**, with the script that reproduces them.
- **Say when n is small.** "On 120 questions" is honest. "Significantly better" on 20
  questions is not.
- **Report what didn't work.** "Query rewriting didn't help (0.74 → 0.73), so I removed
  it." This reads as senior, not weak.
- **Show the cost of the win.** The reranker above tripled the cost per query. Say so,
  and say why it was worth it.

---

## The supporting docs

- **\`ARCHITECTURE.md\`** — the parts, how data flows, why each choice, what you rejected.
- **\`EVALS.md\`** — the golden set: size, how it was built, who labelled it, the
  metrics, how to run it, known gaps.
- **\`RUNBOOK.md\`** — deploy, roll back, rotate keys, what each alert means and what to do
  (Stage 5).

For the diagram, use Excalidraw, or **Mermaid**, which GitHub draws straight from a code
block in your markdown — so the diagram lives next to the code and stays current.`,
    docs: [
      {
        label: 'GitHub — creating Mermaid diagrams',
        url: `https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams`,
      },
    ],
    glossary: [
      {
        term: 'results table',
        def: 'A table of measured metrics per change, from a baseline, with cost and latency.',
      },
      {
        term: 'baseline',
        def: 'The simplest version, measured first, that every change is compared against.',
      },
      {
        term: 'Mermaid',
        def: 'A text format for diagrams that GitHub renders from a code block.',
      },
      {
        term: 'runbook',
        def: 'A document of operational steps: deploy, roll back, respond to each alert.',
      },
    ],
    check: [
      {
        q: 'What must the first screen of a README answer?',
        a: 'What it is, whether it works (a live link and a video), and what\'s impressive (one number).',
      },
      {
        q: 'Name three rules for the results table.',
        a: `Any three of: a baseline row; one change per row; cost and latency beside quality; the eval-set size; the date and model versions.`,
      },
      {
        q: 'Why report what didn\'t work?',
        a: `It shows you measured rather than assumed, and made decisions from evidence. Interviewers read it as senior.`,
      },
      {
        q: 'What goes in EVALS.md?',
        a: `The golden set's size, how it was built, who labelled it, the metrics, how to run it, and its known gaps.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Rewrite a weak README opening',
        body: `> # RAG-Chatbot
> This is my RAG chatbot project made using LangChain, OpenAI, Pinecone and Streamlit.
> It uses AI to answer questions from PDFs. Features: upload PDFs, chat, history.
> Installation: \`pip install -r requirements.txt\`

Rewrite the opening (title to the end of the first screen). Use placeholders like
\`<your number>\` wherever you'd need a real measurement.`,
        answer: `\`\`\`markdown
# DocAnswer — answers questions about long policy PDFs, with a citation for every claim

[Live demo](https://…) · [90-second video](https://…) · [Architecture](ARCHITECTURE.md) · [Evals](EVALS.md)

**recall@5 <your number> on a 120-question golden set, up from <baseline> — at ₹<cost> per
question and <p95> s p95.**

## The problem
Insurance policy PDFs run to 200 pages with tables and numbered clauses. Keyword search
misses paraphrased questions; plain vector search misses exact clause numbers. Answers
without citations can't be trusted by the claims team.
\`\`\`

What changed:
- **The name says what it does and for whom**, instead of naming the technique.
- **Links first:** a live demo and a video, above anything else.
- **One number, with its cost**, in bold.
- **A problem with specifics** (200 pages, tables, clause numbers) instead of "uses AI".
- **The tool list moved down** to Architecture. Tools are how, not what.
- **No feature list.** "Upload, chat, history" is every chatbot.`,
      },
      {
        mode: 'spec',
        title: 'Build the results table from raw notes',
        body: `Your experiment notes:

> Mon: vector only → recall@5 .58 (on the 50-question set), p95 1.1s, ₹0.07/q.
> Tue: extended the golden set to 120 questions. Vector only again → .61, 1.2s.
> Wed: hybrid BM25+RRF → .74, 1.3s, ₹0.08.
> Thu: + query rewriting → .73, 2.1s, ₹0.15. Hmm.
> Fri: hybrid + reranker (no rewriting) → .87, 1.6s, ₹0.28.

Build the README's results table and one "what didn't work" sentence. What must you
*not* do with Monday's number?`,
        answer: `| Change | recall@5 | p95 latency | cost / query | n |
|---|---|---|---|---|
| Baseline: vector only | 0.61 | 1.2 s | ₹0.07* | 120 |
| + hybrid (BM25 + RRF) | 0.74 | 1.3 s | ₹0.08 | 120 |
| + reranker | 0.87 | 1.6 s | ₹0.28 | 120 |

*Tuesday's note has no cost. Monday's ₹0.07 came from the same pipeline, but
re-measure it on the 120-question run rather than borrowing it.

**What didn't work:** "Query rewriting lowered recall slightly (0.74 → 0.73) and nearly
doubled latency and cost, so it's off."

**Don't mix Monday's 0.58 into the table.** It was measured on a different eval set
(50 questions). Numbers from different sets can't be compared. Every row must use the
same set.`,
      },
      {
        mode: 'decision',
        title: 'Which claims can go in the README?',
        body: `Keep, fix, or drop each:

1. "Recall@5 of 0.87 on 120 hand-labelled questions (see EVALS.md)."
2. "Blazing fast and highly scalable."
3. "Handles 1,000 concurrent users." (You tested 20.)
4. "Reranking improved answer quality by 43%." (Recall went 0.61 → 0.87.)
5. "Costs ₹0.28 per question at current prices (measured over 500 queries)."`,
        answer: `1. **Keep.** Specific, measured, reproducible.
2. **Drop.** No number, no meaning.
3. **Fix:** "Load-tested to 20 concurrent users, p95 \`<your number>\`; beyond that,
   \`<what broke first>\` (see RUNBOOK.md)." Claim only what you tested.
4. **Fix.** 0.61 → 0.87 is a 26-*point* gain in recall — a 43% *relative* rise, and it
   measured recall, not "answer quality". Say: "Recall@5 rose from 0.61 to 0.87 (hybrid
   search plus reranking)."
5. **Keep.** Measured, with the sample size and a time qualifier.`,
      },
    ],
  },
  {
    id: 's6.3.t2',
    moduleId: 's6.3',
    title: 'Demo videos that get watched',
    outcome: `You can script and record a 90-second demo that shows the hard part working, the number that proves it, and a failure handled well.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'how to record a great software demo video tips',
        channel: '',
        reason: 'practical demo recording advice',
      },
    ],
    animations: [],
    analogy: `A movie trailer. It doesn't play the film in order — it opens with a hook, shows the best
moments, and ends with the title. Nobody would sit through a trailer that opened with 40
seconds of studio logos. So don't open your demo with the login screen.`,
    notes: `## Why video

Recruiters and engineers rarely run your code. A 90-second video is how most people
will "use" your project.

It also reaches people who'd never read a blog post. If writing isn't for you, videos do
a similar job.

---

## The 90-second shape

| Time | What's on screen |
|---|---|
| 0–10 s | The problem in one sentence, with a real example |
| 10–50 s | **The hard part working** — the demo moment |
| 50–70 s | The number that proves it, and what it cost |
| 70–85 s | A failure handled well — a refusal with a reason, an approval gate, a rollback |
| 85–90 s | Where to find it: the URL and the repo |

Showing a failure handled well is what separates an engineer's demo from a sales demo.

---

## Script first

Write every line. Read it aloud and cut a fifth. Speak slower than feels natural.

Mark what's on screen for each line. If a line has nothing to show, it probably doesn't
belong.

---

## Recording basics

- **A clean browser profile:** no bookmarks bar, no notifications, zoomed to 110–125% so
  text is readable on a phone.
- **1080p, one window.** OBS Studio is free; Loom is quick.
- **Cut every wait.** Pre-load data. Nobody should watch a spinner.
- **Captions.** Many people watch muted. Generate them, then fix the mistakes.
- **Synthetic data only.** Never a real person's resume or email.

---

## The three-minute version

The capstone brief asks for three minutes. Add:

- the architecture (20 seconds, one diagram);
- the **isolation demo** — log in as company B, show you can't see A's candidates;
- the fairness test passing;
- the cost dashboard.

Upload it to YouTube, and put a thumbnail at the top of the README that links to it.
GitHub can also play a short \`.mp4\` inside a README: drag it into GitHub's web editor (or
an issue), and paste the link it gives you.`,
    docs: [
      {
        label: 'OBS Studio',
        url: 'https://obsproject.com/',
      },
    ],
    glossary: [
      {
        term: 'demo moment',
        def: 'The short stretch of a demo that shows the hard thing working.',
      },
      {
        term: 'voice-over',
        def: 'Narration recorded over the screen recording.',
      },
      {
        term: 'synthetic data',
        def: 'Realistic but made-up data, safe to show publicly.',
      },
    ],
    check: [
      {
        q: 'What happens in the first 10 seconds?',
        a: 'The problem, in one sentence, with a real example on screen — not a login page or setup.',
      },
      {
        q: 'Why show a failure in a demo?',
        a: `Handling failure well — a refusal with a reason, an approval gate, a rollback — is what shows engineering judgement.`,
      },
      {
        q: 'Why add captions?',
        a: 'Many people watch with the sound off.',
      },
      {
        q: 'What does the three-minute capstone video add?',
        a: 'The architecture, the tenant isolation demo, the fairness test and the cost dashboard.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Script the 90 seconds',
        body: `Write the full 90-second script for your document-intelligence project (p-3.1): each
line of voice-over with what's on screen, and the timings. Use \`<your number>\` where a
real measurement goes.`,
        answer: `| Time | Voice-over | On screen |
|---|---|---|
| 0–10 s | "Claims teams search 200-page policy PDFs by hand. Keyword search misses paraphrases; answers without sources can't be trusted." | A long PDF scrolling; a failed keyword search |
| 10–25 s | "Here's a question in plain words." | Typing: "Is flood damage covered for a ground-floor shop?" |
| 25–50 s | "It finds clause 14.3 even though the words differ — and every sentence cites its source. Click one, and the PDF opens at that line." | The streamed answer; clicking a citation; the PDF highlighted |
| 50–70 s | "On 120 hand-labelled questions, hybrid search plus reranking took recall@5 from <baseline> to <your number>. It costs ₹<cost> a question — three times the baseline, and worth it." | The results table |
| 70–85 s | "Ask something the policies don't cover, and it says so instead of guessing." | "What's the CEO's salary?" → "The documents don't cover this." |
| 85–90 s | "It's live — link below." | URL and repo |

Check: the demo moment (the citation click) lands before the halfway mark, and there's
a failure handled well.`,
      },
      {
        mode: 'read',
        title: 'Critique this demo outline',
        body: `> 0:00 Intro: my name, my college, my tech stack.
> 0:30 Signing up and logging in.
> 0:50 Uploading five PDFs (waiting for processing).
> 1:40 Asking an easy question it answers correctly.
> 2:10 Showing the code in VS Code.
> 2:50 Thanks for watching!

List the problems and reorder it into the 90-second shape.`,
        answer: `**Problems:**
1. **30 seconds of intro** before anything happens — most viewers leave.
2. **Sign-up and uploads on camera** — setup, not value; and 50 seconds of waiting.
3. **Only an easy question** — nothing hard is shown working.
4. **No number** — nothing proves it's good.
5. **No failure handling** — a sales demo, not an engineer's.
6. **40 seconds of code in VS Code** — video is the wrong medium; link the repo.
7. **Three minutes for a 90-second story.**

**Reordered:**
- 0–10 s: the problem, with a real example
- 10–50 s: a hard question (paraphrased, needs a table) answered with citations —
  documents already uploaded off camera
- 50–70 s: the results table
- 70–85 s: an unanswerable question refused politely
- 85–90 s: link and repo. Your name goes in the description, not the first 30 seconds.`,
      },
    ],
  },
  {
    id: 's6.3.t3',
    moduleId: 's6.3',
    title: 'GitHub, LinkedIn and a site that agree',
    outcome: `You can make GitHub, LinkedIn and a personal site tell one consistent, evidence-led story — and put a live demo on your site without risking your API budget.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'software engineer portfolio website examples tips',
        channel: '',
        reason: 'examples of developer sites that work',
      },
    ],
    animations: [],
    analogy: `In a MERN app, the React forms, the API and the Mongo schema must agree on the same data
model, or things break. Your public profiles are three views of the same data — you. When
they disagree ("ML Engineer" here, "Full-Stack Developer" there, different projects on
each), people notice.`,
    notes: `## One story, three places

The story: **"Full-stack AI engineer. Three flagship systems. Here are the numbers."**
Each profile tells it in its own format. Nothing on one contradicts another.

---

## GitHub

- **Profile README:** one line on who you are; the three flagships, each with a one-line
  outcome and a live link; the install command for your MCP server (p-4.2); a link to
  your site.
- **Pin the flagships** in the order you want them read.
- **Archive** tutorial and course follow-along repos. They dilute the signal.
- **Look professional up close:** clear commit messages, green CI badges, no committed
  secrets or \`node_modules\`.

---

## LinkedIn

- **Headline:** \`Full-Stack AI Engineer · RAG, Agents, MCP · Python + React\`
- **About:** three short paragraphs — what you build; the evidence, with numbers; what
  you're looking for. No "passionate about leveraging cutting-edge AI".
- **Featured:** the three demo videos.
- **Projects:** each flagship with two bullets, each bullet with a number.

Posting is optional. The profile does its job without it.

---

## The personal site

You're a React developer — this can be excellent. It needs:

- the one-paragraph pitch;
- three project cards, each with the video and a live link;
- **one embedded, interactive demo** — a recruiter types a question into your RAG system,
  right there;
- a way to contact you.

It doesn't need skill bars ("Python 80%"), an empty blog, or a 3D intro animation.

---

## A public demo that can't drain your budget

An embedded demo is a public endpoint that spends your money. Apply Stage 5:

- **per-IP limits** (say 30 questions a day) and a **global daily spend cap**;
- when the cap is hit: "The demo is resting today — watch the video";
- a small, cheap model, a short \`max_tokens\`, and a cache for common questions;
- a fixed corpus — no uploads — and a cap on input length;
- no tools with side effects, so a prompt injection has nothing to misuse;
- an alert at half the daily cap; API keys only on the server.

Worst case, in numbers: a ₹50 daily cap is at most ₹1,500 a month, whatever happens.`,
    docs: [
      {
        label: 'GitHub — managing your profile README',
        url: `https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme`,
      },
      {
        label: 'GitHub — archiving repositories',
        url: 'https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories',
      },
    ],
    glossary: [
      {
        term: 'profile README',
        def: 'A README in a repo named after your username; GitHub shows it on your profile.',
      },
      {
        term: 'spend cap',
        def: 'A hard limit on how much an endpoint may spend per day or month.',
      },
      {
        term: 'pinned repositories',
        def: 'Up to six repos you choose to show first on your GitHub profile.',
      },
    ],
    check: [
      {
        q: 'What should a GitHub profile README contain?',
        a: `One line on who you are, the three flagships with outcomes and live links, the MCP server's install command, and a link to your site.`,
      },
      {
        q: 'What are the three paragraphs of a LinkedIn About?',
        a: 'What you build; the evidence, with numbers; what you\'re looking for.',
      },
      {
        q: 'Why cap a public demo\'s spend per day, not only per IP?',
        a: `Many IPs together can still drain the budget. A global daily cap bounds the worst case whatever the traffic.`,
      },
      {
        q: 'Why allow no side-effecting tools in a public demo?',
        a: 'So a prompt injection has nothing harmful to trigger.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Rewrite the About section',
        body: `> "Passionate and result-oriented developer with a keen interest in AI/ML and cutting
> edge technologies. Skilled in Python, React, Node, LangChain, TensorFlow and more.
> Looking for opportunities to leverage my skills in a dynamic organisation."

Rewrite it as three short paragraphs. Use \`<your number>\` for real measurements.`,
        answer: `> I build AI systems end to end — the Python backend (retrieval, agents, evals) and the
> React interface. I came from MERN, so shipping full products is my default.
>
> Three things I've built: a document Q&A system where hybrid search and reranking took
> recall@5 from <baseline> to <your number> on a 120-question golden set, at ₹<cost> a
> query; a support agent with approval gates that survive a restart; and an MCP server
> you can install in one command. I also wrote up the time I broke my own production
> system, and what I changed.
>
> I'm looking for full-stack AI engineering roles where the AI is in production and
> measured. Demos and write-ups: <your site>.

What changed: claims became evidence; the skill list became three projects; "dynamic
organisation" became the specific kind of role you want.`,
      },
      {
        mode: 'spec',
        title: 'Cap the demo\'s spend',
        body: `Your site's demo uses Haiku 4.5 (US$1 per million input tokens, US$5 per million output
tokens). A typical question sends about 1,500 input tokens and gets about 300 back.
Take ₹88 to the dollar.

1. What does one question cost?
2. Your budget is ₹1,500 a month. What daily cap, and roughly how many questions a day?
3. Write an async guard using Redis: 30 questions per IP per day, and the daily cap.
   A refused question must not count towards spend.`,
        answer: `**1.** 1,500 × $1/M + 300 × $5/M = $0.0015 + $0.0015 = **$0.003 ≈ ₹0.26** a question.

**2.** ₹1,500 ÷ 30 days = **₹50 a day** ≈ 190 questions a day (more with caching).

**3.**

\`\`\`python
from datetime import datetime, timezone

DAILY_CAP_INR = 50.0
PER_IP_PER_DAY = 30

async def allow_demo_question(r, ip: str, est_inr: float) -> tuple[bool, str]:
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    ip_key, spend_key = f"demo:ip:{day}:{ip}", f"demo:spend:{day}"

    count = await r.incr(ip_key)
    await r.expire(ip_key, 2 * 86400)
    if count > PER_IP_PER_DAY:
        return False, "You've asked a lot today. The video shows the rest."

    spent = await r.incrbyfloat(spend_key, est_inr)
    await r.expire(spend_key, 2 * 86400)
    if spent > DAILY_CAP_INR:
        await r.incrbyfloat(spend_key, -est_inr)     # a refused question costs nothing
        return False, "The demo is resting for today. Watch the video instead."
    return True, ""

async def settle(r, est_inr: float, actual_inr: float) -> None:
    # after the call, correct the estimate using the response's real token usage
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    await r.incrbyfloat(f"demo:spend:{day}", actual_inr - est_inr)
\`\`\`

Tested against a fake Redis at ₹0.30 a question: one IP gets 30 questions, then
refusals; across many IPs, spending stops at ₹49.80 — under the cap.

Notes: the key includes the date, so each day starts fresh. Reserving the estimate
*before* the call stops a burst of parallel requests from overshooting. Two requests
can still race past the cap by a question or two — fine for a demo; use a Lua script
if you need it exact.`,
      },
    ],
  },
  {
    id: 's6.3.t4',
    moduleId: 's6.3',
    title: 'Writing (optional): claims with numbers',
    outcome: `If you choose to write, you can turn a real problem you solved into a short post with a claim-and-number title, honest methods, and the cost of the win.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A good Stack Overflow answer. It states the fix first, shows the smallest code that
proves it, explains why it works, and warns about the gotcha. Nobody reads the ones that
open with "Great question! In today's world…". Write posts like the good answers.`,
    notes: `## Optional — genuinely

Nothing in this path depends on writing. If it isn't for you, make demo videos instead —
they do a similar job.

Why some people write anyway: one good post can bring more interest than many
applications. And writing shows you which parts you only *thought* you understood.

---

## Titles that are claims

- **Topic:** "My RAG chatbot project"
- **Claim:** "Reranking moved my recall@5 from 0.61 to 0.87 — here's what it cost"

A topic promises homework. A claim promises something specific, and a reader can decide
in two seconds whether they care. *(Numbers are the example's, not yours.)*

---

## The shape of a post

1. **The claim** — the title and one paragraph.
2. **The setup** — the system, the data, how you measured (the metric, n).
3. **What you tried**, in order, including what didn't work.
4. **The results table.**
5. **What it cost** — latency, rupees, complexity.
6. **What you'd try next.**

Around 800–1,500 words. One diagram. Code only where it's the point.

---

## Writing with AI, honestly

Drafting with Claude from your notes and traces is fine — and fast. But:

- every claim and number is yours, and checked;
- rewrite it in your own voice, and cut filler ("delve", "in today's fast-paced world");
- the reader should learn something they couldn't get from the docs.

---

## Where to post

Your own site first (you own it). Cross-post to LinkedIn, dev.to or Hashnode. Share the
link with anyone whose work you built on.

One post per real problem solved. No schedule.`,
    docs: [],
    glossary: [
      {
        term: 'claim title',
        def: 'A title that states a specific result, usually with a number.',
      },
      {
        term: 'cross-posting',
        def: 'Publishing the same post on several sites, with your own site as the original.',
      },
    ],
    check: [
      {
        q: 'What\'s the difference between a topic title and a claim title?',
        a: 'A topic names a subject (\'My RAG project\'); a claim states a specific result, usually with a number.',
      },
      {
        q: 'What are the six parts of a post?',
        a: `The claim; the setup and how you measured; what you tried, including failures; the results table; what it cost; what you'd try next.`,
      },
      {
        q: 'What\'s fine and not fine about drafting with AI?',
        a: `Drafting from your notes is fine. Every claim and number must be yours and checked, and the voice should be yours.`,
      },
      {
        q: 'If you don\'t want to write, what\'s the alternative?',
        a: 'Demo videos, which do a similar job.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Turn topics into claims',
        body: `Rewrite each as a claim title. Use \`<n>\` for numbers you'd need to measure.

1. "Building an AI agent with LangGraph"
2. "Prompt caching explained"
3. "My experience with evals"
4. "Multi-tenancy in RAG"
5. "Deploying FastAPI on Cloud Run"`,
        answer: `Examples:

1. "Checkpointing let my LangGraph agent survive \`<n>\` crashes mid-run without double-refunding anyone"
2. "Moving one line of my prompt cut its cost by \`<n>\`% with prompt caching"
3. "My LLM judge disagreed with me on \`<n>\`% of answers — here's how I found out why"
4. "One missing WHERE clause leaked another tenant's data in my RAG demo — the test that catches it"
5. "Cold starts added \`<n>\` s to my p95 on Cloud Run — three settings that fixed it"

Each names a specific result, and the reader knows what they'll learn.`,
      },
      {
        mode: 'spec',
        title: 'Outline a post from a debug log',
        body: `Your notes from a debugging session:

> recall@5 suddenly 0.93?? too good. → dupes: re-ingest didn't delete old chunks, same
> text twice in top 5, and duplicates of the right chunk count as hits. → fix: content
> hash + upsert by (doc_id, chunk_no). → real recall 0.84. Also storage down 38%.
> Added test: re-ingest twice, count stays the same.

Write the post's title and outline using the six-part shape.`,
        answer: `**Title:** "My recall@5 jumped to 0.93 — because my ingestion was duplicating chunks"

1. **Claim:** a metric that looked like a win was a bug. Duplicate chunks filled the
   top 5 with copies of the right answer, inflating recall. The real number was 0.84.
2. **Setup:** the pipeline (ingest → chunk → embed → hybrid search), the golden set
   and n, and how recall@5 is computed.
3. **What happened:** re-ingesting a document added its chunks again instead of
   replacing them. The clue: identical text appearing twice in results.
4. **Results:** before and after — recall 0.93 (false) → 0.84 (true); storage down 38%.
5. **Cost:** the fix is cheap — a content hash and an upsert keyed by
   \`(doc_id, chunk_no)\` — plus a regression test: ingest twice, and the chunk count must
   not change.
6. **Next:** a data-quality check in CI that flags duplicate chunks before evals run.

The lesson worth sharing: **a metric that jumps unexpectedly is a bug until proven
otherwise.**`,
      },
    ],
  },
];
