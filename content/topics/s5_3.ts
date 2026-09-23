import type { Topic } from '@/lib/types';

export const s5_3: Topic[] = [
  {
    id: 's5.3.t1',
    moduleId: 's5.3',
    title: 'The cache ladder',
    outcome: `You can place five kinds of cache in an AI system, say what each saves and what each risks, and build cache keys that can't serve the wrong answer to the wrong user.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-cache-tiers'],
    analogy: `A kitchen that preps ingredients in the morning, keeps popular sauces ready, and remembers
that table 4 always orders the same thing. Each shortcut saves time — and each one, used
carelessly, serves yesterday's sauce or table 4's order to table 7.`,
    notes: `## Five rungs

| Cache | Stores | Saves | Main risk |
|---|---|---|---|
| **CDN / static** | pages, assets, public answers | everything, for anonymous content | serving private content publicly |
| **Exact-match response** | answer for an identical request | the whole model call | stale answers; wrong user |
| **Provider prompt cache** | the processed prompt prefix | ~90% of repeated input cost, and time | none to correctness — only cost if misused |
| **Semantic** | answer for a *similar* question | the whole call | **false hits**: a similar question with a different answer |
| **Embedding** | vectors by content hash | re-embedding cost | wrong model/version mixed in |

---

## The keys are the design

A cache is only correct if its key includes **everything that changes the answer**:

- model and **prompt version**
- the **permission scope** — tenant and the user's groups (Stage 3's leak)
- the **index or document version** the answer came from
- relevant parameters (language, output format)

\`\`\`python
key = sha256(json.dumps({
    "q": normalise(question), "model": MODEL, "prompt": PROMPT_VERSION,
    "tenant": tenant_id, "groups": sorted(groups), "index": INDEX_VERSION,
}, sort_keys=True).encode()).hexdigest()
\`\`\`

Bump \`INDEX_VERSION\` when documents change, and old entries simply stop matching.

---

## What's worth caching

- **High repetition, low personalisation:** FAQs, policy questions, product descriptions.
- **Not:** anything depending on live data (order status), or on the individual user
  beyond their permissions.

Measure the **hit rate** per endpoint before and after. A cache with a 2% hit rate is mostly
cost and risk.

---

## Provider prompt caching: the free rung

The one rung with **no correctness risk**: the provider caches the processed prefix, and the
answer is computed fresh every time. Stable system prompts and tool definitions first,
cache breakpoints set, and a long, repeated prefix gets cheap and faster. Always do this one.

---

## Order of adoption

1. Provider prompt caching — safe, immediate.
2. Embedding cache — safe, saves ingestion cost.
3. Exact-match response cache — for repetitive endpoints, with careful keys.
4. Semantic cache — only with measured false-hit rates (next topic).`,
    docs: [
      {
        label: 'Anthropic — prompt caching',
        url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      },
    ],
    glossary: [
      {
        term: 'cache hit rate',
        def: 'The share of requests answered from a cache.',
      },
      {
        term: 'cache key',
        def: 'The value that identifies a cached entry; it must include everything that changes the answer.',
      },
      {
        term: 'TTL',
        def: 'Time to live: how long a cached entry stays valid.',
      },
      {
        term: 'invalidation',
        def: 'Making cached entries stop being used when their source changes.',
      },
    ],
    check: [
      {
        q: 'Which cache rung has no correctness risk, and why?',
        a: `Provider prompt caching: it only caches the processed prompt prefix, and every answer is still generated fresh.`,
      },
      {
        q: 'What must a response-cache key include beyond the question?',
        a: `Model and prompt version, the permission scope (tenant and groups), the index or document version, and relevant parameters.`,
      },
      {
        q: 'How do you invalidate cached answers when documents change?',
        a: 'Include an index version in the key and bump it when documents change, so old entries stop matching.',
      },
      {
        q: 'What kind of traffic is worth caching?',
        a: `Highly repetitive, low-personalisation requests like FAQs — not answers that depend on live data or the individual user.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Find the cache bugs',
        body: `\`\`\`python
key = hashlib.md5(question.lower().encode()).hexdigest()
if (hit := await redis.get(key)):
    return json.loads(hit)
answer = await rag_answer(question, user)
await redis.set(key, json.dumps(answer))
\`\`\`

This caches answers for a multi-tenant HR assistant. List every bug.`,
        answer: `1. **No tenant or permission scope in the key** — one company's (or department's)
   answer is served to another. A data leak.
2. **No model or prompt version** — after a prompt fix, old (wrong) answers keep being
   served until something evicts them.
3. **No index version and no TTL** — policies change, cached answers never do.
4. **Caching personal answers** — \`rag_answer(question, user)\` may use user-specific data
   ("your leave balance"), which must never be shared.
5. Only \`lower()\` as normalisation — fine to start, but "What's the notice period?" and
   "what is the notice period" miss each other.

(MD5 is fine for a cache key; it's the missing fields that hurt.) Fix: key on question +
model + prompt version + tenant + sorted groups + index version; set a TTL; skip the cache
for routes that use personal data.`,
      },
      {
        mode: 'tool',
        title: 'Measure the rungs',
        body: `Replay a day of logged questions (or 1,000 realistic ones) through p-3.1 with: provider
prompt caching on, an exact-match cache, and neither. Record hit rates, cost per question
and p95 for each.`,
        answer: `Expected shape:

| Setup | hit rate | cost / question | p95 |
|---|---|---|---|
| no caching | — | baseline | baseline |
| prompt caching | cache reads on nearly every call | clearly lower (system prompt + tools cached) | slightly lower |
| + exact-match | depends on repetition (often 5–30% for FAQ-like traffic) | lower again on hits | hits return in milliseconds |

Report the **exact-match hit rate honestly** — real users phrase things differently, so it
is often lower than hoped. That number is what justifies (or rules out) building a
semantic cache next.`,
      },
    ],
  },
  {
    id: 's5.3.t2',
    moduleId: 's5.3',
    title: 'Semantic caching, properly',
    outcome: `You can build a semantic cache, measure its false-hit rate on labelled pairs, choose a threshold from the data, and add guards so similar-but-different questions never share an answer.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A shop assistant who's heard "do you have this in blue?" a hundred times answers instantly.
Useful — until someone asks "do you have this in blue, size M?" and gets the same instant
"yes" that applied to size L.`,
    notes: `## How it works

1. Embed the incoming question.
2. Find the nearest **previously answered** question (in the same scope).
3. If similarity is above a **threshold**, return the stored answer. Otherwise answer
   normally and store it.

\`\`\`sql
SELECT answer, 1 - (q_embedding <=> $1) AS sim
FROM semantic_cache
WHERE scope_key = $2 AND index_version = $3
ORDER BY q_embedding <=> $1
LIMIT 1;
\`\`\`

---

## The false-hit problem

Embeddings measure **topical** similarity. These pairs can look nearly identical to a
vector:

- "How do I **cancel** my order?" / "How do I **not** cancel my order by mistake?"
- "Refund policy in **Pune**" / "Refund policy in **Chennai**"
- "Leave for **probation** employees" / "Leave for **permanent** employees"
- "Is ₹**5,000** refundable?" / "Is ₹**50,000** refundable?"

A false hit isn't a slow answer — it's a **confidently wrong** one, with no model call to
catch it.

---

## Choose the threshold from data

Label 200+ pairs of real questions: **same answer** or **different answer**. Then, for each
candidate threshold, measure:

- **hit rate** — how often the cache would answer
- **false-hit rate** — of those hits, how many pairs actually needed different answers

Pick the threshold where false hits are acceptably rare for your domain — for HR or money
questions, very rare. That's usually much stricter than tutorials suggest.

---

## Guards on top of the threshold

- **Entity match:** numbers, IDs, places and dates in the two questions must match exactly.
- **Negation check:** "not", "don't", "never" present in one but not the other → miss.
- **Scope:** same tenant, same permission groups, same index version.
- **Only cache cacheable routes:** no personal data, no live data.

---

## Is it worth it?

Semantic caching pays when traffic is **highly repetitive with varied phrasing** — public
FAQs, product questions. For an internal assistant with 200 users, the hit rate at a safe
threshold is often small. Measure hit rate × saving against the false-hit risk before
shipping it.`,
    docs: [
      {
        label: 'pgvector README',
        url: 'https://github.com/pgvector/pgvector',
      },
      {
        label: 'Anthropic — embeddings',
        url: 'https://platform.claude.com/docs/en/build-with-claude/embeddings',
      },
    ],
    glossary: [
      {
        term: 'semantic cache',
        def: 'A cache that reuses answers for questions whose embeddings are similar enough.',
      },
      {
        term: 'false hit',
        def: 'Returning a cached answer for a question that needed a different one.',
      },
      {
        term: 'threshold',
        def: 'The minimum similarity at which the cache counts two questions as the same.',
      },
    ],
    check: [
      {
        q: 'Why are false hits worse than misses?',
        a: `A miss costs a normal model call; a false hit returns a confidently wrong answer with no model call to catch it.`,
      },
      {
        q: 'How do you choose a semantic-cache threshold?',
        a: `From labelled question pairs: measure hit rate and false-hit rate at each threshold, and pick one where false hits are acceptably rare for the domain.`,
      },
      {
        q: 'Name two guards besides the similarity threshold.',
        a: `Exact matching of entities like numbers, IDs, places and dates; a negation check; plus scoping by tenant, permissions and index version.`,
      },
      {
        q: 'When does a semantic cache pay off?',
        a: 'When traffic is highly repetitive with varied phrasing and answers aren\'t personal or live.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'The entity and negation guard',
        body: `Without AI: write \`compatible(q1: str, q2: str) -> bool\` that returns False if the two
questions contain different numbers (including ₹ amounts with commas), different
ALL-CAPS codes like \`ORD-10492\`, or if one contains a negation word (not, no, don't,
never, without) and the other doesn't.`,
        answer: `\`\`\`python
import re

NEGATIONS = {"not", "no", "don't", "dont", "never", "without", "isn't", "can't", "cannot"}

def _numbers(q: str) -> set[str]:
    return {n.replace(",", "") for n in re.findall(r"\\d[\\d,]*(?:\\.\\d+)?", q)}

def _codes(q: str) -> set[str]:
    return set(re.findall(r"\\b[A-Z]{2,}-?\\d+\\b", q))

def _negated(q: str) -> bool:
    return bool(NEGATIONS & set(re.findall(r"[a-z']+", q.lower())))

def compatible(q1: str, q2: str) -> bool:
    return (_numbers(q1) == _numbers(q2)
            and _codes(q1) == _codes(q2)
            and _negated(q1) == _negated(q2))

assert not compatible("Is ₹5,000 refundable?", "Is ₹50,000 refundable?")
assert not compatible("How do I cancel?", "How do I not cancel by mistake?")
assert compatible("What's the notice period?", "what is the notice period")
\`\`\`

It's deliberately conservative: when in doubt, it says "incompatible" and the question
goes to the model. Places ("Pune" vs "Chennai") need a list of known entities from your
domain — a small gazetteer of offices or products — added the same way.`,
      },
      {
        mode: 'tool',
        title: 'Pick a threshold from data',
        body: `Build 200 labelled question pairs from your logs (same answer / different answer), with
at least 50 "tricky" pairs that differ by a number, place or negation. Embed them and
compute hit rate and false-hit rate at thresholds 0.85, 0.90, 0.93, 0.95 and 0.97 —
with and without the guard.`,
        answer: `Your table:

| threshold | hit rate | false-hit rate | false-hit rate with guard |
|---|---|---|---|
| 0.85 | | | |
| 0.90 | | | |
| … | | | |

What people typically find: at loose thresholds the false-hit rate is alarming — the
tricky pairs sit at very high similarity; tightening the threshold cuts hits much faster
than it cuts false hits for those pairs; the **guard** removes most of the dangerous ones
at any threshold.

The decision is then explicit: "At 0.93 with the guard: 18% hit rate, 0.5% false hits,
all on low-stakes FAQ questions — shipped for the public FAQ route only." Or: "Hit rate
too low to be worth the risk — not shipped." Both are good outcomes.`,
      },
    ],
  },
  {
    id: 's5.3.t3',
    moduleId: 's5.3',
    title: 'Model routing',
    outcome: `You can route requests between a cheap and a strong model — by a classifier or a cascade — and measure exactly what quality you trade for the savings.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-model-routing'],
    analogy: `A hospital doesn't send every patient to the senior specialist. A nurse handles most cases,
and escalates the complicated ones. It works because the nurse is good at the common cases,
and because escalation is reliable.`,
    notes: `## The price gap

Current prices per million tokens (input / output): Claude Haiku 4.5 $1 / $5, Sonnet 5
$2 / $10, Opus 5 $5 / $25. For a request with 5,000 input and 400 output tokens:

- Haiku 4.5: 5,000 × $1/M + 400 × $5/M = **$0.007**
- Sonnet 5: 5,000 × $2/M + 400 × $10/M = **$0.014**

Twice the price — and far more between the smallest and largest models. If most traffic is
easy, routing it to the cheaper model saves real money.

---

## Two designs

**Classifier router** — decide up front:

- a small model (or rules) labels the request easy / hard
- easy → cheap model; hard → strong model
- one call per request, plus a tiny classification call

**Cascade** — try cheap first:

- the cheap model answers; a **check** decides whether it's good enough (validation passes,
  a citation exists, confidence is high)
