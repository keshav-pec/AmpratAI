import type { Topic } from '@/lib/types';

export const s3_8: Topic[] = [
  {
    id: 's3.8.t1',
    moduleId: 's3.8',
    title: 'Why evaluation comes first',
    outcome: `You can explain why a RAG system without a fixed question set can't be improved on purpose — and describe the three layers of measurement you'll build.`,
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
        query: 'evals for LLM applications Hamel Husain',
        channel: '',
        reason: 'a practitioner\'s talk on why evals come first',
      },
    ],
    animations: ['anim-eval-loop'],
    analogy: `Refactoring a codebase with no tests. Every change "seems fine", the demo still works, and
three weeks later a customer finds the thing you broke on day two. A golden set is the test
suite for retrieval and answers.`,
    notes: `## Tuning by feel

Without a fixed set of questions, improving RAG goes like this:

- You add hybrid search. You try five questions. It "feels better".
- You change the chunk size. Two of the five look better, one worse. Ship it?
- A week later you add reranking. Is it helping, or covering for the chunk-size change?

You can't tell what helped, what hurt, or whether anything regressed. And the questions
you test by hand are the ones you already know work.

---

## Build the ruler first

That's why this module comes **before** hybrid search, reranking and query rewriting in the
path. Each of those is judged by one question: *did the numbers move?*

The loop you're setting up:

1. A **golden set** of real questions with known evidence.
2. **Measure** the current pipeline.
3. **Read the failures**, group them, and fix the biggest group.
4. Measure again. Keep the change only if the numbers say so.

---

## Three layers of measurement

| Layer | Measures | Cost | When |
|---|---|---|---|
| **Retrieval** | did the evidence come back? (recall@k, MRR) | cheap, no model calls | every change, in CI |
| **Generation** | is the answer faithful, relevant, correctly cited? | model-judged, slower | every meaningful change |
| **Production** | thumbs, follow-ups, escalations | real users | continuously (Stage 5) |

Retrieval metrics are your fast inner loop. Generation metrics catch what retrieval can't:
a model that ignores good context, or cites the wrong passage.

---

## Many questions beat perfect grading

Anthropic's guide to building evals puts it plainly: prioritise **volume over quality** —
more questions with slightly noisier automated grading beat a handful of perfectly
hand-graded ones.

So: hand-write the questions and evidence (that's the asset), and automate the grading
(metrics and a calibrated judge).

---

## The results table

Every version of your pipeline becomes a row:

| Version | recall@5 | faithfulness | p95 | cost per question |
|---|---|---|---|---|
| v1 (your existing project) | | | | |
| v2 structure-aware chunks | | | | |
| v3 + hybrid search | | | | |
| … | | | | |

This table is the heart of p-3.1, and the thing hiring managers remember. It says "I improve
systems with evidence".`,
    docs: [
      {
        label: 'Anthropic — define success criteria and build evaluations',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'eval',
        def: 'A repeatable measurement of how well a system does on a fixed set of inputs.',
      },
      {
        term: 'regression',
        def: 'Something that used to work and no longer does.',
      },
      {
        term: 'results table',
        def: 'One row per pipeline version, one column per metric — the record of what each change did.',
      },
    ],
    check: [
      {
        q: 'Why does evaluation come before hybrid search and reranking in this stage?',
        a: `Those changes can only be judged by measurement. Without a fixed question set you can't tell whether they helped, hurt, or hid another regression.`,
      },
      {
        q: 'Name the three layers of measurement.',
        a: `Retrieval (did the evidence come back), generation (is the answer faithful, relevant and correctly cited), and production (real user signals).`,
      },
      {
        q: 'Which layer runs on every change, and why?',
        a: 'Retrieval metrics: they\'re cheap and need no model calls, so they can run in CI on every change.',
      },
      {
        q: 'What\'s the asset in an eval: the questions or the grading code?',
        a: `The hand-written questions with their evidence. Grading can be automated and improved; good questions are the hard-won part.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'What went wrong in this process?',
        body: `A team's log:

- Week 1: switched to 800-token chunks — "answers look richer".
- Week 2: added a reranker — "top results look sharper".
- Week 3: a customer reports the bot no longer answers pricing-table questions.

What went wrong, and what would have caught it?`,
        answer: `Every decision was made on impressions from a few hand-picked questions, so there was no
way to see a regression — and no way to know *which* change caused it.

Likely cause: 800-token chunks merged pricing tables with surrounding text (or split
them badly), and table questions started missing. Nobody tested table questions, because
nobody had a list of question types.

What would have caught it: a golden set with tagged question types (including tables),
run after each change, with the results table showing recall **per tag**. Week 1 would
have shown the table-question drop immediately — before a customer did.`,
      },
      {
        mode: 'decision',
        title: 'Plan your first eval week',
        body: `You have a working v1 and no eval at all. You can spend about a week. Lay out what you
build, in what order, and what you'll have at the end.`,
        answer: `A realistic week:

1. **Days 1–2: the golden set.** 50 questions from real sources (v1 usage, colleagues,
   support tickets), each with evidence spans and tags; 5–8 of them unanswerable.
   (Next topic.)
2. **Day 3: retrieval metrics.** A script that runs every question through retrieval and
   reports recall@5, recall@10 and MRR, overall and per tag.
3. **Day 4: one generation metric** — faithfulness with a model judge — calibrated on 30
   answers you label yourself (topic 5).
4. **Day 5: error analysis** on v1's failures (topic 7), and the first row of the results
   table.

At the end: v1's numbers, a ranked list of failure categories, and a clear first thing to
fix. CI gating (topic 6) can come in the following week.`,
      },
    ],
  },
  {
    id: 's3.8.t2',
    moduleId: 's3.8',
    title: 'Building the golden set',
    outcome: `You can build a golden set of real questions with evidence labels that survive re-chunking, the right mix of question types, and honest unanswerable cases.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `An answer key for an exam you set yourself. It's only useful if the questions resemble
the real exam, include the tricky ones, and point to where in the textbook each answer lives.`,
    notes: `## Where the questions come from

In order of value:

1. **Real questions** — v1's logs, support tickets, a colleague asked to "ask it things".
2. **Hand-written questions** that cover what real ones miss: tables, exceptions, old
   versions, questions in Hinglish if your users write that way.
3. **Synthetic questions** (a model writes questions from chunks) — only as a supplement,
   labelled as synthetic, and reviewed.

Why synthetic is weaker: questions generated from a chunk reuse that chunk's words, which
makes retrieval look better than it will be with real users' wording.

---

## What each item holds

\`\`\`json
{"id": "q017",
 "question": "Can I take sick leave while on probation?",
 "answerable": true,
 "evidence": [{"doc": "leave-policy-2025", "page": 4,
               "quote": "Sick leave is available from the first day of employment"}],
 "reference": "Yes. Sick leave applies from day one, up to 6 days in the first year.",
 "tags": ["lookup", "exception", "policy"]}
\`\`\`

One JSON object per line (JSONL), in the repo, under version control.

**Evidence is a quote or span, never a chunk ID** — chunk IDs change every time you
re-chunk (Module 4, topic 7).

---

## The mix

Tag every question so you can report per type. A healthy set covers:

| Tag | Example |
|---|---|
| lookup | "What's the notice period?" |
| table / numeric | "What's the dental limit on Plan B?" |
| exception | "Does carry-over apply in the first year?" |
| multi-part | "Compare the Pune and Chennai travel allowances." |
| version / date | "What did the 2023 policy say about…?" |
| **unanswerable** | "What's our policy on sabbaticals?" (there isn't one) |
| wording mismatch | slang, Hinglish, typos, acronyms |

Aim for 10–15% unanswerable. A system never tested on them gets quietly worse at saying
"I don't know".

---

## Size and honesty

- **Start with 50.** Useful from day one; grow to 100–200 over the stage.
- **Mind the noise:** with 50 questions, each is 2 points of recall. Treat small differences
  as ties until the set grows.
- **Don't tune only to the set.** Once you have 100+, keep ~20% aside and check it only
  occasionally, so you notice if you've overfitted the rest.
- **Add a question for every bug** a user reports. The set should grow from real failures.

---

## Labelling fast

A small tool helps: show the question, search the corpus, and let you click the passage
that answers it — saving the document, page and quote. Twenty minutes of building it saves
hours of copying quotes by hand. Or a spreadsheet with columns for each field works fine.`,
    docs: [
      {
        label: 'Anthropic — building evals (volume, edge cases)',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'golden set',
        def: 'A fixed, hand-written set of questions with known evidence and reference answers.',
      },
      {
        term: 'JSONL',
        def: 'A file with one JSON object per line — easy to append, diff and stream.',
      },
      {
        term: 'reference answer',
        def: 'A short correct answer used when grading the system\'s answer.',
      },
      {
        term: 'unanswerable question',
        def: 'A question the corpus can\'t answer; the right response is to say so.',
      },
    ],
    check: [
      {
        q: 'Why are synthetic questions weaker than real ones for measuring retrieval?',
        a: `Generated questions reuse the words of the chunk they came from, so they're easier to retrieve than real users' wording — they overstate recall.`,
      },
      {
        q: 'Why label evidence as a quote or page rather than a chunk ID?',
        a: `Chunk IDs change whenever chunking changes; a quote or page stays valid, so the set survives experiments.`,
      },
      {
        q: 'Why include unanswerable questions?',
        a: `To measure whether the system correctly declines. Without them, answering-anyway regressions go unnoticed.`,
      },
      {
        q: 'With 50 questions, how much is one question worth in recall?',
        a: 'Two percentage points — so small differences between versions are likely noise.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Write your first 50',
        body: `Build the golden set for p-3.1: 50 questions in JSONL with evidence quotes, a short
reference answer, and tags. At least 5 unanswerable, at least 8 about tables or numbers,
and at least 5 phrased the way a hurried user would type.

Then report how the 50 split across tags.`,
        answer: `Checks that separate a good set from a weak one:

- **Evidence quotes are verbatim** and short (one or two sentences) — you'll search for
  them by substring, so they must match the parsed text. Check each one programmatically:
  \`assert quote in parsed_text[doc]\`. Expect to find parsing differences (ligatures,
  hyphenation) — fix the parser or the quote.
- **Unanswerable questions are plausible** — close to the corpus's topics, not absurd.
  "What's our sabbatical policy?" is good; "Who won the World Cup?" tests little.
- **Hurried phrasings are real:** "sick leave probation??", "PL carry fwd rules",
  Hinglish ("probation mein leave milegi kya?").
- **No question is answered by its own wording** — rewrite any that copy a sentence from
  the document.

Tag split: make a quick count table. If "lookup" is 80% of your set, your numbers will
look better than your users' experience.`,
      },
      {
        mode: 'primitive',
        title: 'Validate the set',
        body: `Without AI: \`validate(golden_path, parsed_docs) -> list[str]\` returns a list of problems:
duplicate IDs, missing fields, an \`answerable\` question with no evidence, an unanswerable
question *with* evidence, and evidence quotes not found in the parsed document text.`,
        answer: `\`\`\`python
import json

REQUIRED = {"id", "question", "answerable", "evidence", "tags"}

def validate(golden_path: str, parsed_docs: dict[str, str]) -> list[str]:
    problems, seen = [], set()
    with open(golden_path) as f:
        for n, line in enumerate(f, 1):
            item = json.loads(line)
            missing = REQUIRED - item.keys()
            if missing:
                problems.append(f"line {n}: missing {sorted(missing)}")
                continue
            if item["id"] in seen:
                problems.append(f"line {n}: duplicate id {item['id']}")
            seen.add(item["id"])
            if item["answerable"] and not item["evidence"]:
                problems.append(f"{item['id']}: answerable but no evidence")
            if not item["answerable"] and item["evidence"]:
                problems.append(f"{item['id']}: unanswerable but has evidence")
            for ev in item["evidence"]:
                text = parsed_docs.get(ev["doc"], "")
                if ev["quote"] not in text:
                    problems.append(f"{item['id']}: quote not found in {ev['doc']}")
    return problems
\`\`\`

Run it in CI next to the eval itself. The "quote not found" check does double duty: it
catches typos in the set **and** parser changes that alter the text — both would
otherwise silently turn hits into misses.`,
      },
      {
        mode: 'decision',
        title: 'Synthetic questions: yes or no?',
        body: `You have 50 hand-written questions. A teammate proposes generating 500 synthetic ones
with a model to "make the eval statistically meaningful". What do you say?`,
        answer: `**Yes, as a separate, clearly labelled set — not mixed into the golden set.**

- Synthetic questions are useful for **coverage**: they touch documents your 50 never do,
  and they're good for spotting chunks that are never retrieved for anything.
- But they **overstate** retrieval quality (their wording comes from the chunk), and some
  are ambiguous or unanswerable in ways nobody checked.

So: report both numbers separately — "golden recall@5: 0.78; synthetic recall@5: 0.91" —
and make decisions on the golden number. Make the synthetic questions harder by asking
the model to paraphrase away from the source's wording, and hand-review a sample of 30.
Meanwhile, grow the golden set steadily from real questions — that's the number that
tracks users.`,
      },
    ],
  },
  {
    id: 's3.8.t3',
    moduleId: 's3.8',
    title: 'Retrieval metrics',
    outcome: `You can compute recall@k, precision@k, MRR and nDCG by hand, and say which one answers which question about your retriever.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-rank-metrics'],
    analogy: `Four ways to grade a Google results page. Was the answer on page one at all (recall)? How
much of page one was useful (precision)? How far down did you scroll to the first good
result (MRR)? Were the best results at the top (nDCG)?`,
    notes: `## recall@k — did it come back at all?

Of the relevant items for a question, what fraction appear in the top k?

- One relevant chunk, found at rank 3: recall@5 = 1, recall@2 = 0.
- Two relevant chunks, one found in the top 5: recall@5 = 0.5.

Averaged over all questions. **This is the headline metric for RAG**: if the evidence isn't
retrieved, nothing downstream can save the answer.

---

## precision@k — how much is noise?

Of the top k, what fraction is relevant? One relevant chunk in the top 5: precision@5 = 0.2.

It matters for **cost and focus**: low precision means you pay to send noise, and the
model has more to ignore. With one relevant chunk per question, precision@k can never exceed
1/k — so read it as "how much junk rides along", not a grade out of 100.

---

## MRR — how high is the first hit?

Mean Reciprocal Rank: for each question, 1 / (rank of the first relevant item), or 0 if none.

- First relevant at rank 1 → 1.0; rank 2 → 0.5; rank 3 → 0.33; not found → 0.

Useful when **only the top few** results will be used — a reranker's job is to raise MRR.

---

## nDCG — are the best items near the top?

Each relevant item earns credit that shrinks with rank: 1 / log₂(rank + 1).

- rank 1 → 1.0, rank 2 → 0.63, rank 3 → 0.5, rank 4 → 0.43, rank 5 → 0.39

Sum it (DCG), then divide by the best possible sum (the ideal ordering). 1.0 means every
relevant item is as high as it could be. It also handles **graded** relevance (2 = directly
answers, 1 = related).

---

## A worked example

Two relevant chunks; the retriever returns them at ranks **1 and 4**; k = 5.

- recall@5 = 2/2 = **1.0**
- precision@5 = 2/5 = **0.4**
- MRR = 1/1 = **1.0**
- DCG = 1 + 1/log₂5 = 1 + 0.431 = 1.431; ideal = 1 + 1/log₂3 = 1.631 → nDCG@5 = **0.877**

---

## Which to watch

- **recall@k** at the k you actually send — the headline.
- **MRR** when you add a reranker or trim k.
- **Per tag**, always: tables, exceptions, unanswerable — the average hides them.

And for unanswerable questions, retrieval metrics don't apply; they're graded on the answer
(next topic).`,
    docs: [
      {
        label: 'Wikipedia — discounted cumulative gain',
        url: 'https://en.wikipedia.org/wiki/Discounted_cumulative_gain',
      },
      {
        label: 'Wikipedia — mean reciprocal rank',
        url: 'https://en.wikipedia.org/wiki/Mean_reciprocal_rank',
      },
    ],
    glossary: [
      {
        term: 'recall@k',
        def: 'The share of relevant items that appear in the top k results.',
      },
      {
        term: 'precision@k',
        def: 'The share of the top k results that are relevant.',
      },
      {
        term: 'MRR',
        def: 'Mean reciprocal rank: the average of 1 / (rank of the first relevant result).',
      },
      {
        term: 'nDCG',
        def: 'A ranking score that rewards relevant results near the top, normalised so 1.0 is a perfect order.',
      },
      {
        term: 'graded relevance',
        def: 'Relevance with levels (e.g. 2 = answers it, 1 = related, 0 = not), instead of yes/no.',
      },
    ],
    check: [
      {
        q: 'One relevant chunk, retrieved at rank 3. What are recall@5, recall@2 and MRR?',
        a: 'recall@5 = 1, recall@2 = 0, MRR = 1/3 ≈ 0.33.',
      },
      {
        q: 'Why can precision@5 never exceed 0.2 when each question has one relevant chunk?',
        a: 'At most one of the five results can be relevant, so the best possible is 1/5.',
      },
      {
        q: 'Which metric should rise when you add a reranker?',
        a: 'MRR (and nDCG): a reranker moves the relevant chunk higher, which is exactly what they measure.',
      },
      {
        q: 'Why report metrics per tag?',
        a: `Averages hide weak question types — tables, exceptions, unanswerable — where the real failures concentrate.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Implement the four metrics',
        body: `Without AI: \`recall_at_k(ranked, relevant, k)\`, \`precision_at_k(...)\`, \`mrr(ranked,
relevant)\` and \`ndcg_at_k(ranked, relevant, k)\`, where \`ranked\` is a list of IDs and
\`relevant\` a set of IDs (binary relevance).

Check your code on the worked example: relevant at ranks 1 and 4 must give nDCG@5 ≈ 0.877.`,
        answer: `\`\`\`python
import math

def recall_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) & relevant) / len(relevant) if relevant else 0.0

def precision_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) & relevant) / k

def mrr(ranked, relevant):
    for i, item in enumerate(ranked, 1):
        if item in relevant:
            return 1 / i
    return 0.0

def ndcg_at_k(ranked, relevant, k):
    dcg = sum(1 / math.log2(i + 1) for i, item in enumerate(ranked[:k], 1) if item in relevant)
    ideal = sum(1 / math.log2(i + 1) for i in range(1, min(len(relevant), k) + 1))
    return dcg / ideal if ideal else 0.0

ranked = ["a", "x", "y", "b", "z"]
assert round(ndcg_at_k(ranked, {"a", "b"}, 5), 3) == 0.877
\`\`\`

In a real pipeline, "relevant" isn't a set of chunk IDs — it's computed by checking which
retrieved chunks overlap an evidence span (the \`is_hit\` function from Module 4). So the
metric functions stay the same, and the hit test decides what counts.`,
      },
      {
        mode: 'read',
        title: 'Compare two retrievers',
        body: `Same 60 questions, k = 5:

| | recall@5 | MRR |
|---|---|---|
| Retriever A | 0.82 | 0.48 |
| Retriever B | 0.78 | 0.71 |

You send only the top 3 chunks to the model. Which do you prefer, and what would you
check before deciding?`,
        answer: `**Probably B.** A finds the evidence slightly more often somewhere in the top 5, but its
low MRR says the evidence tends to sit low — often at ranks 4–5, which you don't send.
B puts the first relevant chunk much higher (on average near rank 1–2).

Check before deciding: compute **recall@3** for both — that's the number that matches
what you actually send. And look at the per-tag split: if A's extra recall is all on
tables, a reranker on top of A might beat both.

The general lesson: measure at the k you actually use.`,
      },
      {
        mode: 'tool',
        title: 'Run the retrieval eval on v1',
        body: `Write \`eval/retrieval.py\`: for each answerable golden question, retrieve the top 10,
mark hits by evidence overlap, and print recall@1/3/5/10 and MRR — overall and per tag.
Run it on v1 and record the first row of your results table.`,
        answer: `Shape of the output:

\`\`\`
overall   n=45  R@1 0.38  R@3 0.58  R@5 0.67  R@10 0.76  MRR 0.51
table     n=8   R@1 0.13  R@3 0.25  R@5 0.38  R@10 0.50  MRR 0.24
exception n=6   R@1 0.33  R@3 0.50  R@5 0.50  R@10 0.67  MRR 0.44
lookup    n=24  R@1 0.50  R@3 0.71  R@5 0.83  R@10 0.88  MRR 0.63
\`\`\`

(Illustrative numbers — yours will differ.) Things to do with it:

- The gap between R@5 and R@10 says how much a reranker could recover (evidence that's
  found but ranked too low).
- The weakest tag is usually your first fix — here, tables point at parsing and chunking.
- Save the output as JSON with the git commit, so every row in the results table can be
  reproduced.`,
      },
    ],
  },
  {
    id: 's3.8.t4',
    moduleId: 's3.8',
    title: 'Generation metrics',
    outcome: `You can measure whether answers are faithful, relevant, correct and correctly cited — and whether the system declines when it should.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Marking an open-book exam. Retrieval metrics check the student opened the right page.
Generation metrics check what they wrote: did they copy it correctly, answer the actual
question, and cite the page they used — or make something up?`,
    notes: `## Five things to measure about an answer

| Metric | Question it answers | Needs |
|---|---|---|
| **Faithfulness** | Is every claim supported by the retrieved context? | answer + context |
| **Answer relevance** | Does it address the question asked? | question + answer |
| **Correctness** | Does it match the reference answer? | answer + reference |
| **Citation correctness** | Does each cited passage support its sentence? | answer + citations |
| **Declining correctly** | Does it say "not covered" when it should — and only then? | answerable flag |

---

## Faithfulness, concretely

1. Split the answer into individual claims.
2. For each claim, check: is it supported by the context?
3. Faithfulness = supported claims ÷ all claims.

"Supported by the context" — not "true in the world". A true fact the model added from
memory is still unfaithful: in a RAG product it's an unverifiable claim.

Low faithfulness with good retrieval means a **generation** problem: the prompt, the
escape hatch, or too much context.

---

## Correctness vs faithfulness

They catch different bugs:

- **Faithful but wrong** — the model faithfully repeated the *wrong* chunk (the 2022 policy).
  A retrieval problem.
- **Correct but unfaithful** — right answer, but not from the context (memory). Lucky today,
  unverifiable, and a sign the prompt isn't grounding the model.

For short factual references (a number, a date, a yes/no), check correctness with code —
exact match after normalising. Use a model judge only for longer answers.

---

## Citations and declining

**Citation correctness** has two halves:

- precision: each citation's passage actually supports the sentence it's attached to;
- recall: every factual sentence that needs a citation has one.

With Anthropic's Citations API the cited text is guaranteed to exist in your documents —
but not that it *supports* the claim. You still measure that.

**Declining**, on the two halves of the golden set:

- unanswerable questions → did it decline? (declining rate)
- answerable questions → did it wrongly decline? (false-decline rate)

Track both. Tightening one usually loosens the other.

---

## Tools

Libraries like RAGAS and DeepEval implement these metrics with model judges; promptfoo and
others run them as test suites. They're a fine start — but read what each metric's judge
prompt actually asks, and calibrate it on your own labels (next topic). A metric you don't
understand can't guide a decision.`,
    docs: [
      {
        label: 'Anthropic — citations',
        url: 'https://platform.claude.com/docs/en/build-with-claude/citations',
      },
      {
        label: 'RAGAS — metrics',
        url: 'https://docs.ragas.io/en/stable/concepts/metrics/',
      },
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
    ],
    glossary: [
      {
        term: 'faithfulness',
        def: 'The share of an answer\'s claims that are supported by the retrieved context.',
      },
      {
        term: 'answer relevance',
        def: 'Whether the answer addresses the question that was asked.',
      },
      {
        term: 'citation precision',
        def: 'The share of citations whose passage actually supports the cited sentence.',
      },
      {
        term: 'false decline',
        def: 'Refusing or saying "not covered" when the answer was in the sources.',
      },
    ],
    check: [
      {
        q: 'What does faithfulness measure?',
        a: 'The share of the answer\'s claims that are supported by the retrieved context.',
      },
      {
        q: 'Why is a true fact from the model\'s memory counted as unfaithful?',
        a: `In a RAG product it's unverifiable from the sources — and it shows the model isn't grounded in the context, which will produce wrong answers elsewhere.`,
      },
      {
        q: 'An answer is faithful but wrong. Where\'s the bug likely to be?',
        a: 'Retrieval: the model faithfully used the wrong or outdated passage.',
      },
      {
        q: 'Why track both declining rate and false-decline rate?',
        a: `Tightening the prompt to decline more often usually makes it wrongly refuse answerable questions. You need both numbers to see the trade-off.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec a faithfulness judge',
        body: `Write the spec for a faithfulness judge with Claude: inputs, the prompt, the output
schema, and how you turn per-claim verdicts into one score. Use structured outputs for
the verdict. Have AI implement it.

Review question: what should happen with an answer that says "The documents don't cover
this"?`,
        answer: `Spec essentials:

- **Inputs:** question, retrieved context (with passage IDs), answer.
- **Prompt:** give the context and the answer in XML tags. Ask the model to list each
  factual claim in the answer, and for each: the passage ID that supports it, or none.
  Define "supported" (stated or directly implied by the passage; not common knowledge,
  not a reasonable guess).
- **Output schema** (structured outputs):

\`\`\`python
class Claim(BaseModel):
    claim: str
    supported: bool
    passage_id: str | None

class Verdict(BaseModel):
    claims: list[Claim]
\`\`\`

- **Score:** supported ÷ total claims; also store the unsupported claims — they're what
  you'll read during error analysis.

**"The documents don't cover this":** it makes no factual claims, so faithfulness is
undefined, not 1.0 or 0. Mark it \`declined\` and score it with the declining metric
instead — correct if the question was unanswerable, a false decline if it wasn't.
Averaging a "1.0" in for every decline would make a system that declines everything
look perfectly faithful.`,
      },
      {
        mode: 'read',
        title: 'Grade these answers',
        body: `Context: *"Employees get 10 days of paternity leave, to be taken within 6 months of the
birth."*

Question: "How much paternity leave do I get?"

1. "You get 10 days, to be taken within 6 months of the birth."
2. "You get 10 days of paid paternity leave, which can be split into two blocks."
3. "You get 10 days. Congratulations on your new baby!"
4. "Paternity leave is 10 days [1], and you can also take up to 5 days of casual leave
   [1]."

Give each a faithfulness verdict and note any other problems.`,
        answer: `1. **Fully faithful**, relevant, complete.
2. **Unfaithful:** "paid" and "split into two blocks" aren't in the context. Maybe true —
   unverifiable here. A classic plausible embellishment.
3. **Faithful on the facts.** "Congratulations" isn't a factual claim; a good judge
   ignores pleasantries. (If your judge marks it unsupported, the rubric needs a line
   about non-factual text — a calibration fix.)
4. **Partly unfaithful, and a citation error:** the casual-leave claim is unsupported,
   and its citation [1] points at a passage that doesn't mention casual leave. Citation
   precision catches this even when the claim might be true elsewhere in the corpus.`,
      },
      {
        mode: 'decision',
        title: 'Which metric first?',
        body: `You have time to build and calibrate **one** generation metric this week. Your error
analysis shows: retrieval recall@5 is decent (0.84), users complain about "made up"
details, and a few complain the bot "won't answer simple things". Which metric do you
build first, and why?`,
        answer: `**Faithfulness.** "Made-up details" with decent retrieval is the signature of unfaithful
generation: the evidence arrives, and the model embellishes beyond it. Faithfulness
measures exactly that, and it tells you whether prompt changes (a stronger grounding
instruction, quoting before answering, fewer chunks) fix it.

Build the **declining** pair next — the "won't answer simple things" complaints suggest
false declines. It's cheaper than it sounds: it needs no model judge, just a check of
whether the answer declined, against the \`answerable\` flag.

Watch them together: a stricter grounding prompt often raises faithfulness *and* the
false-decline rate at the same time.`,
      },
    ],
  },
  {
    id: 's3.8.t5',
    moduleId: 's3.8',
    title: 'LLM-as-judge: rubrics, calibration and bias',
    outcome: `You can write a judge prompt with a clear rubric, calibrate it against your own labels, and defend it against position, length and self-preference bias.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'LLM as a judge calibration binary pass fail',
        channel: '',
        reason: 'a practitioner\'s guide to building judges you can trust',
      },
    ],
    animations: ['anim-judge-bias'],
    analogy: `Hiring a teaching assistant to mark exams. Before trusting their marks, you mark 50 papers
yourself and compare. Where they disagree, you sharpen the marking guide. And you shuffle
the papers, because everyone marks the first essay of the pile differently.`,
    notes: `## Why a model as judge

Faithfulness, relevance and citation support need *reading*. A person can do it — slowly,
expensively, never at 2 a.m. in CI. A model judge can, **if** you've checked that it agrees
with you.

An uncalibrated judge is a random number generator with good grammar.

---

## Write the rubric like a spec

- **Binary verdicts** (pass/fail) per criterion, not 1–10 scores. People and models both
  struggle to use a 10-point scale consistently; pass/fail is easier to agree on and to
  calibrate.
- **One criterion per judge call** — faithfulness separately from relevance.
- **Define the edge cases** in the rubric: pleasantries, partial answers, "not covered".
- **Ask for a short reason**, and put the verdict in a structured field (an enum) so parsing
  never breaks.

\`\`\`python
class Judgement(BaseModel):
    reason: str
    verdict: Literal["pass", "fail"]
\`\`\`

---

## Calibrate against your own labels

1. Label 50–100 real outputs yourself: pass or fail, with a one-line reason.
2. Run the judge on the same outputs.
3. Compare, looking at **both** kinds of disagreement:
   - it **passes** what you failed (misses real problems — the dangerous kind)
   - it **fails** what you passed (false alarms)
4. Read every disagreement, fix the rubric, re-run.
5. Keep some labels aside that you never tune on, to check you haven't just fitted the rubric
   to the examples.

Report agreement as "catches X% of real failures; Y% false alarms" — far more useful than
one accuracy number.

---

## Three known biases

Documented in the 2023 study *Judging LLM-as-a-Judge* and since:

- **Position bias** — in A-vs-B comparisons, a preference for whichever answer comes first
  (or second). Fix: judge both orders; count it only if the verdict agrees.
- **Length bias** — a preference for longer, more detailed-looking answers. Fix: rubric
  lines that say length is not quality; compare with length in mind.
- **Self-preference** — a preference for outputs from its own model family. Fix: where it
  matters, judge with a different model, and calibrate either way.

---

## Cost and model choice

Judge calls = questions × criteria × runs. 100 questions × 3 criteria is 300 calls per eval
run. Start with a strong model for calibration; then try a smaller one and keep it only if
its agreement with your labels holds up.

Note that the newest Claude models don't accept \`temperature\`, so repeated runs vary a
little. Measure that spread (topic 6) instead of pretending it's zero.`,
    docs: [
      {
        label: 'Judging LLM-as-a-Judge (Zheng et al., 2023)',
        url: 'https://arxiv.org/abs/2306.05685',
      },
      {
        label: 'Anthropic — building evals: grading methods',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
    ],
    glossary: [
      {
        term: 'LLM-as-judge',
        def: 'Using a model to grade outputs against a rubric.',
      },
      {
        term: 'rubric',
        def: 'The written criteria a grader applies, including how to handle edge cases.',
      },
      {
        term: 'calibration',
        def: 'Comparing a judge with your own labels and adjusting until they agree.',
      },
      {
        term: 'position bias',
        def: 'A judge preferring an answer because of where it appears, not what it says.',
      },
      {
        term: 'self-preference',
        def: 'A judge favouring outputs from its own model family.',
      },
    ],
    check: [
      {
        q: 'Why prefer pass/fail over a 1–10 score for a judge?',
        a: `Binary verdicts are easier for both people and models to apply consistently, and far easier to calibrate against your own labels.`,
      },
      {
        q: 'What are the two kinds of disagreement to track when calibrating?',
        a: `The judge passing outputs you failed (missed problems) and failing outputs you passed (false alarms).`,
      },
      {
        q: 'How do you control position bias in pairwise judging?',
        a: `Judge both orders and only count the verdict when they agree; disagreement becomes a tie or goes to a person.`,
      },
      {
        q: 'Why keep some labelled examples aside?',
        a: `To check the rubric works on examples it wasn't tuned on — otherwise you may have just fitted it to your calibration set.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Calibrate your faithfulness judge',
        body: `Take 50 answers from your v1. Label each pass/fail for faithfulness yourself, with a
one-line reason. Run your judge. Build the 2×2 table (you vs judge), read every
disagreement, change the rubric, and run again on a fresh 20 you set aside.`,
        answer: `The table:

| | judge: pass | judge: fail |
|---|---|---|
| **you: pass** | agree | false alarm |
| **you: fail** | **missed failure** | agree |

Report: "catches X of Y real failures; Z false alarms out of W passes".

What disagreements usually reveal:

- **Missed failures** on subtle embellishments ("paid" leave, an invented date) → add a
  rubric line: every specific detail — numbers, dates, conditions — must appear in the
  context.
- **False alarms** on pleasantries or restating the question → add a line saying
  non-factual text is ignored.
- **Disagreements where *you* were wrong** — it happens. Fix your label.

Two rounds usually bring agreement to a level you can use. The fresh 20 tell you whether
it holds.`,
      },
      {
        mode: 'read',
        title: 'Spot the bias',
        body: `A pairwise eval compares prompt v3 (answer shown as "A") against v4 (shown as "B"),
always in that order. Result: v3 wins 71% of the time. v4's answers are also about 40%
shorter on average.

What might be going on, and how do you re-run it properly?`,
        answer: `Two biases could be producing some or all of that 71%:

- **Position bias** — v3 is always first.
- **Length bias** — v3's answers are longer.

Re-run properly:

1. **Swap orders:** judge every pair twice (v3 first, then v4 first). Count a win only
   when both orders agree; otherwise, a tie.
2. **Add rubric lines** saying extra length that adds no supported information is not
   better — or judge each answer on its own against a pass/fail rubric instead of
   comparing pairs.
3. **Calibrate on 30 pairs you judge yourself.**

If v3 still wins clearly after that, great — you have a real result. Often the gap shrinks
a lot, and the shorter prompt turns out to be as good and cheaper.`,
      },
      {
        mode: 'primitive',
        title: 'The agreement report',
        body: `Without AI: \`agreement(human: list[bool], judge: list[bool]) -> dict\` where True means
pass. Return: \`missed\` (human fail, judge pass), \`false_alarms\` (human pass, judge fail),
\`catch_rate\` (share of human fails the judge also failed) and \`false_alarm_rate\` (share of
human passes the judge failed).`,
        answer: `\`\`\`python
def agreement(human: list[bool], judge: list[bool]) -> dict:
    assert len(human) == len(judge)
    pairs = list(zip(human, judge))
    missed = sum(1 for h, j in pairs if not h and j)
    false_alarms = sum(1 for h, j in pairs if h and not j)
    human_fails = sum(1 for h in human if not h)
    human_passes = len(human) - human_fails
    return {
        "missed": missed,
        "false_alarms": false_alarms,
        "catch_rate": (human_fails - missed) / human_fails if human_fails else None,
        "false_alarm_rate": false_alarms / human_passes if human_passes else None,
    }
\`\`\`

Why not plain accuracy: if 90% of answers pass, a judge that says "pass" to everything
scores 90% accuracy and catches nothing. The catch rate exposes that immediately (0%).
Return \`None\` rather than dividing by zero when you have no fails yet — and treat that as
a sign you need more failure examples in your labels.`,
      },
    ],
  },
  {
    id: 's3.8.t6',
    moduleId: 's3.8',
    title: 'Evals in CI: regression gates',
    outcome: `You can run your eval on every pull request, compare it against the main branch's numbers with a noise-aware threshold, and block a merge that makes things worse.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Your test suite already blocks a PR that breaks a unit test. A regression gate does the
same for quality: the PR that quietly drops recall by eight points gets a red cross, not a
merge.`,
    notes: `## What runs, and when

| Check | Runs on | Cost |
|---|---|---|
| golden-set validator | every PR | free |
| retrieval eval (recall, MRR) | every PR touching retrieval, chunking or prompts | embeddings only |
| generation eval (faithfulness, declining) | same PRs, or a smaller subset per PR + full nightly | model calls |

Retrieval evals are deterministic for a fixed index, so their gate can be tight. Generation
evals vary between runs, so their gate needs a noise margin.

---

## The workflow

\`\`\`yaml
name: rag-eval
on:
  pull_request:
    paths: ["app/rag/**", "prompts/**", "eval/**"]
jobs:
  eval:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg17
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v6
      - run: uv sync
      - run: uv run python -m eval.build_index      # small fixed corpus snapshot
      - run: uv run python -m eval.run --out results.json
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          VOYAGE_API_KEY: \${{ secrets.VOYAGE_API_KEY }}
      - run: uv run python -m eval.gate --baseline eval/baseline.json --results results.json
\`\`\`

---

## The gate

\`\`\`python
import json, sys

TOLERANCE = {"recall@5": 0.01, "mrr": 0.02, "faithfulness": 0.03, "decline_accuracy": 0.05}

base = json.load(open(sys.argv[1]))
new = json.load(open(sys.argv[2]))
failed = [f"{m}: {base[m]:.3f} -> {new[m]:.3f}"
          for m, tol in TOLERANCE.items() if new[m] < base[m] - tol]

print("\\n".join(failed) or "all metrics within tolerance")
sys.exit(1 if failed else 0)
\`\`\`

A non-zero exit fails the job; a branch protection rule makes that block the merge.

---

## Setting the noise margin

Run the generation eval **5 times on the same commit**. The spread between runs is your
noise. Set each tolerance a little above it.

- Too tight: the gate fails randomly, and people learn to ignore it.
- Too loose: real regressions slip through.

If the noise is large, add questions — noise shrinks as the set grows.

---

## Keeping the baseline honest

- \`eval/baseline.json\` holds main's numbers. When a PR **improves** things, update it in the
  same PR, so the next PR is compared with the new level.
- Post the comparison table as a PR comment: metric, baseline, new, change. Reviewers see it
  without opening logs.
- Secrets aren't available to PRs from forks — for a personal repo that's fine; know why
  the job skips there.

---

## Prove it works

Make a deliberately bad change — shrink chunks to 64 tokens, or delete the escape hatch
from the prompt — and open a PR. **Watch the gate go red.** That's one of this stage's
readiness checks, and a great screenshot for your README.`,
    docs: [
      {
        label: 'GitHub Actions — workflow syntax',
        url: 'https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions',
      },
      {
        label: 'GitHub Actions — service containers (Postgres)',
        url: `https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/creating-postgresql-service-containers`,
      },
      {
        label: 'Anthropic — building evals',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'regression gate',
        def: 'A CI check that fails when quality metrics drop beyond a tolerance.',
      },
      {
        term: 'baseline',
        def: 'The metric values of the main branch, used for comparison.',
      },
      {
        term: 'noise margin',
        def: 'The tolerance that absorbs normal run-to-run variation.',
      },
      {
        term: 'branch protection',
        def: 'A repository rule that blocks merging until required checks pass.',
      },
    ],
    check: [
      {
        q: 'Why can the retrieval gate be tighter than the generation gate?',
        a: `Retrieval results are deterministic for a fixed index and inputs; generation results vary between runs, so their gate needs a margin for noise.`,
      },
      {
        q: 'How do you find the right tolerance for a generation metric?',
        a: `Run the eval several times on the same commit, measure the spread, and set the tolerance a little above it.`,
      },
      {
        q: 'What happens when a PR improves the metrics?',
        a: `It updates the baseline file in the same PR, so later PRs are compared against the new, higher level.`,
      },
      {
        q: 'How do you prove the gate works?',
        a: 'Open a PR with a deliberately harmful change and confirm the gate fails it.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Wire the gate and watch it fail',
        body: `Add the workflow and gate script to your p-3.1 repo. Generate \`eval/baseline.json\` from
main. Then open two PRs: one harmless (a README edit that touches \`eval/\`), one harmful
(chunk size 64). Screenshot both results.`,
        answer: `What you should see:

- **Harmless PR:** green; the PR comment shows every metric within a point or two of the
  baseline.
- **Harmful PR:** red; the log names the metric that dropped, e.g.
  \`recall@5: 0.812 -> 0.604\`.

Common snags:

- **The job can't reach Postgres:** the service container is \`localhost:5432\` from the
  job's steps; make sure your code reads the DSN from an environment variable.
- **Index build is slow:** use a small fixed corpus snapshot (a few hundred chunks
  covering your golden questions) for CI, and the full corpus nightly.
- **Costs creep:** log token usage per run; if generation eval gets expensive, run a
  tagged subset per PR and the full set on a schedule.

Put both screenshots in the README. "The eval blocks regressions — here's it catching
one" is exactly the evidence the readiness check asks for.`,
      },
      {
        mode: 'read',
        title: 'Is this gate trustworthy?',
        body: `A team's gate fails about one PR in four. When it fails, developers re-run the job, and
it usually passes on the second try. Tolerance for faithfulness: 0.005. Golden set: 30
questions.

What's wrong, and what do you change?`,
        answer: `**The gate is measuring noise.** With 30 questions, one answer flipping moves
faithfulness by several points — far more than the 0.005 tolerance. Re-running "fixes"
it, which teaches everyone to re-run instead of reading it. Soon real regressions get
re-run away too.

Changes:

1. **Measure the noise:** run the eval 5 times on one commit; set the tolerance just above
   the observed spread.
2. **Grow the set** — 100+ questions makes each question matter less.
3. **Gate on retrieval tightly** (deterministic) and generation loosely.
4. Optionally, **average two runs** of the generation eval in CI.

A gate is only useful if a red result means something. Flaky gates are worse than none.`,
      },
      {
        mode: 'primitive',
        title: 'Write the PR comment',
        body: `Without AI: \`comparison_table(base: dict, new: dict, tolerance: dict) -> str\` returns a
markdown table with columns metric, baseline, this PR, change, and a status of ✅ or ❌ per
metric.`,
        answer: `\`\`\`python
def comparison_table(base: dict, new: dict, tolerance: dict) -> str:
    rows = ["| metric | baseline | this PR | change | |", "|---|---|---|---|---|"]
    for m, tol in tolerance.items():
        delta = new[m] - base[m]
        ok = delta >= -tol
        rows.append(f"| {m} | {base[m]:.3f} | {new[m]:.3f} | {delta:+.3f} | {'✅' if ok else '❌'} |")
    return "\\n".join(rows)
\`\`\`

Post it with the GitHub CLI in the workflow (\`gh pr comment ... --body-file\`) or an
action that comments on PRs. The \`{delta:+.3f}\` format shows the sign explicitly, so
"+0.012" and "-0.041" read at a glance.`,
      },
    ],
  },
  {
    id: 's3.8.t7',
    moduleId: 's3.8',
    title: 'Error analysis',
    outcome: `You can read failures by hand, group them into categories, count them, and fix the biggest category first — the loop that actually improves RAG systems.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A doctor doesn't prescribe from the average temperature of the whole hospital. They see
patients, notice patterns, and treat the most common cause first. Metrics tell you there's
a fever. Error analysis tells you why.`,
    notes: `## Metrics say how much; reading says why

"recall@5 is 0.71" doesn't tell you what to change. Twenty failures read one by one do:
"six of these are tables", "four are the old policy version", "three used an acronym".

This is the most valuable hour in the whole stage — and the part most tutorials skip.

---

## The loop

1. **Collect** the failures: golden questions that missed, answers the judge failed.
2. **Read each one** with its full trace — question, retrieved chunks, answer. Write one
   line: what went wrong, in your own words. No categories yet.
3. **Group** the notes into categories once you've read 20–30.
4. **Count.** Sort the categories by size.
5. **Fix the biggest one.** Re-run the eval. Check that the category shrank and nothing else
   grew.
6. Repeat.

---

## Categories you'll probably find

| Category | Stage it points to |
|---|---|
| evidence never retrieved | embeddings, hybrid search, chunking |
| evidence retrieved but ranked too low | reranking |
| answer split across chunks | chunking, parent-document |
| garbage text (tables, columns) | ingestion |
| outdated version retrieved | metadata, filters |
| vocabulary mismatch (acronyms, Hinglish) | hybrid search, query rewriting |
| good context, model embellished | prompt, context assembly |
| wrongly declined / wrongly answered | escape hatch, declining eval |
| question itself ambiguous | clarifying questions, golden-set cleanup |

Your own notes decide the categories — this table is only a starting vocabulary.

---

## Tooling: keep it boring

A spreadsheet works: one row per failure, columns for the question, a link to the trace, your
note, and the category. Or a tiny page in your app that shows a trace with a notes box.

Observability tools (Stage 5) make traces easier to browse. The thinking is the same.

---

## What each round produces

- **A fix**, measured.
- **New golden questions** in the category you fixed, so it can't quietly come back.
- **A line in your README:** "Round 2: 7 of 25 failures were tables flattened by the
  parser. Switched table pages to Docling; table recall@5 went from 0.38 to 0.75."

That line is exactly the kind of story senior interviewers probe for: it shows you debug
systems by evidence, not by trying things until the demo works.`,
    docs: [
      {
        label: 'Hamel Husain — your AI product needs evals',
        url: 'https://hamel.dev/blog/posts/evals/',
      },
      {
        label: 'Anthropic — building evals',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'error analysis',
        def: 'Reading failures one by one, grouping them into categories and fixing the largest first.',
      },
      {
        term: 'trace',
        def: 'The full record of one request: question, retrieved chunks, prompt, answer.',
      },
      {
        term: 'open coding',
        def: 'Writing free-form notes about each failure before deciding on categories.',
      },
    ],
    check: [
      {
        q: 'Why write free-text notes before choosing categories?',
        a: `Categories should come from what you actually see. Deciding them first makes you force failures into boxes and miss the real patterns.`,
      },
      {
        q: 'After fixing a category, what two things do you check?',
        a: `That the category shrank, and that no other category grew — fixes often cause new failures elsewhere.`,
      },
      {
        q: 'What should each round add to the golden set?',
        a: 'New questions in the category you just fixed, so the failure can\'t quietly return.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Run your first round',
        body: `Take v1's failures from your retrieval and faithfulness evals (aim for 25). For each,
open the full trace and write a one-line note. Then group, count and pick the first fix.
Record it as a README paragraph.`,
        answer: `How a good first round looks:

1. **Notes** are specific: "chunk has the Plan B row but without column headers", not
   "retrieval bad".
2. **Categories** after grouping — for a typical v1: tables/parsing 7, never retrieved
   (acronyms, synonyms) 6, ranked too low 5, old version 3, embellished answer 3,
   ambiguous question 1.
3. **The pick:** the biggest category *with a clear fix* — here tables (a parser change
   for table pages). "Never retrieved" is almost as big, but its fix (hybrid search) is
   Module 6's work; it'll be round 2.
4. **The re-run** shows table recall up and — check — nothing else down.

The README paragraph: what you saw, what you changed, the before/after numbers. Three or
four of these rounds make p-3.1's story.`,
      },
      {
        mode: 'read',
        title: 'Categorise these failures',
        body: `Assign each failure to a category:

1. Q: "What's the LTA limit?" The corpus says "Leave Travel Allowance"; top 10 has
   nothing relevant.
2. Q: "Notice period for managers?" Evidence is at rank 7; you send the top 5.
3. Q: "How many sick days?" Answer uses the 2021 policy; the 2025 one says something
   different.
4. Q: "Can I carry forward leave?" Retrieved chunk says "up to 10 days"; the "except in
   the first year" line is in the next chunk.
5. Answer adds "as per government rules" — not in any retrieved passage.`,
        answer: `1. **Vocabulary mismatch → never retrieved.** An acronym the embeddings don't connect.
   Fix: hybrid search, an acronym list for query expansion, or contextual chunks that
   spell it out.
2. **Ranked too low.** Fix: reranking (or sending more, if the budget allows).
3. **Outdated version.** Fix: version metadata and a latest-version filter.
4. **Answer split across chunks.** Fix: structure-aware chunking or parent-document
   retrieval.
5. **Embellishment (unfaithful generation).** Fix: prompt grounding and the faithfulness
   metric to confirm.

Five failures, five different stages. That's why averages alone can't tell you what to fix.`,
      },
      {
        mode: 'decision',
        title: 'Which category first?',
        body: `Round 1 counts: never retrieved 9, ranked too low 8, tables 4, embellished 2, ambiguous
question 2. You have two days. What do you fix first?`,
        answer: `**Ranked too low (8), with a reranker** — probably first, even though "never retrieved"
is bigger.

- A reranker is usually a small code change with a large, measurable effect on exactly
  this category, and it's quick to evaluate.
- "Never retrieved" (9) needs diagnosis first — acronyms, synonyms, missing documents,
  parsing? — and the fixes (hybrid search, query rewriting, re-ingestion) are larger.
  Spend a little of the two days splitting that category by cause, so round 2 can start
  with the right fix.

The general rule: rank by **size × how cheaply and surely you can fix it**, not by size
alone. And whatever you pick, re-run and check nothing else got worse.`,
      },
    ],
  },
];
