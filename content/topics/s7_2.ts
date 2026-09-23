import type { Topic } from '@/lib/types';

export const s7_2: Topic[] = [
  {
    id: 's7.2.t1',
    moduleId: 's7.2',
    title: 'From a gap to a short plan',
    outcome: `You can turn a gap — from a job description or a debrief — into a plan of four or five sessions: a primary source, a small working build, one measurement, and a write-up.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Fixing a production bug. You don't rewrite the service. You reproduce the bug, read the
code involved, make the smallest fix, add a test, and note it in the changelog. A skill
gap deserves the same treatment — small, targeted, and finished.`,
    notes: `## Gaps arrive at awkward moments

A JD asks for something you've never touched. An interviewer probes where you're thin.

The answer isn't a 40-hour course. It's a small plan that ends with **evidence** — a
working example and an explanation you can give in 90 seconds.

---

## Size the gap first

- **A concept** — for example, how the KV cache limits concurrency. Read, explain, write
  one structured answer. One or two sessions.
- **A tool** — for example, Kubernetes basics. The official quickstart, then deploy
  something you already built. Three to five sessions.
- **Project-sized** — for example, agent evals at scale. A small proof-of-skill build
  (topic 3). Four to six sessions.

---

## The five-session plan

1. **Primary source.** The official docs, the paper, the spec — not a listicle. Note five
   key ideas.
2. **The smallest working thing.** Apply it to something you already have: the capstone
   or a flagship.
3. **Measure.** One number: before and after, or A versus B.
4. **Explain.** Write the Claim / How / Evidence / Trade-off answer, and a README section.
5. **Link it.** Add it to your portfolio, and mark the gap closed.

**Sessions, not days.** Fit them around exams and life.

---

## When to stop

Stop when you can:

- explain it in 90 seconds;
- point to your own working example;
- state one trade-off.

More depth waits until a real need shows up. That's what "depth on demand" means.

---

## Example: "Kubernetes basics"

1. Read the Kubernetes concepts overview: pods, deployments, services, autoscaling.
2. Deploy your FastAPI container to a local cluster (\`kind\` or \`minikube\`), two replicas.
3. Add a Horizontal Pod Autoscaler on CPU (it needs the metrics server installed);
   load-test with k6; watch it scale, and note the numbers.
4. Write a runbook section, and the answer to "How would you autoscale an LLM gateway?"
5. Add it to the README. Close the gap.`,
    docs: [
      {
        label: 'Kubernetes — concepts overview',
        url: 'https://kubernetes.io/docs/concepts/overview/',
      },
      {
        label: 'Kubernetes — Horizontal Pod Autoscaling',
        url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
      },
      {
        label: 'kind — local Kubernetes clusters',
        url: 'https://kind.sigs.k8s.io/',
      },
    ],
    glossary: [
      {
        term: 'depth on demand',
        def: 'Going deep on a topic when a real need appears, not in advance.',
      },
      {
        term: 'primary source',
        def: 'The original: official docs, the paper, the specification.',
      },
      {
        term: 'Horizontal Pod Autoscaler (HPA)',
        def: 'The Kubernetes feature that adds or removes replicas based on load.',
      },
    ],
    check: [
      {
        q: 'What are the three sizes of gap?',
        a: `A concept (read and explain), a tool (quickstart plus a small deployment of your own work), or project-sized (a small proof-of-skill build).`,
      },
      {
        q: 'What are the five sessions?',
        a: `Primary source; the smallest working thing; one measurement; the explanation and README section; linking it into your portfolio.`,
      },
      {
        q: 'When do you stop going deeper?',
        a: 'When you can explain it in 90 seconds, point to your own working example, and state a trade-off.',
      },
      {
        q: 'Why \'sessions, not days\'?',
        a: `So the plan fits around exams and life — progress is counted in focused sessions, not calendar deadlines.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Plan this gap',
        body: `Three of your target JDs mention "experience serving open models (vLLM or similar)".
You've only used hosted APIs. Write the five-session plan.`,
        answer: `An example plan:

1. **Primary source:** the vLLM docs' quickstart and the PagedAttention paper's
   introduction. Five notes: what the KV cache is, why memory limits concurrency,
   paging, continuous batching, the OpenAI-compatible server.
2. **Smallest working thing:** serve a small open model with \`vllm serve\` on a
   rented GPU (or a free notebook GPU). Point your p-3.1 generation step at it, behind
   a config switch.
3. **Measure:** a k6 load test at 1, 8 and 32 concurrent users — time to first token
   (p95), tokens per second, and cost per million tokens at the GPU's hourly price.
   Compare with the hosted model on your golden set, for quality.
4. **Explain:** "When would you self-host?" — Claim / How / Evidence / Trade-off, using
   your numbers. A README section with the table.
5. **Link it:** add it to the p-3.1 README ("runs on a self-hosted model too"), and
   close the gap.

Stage 7.3's vLLM topic covers the concepts for session 1.`,
      },
      {
        mode: 'decision',
        title: 'Course or plan?',
        body: `For each gap, choose: a long course, or a short plan. Say why.

1. "Deep learning fundamentals" — an interviewer asked how attention works, and you
   were vague.
2. "Terraform" — one JD in fifteen mentions it.
3. "LLM evals: judge calibration" — three debriefs flagged it, and your specialisation
   is AI evals.`,
        answer: `1. **A short plan (concept-sized).** You don't need a course to explain attention well.
   Read a good visual explainer and the relevant section of a textbook, write your own
   explanation — queries, keys, values, weighted sums — and connect it to the KV cache
   you already know. Two sessions.
2. **Neither — not yet.** One JD in fifteen is under the 10% line. Note it and move on.
3. **A plan, possibly followed by more.** It's recurring *and* core to your
   specialisation. Start with a proof-of-skill build: label 100 answers yourself, run
   a judge on them, measure agreement, fix the rubric, measure again. If it keeps
   coming up, go deeper — that's where a longer course or a paper series earns its
   place.`,
      },
    ],
  },
  {
    id: 's7.2.t2',
    moduleId: 's7.2',
    title: 'Reading papers, specs and docs fast',
    outcome: `You can read a paper in three passes, get what you need from a protocol spec or API docs in one sitting, and turn it into notes you can explain.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'how to read a research paper efficiently three pass',
        channel: '',
        reason: 'the three-pass method explained',
      },
    ],
    animations: [],
    analogy: `Reading an unfamiliar codebase. You don't start at line 1 of every file. You read the
README, look at the folders, find the entry point, and follow one request through. Papers,
specs and docs have the same kind of structure — use it.`,
    notes: `## Three passes

From S. Keshav's short guide *How to Read a Paper*:

- **Pass 1 (5–10 minutes):** title, abstract, introduction, headings, conclusion; glance
  at the references. Then answer the **five Cs**: *Category* (what kind of paper),
  *Context* (what it builds on), *Correctness* (do the assumptions look valid?),
  *Contributions*, *Clarity*.
- **Pass 2 (up to an hour):** read carefully but skip proofs. Study the figures and
  tables. Note unfamiliar terms.
- **Pass 3 (only to implement or critique):** re-create the work in your head, challenging
  every assumption.

Most papers only deserve pass 1.

---

## What to pull from an AI paper

- The problem, and the **baseline** it beats
- The key idea, in one sentence
- The evaluation: data, metric, numbers — and what's **missing** (cost? latency?)
- The limitations: theirs, and the ones you notice
- Does it matter for your systems? Often, honestly: "not yet".

---

## Protocol specs (MCP, for example)

1. The overview and architecture.
2. The **message types**.
3. The **lifecycle** — how a connection starts, runs and ends.
4. One example exchange, end to end.

Then build the smallest client or server that works. Look up the rest when you need it.

---

## API docs

In this order: quickstart → concepts → the specific API reference → the **limitations and
errors** sections. The gotchas live in the last one — like the minimum prompt length for
caching that changes by model.

Check dates and versions. APIs change faster than memories — yours and AI models' alike.
When the docs and your memory disagree, the docs win.

---

## Notes you can use

One note per source:

- a one-sentence summary;
- three key ideas;
- one number;
- one open question;
- how it connects to your work.

Then test yourself: explain it out loud, or to Claude, with no notes. Where you stumble is
what you didn't understand.`,
    docs: [
      {
        label: 'S. Keshav — How to Read a Paper',
        url: 'http://ccr.sigcomm.org/online/files/p83-keshavA.pdf',
      },
      {
        label: 'PagedAttention (vLLM) paper',
        url: 'https://arxiv.org/abs/2309.06180',
      },
      {
        label: 'MCP specification',
        url: 'https://modelcontextprotocol.io/specification/',
      },
      {
        label: 'MCP Inspector',
        url: 'https://modelcontextprotocol.io/docs/tools/inspector',
      },
    ],
    glossary: [
      {
        term: 'five Cs',
        def: 'Category, context, correctness, contributions, clarity — the first-pass questions.',
      },
      {
        term: 'lifecycle',
        def: 'How a protocol connection starts, runs and ends.',
      },
      {
        term: 'MCP Inspector',
        def: 'A tool for connecting to an MCP server and watching its messages.',
      },
    ],
    check: [
      {
        q: 'What happens in pass 1 of reading a paper?',
        a: `5–10 minutes on the title, abstract, introduction, headings and conclusion, then answering the five Cs: category, context, correctness, contributions, clarity.`,
      },
      {
        q: 'What\'s usually missing from AI papers\' evaluations that matters to engineers?',
        a: 'Cost and latency — and often how it performs on data like yours.',
      },
      {
        q: 'In what order do you read API docs?',
        a: 'Quickstart, concepts, the specific API reference, then the limitations and errors sections.',
      },
      {
        q: 'How do you test whether you understood a source?',
        a: 'Explain it out loud without notes; where you stumble shows the gap.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'First-pass a paper',
        body: `A paraphrase of a well-known paper's abstract:

> Serving large language models is limited by the memory for the key-value (KV) cache,
> which grows and shrinks with each request and is wasted through fragmentation and
> over-reservation. We propose PagedAttention, inspired by virtual memory and paging
> in operating systems, which stores the KV cache in non-contiguous fixed-size blocks,
> and build vLLM on it. vLLM nearly eliminates KV-cache waste and allows sharing across
> requests. It improves throughput by 2–4× over earlier systems at the same latency,
> with bigger gains for longer sequences, larger models and more complex decoding.

Answer the five Cs, and say whether it matters for a team that only uses hosted APIs.`,
        answer: `- **Category:** a systems paper — it designs and measures a serving engine.
- **Context:** KV-cache memory management; builds on operating-system paging and on
  earlier serving systems with continuous batching.
- **Correctness:** assumes serving is memory-bound and batched — true for most GPU
  serving. Worth checking: does the 2–4× hold for short prompts and small batches? (The
  abstract hints the gains shrink there.)
- **Contributions:** PagedAttention; vLLM; near-zero KV waste; sharing blocks across
  requests; a 2–4× throughput gain at the same latency.
- **Clarity:** a clear problem statement and a measurable claim.

**For an API-only team:** not directly — the provider handles serving. But it explains
*why* long contexts cost more and cap concurrency, and it matters the day you
self-host (Stage 7.3).`,
      },
      {
        mode: 'spec',
        title: 'Read the spec, then prove it',
        body: `You need to explain MCP's lifecycle in an interview, and you learn best by building.
Which parts of the spec do you read first, and what's the smallest thing you'd build to
prove you understood?`,
        answer: `**Read first:** the architecture overview (hosts, clients, servers); the **lifecycle**
(the initialisation handshake — the client and server exchange versions and
capabilities, then an "initialized" notification); the messages for **listing tools**
and **calling a tool**; one example exchange end to end.

**Build:** a one-tool server with the official SDK — say, \`lookup_order(order_id)\`
returning fake data. Connect with the **MCP Inspector** and watch the handshake, the
tool listing and one call. Then write down, in your own words, each message you saw.

**Prove it:** explain the lifecycle out loud using your own logged messages, not the
spec's diagrams. Look up resources, prompts, sampling and the rest only when you need
them.`,
      },
    ],
  },
  {
    id: 's7.2.t3',
    moduleId: 's7.2',
    title: 'Small proof-of-skill builds',
    outcome: `You can scope a small, finished, public build that proves a skill — one question, one number, one page — and use it in applications and interviews.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A lab record entry: aim, apparatus, procedure, observations, result, precautions. It's
small, but it proves you did the experiment and understood it. A proof-of-skill build is a
lab record for your portfolio.`,
    notes: `## What it is

A tiny repo or notebook that answers **one question** with **one measured number**,
written up on **one page**. For example:

- "Does a reranker help on my data? Three rerankers on my 120-question golden set."
- "How much would prompt caching save on my agent's real traces?"
- "Can Haiku 4.5 replace Sonnet 5 for my intent classifier? Accuracy and cost on 300
  labelled messages."
- "How many users can one GPU serve for an 8B model with time to first token under 2 s?"

---

## The rules

- One question; one number, or one small table.
- Your real data or systems, wherever possible.
- **Finished:** it runs from a fresh clone with one command.
- **Honest:** n, method, limitations.

---

## The one-page README

1. **Question**
2. **Setup** — data, n, models and versions, date
3. **Method**
4. **Result** — the table
5. **What it cost**
6. **What I'd conclude — and what I wouldn't**

The last line is the one interviewers remember. "With 300 messages I can't separate a
1-point difference" shows you understand measurement.

---

## How to use it

- **In outreach:** a link that answers something the team cares about.
- **In interviews:** "I wondered the same thing, so I measured it."
- **In your gap list:** mark the gap closed, with the link.

---

## Keep it small

Signs it's growing into a project: a UI, a second question, "general support for any
model". Split it into two builds instead.

Small and finished beats big and nearly done — every time.`,
    docs: [],
    glossary: [
      {
        term: 'proof-of-skill build',
        def: 'A small, finished, public build answering one question with one measured number.',
      },
      {
        term: 'n',
        def: 'The number of examples a measurement is based on.',
      },
      {
        term: 'noise',
        def: 'Random variation that can make two equal things look different in a small sample.',
      },
    ],
    check: [
      {
        q: 'What makes a build a proof-of-skill build?',
        a: `One question, one measured number or small table, one page — finished, runnable from a fresh clone, and honest about method and limits.`,
      },
      {
        q: 'What are the six parts of its README?',
        a: 'Question, setup, method, result, cost, and what you\'d conclude and wouldn\'t.',
      },
      {
        q: 'Why include \'what I wouldn\'t conclude\'?',
        a: `It shows you understand the limits of your measurement — for example, a sample too small to separate close results.`,
      },
      {
        q: 'What do you do when a build starts growing?',
        a: 'Split it into two builds, each with one question.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Scope three builds',
        body: `Turn each gap into a one-question build: the question, the data, the number, and what
"done" means.

1. An interviewer asked, "What does a reranker cost you in latency?" You didn't know.
2. Several JDs mention "LLM cost optimisation".
3. Your debriefs keep flagging "judge calibration".`,
        answer: `1. **"What does reranking cost in latency and money on my data, for what recall gain?"**
   Data: the p-3.1 golden set. Numbers: recall@5, p50/p95 added latency, ₹ per query,
   for two or three rerankers and "no reranker". Done: a table, a script, a one-page
   README.
2. **"How much can caching and routing cut my agent's cost per conversation, with
   quality held?"** Data: 200 real traces from p-4.1. Numbers: ₹ per conversation
   before and after each lever; the pass rate on the eval suite. Done: the table, plus
   the one lever that didn't pay.
3. **"How well does my judge agree with me, and what raised it?"** Data: 100 answers you
   label yourself. Numbers: agreement before and after one rubric change (for example,
   asking for a reason before the verdict). Done: the table, confusion counts, and
   the rubric diff.`,
      },
      {
        mode: 'read',
        title: 'Critique this README',
        body: `> # Model comparison
> I compared GPT-style and Claude-style models and found Claude is better for RAG.
> Tested on 12 questions. Claude got 11/12, the other got 9/12. Claude is clearly the
> winner. Code in notebook.ipynb (needs my API keys).

List the problems, and rewrite the result section.`,
        answer: `**Problems:**
1. **Vague question** — "better for RAG" on what data, and measured how?
2. **Tiny n.** 11/12 against 9/12 is two questions' difference; with 12 questions,
   that could easily be noise.
3. **No versions or date** — "Claude-style" isn't a model.
4. **Only accuracy** — no cost or latency.
5. **Not runnable** — it needs *their* keys; there's no \`.env.example\` or instructions.
6. **Overclaims** — "clearly the winner".

**Rewritten result:**

> On 12 questions from my policy corpus (answer correctness, judged by me),
> <model A, version> answered 11 correctly and <model B, version> 9, on <date>. At this
> size the difference isn't meaningful — two questions. Next: extend to 100 questions
> and add cost and p95 latency per answer. To run: copy \`.env.example\` to \`.env\`, add
> your key, \`make run\`.`,
      },
    ],
  },
];