- if not, escalate to the strong model
- escalated requests pay for both, and wait longer

---

## The arithmetic

- Router, 70% to Haiku: 0.7 × $0.007 + 0.3 × $0.014 = **$0.0091** — 35% less than all-Sonnet.
- Cascade with 25% escalated: $0.007 + 0.25 × $0.014 = **$0.0105** — 25% less, with slower
  escalations.

The cascade saves less, but its check sees the actual answer — often more accurate routing.

---

## Measure the quality you trade

Run the golden set through each route:

- quality of the cheap model **on the traffic it would get** (not on everything)
- the router's mistakes: hard questions sent to the cheap model
- overall quality, cost and p95 for: all-strong, all-cheap, router, cascade

The deciding question: *how much quality do we give up for how much money?* Answer it with
a table, not a feeling — and re-check it when either model changes.

---

## Simple wins first

Before a learned router, the obvious splits: small models for classification, extraction,
routing and rewriting; the strong model only for final answers. That alone often captures
most of the savings.`,
    docs: [
      {
        label: 'Anthropic — models overview',
        url: 'https://platform.claude.com/docs/en/models/overview',
      },
      {
        label: 'Anthropic — pricing',
        url: 'https://platform.claude.com/docs/en/about-claude/pricing',
      },
    ],
    glossary: [
      {
        term: 'model routing',
        def: 'Sending each request to a model chosen for its difficulty and cost.',
      },
      {
        term: 'cascade',
        def: 'Trying a cheap model first and escalating to a stronger one when a check fails.',
      },
      {
        term: 'escalation rate',
        def: 'The share of requests a cascade passes on to the stronger model.',
      },
    ],
    check: [
      {
        q: 'What\'s the difference between a classifier router and a cascade?',
        a: `A router decides the model up front; a cascade tries the cheap model first and escalates if a check on its answer fails.`,
      },
      {
        q: 'Why can a cascade route more accurately than a classifier?',
        a: 'Its check looks at the actual answer, not just the question\'s apparent difficulty.',
      },
      {
        q: 'What does a cascade cost on escalated requests?',
        a: 'Both model calls, plus extra latency.',
      },
      {
        q: 'How should the cheap model\'s quality be measured for routing?',
        a: 'On the traffic the router would actually send it, using the golden set — not on all traffic.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Compare the routing strategies',
        body: `Without AI: \`strategy_cost(share_cheap, escalate, c_cheap, c_strong, c_router=0.0)\`
returns the average cost per request for a router (\`escalate=None\`) or a cascade
(\`share_cheap\` ignored, all requests try cheap first, \`escalate\` share goes to strong).
Reproduce the slide's numbers, then add a $0.0007 router call.`,
        answer: `\`\`\`python
def strategy_cost(share_cheap, escalate, c_cheap, c_strong, c_router=0.0):
    if escalate is None:                                  # classifier router
        return c_router + share_cheap * c_cheap + (1 - share_cheap) * c_strong
    return c_cheap + escalate * c_strong                  # cascade

print(strategy_cost(0.7, None, 0.007, 0.014))             # 0.0091
print(strategy_cost(None, 0.25, 0.007, 0.014))            # 0.0105
print(strategy_cost(0.7, None, 0.007, 0.014, 0.0007))     # 0.0098
\`\`\`

With the router's own call included, the router costs $0.0098 — still 30% under
all-Sonnet ($0.014). The break-even for the cascade: it only beats all-strong while
\`c_cheap + escalate × c_strong < c_strong\`, i.e. escalation below 50% here. If the cheap
model fails half the time, the cascade costs *more* than just using the strong model.`,
      },
      {
        mode: 'tool',
        title: 'Route your RAG answers',
        body: `On p-3.1: build a cascade where Haiku 4.5 answers first and escalates to a stronger model
if (a) the answer has no valid citation or (b) your faithfulness judge fails it. Run the
golden set and compare all-Haiku, all-strong and the cascade on quality, cost and p95.`,
        answer: `A typical result:

| Setup | quality | cost / question | p95 |
|---|---|---|---|
| all Haiku 4.5 | lower on hard questions | lowest | lowest |
| all strong | highest | highest | medium |
| cascade | close to all-strong | between the two | higher on escalated questions |

Things to look at: the **escalation rate** (if it's above ~50%, the cascade costs more
than it saves); **which questions escalate** (often multi-part and comparison questions —
maybe the router should send those straight to the strong model); and whether the check
itself adds latency (a judge call on every answer does). Report the trade as one
sentence with numbers: "the cascade keeps 97% of the quality at 62% of the cost".`,
      },
    ],
  },
  {
    id: 's5.3.t4',
    moduleId: 's5.3',
    title: 'Unit economics and budget guards',
    outcome: `You can compute cost per request, per user and per month against revenue, attribute cost to features and tenants, and put guards in place that stop a runaway bill within minutes.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A restaurant knows its food cost per plate and its price per plate. If a dish costs more to
make than it sells for, selling more of it makes things worse. AI features have a cost per
plate too — and some users order a lot of plates.`,
    notes: `## From request to business

- **Cost per request:** measured from logged usage (topic from Module 1).
- **Cost per user per month:** requests per user × cost per request — look at the
  distribution, not the average: a few heavy users often cost more than the rest together.
- **Against revenue:** a ₹499/month plan with heavy users costing ₹900/month in model calls
  loses money on exactly the users who love it most.

Know these numbers before pricing decisions, not after the invoice.

---

## Attribute every rupee

Tag each model call with **feature**, **tenant** and **prompt version**, and log its cost.
Then you can answer:

- which feature costs most (often not the one you'd guess)
- which tenant is unprofitable
- what a prompt change did to cost per request

The same tags drive the dashboards in the next module.

---

## Guards, from soft to hard

1. **Per-tenant quotas** — a monthly budget in tokens or rupees per plan; warn at 80%,
   degrade or stop at 100%.
2. **Rate limits** (last module) — bursts can't run up the bill.
3. **Alerts** — daily spend at 50%, 80%, 100% of plan; cost per request up 30% day on day.
4. **Kill switches** — a feature flag that turns an expensive feature off (or onto a
   cheaper model) instantly, without a deploy.
5. **Provider spend limits** — a monthly cap in the provider's console (per organisation or
   workspace): the last line of defence. When reached, requests fail with a clear error, so
   your fallback path must handle it.

---

## Degrade before you fail

When a budget runs low, prefer a worse-but-working product:

- switch to a cheaper model for non-critical routes
- shorten answers, reduce retrieved context
- pause background jobs (evals, re-embedding) before user-facing traffic

Plan these steps in advance and wire them to flags; a 2 a.m. spend incident is not the
time to design them.`,
    docs: [
      {
        label: 'Anthropic — rate limits and spend limits',
        url: 'https://platform.claude.com/docs/en/api/rate-limits',
      },
      {
        label: 'Anthropic — pricing',
        url: 'https://platform.claude.com/docs/en/about-claude/pricing',
      },
    ],
    glossary: [
      {
        term: 'unit economics',
        def: 'Cost and revenue per unit — per request, per user — multiplied by volume.',
      },
      {
        term: 'cost attribution',
        def: 'Tagging costs by feature, tenant and version so you know where money goes.',
      },
      {
        term: 'quota',
        def: 'A budget of usage allowed per tenant or user per period.',
      },
      {
        term: 'kill switch',
        def: 'A runtime flag that instantly disables or downgrades a feature.',
      },
    ],
    check: [
      {
        q: 'Why look at the distribution of cost per user rather than the average?',
        a: `A few heavy users often cost more than everyone else together, and can make a plan unprofitable even when the average looks fine.`,
      },
      {
        q: 'What three tags make cost attributable?',
        a: 'Feature, tenant and prompt version on every model call.',
      },
      {
        q: 'What is a kill switch here?',
        a: `A feature flag that turns an expensive feature off or onto a cheaper model instantly, without deploying.`,
      },
      {
        q: 'What\'s the provider spend limit\'s role?',
        a: `The last line of defence: a hard monthly cap, after which requests fail — so your fallback path must handle it.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Is this plan profitable?',
        body: `A study app charges ₹299/month. Usage: median student 60 questions a month, the top 5%
of students 1,500 a month. Each question costs about ₹1.4 in model calls. Payment fees
and infrastructure take ₹60 per user. Is the plan profitable, and what would you change?`,
        answer: `Per user per month:

- **Median:** 60 × ₹1.4 = ₹84 + ₹60 = ₹144 → **₹155 profit**.
- **Top 5%:** 1,500 × ₹1.4 = ₹2,100 + ₹60 = ₹2,160 → **₹1,861 loss** each.

Blended (assume the other 95% average ~₹100 in model costs): 0.95 × (₹100 + ₹60) +
0.05 × ₹2,160 ≈ ₹152 + ₹108 = **₹260** cost per user against ₹299 — a thin margin, and one
viral month away from a loss.

Changes, in order: a **fair-use quota** (e.g. 500 questions/month, then a slower cheaper
model); **caching** for repeated textbook questions; **routing** easy questions to a small
model; and a **higher tier** for heavy users. Then re-run the numbers — they are the
product decision.`,
      },
      {
        mode: 'spec',
        title: 'Spec the spend guards',
        body: `Spec the budget guards for p-5.1: per-tenant monthly budgets, the alert thresholds and
channels, the kill switches (which features, what they fall back to), and how the app
behaves when the provider's spend limit is hit. Have AI implement the budget check and
the flags.`,
        answer: `Spec essentials:

- **Metering:** every model call logs \`tenant, feature, prompt_version, model, tokens,
  cost_inr\`; a materialised daily view per tenant and feature.
- **Tenant budgets:** plan-based monthly ₹ caps; check before each call (cached
  month-to-date spend, refreshed every minute); at 80% email the admin; at 100% switch
  to the "economy" route (cheaper model, shorter answers) or block with a clear message,
  per plan.
- **Global alerts:** daily spend vs forecast at 50/80/100% to Slack; cost per request up
  30% day on day → alert with the top feature by change.
- **Kill switches:** flags \`feature.deep_research.enabled\`, \`answers.model_tier\`,
  \`jobs.background.enabled\` — changeable at runtime without a deploy.
- **Provider cap reached:** the spend-limit error is caught as its own case; user-facing
  routes show "temporarily limited", background jobs pause, and on-call is paged.

Test: simulate a tenant crossing 80% and 100% and assert the email, the route switch and
the block happen as specified.`,
      },
    ],
  },
  {
    id: 's5.3.t5',
    moduleId: 's5.3',
    title: 'Latency work',
    outcome: `You can find where a slow AI request spends its time and cut it — streaming, parallelism, smaller prompts and outputs, caching and faster models — measuring p95 before and after.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Cutting a commute: you don't drive faster, you leave at a better time, skip the jammed road,
and run two errands on the way instead of two trips. Most latency wins in AI systems are the
same — rearranging and removing work, not speeding it up.`,
    notes: `## Measure first

Two numbers matter:

- **Time to first token (TTFT)** — how long before the user sees anything.
- **Total time** — when the answer is complete.

Trace one slow request end to end (next module) and write the time per step. The biggest
step is where to start — and it's often not the model.

---

## The toolbox

1. **Stream.** TTFT, not total time, is what users feel.
2. **Parallelise** independent steps: routing, retrieval and history loading at once.
3. **Trim the prompt.** Input tokens take time to process; fewer, better chunks help both
   cost and TTFT.
4. **Shorten the output.** Output tokens are generated one by one: a 600-token answer takes
   roughly twice as long as a 300-token one. Ask for concise formats; set \`max_tokens\`.
5. **Cache.** Prompt caching means long, repeated prefixes don't have to be processed again;
   response caching skips the call entirely.
6. **Faster models for sub-steps.** A small model for routing, rewriting and extraction.
7. **Lower effort** where depth isn't needed — fewer thinking and tool steps on recent models.
8. **Prefetch.** Start work you'll probably need (retrieval for the likely next question, a
   warm connection) before it's asked for.

---

## A worked cut

Before: embed 90 ms → search 70 → rerank 50 chunks 260 → answer TTFT 1,400 (12,000-token
prompt) → total TTFT ≈ **1.8 s**.

After: rerank only 30 chunks (160 ms), send 5 chunks instead of 12 (prompt 6,000 tokens,
TTFT ~900 ms), cache the 2,000-token system prompt, router in parallel → ≈ **1.2 s**, and
cheaper too.

---

## Guard the win

Latency regresses quietly: a new tool, a longer prompt, a bigger model. Put **p95 per
endpoint** on a dashboard with an alert, and include latency in the CI eval report so a
change that makes answers 40% slower is visible before it ships.`,
    docs: [
      {
        label: 'Anthropic — reducing latency',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency',
      },
      {
        label: 'Anthropic — prompt caching',
        url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      },
      {
        label: 'Anthropic — effort',
        url: 'https://platform.claude.com/docs/en/build-with-claude/effort',
      },
    ],
    glossary: [
      {
        term: 'TTFT',
        def: 'Time to first token: how long until the first words appear.',
      },
      {
        term: 'tail latency',
        def: 'The slowest requests — p95, p99 — which users remember.',
      },
      {
        term: 'prefetching',
        def: 'Starting work you\'ll probably need before it\'s requested.',
      },
    ],
    check: [
      {
        q: 'Which two latency numbers matter for AI requests?',
        a: 'Time to first token (what users feel) and total time to complete the answer.',
      },
      {
        q: 'Why does shortening the output reduce latency roughly proportionally?',
        a: 'Output tokens are generated one after another, so twice as many tokens takes roughly twice as long.',
      },
      {
        q: 'Name three ways to cut time to first token.',
        a: `Stream, trim the prompt (fewer and better chunks), parallelise independent steps, cache long prefixes, use faster models for sub-steps.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Cut your p95 by a third',
        body: `Trace 50 requests to p-3.1 and build a table of median and p95 time per step. Make three
changes from the toolbox, one at a time, and measure TTFT p95 after each. Stop when
you've cut it by a third — or explain why you couldn't.`,
        answer: `Typical findings, in order of payoff:

1. **Too much context** — sending 10–15 chunks when 5 reranked chunks score the same on
   the golden set. Cutting it lowers TTFT and cost together.
2. **Sequential steps that could overlap** — history loading, routing and retrieval run
   one after another; \`asyncio.gather\` removes a few hundred milliseconds.
3. **No prompt caching** on a long system prompt and tool list.
4. **Reranking too many candidates** — 100 → 30 often loses nothing measurable.

Keep a before/after table with the golden-set score next to each change, so every
latency win is shown not to cost quality. That table is a p-5.1 deliverable.`,
      },
      {
        mode: 'read',
        title: 'Why did p95 get worse?',
        body: `After a release, median TTFT is unchanged at 900 ms but p95 went from 1.6 s to 4.2 s.
The release added a tool that looks up customer history, and a longer system prompt.
Where would you look?`,
        answer: `A worse **tail** with an unchanged **median** means *some* requests got much slower, not
all:

- **The new tool**: called only on some requests, and slow on some of those (a slow query
  for customers with long histories?). Check the tool's own p95 in traces.
- **An extra model round trip**: requests that use the tool need tool call → result →
  second model call, adding a full model latency — which shows up only in the tail.
- **The longer system prompt**: if it broke prompt caching (a changed prefix), cold
  calls get slower — but that would move the median too, so it's less likely the main
  cause.

Fix the tool's slow cases (index, limit, cache), and consider fetching customer history
in parallel **before** the model call when it's usually needed, instead of as a tool.`,
      },
    ],
  },
];
