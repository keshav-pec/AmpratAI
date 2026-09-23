import type { Topic } from '@/lib/types';

export const s5_5: Topic[] = [
  {
    id: 's5.5.t1',
    moduleId: 's5.5',
    title: 'Offline suites, versioned and sliced',
    outcome: `You can organise evals per feature, version the datasets like code, report results per slice, and keep a held-out set honest.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A school doesn't grade students on one giant average — it reports per subject, and keeps the
final exam paper secret until exam day. Eval suites work best the same way: per feature,
per slice, with a part you don't tune against.`,
    notes: `## One suite per feature

An AI product is several AI features, each with its own suite:

| Feature | Suite checks |
|---|---|
| router | the right route per message (confusion table) |
| retrieval | recall@k, MRR on the golden set |
| answers | faithfulness, correctness, citations, declining |
| extraction | field-level accuracy against labelled documents |
| agent | scenario pass rate, safety gates, pass^k |

Each runs on its own, so a regression points at one component.

---

## Datasets are code

- Stored in the repo (JSONL), or in your eval tool with **version IDs**.
- Every change reviewed like code: added cases, removed cases, **changed labels**.
- Each result records the **dataset version** it ran on. A score from dataset v7 and one
  from v9 aren't comparable.
- A short changelog: "v9: +40 Hinglish questions from production feedback."

---

## Slice everything

Report every metric per slice as well as overall:

- **tenant** or department
- **document type** (policy, contract, FAQ, table)
- **query type** (lookup, comparison, exception, unanswerable)
- **language** (English, Hindi, Hinglish)

A change that lifts the average by 2 points while dropping Hinglish questions by 15 is a
regression for your Hinglish users. Only slices show it.

---

## Keep a held-out set

If you tune prompts against the same questions you report on, scores climb while real
quality doesn't. Split:

- **dev** — what you iterate on
- **held-out** — run rarely, for release decisions only

When held-out scores lag dev scores more and more, you're fitting the dev set.`,
    docs: [
      {
        label: 'Anthropic — building evals',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'eval suite',
        def: 'A set of eval cases and checks for one feature.',
      },
      {
        term: 'dataset version',
        def: 'An identifier for an exact set of eval cases and labels.',
      },
      {
        term: 'slice',
        def: 'A subset of eval results reported separately — by tenant, type or language.',
      },
      {
        term: 'held-out set',
        def: 'Eval cases kept aside from tuning and used only for release decisions.',
      },
    ],
    check: [
      {
        q: 'Why run a separate suite per AI feature?',
        a: `So a regression points at one component — router, retrieval, answers, extraction or agent — rather than a single blended number.`,
      },
      {
        q: 'Why must results record the dataset version?',
        a: `Scores from different dataset versions aren't comparable; without the version, a change in the data looks like a change in the system.`,
      },
      {
        q: 'What can slicing reveal that an average hides?',
        a: 'A drop in one group — a tenant, document type or language — masked by gains elsewhere.',
      },
      {
        q: 'What\'s the held-out set for?',
        a: 'Release decisions; you don\'t tune against it, so it shows whether gains on the dev set are real.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Slice your RAG results',
        body: `Tag every golden-set question in p-3.1 with document type, query type and language. Extend
your eval report to print each metric per slice, with the number of questions in each.
Find the weakest slice.`,
        answer: `A typical report:

\`\`\`text
overall           n=160  recall@5 0.84  faithful 0.91
doc=table         n=22   recall@5 0.64  faithful 0.86
query=comparison  n=14   recall@5 0.57  faithful 0.93
lang=hinglish     n=18   recall@5 0.72  faithful 0.89
query=unanswer.   n=16   declined correctly 0.81
\`\`\`

Two habits: always show **n** (a slice of 6 questions can swing 17 points on one
question), and pick the next piece of work from the weakest slice with a meaningful n —
here tables or comparisons, which point at parsing and at query decomposition. That's
how evals choose the roadmap.`,
      },
      {
        mode: 'decision',
        title: 'Is this a regression?',
        body: `v2 vs v1 on dataset v9 (dev): overall faithfulness 0.91 → 0.93. Slices: English 0.93 →
0.95 (n=120), Hinglish 0.88 → 0.79 (n=24), tables 0.86 → 0.87 (n=22). Held-out: 0.90 →
0.90. Ship v2?`,
        answer: `**Not as is.** The overall gain is driven by English, while Hinglish dropped 9 points —
on 24 questions that's about two answers, so check whether it's real: read the Hinglish
failures in v2, and run the slice several times to see the noise.

The held-out score not moving (0.90 → 0.90) also suggests the dev-set gain may partly be
tuning to the dev set.

Options: fix the Hinglish regression (often a prompt instruction that assumed English
input), or ship v2 only to English traffic via the router. Either way, add more Hinglish
cases so that slice's n is large enough to trust.`,
      },
    ],
  },
  {
    id: 's5.5.t2',
    moduleId: 's5.5',
    title: 'Assertions before judges',
    outcome: `You can cover most regressions with fast, deterministic assertions — schemas, facts, citations, formats, tool sequences — and save model judges for what code can't check.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A factory checks a part's size with a gauge before a person inspects its finish. The gauge
is instant, never tired, never inconsistent. Code assertions are the gauge; model judges are
the inspector — valuable, slower, and needed only for what a gauge can't measure.`,
    notes: `## What code can check

| Assertion | Example |
|---|---|
| **schema** | output parses into the pydantic model |
| **required facts** | the refund amount "₹1,499" appears in the reply |
| **forbidden content** | no "guaranteed", no competitor names, no raw email addresses |
| **citations** | every \`[n]\` refers to a document that was sent |
| **format** | ≤ 120 words; bullet list; correct language |
| **tool calls** | \`check_eligibility\` happened before \`issue_refund\` |
| **decline** | unanswerable questions get the "not covered" response |

Fast (milliseconds), free, deterministic — and together they catch most regressions.

---

## In pytest

\`\`\`python
import pytest

CASES = load_cases("evals/answers.jsonl")

@pytest.mark.parametrize("case", CASES, ids=lambda c: c["id"])
def test_answer(case, answer_for):
    out = answer_for(case["question"])
    for fact in case.get("must_include", []):
        assert normalise(fact) in normalise(out.text), f"missing: {fact}"
    for bad in case.get("must_not_include", []):
        assert bad.lower() not in out.text.lower(), f"forbidden: {bad}"
    assert all(1 <= n <= len(out.sources) for n in out.citations), "invalid citation"
    if not case["answerable"]:
        assert out.declined, "should have declined"
\`\`\`

\`answer_for\` is a fixture that runs your pipeline (with a cache of responses per commit, so
re-runs are cheap).

---

## Where judges earn their cost

- faithfulness when facts are paraphrased
- relevance and completeness
- tone and helpfulness

Run the assertions first; only cases that pass them go to the judge. You save money and
the judge's verdicts aren't polluted by format failures.

---

## Assertions evolve from failures

Every production bug that code **could** have caught becomes an assertion. Over time the
cheap layer catches more and the judges focus on the genuinely subtle.`,
    docs: [
      {
        label: 'pytest — parametrizing tests',
        url: 'https://docs.pytest.org/en/stable/how-to/parametrize.html',
      },
      {
        label: 'promptfoo — assertions',
        url: 'https://www.promptfoo.dev/docs/configuration/expected-outputs/',
      },
    ],
    glossary: [
      {
        term: 'assertion',
        def: 'A deterministic, code-based check on an output.',
      },
      {
        term: 'parametrised test',
        def: 'One test function run over many cases.',
      },
      {
        term: 'deterministic',
        def: 'Giving the same result every time for the same input.',
      },
    ],
    check: [
      {
        q: 'Why run assertions before judges?',
        a: `They're fast, free and deterministic, catch most regressions, and stop format failures from wasting judge calls or muddying their verdicts.`,
      },
      {
        q: 'Name four things assertions can check.',
        a: `Schema validity, required facts, forbidden content, valid citations, format and length, tool-call order, and correct declining.`,
      },
      {
        q: 'What still needs a model judge?',
        a: `Qualities code can't pin down: faithfulness with paraphrase, relevance and completeness, tone and helpfulness.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Write assertions for p-4.1\'s replies',
        body: `From your p-4.1 scenarios, write the assertion set for drafted replies: which facts must
appear (from the trace), which phrases are forbidden, format limits, and the tool-order
rules. Have AI turn it into a parametrised pytest suite.`,
        answer: `Assertions that typically cover most failures:

- **Facts from the trace:** the order ID; the refund amount and status if a refund was
  proposed ("pending approval" if approval was requested); the next step for the
  customer.
- **Forbidden:** "guaranteed", "within 24 hours" (unless policy says so), internal terms
  ("eligibility check", "escalation queue"), other customers' names or order IDs.
- **Format:** ≤ 150 words; greeting uses the customer's first name; same language as
  the ticket.
- **Tool order:** \`get_order\` before any claim about an order; \`check_refund_eligibility\`
  before \`issue_refund\`; no \`issue_refund\` on "just asking" scenarios.

Then count: run the suite on your last 50 production-like drafts. The share of real
problems caught by assertions alone is usually high — which tells you how little of the
budget the judge actually needs.`,
      },
      {
        mode: 'read',
        title: 'Assertion or judge?',
        body: `Classify each check as an assertion or a judge:

1. The answer cites at least one source.
2. The answer is "polite and empathetic".
3. The JSON has \`confidence\` between 0 and 1.
4. The answer doesn't state anything the context doesn't support.
5. The reply is in Hindi when the ticket was in Hindi.
6. The summary covers all three action items from the meeting.`,
        answer: `1. **Assertion** — count valid citation markers.
2. **Judge** — tone needs reading. (A cheap assertion can still catch rude words.)
3. **Assertion** — parse and check the range.
4. **Judge** — faithfulness with paraphrase needs a model; assertions can check specific
   numbers and names appear in the context.
5. **Assertion** — a language-detection library, not a model.
6. **Both** — if the action items are labelled, assert each item's key phrase appears;
   use a judge when wording varies a lot.`,
      },
    ],
  },
  {
    id: 's5.5.t3',
    moduleId: 's5.5',
    title: 'Pairwise comparison',
    outcome: `You can decide whether version B is better than A by comparing outputs side by side — in both orders, with ties — and check whether the win rate is more than luck.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `An eye test: "clearer with lens one… or lens two?" People are bad at rating sharpness on a
scale of 1 to 10, and very good at picking the better of two. Pairwise comparison uses the
same trick for AI outputs.`,
    notes: `## Why compare instead of score

Absolute scores saturate and drift: both versions get "4 out of 5", and the judge's idea of
a 4 shifts between runs. Asking **"which of these two is better, or are they tied?"** is
easier and more consistent — for people and for model judges.

Use it for "should v2 replace v1?", when both already pass the assertions.

---

## Doing it fairly

- Same inputs for both versions.
- **Both orders** for every pair (position bias, Stage 3); count a win only if both orders
  agree, otherwise a tie.
- A **rubric**: what "better" means for this feature (more correct, better cited, more
  concise — in that priority).
- Hide which version is which.
- Calibrate the judge against 30 pairs you judge yourself.

---

## Is the win rate real?

60 pairs: v2 wins 34, v1 wins 18, 8 ties. Ignore ties: 34 wins out of 52.

If the versions were equally good, each pair would be a coin flip. The chance of 34 or more
heads in 52 flips is small — about **0.036** counting both directions (a **sign test**).
So v2 is very likely better.

By contrast, 24 wins out of 40 looks like "60%!" but has a two-sided p-value of about
**0.27** — entirely possible by luck. You'd need more pairs.

---

## Many versions

To rank several prompts or models, run pairwise comparisons across them and fit a rating
(Elo or Bradley–Terry) — the method public model leaderboards use. For two versions, the
sign test is enough.`,
    docs: [
      {
        label: 'Judging LLM-as-a-Judge (pairwise and position bias)',
        url: 'https://arxiv.org/abs/2306.05685',
      },
      {
        label: 'SciPy — binomtest',
        url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binomtest.html',
      },
    ],
    glossary: [
      {
        term: 'pairwise comparison',
        def: 'Judging which of two outputs is better, instead of scoring each alone.',
      },
      {
        term: 'sign test',
        def: 'A test of whether wins versus losses are more lopsided than coin flips would give.',
      },
      {
        term: 'p-value',
        def: 'How likely a result at least this extreme would be if there were no real difference.',
      },
      {
        term: 'Elo / Bradley–Terry',
        def: 'Rating methods that turn many pairwise results into a ranking.',
      },
    ],
    check: [
      {
        q: 'Why are pairwise comparisons more consistent than absolute scores?',
        a: `Picking the better of two is easier than placing each on a scale, and it avoids scores saturating or drifting between runs.`,
      },
      {
        q: 'How are ties handled in a sign test?',
        a: 'They\'re excluded; the test uses only pairs with a winner.',
      },
      {
        q: 'Is 24 wins out of 40 pairs strong evidence?',
        a: 'No — the two-sided p-value is about 0.27, so it could easily be luck. More pairs are needed.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'A sign test by hand',
        body: `Without AI and without scipy: \`sign_test(wins_a, wins_b) -> float\` returning the
two-sided p-value (ties already excluded). Verify: (34, 18) ≈ 0.036 and (24, 16) ≈ 0.27.`,
        answer: `\`\`\`python
from math import comb

def sign_test(wins_a: int, wins_b: int) -> float:
    n, k = wins_a + wins_b, max(wins_a, wins_b)
    tail = sum(comb(n, i) for i in range(k, n + 1)) / 2 ** n   # P(X >= k), fair coin
    return min(1.0, 2 * tail)                                  # two-sided

assert abs(sign_test(34, 18) - 0.0365) < 0.001
assert round(sign_test(24, 16), 2) == 0.27
\`\`\`

\`comb(n, i) / 2**n\` is the probability of exactly \`i\` wins out of \`n\` fair coin flips;
summing the tail gives the chance of a result at least this lopsided; doubling covers
"either version this lopsided". Fine for a few hundred pairs; for much larger n, use a
normal approximation or \`scipy.stats.binomtest\`.`,
      },
      {
        mode: 'tool',
        title: 'Compare two prompts pairwise',
        body: `Take two versions of p-3.1's answer prompt. Generate answers to 60 golden questions with
each, judge every pair in both orders with a rubric, count wins and ties, and run the sign
test. Then judge 20 pairs yourself and compare with the model judge.`,
        answer: `Report:

| | count |
|---|---|
| v2 wins (both orders agree) | |
| v1 wins (both orders agree) | |
| ties (or orders disagree) | |
| sign-test p-value | |
| your agreement with the judge on 20 pairs | |

Typical discoveries: a noticeable number of "wins" flip when the order flips (that's why
you judge both orders); ties are common when both prompts are decent; and the judge
agrees with you most on clear cases, less on close ones. A result like "v2 wins 31–14 with
15 ties, p ≈ 0.02, judge agreed with me on 17 of 20" is a solid basis for a prompt change.`,
      },
    ],
  },
  {
    id: 's5.5.t4',
    moduleId: 's5.5',
    title: 'Online evaluation: sampling, shadowing and canaries',
    outcome: `You can evaluate on real traffic safely — judging sampled production answers, shadow-running a new version, canarying it to a small share, and rolling back automatically.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-canary-rollback'],
    analogy: `A new metro line runs empty trains for weeks (shadowing), then opens to a few stations
(a canary), and only then runs at full service — with the old timetable ready if anything
goes wrong. Real traffic finds problems no test track does.`,
    notes: `## Why offline isn't enough

Your golden set is a fixed sample of the past. Production has new phrasings, new documents,
new users and new failure modes. Online evaluation measures quality **on what's actually
happening**.

---

## Four techniques, from safest

1. **Sampled judging** — every day, judge a random 1–5% of production answers (faithfulness,
   citations) and track the trend. Costs a little; changes nothing for users.
2. **Shadow runs** — send a copy of real requests to the new version too, **without** showing
   its answers. Compare quality, cost and latency on real inputs. (Careful with tools that
   have side effects: shadow agents must use read-only or mocked tools.)
3. **Canary** — route a small share (1–5%) of users to the new version; watch its metrics
   against the old version's.
4. **Full rollout** — step up: 5% → 25% → 50% → 100%, pausing at each step.

---

## Automatic rollback

Decide the rules **before** the canary starts:

- roll back if the canary's error rate is 2× the baseline's for 10 minutes
- roll back if p95 exceeds the target
- roll back if judged faithfulness on the canary's sample drops more than X points
- roll back on **any** safety signal

Then let automation do it. At 2 a.m. nobody makes good judgement calls.

---

## Prompts are releases too

A prompt change can break things as badly as code. Put prompts behind the same machinery:
versioned, flag-controlled (\`prompt.answer = v15\` for 5% of traffic), measured, and
instantly revertible without a deploy.

---

## Compare like with like

Canary and baseline must receive **similar traffic**: randomise by user (not by request, or
one conversation bounces between versions), and compare them over the **same time window** —
Monday morning traffic isn't Sunday night traffic.`,
    docs: [
      {
        label: 'Google SRE workbook — canarying releases',
        url: 'https://sre.google/workbook/canarying-releases/',
      },
      {
        label: 'Anthropic — building evals',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'online evaluation',
        def: 'Measuring quality on live production traffic.',
      },
      {
        term: 'shadow run',
        def: 'Running a new version on copies of real requests without users seeing its output.',
      },
      {
        term: 'canary',
        def: 'Releasing a new version to a small share of users first, while watching its metrics.',
      },
      {
        term: 'auto-rollback',
        def: 'Automatically reverting a release when predefined metric rules are broken.',
      },
    ],
    check: [
      {
        q: 'What does a shadow run do?',
        a: `Sends a copy of real requests to the new version without showing its output, so quality, cost and latency can be compared on real inputs.`,
      },
      {
        q: 'Why must shadow agents use read-only or mocked tools?',
        a: `Otherwise the shadow copy would perform real side effects — duplicate refunds, emails — for requests the old version is already handling.`,
      },
      {
        q: 'When should rollback rules be decided?',
        a: 'Before the canary starts — and then applied automatically.',
      },
      {
        q: 'Why randomise canaries by user rather than by request?',
        a: `So one user's conversation doesn't bounce between versions, and comparisons aren't muddied by mixed experiences.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec a prompt canary with auto-rollback',
        body: `Spec how p-5.1 releases a new answer prompt: the flag, how users are assigned, which
metrics are compared, the rollback rules, the step-up schedule, and what gets logged.
Have AI implement the flag assignment and the rollback checker.`,
        answer: `Spec essentials:

- **Flag:** \`prompt.answer.canary = {"version": "v15", "share": 0.05}\` in a config table,
  readable at runtime without a deploy.
- **Assignment:** \`hash(user_id + "answer-v15") % 100 < share × 100\` — stable per user,
  independent across experiments.
- **Logging:** every request records the prompt version, so every metric splits by version.
- **Metrics compared (canary vs baseline, same window):** error rate, p95 TTFT, cost per
  request, judged faithfulness on a 20% sample of canary traffic (higher than the usual
  sample, to get signal fast), thumbs-down rate.
- **Rollback rules**, checked every 5 minutes: error rate > 2× baseline; p95 > target;
  faithfulness −5 points with at least 100 judged answers; any safety alert → set share
  to 0 and notify.
- **Step-up:** 5% for 24 h → 25% → 50% → 100%, each step only if no rule fired.

Test: inject a broken prompt into the canary in staging and confirm the checker sets the
share to 0 within one cycle.`,
      },
      {
        mode: 'decision',
        title: 'Shadow, canary, or neither?',
        body: `1. A new embedding model for retrieval (requires re-indexing).
2. A reworded system prompt for the support agent.
3. Switching the support agent's refund tool to a new payments API.
4. A typo fix in the "not in the documents" message.`,
        answer: `1. **Shadow first**, on a separate index built in the background (blue/green, Stage 3):
   run real queries against both indexes, compare recall on sampled traffic, then
   canary the switch.
2. **Canary** with auto-rollback — behaviour changes are exactly what canaries catch.
3. **Shadow with a mocked payments tool** (to compare the agent's decisions), then a
   careful canary with human approval still on every refund. Side-effecting tools never
   run twice for real.
4. **Neither** — a normal, reviewed deploy. Process should match risk.`,
      },
    ],
  },
  {
    id: 's5.5.t5',
    moduleId: 's5.5',
    title: 'A/B testing AI features',
    outcome: `You can run an A/B test on a model or prompt change with a goal metric, guardrail metrics, a sensible sample size and user-level randomisation — and read the result honestly.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A shop tries two window displays in two similar branches for a month, and counts sales —
while checking that neither display caused complaints or theft. The sales are the goal; the
complaints are the guardrails.`,
    notes: `## Goal and guardrails

- **Goal metric** — the one thing the change should improve: support tickets resolved without
  a human, answers accepted, tasks completed.
- **Guardrail metrics** — things that must **not** get worse: p95 latency, cost per request,
  complaint rate, safety flags, escalations.

A version that wins the goal but breaks a guardrail doesn't ship.

---

## Setup

- **Randomise by user** (or tenant), not by request.
- **Decide the metric, duration and sample size first.** Checking every day and stopping when
  it "looks significant" finds false winners.
- Run whole **weeks**, so weekday and weekend behaviour are both included.

---

## How many users?

A rule of thumb for a rate metric (80% power, 5% significance):

> users per arm ≈ 16 × p × (1 − p) / δ²

where p is the current rate and δ the smallest change worth detecting. With a 30% resolution
rate and a 3-point change to detect: 16 × 0.3 × 0.7 / 0.03² ≈ **3,733 users per arm**.

If you don't have that traffic, test bigger changes — or rely on offline evals and canaries.

---

## AI-specific traps

- **Novelty:** users try the new feature more at first; wait for it to settle.
- **Cost is part of the result:** a version that resolves 2% more tickets at 3× the cost may
  lose on the business case. Report cost per successful outcome.
- **Quality lags:** a subtly wrong answer may only show up as a complaint weeks later —
  keep sampled judging running alongside the test.

---

## Reporting

One table: goal metric with its confidence interval, every guardrail, cost per outcome, and
the decision. Include the tests that didn't win — they're how the team learns.`,
    docs: [
      {
        label: 'Evan Miller — sample size calculator',
        url: 'https://www.evanmiller.org/ab-testing/sample-size.html',
      },
      {
        label: 'Evan Miller — how not to run an A/B test',
        url: 'https://www.evanmiller.org/how-not-to-run-an-ab-test.html',
      },
    ],
    glossary: [
      {
        term: 'A/B test',
        def: 'A randomised comparison of two versions on real users.',
      },
      {
        term: 'goal metric',
        def: 'The outcome a change is meant to improve.',
      },
      {
        term: 'guardrail metric',
        def: 'An outcome that must not get worse for the change to ship.',
      },
      {
        term: 'minimum detectable effect',
        def: 'The smallest change a test is designed to reliably detect.',
      },
    ],
    check: [
      {
        q: 'What\'s the difference between a goal metric and a guardrail metric?',
        a: `The goal is what the change should improve; guardrails are what must not get worse, like latency, cost, complaints and safety.`,
      },
      {
        q: 'Why decide the sample size before starting?',
        a: 'Peeking and stopping when results look significant produces false winners.',
      },
      {
        q: 'Roughly how many users per arm to detect a 3-point change from a 30% rate?',
        a: 'About 3,700 (16 × 0.3 × 0.7 / 0.03²).',
      },
      {
        q: 'Why report cost per successful outcome?',
        a: 'A version that wins slightly on the goal at a much higher cost can lose on the business case.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Read this A/B result',
        body: `Two weeks, randomised by user. Goal: tickets resolved without a human — A 31.2%, B 34.0%
(difference +2.8 points, 95% interval +0.9 to +4.7). Guardrails: p95 latency A 2.1 s,
B 3.4 s (target 3 s); cost per ticket A ₹1.1, B ₹2.6; complaints A 0.8%, B 0.7%. Ship B?`,
        answer: `**Not as is.** B genuinely improves the goal (the interval excludes zero), but it breaks
the **latency guardrail** (3.4 s vs a 3 s target) and costs more than twice as much.

Cost per resolved ticket: A ₹1.1 / 0.312 ≈ ₹3.5; B ₹2.6 / 0.340 ≈ ₹7.6. For every extra
ticket B resolves, you pay a lot more — worth it only if a human-handled ticket costs
more than that difference (it may; do the maths with the support team's cost per ticket).

Next step: find what made B better (a larger model? more retrieval?) and try to keep that
part within the latency and cost budget — for example, B's model only for the hard
tickets via routing. Then test again.`,
      },
      {
        mode: 'primitive',
        title: 'Sample size and duration',
        body: `Without AI: write \`users_per_arm(p, delta)\` using the rule of thumb, and
\`days_needed(p, delta, eligible_users_per_day)\` for a 50/50 split. How many days to detect
a 2-point change from 25% with 800 new eligible users a day?`,
        answer: `\`\`\`python
import math

def users_per_arm(p: float, delta: float) -> int:
    return math.ceil(16 * p * (1 - p) / delta ** 2)

def days_needed(p: float, delta: float, eligible_per_day: int) -> int:
    return math.ceil(2 * users_per_arm(p, delta) / eligible_per_day)

print(users_per_arm(0.25, 0.02), days_needed(0.25, 0.02, 800))
\`\`\`

16 × 0.25 × 0.75 / 0.0004 = **7,500 users per arm** → 15,000 in total → **19 days**,
which you'd round up to **three full weeks**.

If three weeks is too long, the options are honest ones: accept detecting only larger
effects (δ = 3 points needs about 9 days), or decide on offline evals plus a canary
instead of a formal A/B test.`,
      },
    ],
  },
];
