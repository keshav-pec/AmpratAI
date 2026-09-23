import type { Topic } from '@/lib/types';

export const s3_1: Topic[] = [
  {
    id: 's3.1.t1',
    moduleId: 's3.1',
    title: 'Why retrieval exists',
    outcome: `You can say exactly which three problems retrieval solves — and recognise the requests where it is the wrong tool.`,
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
        query: 'what is retrieval augmented generation RAG explained',
        channel: 'IBM Technology',
        reason: 'a short, clear whiteboard explanation',
      },
    ],
    animations: [],
    analogy: `Your Express API never ships the whole database to the React app on page load. It queries
for the few rows this page needs. Retrieval is the same move for a model: fetch the few
passages *this question* needs, and send only those.`,
    notes: `## Three gaps a model can't close on its own

1. **It doesn't know your private data.** Your company's leave policy, your contracts, your
   tickets — none of it was in the training data.
2. **It doesn't know anything recent.** Training stops at a cutoff date. Your pricing page
   changed last Tuesday.
3. **It can't show where a claim came from.** Even when it's right, "trust me" is not good
   enough for an HR answer or a legal one.

Retrieval closes all three at once: find the relevant passages when the question arrives,
put them in the prompt, and ask for an answer *from those passages*, with citations.

---

## What RAG actually is

**R**etrieval-**A**ugmented **G**eneration, in one line:

> find passages → put them in the prompt → generate an answer from them

Nothing is learned. The model is exactly the same model. The only thing that changes
from one question to the next is **what you put in the prompt**.

That is also why RAG is cheap to update: edit a document, re-index it, and the next
question sees the new version. No retraining.

---

## Garbage in, fluent garbage out

RAG is a chain, and the chain is only as good as the passages it finds.

If retrieval brings back the 2022 version of the leave policy, the best model in the
world will write a confident, well-formatted, **wrong** answer — and cite it.

In practice, most "the model hallucinated" reports in a RAG system turn out to be
retrieval problems: the right passage was never in the prompt. That is why this stage
spends far more time on ingestion, chunking and retrieval than on the generation step.

---

## When retrieval is the wrong tool

| The request | Better tool |
|---|---|
| "How many open roles do we have in Bangalore?" | **SQL.** It's a count over rows, not a passage to find. |
| "Summarise this 30-page report." | **Send the whole document.** Every part matters. |
| "What's the status of order 4471 right now?" | **A tool / API call.** Live data. |
| "Always reply in our brand's tone." | **The system prompt** (or fine-tuning). It's behaviour, not facts. |
| "Hi!" | **Nothing.** Don't retrieve for a greeting. |

RAG is for questions whose answer *sits in a passage somewhere* in a pile of text too big
to send every time.

---

## What this stage does differently

You've built a basic RAG app already. This stage rebuilds it properly, in a specific order:

- **Audit v1** against twelve questions (the last topic of this module).
- Fix **ingestion, chunking, embeddings and storage** — the foundations.
- **Build the ruler before tuning:** a golden set and metrics come *before* hybrid search
  and reranking, so every improvement is a number, not a feeling.
- Your v1 becomes the first row of the results table in p-3.1.`,
    docs: [
      {
        label: 'Anthropic — reduce hallucinations',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations',
      },
      {
        label: 'The original RAG paper (Lewis et al., 2020)',
        url: 'https://arxiv.org/abs/2005.11401',
      },
    ],
    glossary: [
      {
        term: 'RAG',
        def: 'Retrieval-augmented generation: find relevant passages, put them in the prompt, answer from them.',
      },
      {
        term: 'grounding',
        def: 'Making the model answer from supplied sources instead of from memory.',
      },
      {
        term: 'knowledge cutoff',
        def: 'The date after which the model has no training data.',
      },
      {
        term: 'provenance',
        def: 'Where a claim came from — which document, page and section.',
      },
      {
        term: 'escape hatch',
        def: 'An instruction that gives the model a concrete way to say the answer isn\'t in the sources.',
      },
    ],
    check: [
      {
        q: 'Name the three gaps retrieval closes.',
        a: `Private data the model never saw, recent data after its training cutoff, and provenance — showing where each claim came from.`,
      },
      {
        q: 'Does RAG change the model?',
        a: `No. It changes only what goes into the prompt for each question. Nothing is trained, which is why updating a document is instant.`,
      },
      {
        q: 'Why is "the model hallucinated" often a retrieval bug?',
        a: `If the right passage never reached the prompt, the model answers from whatever it got, or from memory. The generation step can't fix a passage that isn't there.`,
      },
      {
        q: 'A user asks how many contracts expire in March. Why is RAG a poor fit?',
        a: `It's an aggregation over structured data. Retrieval returns a handful of passages, not a complete count. Query the database instead.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Retrieval — or something else?',
        body: `For each request, pick the right tool: **RAG**, **SQL**, **whole document**, **live
API/tool**, **system prompt**, or **no retrieval**.

1. "What's our notice period for employees on probation?" (HR has 400 pages of policies)
2. "Which candidates applied in the last 7 days?"
3. "Summarise the attached 12-page offer letter."
4. "Is the payments service down right now?"
5. "Thanks, that's helpful!"
6. "Which of our three office leases has the earliest break clause?"
7. "Write every answer as three short bullet points."
8. "What did the 2023 travel policy say about per-diem in Mumbai?"`,
        answer: `1. **RAG.** One fact inside a large pile of text.
2. **SQL.** A filter over rows with dates — exact and complete, which retrieval isn't.
3. **Whole document.** A summary needs all of it, and 12 pages fits easily in the window.
4. **Live API/tool.** No document knows the current status.
5. **No retrieval.** Retrieving for a thank-you wastes money and can produce odd answers.
6. **Whole documents, or RAG with care.** Three leases may fit in the window outright.
   If they don't, retrieval must bring back the break clause *from each lease*, which
   plain top-k may not do (Module 6 covers query decomposition for exactly this).
7. **System prompt.** It's a behaviour, not a fact to look up.
8. **RAG with a metadata filter.** The word "2023" must become a filter on the
   document's version or date. Without that metadata, you'll retrieve the current policy
   and answer the wrong year confidently — one reason Module 3 is about metadata.`,
      },
      {
        mode: 'read',
        title: 'Find the broken link in the chain',
        body: `Question: "How many days of paternity leave do I get?"

Retrieved passages (top 3):
1. *Leave Policy v2 (2022)*: "...paternity leave of 5 working days..."
2. *Leave Policy v2 (2022)*: "...leave must be applied for 2 weeks in advance..."
3. *Holiday calendar 2025*: "...Diwali, 20 October..."

Answer: "You get 5 working days of paternity leave [1]."

The current policy (v3, 2025) gives 10 days. Which stage failed, and what's the fix?`,
        answer: `**Retrieval failed; generation did its job.** The model answered faithfully from what it
was given, and even cited it. The problem is *what* it was given.

Likely causes, in order of how often you'll see them:

- **v3 was never ingested**, or ingestion failed silently on it (check your pipeline's
  failed-documents list — Module 3 builds one).
- **Both versions are indexed with no version metadata**, so the old one competed and
  won. Fix: store \`version\` / \`effective_date\`, and either delete superseded versions or
  filter to the latest by default.
- **v3 phrases it differently** ("parental leave for the non-birthing parent"), so vector
  search ranked it lower. Fix: hybrid search and reranking (Module 6).

The lesson: when an answer is wrong, **look at the retrieved passages first.** Most of the
time that's where the bug is.`,
      },
      {
        mode: 'break',
        title: 'Ask v1 something it can\'t know',
        body: `Take your existing RAG project. Ask it three questions whose answers are definitely **not**
in your corpus — one close to the topic, one far from it, and one with a false premise
("Why did we cancel the Pune office?" when there is no Pune office).

Record exactly what it says. Then decide what it *should* say.`,
        answer: `What a typical v1 does:

- **Close-to-topic question:** answers anyway, stitching together nearby passages into
  something plausible. This is the most dangerous case, because it looks grounded.
- **Far question:** answers from the model's general knowledge, ignoring the documents.
- **False premise:** often accepts the premise and invents a reason.

What it should do: say plainly that the documents don't cover it, and, for the false
premise, say it found nothing about a Pune office.

The fixes come in two layers:

1. **The prompt:** an explicit escape hatch — "If the passages don't contain the answer,
   say so and don't answer from general knowledge." (Stage 2's prompting module.)
2. **The eval:** add these no-answer questions to your golden set (Module 8), so you
   *measure* how often the system correctly declines. A system that is never tested on
   unanswerable questions will quietly get worse at them.

A similarity-score threshold ("refuse if the best match is below 0.7") sounds like a fix
but is brittle: scores shift with the embedding model and the query length. Use it as a
signal at most, not the gate.`,
      },
    ],
  },
  {
    id: 's3.1.t2',
    moduleId: 's3.1',
    title: 'RAG vs long context vs fine-tuning',
    outcome: `You can pick between retrieval, long context and fine-tuning for a real problem, and defend the choice with cost, latency, freshness and provenance.`,
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
        query: 'RAG vs fine-tuning vs long context comparison',
        channel: '',
        reason: 'a comparison talk; check it\'s from 2025 or later — the long-context numbers changed a lot',
      },
    ],
    animations: [],
    analogy: `Three ways to prepare for an open-book exam. **RAG:** bring an index and look up the right
pages for each question. **Long context:** carry the whole book and re-read all of it for
every question. **Fine-tuning:** memorise the course beforehand. Memorising is great for
*how* to write answers — and terrible for facts that change next week.`,
    notes: `## The three options, one line each

- **RAG** — find the few relevant passages per question and send only those.
- **Long context** — send the whole corpus with every question. Windows are now 1M tokens
  on Claude Sonnet 5 and Opus 5, so this is a real option for more cases than it used to be.
- **Fine-tuning** — train a model further on your examples, changing its weights.

This comparison is a guaranteed interview question. The good answer is never "it depends"
on its own — it's "it depends on these four numbers."

---

## The four numbers that decide it

| | RAG | Long context | Fine-tuning |
|---|---|---|---|
| **Cost per question** | low — a few thousand tokens | high — the whole corpus, every time (caching helps) | low at run time; training costs up front |
| **Latency** | retrieval (~50–300 ms) + a short prompt | the model must read everything first | lowest |
| **Freshness** | re-index a document: minutes | always fresh — you send the current text | stale until you retrain |
| **Provenance** | cite the exact passage | possible (citations work on documents) | none — facts are baked into weights |

Plus two practical rows: **corpus size** (long context stops at the window; RAG scales to
millions of documents) and **per-user permissions** (easy to filter in retrieval, very hard
to enforce in weights).

---

## Do the arithmetic once

A 400-page HR manual is roughly **250,000 tokens**. On Claude Sonnet 5 ($2 per million input):

- **Long context, uncached:** 250K × $2/M = **$0.50 per question**, and several seconds
  before the first word while the model reads it all.
- **Long context, cache hits:** reads cost about a tenth → about **$0.05**, but only while
  the cache is warm (5 minutes by default) — great for a busy app, useless for a quiet one.
- **RAG:** 8 passages × 500 tokens = 4,000 tokens → about **$0.008 per question**.

RAG is ~60× cheaper than uncached long context here, and faster. But if the whole manual
were 40 pages, the gap shrinks and long context's simplicity starts to win.

---

## When long context wins

- The corpus **fits comfortably** — a few hundred pages or less. Anthropic's own guidance on
  contextual retrieval says a knowledge base under about 200,000 tokens can simply go in the
  prompt, with prompt caching, and skip RAG entirely.
- Questions need **the whole thing**: summaries, "what changed between these two versions",
  cross-references between sections.
- You're **prototyping** and want a baseline. Long context is the strongest no-engineering
  baseline your RAG system has to beat.

It has limits: quality still drops as inputs grow (Chroma's 2025 "context rot" study found
this even on simple tasks), and the cost scales with every question.

---

## When fine-tuning wins

Fine-tuning changes **behaviour**, not knowledge:

- a consistent output format or tone that prompting can't hold
- a narrow classification task at high volume, moved to a small, cheap model
- domain phrasing the model keeps getting wrong

It is the wrong tool for facts: it can't cite, it goes stale the day a document changes,
and it can't respect "this user may only see these documents." Stage 5 has an optional
module on when and how to fine-tune.

---

## They combine

The real answer is often a mix:

- **RAG + long context:** windows are large now, so retrieve *whole sections* (or whole
  documents) instead of tiny chunks, and let the model read more around the answer.
- **RAG + a fine-tuned small model:** retrieval supplies the facts; the tuned model supplies
  the format, cheaply.

A strong interview answer: *"Start with long context as the baseline if the corpus fits.
Move to RAG when cost, latency, corpus size or permissions force it — and prove it with the
eval numbers. Fine-tune only for behaviour, never for facts."*`,
    docs: [
      {
        label: 'Anthropic — context windows',
        url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
      },
      {
        label: 'Anthropic — pricing',
        url: 'https://platform.claude.com/docs/en/about-claude/pricing',
      },
      {
        label: 'Anthropic — prompt caching',
        url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      },
      {
        label: 'Chroma — context rot research',
        url: 'https://research.trychroma.com/context-rot',
      },
    ],
    glossary: [
      {
        term: 'long context',
        def: 'Sending the entire corpus in the prompt instead of retrieving parts of it.',
      },
      {
        term: 'fine-tuning',
        def: 'Training a model further on your examples, changing its weights.',
      },
      {
        term: 'context rot',
        def: 'Answer quality dropping as the input gets longer, even when the answer is present.',
      },
      {
        term: 'baseline',
        def: 'The simplest approach, which any cleverer approach must measurably beat.',
      },
    ],
    check: [
      {
        q: 'Which of the three can respect per-user document permissions, and why?',
        a: `RAG — you filter the retrieval query by the user's permissions. Long context can too, if you only send permitted documents. Fine-tuning can't: once facts are in the weights, every user can get them out.`,
      },
      {
        q: 'Why is fine-tuning the wrong way to teach a model your leave policy?',
        a: `It can't cite a source, it's stale the moment the policy changes, and it can't enforce who may see what. It's for behaviour, not facts.`,
      },
      {
        q: `Roughly how many tokens is a 400-page manual, and what does one uncached long-context question cost on a $2-per-million model?`,
        a: 'About 250,000 tokens, so about $0.50 per question — before counting the output.',
      },
      {
        q: 'When is long context the right first move?',
        a: `When the corpus fits comfortably in the window (a few hundred pages), questions need the whole thing, or you want a quick baseline for RAG to beat.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Pick one, defend it with numbers',
        body: `For each scenario, choose RAG, long context, fine-tuning, or a combination, and give the
one number that decided it.

1. A support bot over 35,000 help-centre articles, updated daily, ~20,000 questions a day.
2. A tool that answers questions about **one** uploaded 60-page contract per session.
3. A classifier that tags 2 million support tickets a month into 14 categories; prompting
   Haiku gets 91% accuracy, you need 97%.
4. An internal assistant over a 90-page engineering handbook, about 30 questions a day.`,
        answer: `1. **RAG.** 35,000 articles is tens of millions of tokens — it doesn't fit any window,
   and daily updates rule out fine-tuning. The deciding number: corpus size vs window.
2. **Long context.** 60 pages is roughly 35,000–40,000 tokens: it fits easily, and the
   user asks many questions about the same document in one session, so prompt caching
   makes follow-ups cheap. Building an index per upload is effort with little gain.
3. **Fine-tuning** (or a strong prompt plus more examples first). This is behaviour — a
   consistent classification — at very high volume, and there are no facts to cite. The
   deciding number: 2 million calls a month, where a smaller tuned model cuts cost and
   lifts accuracy.
4. **Long context with caching, probably.** 90 pages is ~55,000 tokens. At 30 questions a
   day, cache hits are rare, so each question costs about 55K × $2/M ≈ $0.11 on Sonnet 5
   — about $100 a month. Cheap enough that RAG's engineering effort may not pay off.
   Re-check if usage grows 10×.`,
      },
      {
        mode: 'primitive',
        title: 'Build the cost comparison yourself',
        body: `Without AI, write a small Python function:

\`\`\`python
def cost_per_question(corpus_tokens, k, chunk_tokens, output_tokens,
                      in_price, out_price, cache_hit_rate=0.0):
    ...
\`\`\`

It returns a dict with the per-question cost of long context (with the given cache hit
rate, reads at 0.1× and writes at 1.25×) and of RAG. Run it for the 400-page manual at
cache hit rates of 0, 0.5 and 0.9.`,
        answer: `\`\`\`python
def cost_per_question(corpus_tokens, k, chunk_tokens, output_tokens,
                      in_price, out_price, cache_hit_rate=0.0):
    per_tok_in = in_price / 1_000_000
    per_tok_out = out_price / 1_000_000
    out = output_tokens * per_tok_out

    hit, miss = cache_hit_rate, 1 - cache_hit_rate
    long_in = corpus_tokens * per_tok_in * (hit * 0.1 + miss * 1.25)
    rag_in = k * chunk_tokens * per_tok_in

    return {"long_context": round(long_in + out, 4),
            "rag": round(rag_in + out, 4)}

for h in (0, 0.5, 0.9):
    print(h, cost_per_question(250_000, 8, 500, 400, 2, 10, h))
\`\`\`

With Sonnet 5 prices ($2 in, $10 out) and 400 output tokens:

| cache hit rate | long context | RAG |
|---|---|---|
| 0 | ~$0.63 | ~$0.012 |
| 0.5 | ~$0.34 | ~$0.012 |
| 0.9 | ~$0.11 | ~$0.012 |

Two things to notice. A miss is *worse* than uncached, because it pays the 1.25× write.
And even at a 90% hit rate, RAG is still about 9× cheaper — but at that point the
difference is cents, and simplicity might matter more.`,
      },
      {
        mode: 'read',
        title: 'Critique this architecture decision',
        body: `A teammate writes: *"We'll fine-tune an open model on our 2,000 product docs so it
knows everything. Then we don't need a vector database, and answers will be faster."*

List the problems, and propose what you'd do instead.`,
        answer: `Problems:

- **No citations.** Users and support staff can't check where an answer came from.
- **Stale on day one.** Every doc change means another training run.
- **Unreliable recall of facts.** Fine-tuning is good at style and format; it is poor at
  storing thousands of precise facts. Expect confident, subtly wrong details (model
  numbers, limits, prices).
- **No permissions.** Internal-only docs baked into weights can leak to any user.
- **Hidden costs.** Training, evaluation and hosting your own model are real engineering
  work — the "no vector database" saving is small next to that.

Instead: RAG over the 2,000 docs (2,000 docs is small — pgvector handles it easily) with
citations and metadata. If answers need a specific format or tone, handle that in the
prompt first; fine-tune a small model for format only if the prompt can't hold it.`,
      },
    ],
  },
  {
    id: 's3.1.t3',
    moduleId: 's3.1',
    title: 'The eight stages — and auditing your own project',
    outcome: `You can name the eight stages of a RAG pipeline and what breaks at each — and you've audited your v1 against twelve questions.`,
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
        query: 'RAG pipeline from scratch ingestion chunking embedding retrieval',
        channel: '',
        reason: 'a full-pipeline walkthrough; watch the architecture parts, skip the framework setup',
      },
    ],
    animations: ['anim-rag-pipeline'],
    analogy: `An assembly line. A defect introduced at station 2 only shows up at the end of the line, on
the finished product. Debugging RAG means walking back down the line, station by station,
until you find where the defect got in.`,
    notes: `## The eight stages

**Offline** — runs whenever documents change:

1. **Ingest** — turn files (PDF, HTML, docx…) into clean text plus metadata
2. **Chunk** — split the text into retrievable pieces
3. **Embed** — turn each chunk into a vector
4. **Index** — store vectors, text and metadata so search is fast

**Online** — runs for every question:

5. **Retrieve** — find candidate chunks (vector + keyword search)
6. **Rerank** — read each candidate *with* the question; keep the best few
7. **Assemble** — build the prompt inside a token budget, in a sensible order
8. **Generate** — write the answer, with citations

**Around all of it:** evaluation — a fixed question set that measures every stage.

---

## Offline and online are different worlds

| | Offline (1–4) | Online (5–8) |
|---|---|---|
| Runs | when documents change | on every question |
| Latency budget | minutes to hours is fine | ~1–3 seconds total |
| Failure mode | silent: bad text gets indexed and stays there | visible: a slow or wrong answer |
| Built as | a queue + workers | your API request path |

The offline side fails **quietly**. A table that parsed into gibberish in March is still
gibberish in your index in September, making every related answer worse. That's why
ingestion gets its own module.

---

## What breaks at each stage

| Stage | A typical defect |
|---|---|
| Ingest | a table flattened into a word soup; a two-column page read across the columns |
| Chunk | the answer split across two chunks, neither enough on its own |
| Embed | queries and documents embedded differently; a model weak on your domain |
| Index | approximate search quietly skipping the best match |
| Retrieve | an exact code like \`ERR-4471\` missed, because vectors blur exact strings |
| Rerank | none at all, so the right chunk sits at rank 9 and never reaches the prompt |
| Assemble | 20 chunks stuffed in; the key one lost in the middle |
| Generate | answers from memory instead of the passages; citations that don't support the claim |

---

## Audit your v1: twelve questions

Answer each one about your existing project. **"I don't know" is a valid answer** — each
one is a module of this stage.

1. What happens to a table, a two-column page and a scanned page during ingestion?
2. What metadata does each chunk carry? Could you filter by date, source or permission today?
3. How big are your chunks, and why that size?
4. Which embedding model and distance metric? Are the vectors normalised?
5. If one document changes, what gets re-processed — that document, or everything?
6. Which index type, and what's its recall compared with exact search?
7. Does keyword search play any part? What happens with an exact error code or product ID?
8. How many chunks go into the prompt, in what order, and how many tokens is that?
9. Can a user click a citation and land on the right page and section?
10. What happens when the answer isn't in the corpus?
11. What's your recall@5 on a fixed set of questions?
12. What does one question cost, and how long does it take at p95?

---

## Turning the audit into your plan

Put the answers in \`AUDIT.md\` in the v1 repo. Then:

- Every "I don't know" → that's the module that answers it.
- Question 11 almost always has no answer — **there is no fixed question set yet.** That's
  why evaluation comes before the tuning modules in this stage.
- v1's numbers (once you can measure them) become **row 1 of the results table** in p-3.1.
  Every later version is a new row, and the table is the portfolio piece.`,
    docs: [
      {
        label: 'Anthropic — long-context prompting tips',
        url: `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#long-context-prompting`,
      },
      {
        label: 'Anthropic — citations',
        url: 'https://platform.claude.com/docs/en/build-with-claude/citations',
      },
    ],
    glossary: [
      {
        term: 'ingestion',
        def: 'Turning source files into clean text plus metadata.',
      },
      {
        term: 'indexing',
        def: 'Storing vectors, text and metadata so search is fast.',
      },
      {
        term: 'reranking',
        def: 'Re-scoring retrieved candidates by reading each one together with the question.',
      },
      {
        term: 'golden set',
        def: 'A fixed, hand-written set of questions with known correct sources, used to measure the system.',
      },
      {
        term: 'offline pipeline',
        def: 'The part that runs when documents change, not when questions arrive.',
      },
    ],
    check: [
      {
        q: 'Which four stages run offline, and when?',
        a: 'Ingest, chunk, embed and index — whenever documents are added, changed or deleted.',
      },
      {
        q: 'Why are offline failures more dangerous than online ones?',
        a: `They're silent. A badly parsed document stays in the index and quietly damages every related answer until someone notices.`,
      },
      {
        q: 'An answer is wrong. Where do you look first?',
        a: `At the retrieved passages. If the right passage wasn't retrieved, the bug is upstream (ingest, chunk, embed, index or retrieve). If it was, look at assembly and generation.`,
      },
      {
        q: 'Why does audit question 11 usually have no answer yet?',
        a: `Because v1 has no fixed question set with known correct sources. Without one, you can't compute recall@5 — or tell whether any change helped.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Run the audit on your v1',
        body: `Open your existing RAG project. Answer the twelve questions in \`AUDIT.md\`, with
evidence where you can (a code link, a query you ran, a screenshot).

For each "I don't know", write which module of this stage you expect to answer it.`,
        answer: `A realistic v1 audit looks something like this:

| # | Typical v1 answer | Where it gets fixed |
|---|---|---|
| 1 | "PyPDF text; never checked tables or scans" | Module 3 — ingestion |
| 2 | "Only the file name" | Module 3 — metadata design |
| 3 | "1,000 characters, 200 overlap — the tutorial default" | Module 4 — chunking |
| 4 | "OpenAI small embeddings, cosine; don't know about normalisation" | Module 2 — embeddings |
| 5 | "Everything — I re-run the whole script" | Module 3 — incremental sync |
| 6 | "Whatever Chroma does by default" | Module 5 — vector storage |
| 7 | "No keyword search" | Module 6 — hybrid search |
| 8 | "Top 4, similarity order, never counted tokens" | Module 7 — context assembly |
| 9 | "Shows the file name only" | Module 7 — citations |
| 10 | "It makes something up" | Stage 2 escape hatch + Module 8 no-answer questions |
| 11 | "No question set" | Module 8 — golden set |
| 12 | "Never measured" | Module 8 + Stage 5 |

If yours looks like this, good: that's the honest starting point, and it's exactly what
a hiring manager wants to see improve over a results table. The audit itself is worth
keeping in the p-3.1 repo — it shows where you started.`,
      },
      {
        mode: 'read',
        title: 'Which stage failed?',
        body: `Name the failing stage for each:

1. Question: "What's the fee for ERR-2210 refunds?" The chunk containing "ERR-2210" exists
   in the index, but the top 5 results are all about refunds in general.
2. The answer cites page 14, but page 14 says nothing like the claim.
3. A question about a benefits table gets an answer with numbers from the wrong row.
   The retrieved chunk reads "Plan A Plan B Plan C 5,000 10,000 15,000 Dental Vision…"
4. The right chunk is retrieved at rank 7. The prompt includes only the top 5.`,
        answer: `1. **Retrieve.** Vector search blurs exact identifiers; the error code needs keyword
   search in the mix (hybrid, Module 6).
2. **Generate.** The citation doesn't support the claim — the model wrote something the
   passage doesn't say. Measure citation correctness (Module 8) and consider the
   Citations API, which guarantees the cited text exists (Module 7).
3. **Ingest.** The table was flattened during parsing, so row/column structure was lost
   before chunking even started. No retrieval trick fixes that (Module 3).
4. **Rerank** (missing). A reranker reorders the top 50 so the right chunk climbs into
   the top 5. Or assemble more chunks — but reranking is usually the better fix.`,
      },
      {
        mode: 'decision',
        title: 'Where does week one go?',
        body: `Your audit shows: tables parse badly, there's no metadata, chunking is the tutorial
default, there's no keyword search, and there's no question set.

You have limited time before you want visible improvement. What do you do first, and
what do you deliberately leave for later?`,
        answer: `**First: a small golden set** — even 30 hand-written questions with known correct
sources. Without it, every other change is a guess: you can't tell whether a new chunk
size helped or hurt. It also produces v1's first row of numbers.

**Second: ingestion quality**, if many golden-set questions touch tables. A parsing fix is
upstream of everything, and garbage text caps every downstream score.

**Third: metadata**, because it's cheap now and painful later (re-ingesting everything to
add a field you forgot).

Deliberately **later:** hybrid search, reranking, query rewriting. They're big wins, but
only measurable once the ruler exists — and they compensate for upstream problems you'd
rather fix at the source.`,
      },
    ],
  },
];
