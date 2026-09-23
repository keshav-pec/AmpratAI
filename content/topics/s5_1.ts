import type { Topic } from '@/lib/types';

export const s5_1: Topic[] = [
  {
    id: 's5.1.t1',
    moduleId: 's5.1',
    title: 'A framework for AI system design',
    outcome: `You can walk any AI system design — in an interview or at work — through eight steps in a fixed order, and know what a good answer covers at each step.`,
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
        query: 'LLM system design interview framework',
        channel: '',
        reason: 'a walkthrough of an AI system design interview',
      },
    ],
    animations: ['anim-ai-system-anatomy'],
    analogy: `A doctor's examination follows the same order every time — history, vitals, examination,
tests, diagnosis — so nothing important gets skipped under pressure. A design framework does
the same for a 40-minute system design round.`,
    notes: `## The eight steps

1. **Requirements** — who uses it, for what, how often, how accurate, how fast, how cheap.
2. **Budgets** — the latency budget and the cost budget. Second, never last.
3. **Model strategy** — which model per task, routing, fallbacks.
4. **Context strategy** — retrieval, memory, the token budget.
5. **Orchestration** — sync or async, queues, streaming, workflow or agent.
6. **Guardrails** — validation, injection defence, moderation, rate limits, tenancy.
7. **Evaluation** — offline suite, online metrics, feedback capture.
8. **Operations** — observability, alerting, rollback, cost caps.

---

## Step 1 in practice: numbers, not adjectives

"Fast" and "accurate" aren't requirements. Ask for — or propose — numbers:

- **Users and volume:** 2,000 employees, ~6,000 questions a day, peaks at 10 a.m.
- **Quality:** answer correct with a citation on ≥ 85% of a golden set; wrong-answer rate
  on unanswerable questions ≤ 5%.
- **Latency:** first words within 1.5 s at p95.
- **Cost:** under ₹1 per question.
- **Constraints:** data stays in India; per-department permissions.

Writing these down in the first five minutes is what separates a design from a diagram.

---

## Steps 3–6: the choices that differ from web design

- **Model strategy:** a small model for classification and routing, a larger one for
  answers, a fallback provider or model for outages (Stage 2).
- **Context strategy:** Stage 3's pipeline — ingestion, chunking, hybrid retrieval,
  reranking, a token budget.
- **Orchestration:** synchronous and streamed for chat; a queue for ingestion and long agent
  runs (next module).
- **Guardrails:** permission-filtered retrieval, injection defences, output checks, rate
  limits per tenant.

---

## Steps 7–8: how you know it works, and keeps working

- **Evaluation:** the golden set in CI, sampled production traces judged daily, thumbs and
  edits captured as feedback.
- **Operations:** traces for every model call, dashboards for cost and latency, alerts, a
  rollback for prompts as well as code, a spend cap.

Interviewers notice when these come up unprompted. Most candidates stop at the architecture
diagram.

---

## Using it in the room

- Say the framework out loud at the start: "I'll go requirements, budgets, then the design,
  then evals and operations."
- Spend roughly: requirements and budgets 8 minutes, design 20, evals and operations 8,
  trade-offs 4.
- Close with **trade-offs you chose** and **what you'd measure first** after launch.`,
    docs: [
      {
        label: 'Anthropic — Building effective agents',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
      {
        label: 'Anthropic — pricing',
        url: 'https://platform.claude.com/docs/en/about-claude/pricing',
      },
    ],
    glossary: [
      {
        term: 'requirements',
        def: 'What the system must do, stated as numbers and constraints.',
      },
      {
        term: 'latency budget',
        def: 'The maximum time allowed, split across the steps of a request.',
      },
      {
        term: 'cost budget',
        def: 'The maximum spend allowed per request or per period.',
      },
      {
        term: 'guardrail',
        def: 'A check or limit that keeps the system within safe and intended behaviour.',
      },
    ],
    check: [
      {
        q: 'List the eight steps in order.',
        a: `Requirements, budgets, model strategy, context strategy, orchestration, guardrails, evaluation, operations.`,
      },
      {
        q: 'Why do budgets come second?',
        a: `Latency and cost limits rule out whole designs; deciding them late means redesigning. They shape every later choice.`,
      },
      {
        q: 'Turn \'it should be accurate\' into a requirement.',
        a: `For example: correct, cited answers on at least 85% of a golden set, and no more than 5% wrong answers on unanswerable questions.`,
      },
      {
        q: 'What do most candidates leave out of AI system designs?',
        a: `Evaluation and operations — how quality is measured and maintained, and how the system is observed, rolled back and capped on cost.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Requirements from a vague brief',
        body: `Brief: "Build an AI assistant that helps our sales team answer customer questions about
our products." Write the requirements as numbers and constraints. State each assumption
you had to make.`,
        answer: `A strong answer, with assumptions marked:

- **Users:** ~150 sales reps (assume), each ~20 questions a day → ~3,000 a day; peaks
  during Indian business hours.
- **Corpus:** product docs, pricing sheets, datasheets — ~2,000 documents (assume),
  updated weekly; pricing changes monthly.
- **Quality:** correct and cited on ≥ 90% of a golden set built with the sales team;
  **pricing answers must come from the current price list** — a wrong price is costly.
- **Latency:** first words ≤ 2 s p95 — reps are often on calls.
- **Cost:** ≤ ₹2 per question (assume), about ₹1.8 lakh a year at this volume.
- **Constraints:** some price lists are confidential per region → permission filters;
  answers are drafts the rep checks, not sent to customers automatically.

Saying the assumptions out loud ("I'll assume 150 reps — tell me if it's more") is exactly
what interviewers want: it shows you design from numbers, and invites correction.`,
      },
      {
        mode: 'read',
        title: 'What\'s missing from this design?',
        body: `A candidate's design for a support chatbot: "React front end → FastAPI → vector DB
(Pinecone) → GPT-style model → answer. Documents are embedded nightly." That's the whole
answer.

List what's missing, by framework step.`,
        answer: `- **Requirements:** no volumes, quality target, latency or cost numbers.
- **Budgets:** none — so no way to judge any choice.
- **Model strategy:** one model for everything; no routing, no fallback when the provider
  is down.
- **Context:** no chunking strategy, no keyword search for order IDs, no reranking, no
  token budget, no handling of conversation history.
- **Orchestration:** no streaming; nightly batch embedding means new articles are
  invisible for up to a day.
- **Guardrails:** no permissions, injection defence, rate limits or escalation to humans.
- **Evaluation:** nothing — no golden set, no feedback, no CI gate.
- **Operations:** no tracing, dashboards, alerts, rollback or spend cap.

The diagram isn't wrong; it's the first 20% of the answer.`,
      },
    ],
  },
  {
    id: 's5.1.t2',
    moduleId: 's5.1',
    title: 'Budgets first',
    outcome: `You can split a latency budget across the steps of a request and build a cost model per request — and use both to accept or reject a design.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Planning a trip with ₹30,000 and four days. Before choosing hotels or trains, you split the
money and the days — and suddenly half the options disappear on their own. Budgets do the
same to system designs.`,
    notes: `## A latency budget, split

Target: **first words within 1.5 s at p95** for a RAG chat. Split it:

| Step | p95 budget |
|---|---|
| auth, request handling | 50 ms |
| router (small model) | 300 ms, **in parallel** with retrieval |
| query embedding | 80 ms |
| hybrid search | 60 ms |
| rerank 30 candidates | 150 ms |
| model: time to first token | 800 ms |
| network and streaming | 100 ms |

Sequential path: 50 + 80 + 60 + 150 + 800 + 100 = **1,240 ms**, with the router hidden in
parallel. The budget holds — just. Now every proposal ("add HyDE", "use a bigger model")
has a price in milliseconds.

---

## p95, not averages

Users remember the slow times. Budget and measure the **95th percentile** (and watch p99):
an average of 900 ms can hide one request in twenty taking 4 seconds.

---

## A cost model per request

Price the request with real prices (Claude Sonnet 5: $2 per million input tokens, $10 per
million output; Haiku 4.5: $1 and $5):

| Part | Tokens | Cost |
|---|---|---|
| router (Haiku 4.5) | 600 in / 10 out | $0.00065 |
| answer (Sonnet 5), input | 2,000 system (cached) + 4,000 context + 300 question | see below |
| answer, output | 350 | $0.0035 |
| embeddings, rerank | — | ~$0.0003 |

Answer input: the 2,000-token system prompt as a cache read ($0.20/M) = $0.0004; the other
4,300 tokens at $2/M = $0.0086. Total ≈ **$0.0135 per question** — about **₹1.2** at ₹88 to
the dollar (use the current rate).

---

## Multiply by volume

6,000 questions a day × ₹1.2 ≈ **₹7,200 a day**, about **₹2.2 lakh a month**. Now the
business can decide whether that's worth it — and you know where the money goes: here,
mostly the retrieved context. Halving it with a better reranker saves more than switching
the router to a cheaper model.

---

## Budgets decide designs

- Agentic multi-step answers at 5 steps × this cost? ~₹6 a question — over budget unless
  the value justifies it.
- Long context instead of RAG over a 250K-token corpus? ~$0.50 a question uncached — out.
- A reranker adding 150 ms? Fits the latency budget; test whether it lets you send fewer
  chunks and save cost too.`,
    docs: [
      {
        label: 'Anthropic — pricing',
        url: 'https://platform.claude.com/docs/en/about-claude/pricing',
      },
      {
        label: 'Anthropic — reducing latency',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency',
      },
    ],
    glossary: [
      {
        term: 'p95',
        def: 'The 95th percentile: 95% of requests are this fast or faster.',
      },
      {
        term: 'sequential path',
        def: 'The steps that must happen one after another; their times add up.',
      },
      {
        term: 'unit economics',
        def: 'Cost (and value) per request or per user, multiplied by volume.',
      },
    ],
    check: [
      {
        q: 'Why budget at p95 instead of the average?',
        a: 'Averages hide the slow tail that users notice; p95 says how slow one request in twenty is.',
      },
      {
        q: 'How does running the router in parallel change the latency budget?',
        a: `Its time overlaps with retrieval instead of adding to the sequential path, so it costs little or no extra latency.`,
      },
      {
        q: 'In the worked cost model, what dominates the cost per question?',
        a: `The retrieved context in the answer model's input — so reducing how much context is sent saves the most.`,
      },
      {
        q: 'What do you need to turn cost per request into a monthly figure?',
        a: 'The volume: requests per day (and peaks), multiplied out over the month.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'A cost-per-request calculator',
        body: `Without AI: write \`request_cost(calls, prices, inr_per_usd)\` where \`calls\` is a list of
dicts like \`{"model": "sonnet-5", "in": 4300, "cached_in": 2000, "out": 350}\` and \`prices\`
maps model → \`{"in", "cache_read", "out"}\` in dollars per million tokens. Return the cost
in rupees. Reproduce the worked example.`,
        answer: `\`\`\`python
PRICES = {
    "haiku-4.5": {"in": 1.0, "cache_read": 0.10, "out": 5.0},
    "sonnet-5":  {"in": 2.0, "cache_read": 0.20, "out": 10.0},
}

def request_cost(calls, prices=PRICES, inr_per_usd=88.0) -> float:
    usd = 0.0
    for c in calls:
        p = prices[c["model"]]
        usd += (c["in"] * p["in"]
                + c.get("cached_in", 0) * p["cache_read"]
                + c["out"] * p["out"]) / 1_000_000
    return round(usd * inr_per_usd, 3)

calls = [
    {"model": "haiku-4.5", "in": 600, "out": 10},                     # router
    {"model": "sonnet-5", "in": 4300, "cached_in": 2000, "out": 350}, # answer
]
print(request_cost(calls))
\`\`\`

Router: $0.00065; answer: $0.0086 + $0.0004 + $0.0035 = $0.0125. Total $0.01315 → about
**₹1.16** (plus a few paise for embeddings and reranking, ≈ ₹1.2).

Put this function in your repo and feed it from real logged usage — then "cost per
request" becomes a measured number per endpoint, not an estimate (Stage 5's dashboards).`,
      },
      {
        mode: 'decision',
        title: 'Does the design fit the budget?',
        body: `Budget: first words ≤ 2 s p95; ≤ ₹3 per request. A proposed design for a contracts Q&A
tool: query rewriting (Haiku, 400 ms) → HyDE (Sonnet, 1.8 s to generate) → hybrid
search (80 ms) → rerank (200 ms) → Sonnet answer (TTFT 900 ms). Does it fit? What would
you change?`,
        answer: `**Latency doesn't fit.** Sequential path: 400 + 1,800 + 80 + 200 + 900 ≈ **3.4 s** to
first words, well over 2 s. HyDE alone uses 90% of the budget, because generating a
hypothetical answer means waiting for the whole generation before searching.

Options:

- **Drop HyDE** unless the eval shows a large gain; contracts are rich in exact terms
  where hybrid search already does well.
- If you keep something like it, use a **small model** with a short max_tokens, and run it
  **in parallel** with the plain search, fusing results with RRF.
- Run the query rewrite in parallel with the first search too, or only for follow-ups.

Without HyDE: 400 + 80 + 200 + 900 ≈ 1.6 s — fits. **Cost** likely fits either way at a
few thousand tokens per call; check it with the calculator.`,
      },
    ],
  },
  {
    id: 's5.1.t3',
    moduleId: 's5.1',
    title: 'How AI system design differs',
    outcome: `You can explain the five ways AI systems differ from classic web systems, and the design habit each one forces.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Designing a restaurant kitchen versus a vending machine. The vending machine gives the same
item every time, instantly, at a fixed cost. The kitchen's dishes vary a little, take
minutes, cost money per plate, depend on suppliers, and can simply taste wrong. You design
kitchens differently.`,
    notes: `## Five differences

| Web systems | AI systems |
|---|---|
| same input → same output | **non-deterministic** output |
| a request costs fractions of a paisa | **each call has a real, variable cost** |
| correct or a bug | **quality is a spectrum** you measure |
| your code, your servers | **a provider you don't control** |
| milliseconds, optimisable | **seconds, with a floor** you can't remove |

---

## The habit each one forces

1. **Non-determinism → evals, not only unit tests.** You measure pass rates over sets of
   cases, and run important checks several times (pass^k).
2. **Cost per call → budgets and caps everywhere.** Cost belongs in design reviews,
   dashboards and alerts — and in abuse prevention (someone can run up your bill).
3. **Quality as a metric → golden sets, judges and feedback.** "Is it good?" becomes a
   number with a trend.
4. **Provider dependency → fallbacks and adapters.** Outages, rate limits, deprecations and
   behaviour changes between model versions are normal events to design for.
5. **A latency floor → streaming and async.** You can't make a model answer in 50 ms, so
   you show progress, stream tokens, and move long work to queues.

---

## What stays the same

Most of the system is still ordinary engineering: databases, queues, auth, caching,
deployment, monitoring. That's good news for you — MERN and backend experience carries
straight over. The AI-specific parts sit **on top** of a normal, well-built service.

---

## A sentence for interviews

*"AI systems are ordinary distributed systems with one unusual dependency: a component
that's slow, costs money per call, varies its output, and whose quality has to be measured
rather than asserted. Most of my design choices follow from that."*`,
    docs: [
      {
        label: 'Anthropic — model deprecations',
        url: 'https://platform.claude.com/docs/en/about-claude/model-deprecations',
      },
    ],
    glossary: [
      {
        term: 'non-determinism',
        def: 'The same input can produce different outputs.',
      },
      {
        term: 'latency floor',
        def: 'A minimum response time you can\'t engineer away.',
      },
      {
        term: 'provider dependency',
        def: 'Relying on an external model service you don\'t control.',
      },
    ],
    check: [
      {
        q: 'Name the five differences between AI and classic web systems.',
        a: `Non-deterministic output, real per-call cost, quality as a measured spectrum, dependence on an external provider, and a latency floor of seconds.`,
      },
      {
        q: 'What design habit does non-determinism force?',
        a: `Evaluating with sets of cases and pass rates (and repeated runs), rather than relying only on unit tests.`,
      },
      {
        q: 'What does provider dependency require you to design for?',
        a: `Outages, rate limits, deprecations and behaviour changes between model versions — with fallbacks and an adapter layer.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Which difference bit them?',
        body: `Match each incident to the difference it comes from, and the habit that would have
prevented it:

1. A model version upgrade made answers 40% longer; costs jumped and the UI overflowed.
2. A bot hammered the public endpoint overnight; the bill was ₹3 lakh by morning.
3. A prompt change passed all unit tests, but users complained answers got worse.
4. The provider had a 40-minute outage; the whole product showed errors.
5. Users abandoned the app because answers took 9 s to appear.`,
        answer: `1. **Provider dependency** (behaviour changes between versions) → pin model versions,
   re-run the eval suite (including output length and cost) before upgrading.
2. **Cost per call** → per-user and per-IP rate limits, spend caps and alerts.
3. **Quality as a metric** → a golden-set eval gate in CI; unit tests can't see quality.
4. **Provider dependency** → a fallback model or provider and graceful degradation
   (Stage 2's fallback chain).
5. **Latency floor** → streaming so words appear in about a second, and a smaller model or
   less context to cut time to first token.`,
      },
      {
        mode: 'spec',
        title: 'A model-upgrade checklist',
        body: `A newer model version is released and your team wants to switch. Write the checklist you
run before, during and after the switch, so that incident 1 above can't happen to you.`,
        answer: `**Before**

- Read the migration notes: removed parameters, changed defaults, new stop reasons,
  tokenizer changes (the same text can cost more tokens on a new model).
- Run the **full eval suite** on the new model: quality per slice, safety gates, output
  length, cost per request and latency — compared side by side with the current model.
- Re-tune prompts if needed; prompts written for one model often need small changes.

**During**

- Ship behind a flag; **canary** a small share of traffic (Module 5).
- Watch cost per request, p95, error rates, thumbs-down rate and output length.

**After**

- Keep the old model ID ready for instant rollback until the new one has run cleanly for
  a week.
- Update the pinned model ID in config, the eval baseline, and the cost model.

Pinning exact model versions (rather than floating aliases) in production is what makes
this a planned change instead of a surprise.`,
      },
    ],
  },
  {
    id: 's5.1.t4',
    moduleId: 's5.1',
    title: 'A worked design, and eight to practise',
    outcome: `You can deliver a complete 40-minute design for enterprise document Q&A, and you have a plan to whiteboard eight AI systems out loud.`,
    minutes: 50,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'RAG system design interview end to end',
        channel: '',
        reason: 'an example of a full AI design walkthrough',
      },
    ],
    animations: [],
    analogy: `Learning to cook from a recipe once, carefully, and then cooking eight different dishes on
your own. The worked design is the recipe; the eight systems are where you actually learn.`,
    notes: `## The brief

"Design a question-answering assistant over a company's internal documents — policies,
contracts, wikis — for 5,000 employees."

---

## 1–2. Requirements and budgets (8 minutes)

- ~15,000 questions a day; 50,000 documents; updates hourly; per-department permissions.
- Quality: ≥ 85% correct and cited on the golden set; ≤ 5% wrong on unanswerable.
- Latency: first words ≤ 1.5 s p95. Cost: ≤ ₹1 per question → ~₹4.5 lakh a month at volume.

---

## 3–5. Design (20 minutes)

- **Ingestion (async):** connectors → queue → workers: parse (layout-aware), clean, chunk
  by structure with heading paths, contextual lines, embed; incremental sync by content
  hash; permissions synced every few minutes.
- **Storage:** Postgres + pgvector + full-text, chunks with tenant, department ACLs, version
  and page metadata; row-level security.
- **Query path (sync, streamed):** router (small model) in parallel with retrieval → hybrid
  search filtered by the user's groups → rerank 50 → 6 chunks → answer with citations →
  stream.
- **Models:** a small model for routing and rewriting; a mid-size model for answers; a
  fallback model for outages.

---

## 6–8. Guardrails, evals, operations (8 minutes)

- **Guardrails:** permission filters in SQL plus RLS; documents framed as data; output
  checked for citations; rate limits per user; no external links rendered.
- **Evals:** a 200-question golden set with department slices, in CI; daily judged samples
  of production traffic; thumbs and edits feed new cases.
- **Operations:** traces per request (retrieval and model spans, tokens, cost); dashboards
  for p95, cost per day, citation rate; alerts; prompt versions with rollback; spend cap.

---

## Trade-offs to volunteer (4 minutes)

- RAG over long context: the corpus is far beyond any window, and permissions need
  filtering per user.
- Hourly sync vs real-time: hourly is cheaper; permission changes get a faster path.
- A reranker costs ~150 ms but lets you send fewer chunks — cheaper and more accurate.
- What I'd measure first after launch: answer rate on unanswerable questions, and p95 at the
  10 a.m. peak.

---

## Your eight systems

Whiteboard each in 40 minutes, out loud, with the framework:

1. Enterprise document Q&A (above) · 2. A support agent (p-4.1) · 3. A code assistant for a
monorepo · 4. Semantic product search for an e-commerce site · 5. A meeting summariser ·
6. Resume ↔ job description matching · 7. Content moderation for a social app · 8. A
personalised email agent.

Record two of them and watch them back. It's uncomfortable and it works.`,
    docs: [
      {
        label: 'Anthropic — Building effective agents',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
      {
        label: 'Anthropic — contextual retrieval',
        url: 'https://www.anthropic.com/engineering/contextual-retrieval',
      },
    ],
    glossary: [
      {
        term: 'system design round',
        def: 'An interview where you design a system out loud, usually in 40–60 minutes.',
      },
      {
        term: 'trade-off',
        def: 'A choice that gains one property at the cost of another.',
      },
      {
        term: 'slice',
        def: 'A subset of an eval set (by department, tenant, query type) reported separately.',
      },
    ],
    check: [
      {
        q: 'Why RAG rather than long context for enterprise document Q&A?',
        a: `The corpus is far larger than any context window, and per-user permissions must be enforced by filtering what's retrieved.`,
      },
      {
        q: 'What runs asynchronously and what synchronously in the worked design?',
        a: `Ingestion (parsing, chunking, embedding, sync) runs asynchronously through queues; the question path runs synchronously and streams the answer.`,
      },
      {
        q: 'Name two trade-offs worth volunteering in the worked design.',
        a: `Hourly sync versus real-time (with a faster path for permissions), and the reranker's ~150 ms against sending fewer, better chunks.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Whiteboard: resume ↔ job matching',
        body: `Take 40 minutes. Design a system that ranks 5,000 resumes against a job description for a
recruiter, explains each ranking, and avoids unfair bias. Use all eight steps. Then compare
with the outline in the answer.`,
        answer: `An outline of a strong answer:

1. **Requirements:** recruiters at ~200 companies (multi-tenant); a JD arrives, ranking
   within 2 minutes (async is fine); explanations per candidate; **no use of protected
   attributes**; auditability.
2. **Budgets:** ranking 5,000 resumes with a large model per resume is expensive — at
   ~3,000 tokens each that's 15M input tokens per JD. So: a cheap first stage, a careful
   second stage.
3. **Models:** embeddings for recall; a small model to extract structured facts from each
   resume once (skills, years, titles) at ingestion; a larger model only for the top ~50,
   to score against the JD's requirements and explain.
4. **Context:** parse resumes to structured profiles once; JD → required and nice-to-have
   criteria (structured outputs, recruiter-editable).
5. **Orchestration:** a job per JD on a queue; progress streamed to the UI; results cached.
6. **Guardrails:** strip names, photos, age, gender and address signals before scoring;
   score only on the job's criteria; tenant isolation; rate limits.
7. **Evals:** agreement with recruiter shortlists on past hires; **fairness checks** —
   compare score distributions across groups on a labelled audit set; explanation
   faithfulness (claims supported by the resume).
8. **Ops:** audit log of every ranking and its criteria; cost per JD; drift monitoring.

Trade-offs: explanations make decisions reviewable but cost more; structured extraction
at ingestion makes ranking cheap and consistent. (This is close to the Stage 6 capstone —
practising it now pays twice.)`,
      },
      {
        mode: 'tool',
        title: 'Record one design',
        body: `Pick system 4 (semantic product search) or 7 (content moderation). Set a 40-minute timer,
talk through the eight steps out loud while drawing, and record it. Watch it back and
write down three things to improve.`,
        answer: `What people usually notice when they watch themselves back:

- **Diving into architecture before numbers** — the first five minutes had no volume,
  latency or cost figures.
- **Silence while thinking** — say what you're weighing ("I'm choosing between a
  classifier and a model call here because…"). Interviewers grade reasoning they can hear.
- **No evals or operations** until asked — or at all.
- **Running out of time** on one component; the timer split (8 / 20 / 8 / 4) fixes it.

For product search specifically, strong answers mention hybrid search (exact SKUs and
brand names), query understanding (filters like "under ₹2,000"), latency under ~300 ms
(search is interactive, so no large model in the hot path), and click-through and
conversion as the online metrics. For moderation: precision/recall trade-offs per policy
category, human review queues, appeals, and adversarial users.`,
      },
    ],
  },
];
