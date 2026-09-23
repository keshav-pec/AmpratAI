import type { Topic } from '@/lib/types';

export const s3_2: Topic[] = [
  {
    id: 's3.2.t1',
    moduleId: 's3.2',
    title: 'Choosing an embedding model',
    outcome: `You can shortlist embedding models on what actually matters — quality on your data, dimensions, cost, input length and languages — and pick one with a test, not a leaderboard.`,
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
        query: 'text embeddings explained vector similarity',
        channel: '',
        reason: 'a visual explanation of what an embedding is',
      },
    ],
    animations: [],
    analogy: `You wouldn't pick a database index from someone's benchmark blog post; you'd run *your*
queries on *your* data. Embedding leaderboards are the blog posts. Useful for a shortlist,
never for the final choice.`,
    notes: `## What the model decides for you

An embedding model turns text into a list of numbers (a vector) so that texts with similar
meaning get similar vectors. But "similar" is whatever the model learned from its training
data.

A model trained mostly on web pages may think two legal clauses are near-identical when a
lawyer would say they're opposites. That's why **domain fit** matters more than a
leaderboard rank.

---

## Five things to compare

| Criterion | Why it matters |
|---|---|
| **Retrieval quality on your data** | the only number that counts; measured with your golden set |
| **Dimensions** | storage and speed: 3,072 numbers per chunk costs 3× what 1,024 does |
| **Price per million tokens** | paid once for the corpus, plus once per query |
| **Max input length** | text past the limit is cut off or rejected, depending on the API |
| **Languages** | will users ask in Hindi or Hinglish about English documents? |

Plus two practical ones: **hosted or self-hosted** (data residency, cost at scale), and
whether it supports **shorter vectors and quantisation** (topic 5).

---

## The landscape, mid-2026

- **Voyage AI** — the provider Anthropic's docs point to. \`voyage-4-large\`, \`voyage-4\` and
  \`voyage-4-lite\` (32K-token input, 1,024 dimensions by default, 256–2,048 available);
  \`voyage-4-nano\` is open-weight. Domain models: \`voyage-code-3\`, \`voyage-law-2\`,
  \`voyage-finance-2\`. \`voyage-context-4\` embeds chunks with awareness of their document.
- **OpenAI** — \`text-embedding-3-small\` (1,536 dims, very cheap) and
  \`text-embedding-3-large\` (3,072 dims); a \`dimensions\` parameter shortens them.
- **Google** — \`gemini-embedding-001\` (3,072 dims by default; 768 and 1,536 available).
- **Cohere** — \`embed-v4.0\`, multilingual and multimodal.
- **Open-weight, run yourself** — BGE-M3, Qwen3-Embedding, EmbeddingGemma and others,
  via \`sentence-transformers\`.

Names and prices move every few months. Treat this as a map, not a menu.

---

## Leaderboards: a shortlist, not an answer

**MTEB** (the Massive Text Embedding Benchmark, on Hugging Face) ranks hundreds of models.
Three cautions:

1. The headline score averages many tasks — classification, clustering, and more. Look at
   the **retrieval** column only.
2. Its datasets aren't your documents. Your domain and language may rank models differently.
3. Some models are trained on data close to the benchmark, which flatters them.

Use it to pick **three candidates**. Then test.

---

## The bake-off

1. Take a sample: ~2,000 chunks and your golden-set questions (Module 8; even 30 will do).
2. Embed the sample with each candidate — **using each model's query/document settings
   correctly** (topic 2).
3. Measure recall@5 and recall@10 for each, plus cost and latency per query.
4. Pick the cheapest model within a point or two of the best.

And from day one, **store the model name and version next to every vector**. Vectors from
two different models live in different spaces — even when they have the same number of
dimensions — and must never be compared or mixed in one index.`,
    docs: [
      {
        label: 'Anthropic — embeddings (Voyage AI)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/embeddings',
      },
      {
        label: 'MTEB leaderboard',
        url: 'https://huggingface.co/spaces/mteb/leaderboard',
      },
      {
        label: 'Sentence Transformers docs',
        url: 'https://sbert.net/',
      },
    ],
    glossary: [
      {
        term: 'embedding',
        def: 'A list of numbers representing a text\'s meaning, so similar texts get similar lists.',
      },
      {
        term: 'dimensions',
        def: 'How many numbers are in each vector — 1,024 is common.',
      },
      {
        term: 'MTEB',
        def: 'The Massive Text Embedding Benchmark: a public leaderboard of embedding models across many tasks.',
      },
      {
        term: 'open-weight model',
        def: 'A model whose weights you can download and run yourself.',
      },
      {
        term: 'bake-off',
        def: 'A head-to-head test of candidate models on your own data.',
      },
    ],
    check: [
      {
        q: `Why can't you compare a vector from model A with one from model B, even if both have 1,024 dimensions?`,
        a: `Each model maps text into its own space. Coordinate 17 means something different in each, so distances between them are meaningless.`,
      },
      {
        q: 'What happens to a chunk longer than the model\'s input limit?',
        a: `Depending on the API, it's rejected with an error or silently cut off. If it's cut off, the vector only represents the beginning of the chunk.`,
      },
      {
        q: 'Why is MTEB\'s overall average a weak way to choose?',
        a: `It averages many task types; retrieval is one column. And the benchmark's data isn't your documents or languages.`,
      },
      {
        q: 'What should you store next to every vector, and why?',
        a: `The embedding model's name and version (and the dimensions), so you can never mix models by accident and can migrate cleanly later.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Run a three-model bake-off',
        body: `Pick three models: one cheap hosted (\`text-embedding-3-small\`), one strong hosted
(\`voyage-4\` or \`voyage-4-lite\`), and one open-weight you run locally (BGE-M3 via
\`sentence-transformers\`).

Embed ~2,000 chunks from your corpus with each. Run 20–30 golden questions. Produce a
table: recall@5, recall@10, cost to embed the full corpus, and median query-embedding
latency.`,
        answer: `Your table should look like this (numbers are yours to fill):

| Model | recall@5 | recall@10 | full-corpus cost | query latency |
|---|---|---|---|---|
| text-embedding-3-small | | | | |
| voyage-4-lite | | | | |
| BGE-M3 (local) | | | | |

The pitfalls that make bake-offs lie:

- **Forgetting query/document settings.** Voyage needs \`input_type="query"\` for
  questions and \`"document"\` for chunks. Leave it out and Voyage is handicapped.
- **Not normalising the local model.** Pass \`normalize_embeddings=True\` in
  \`sentence-transformers\`, or its dot-product results won't match cosine.
- **Different chunk sets.** Every model must see the exact same chunks and questions.
- **Too few questions.** With 20 questions, one question is 5 points of recall. Treat
  differences under ~5 points as a tie.

A common result: the models land within a few points on general text, and one pulls
clearly ahead on your domain's jargon. If they tie, pick on cost, latency and whether you
can send the data to a third party at all.`,
      },
      {
        mode: 'decision',
        title: 'Pick a model for each case',
        body: `1. Indian legal judgments in English. Client contract says data may not leave your cloud.
2. Code search across 40 internal repositories.
3. A support bot where users ask in Hindi, English and Hinglish, over English help articles.
4. A weekend prototype on a student budget.`,
        answer: `1. **An open-weight model you host** (for example BGE-M3, Qwen3-Embedding or
   \`voyage-4-nano\`), because the data can't go to a hosted API. Then bake off two of them
   on real judgments — legal language is where general models most often stumble.
2. **A code-specific model** such as \`voyage-code-3\` if hosted is allowed. Code search
   also needs keyword search for exact identifiers (hybrid, Module 6) and chunking by
   function or class (Module 4).
3. **A strong multilingual model** (Voyage 4, Cohere embed-v4.0, Gemini, BGE-M3), and —
   the important part — **put Hinglish questions in the golden set.** Cross-language
   retrieval is exactly where models differ most, and you'll only see it if you test it.
4. **\`text-embedding-3-small\`.** Cheap, decent, easy. Store the model name so you can
   migrate later without guesswork.`,
      },
      {
        mode: 'read',
        title: 'Why did recall drop after the upgrade?',
        body: `A teammate "upgraded" from \`text-embedding-3-small\` to \`voyage-4\`. They changed the
embedding call in the query path and deployed. Recall@5 fell from 0.78 to 0.09.
No errors anywhere.

What happened, and what's the correct migration?`,
        answer: `**Queries are now embedded with Voyage, but the stored chunks are still OpenAI vectors.**
The two models live in different spaces, so the "nearest" chunks are close to random.
(Both return lists of floats, and a 1,024-dim Voyage query can even be compared against a
1,024-dim OpenAI vector without any error — which is why nothing complained.)

Correct migration (topic 3 covers it in detail):

1. Add a new vector column (or table) for Voyage vectors.
2. Re-embed the whole corpus into it in the background.
3. Evaluate both on the golden set.
4. Switch queries to Voyage **and** the new column at the same time, behind a flag.
5. Keep the old column until you're sure, then drop it.

A cheap guard: store the model name per row and assert it matches the query model.`,
      },
    ],
  },
  {
    id: 's3.2.t2',
    moduleId: 's3.2',
    title: 'Distance metrics, normalisation and silent recall killers',
    outcome: `You can pick the right distance operator for your model, and you know the four mistakes that quietly ruin recall without a single error.`,
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
        query: 'cosine similarity vs dot product vs euclidean distance embeddings',
        channel: '',
        reason: 'a visual comparison of the three measures',
      },
    ],
    animations: ['anim-embedding-space'],
    analogy: `Comparing prices in rupees against prices in dollars without converting: every comparison
runs, nothing crashes, and the answers are wrong. Most embedding bugs are like this. The code
works. The results are quietly worse.`,
    notes: `## Three ways to measure "close"

- **Cosine similarity** — the angle between two vectors. Ignores their lengths.
- **Dot product** — the angle *and* the lengths multiplied together.
- **Euclidean (L2) distance** — the straight-line distance between the two points.

They can disagree. With a dot product, a vector that is simply *longer* can win over one
that points in a better direction.

---

## The shortcut: unit-length vectors

If every vector has length exactly 1 (it's **normalised**), all three give **the same
ranking**:

- dot product = cosine similarity
- L2 distance² = 2 − 2 × cosine similarity

OpenAI and Voyage return normalised vectors already. Many local models don't unless you ask:

\`\`\`python
model.encode(texts, normalize_embeddings=True)   # sentence-transformers
\`\`\`

Once vectors are normalised, use dot product (the fastest) or cosine (the most forgiving)
— they'll agree.

---

## The same thing in pgvector

| Operator | Meaning | Index opclass |
|---|---|---|
| \`<=>\` | cosine distance (1 − cosine similarity) | \`vector_cosine_ops\` |
| \`<#>\` | **negative** inner product | \`vector_ip_ops\` |
| \`<->\` | L2 distance | \`vector_l2_ops\` |

\`\`\`sql
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);

SELECT id, 1 - (embedding <=> $1) AS similarity
FROM chunks
ORDER BY embedding <=> $1
LIMIT 10;
\`\`\`

Why *negative* inner product? Postgres index scans return the smallest values first, so the
most similar item needs the smallest number.

**The operator must match the index opclass.** If they don't, Postgres can't use the index
and scans the whole table: results stay correct, but slow. \`EXPLAIN\` shows it.

---

## Four silent recall killers

1. **Ignoring query/document settings.** Many models embed questions and passages
   differently: Voyage's \`input_type="query"\` / \`"document"\`, Cohere's \`input_type\`,
   Gemini's task types, and prefixes like \`"query: "\` / \`"passage: "\` for E5-style models.
   Forget them and recall drops, with no error.
2. **Unnormalised vectors with dot product.** Long, high-magnitude vectors win regardless
   of relevance.
3. **Mixed models or versions in one index** — the upgrade bug from topic 1.
4. **Silent truncation.** A 3,000-token chunk into a 512-token model: the vector only
   describes the first sixth of it.

---

## Catch them with a 20-line test

\`\`\`python
def test_embedding_sanity():
    pairs = [("How many days of paternity leave?", "Employees get 10 days of paternity leave..."),
             ...]  # 5 known question -> passage pairs
    distractors = [...]  # 5 unrelated passages

    for q, gold in pairs:
        qv = embed_query(q)
        ranked = rank(qv, [embed_doc(gold)] + [embed_doc(d) for d in distractors])
        assert ranked[0] == 0, f"gold passage not first for: {q}"

    v = embed_doc("any text")
    assert abs(sum(x * x for x in v) - 1) < 1e-3, "vectors are not normalised"
\`\`\`

Add a check that the model name in config matches the model name stored with the vectors.
Run it in CI. It takes seconds and catches three of the four killers.`,
    docs: [
      {
        label: 'pgvector README — querying and indexing',
        url: 'https://github.com/pgvector/pgvector',
      },
      {
        label: 'Anthropic — embeddings FAQ (normalisation, input_type)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/embeddings#faq',
      },
    ],
    glossary: [
      {
        term: 'cosine similarity',
        def: 'How closely two vectors point the same way, ignoring their lengths. 1 means identical direction.',
      },
      {
        term: 'dot product',
        def: 'Multiply matching numbers and add them up. Depends on direction and length.',
      },
      {
        term: 'L2 distance',
        def: 'Straight-line distance between two points.',
      },
      {
        term: 'normalised vector',
        def: 'A vector scaled to length 1.',
      },
      {
        term: 'opclass',
        def: 'The operator class an index is built for; it decides which operators the index can serve.',
      },
    ],
    check: [
      {
        q: 'If vectors are unit length, why do cosine, dot product and L2 give the same ranking?',
        a: `For unit vectors the dot product equals the cosine, and squared L2 distance equals 2 − 2 × cosine. Sorting by any of them gives the same order.`,
      },
      {
        q: 'Why does pgvector\'s inner-product operator return a negative number?',
        a: `Index scans return the smallest values first. Negating the dot product makes the most similar item the smallest.`,
      },
      {
        q: 'What\'s the symptom of using `<=>` against an index built with `vector_l2_ops`?',
        a: `The index isn't used. Results are still correct but the query does a sequential scan and is slow; EXPLAIN shows it.`,
      },
      {
        q: 'What does Voyage\'s `input_type` actually do?',
        a: `It prepends a short instruction (one for queries, one for documents) before embedding, so questions and passages are represented in the way the model was trained to match.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Prove the equivalence by hand',
        body: `Without numpy, write \`cosine(a, b)\`, \`dot(a, b)\` and \`l2(a, b)\` in plain Python, plus
\`normalise(v)\`.

1. Make three random 8-dimensional vectors, normalise them, and show that ranking two
   candidates against a query gives the same order under all three measures.
2. Now build a counter-example with **unnormalised** vectors where dot product ranks a
   candidate first that cosine ranks last.`,
        answer: `\`\`\`python
import math, random

def dot(a, b): return sum(x * y for x, y in zip(a, b))
def norm(a): return math.sqrt(dot(a, a))
def cosine(a, b): return dot(a, b) / (norm(a) * norm(b))
def l2(a, b): return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))
def normalise(v): n = norm(v); return [x / n for x in v]

q, c1, c2 = (normalise([random.gauss(0, 1) for _ in range(8)]) for _ in range(3))
by_cos = sorted([c1, c2], key=lambda c: -cosine(q, c))
by_dot = sorted([c1, c2], key=lambda c: -dot(q, c))
by_l2 = sorted([c1, c2], key=lambda c: l2(q, c))
assert by_cos == by_dot == by_l2
\`\`\`

A counter-example in 2D, which is enough:

\`\`\`python
q = [1.0, 0.0]
a = [0.9, 0.1]      # almost the same direction, short
b = [5.0, 5.0]      # 45 degrees off, but long
cosine(q, a), cosine(q, b)   # 0.994, 0.707  -> a wins
dot(q, a), dot(q, b)         # 0.9,   5.0    -> b wins
\`\`\`

\`b\` wins on dot product purely because it's long. With real embeddings, "long" often
correlates with things like chunk length or boilerplate — not relevance.`,
      },
      {
        mode: 'read',
        title: 'Predict the query plan',
        body: `\`\`\`sql
CREATE INDEX chunks_emb_idx ON chunks USING hnsw (embedding vector_l2_ops);

EXPLAIN SELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 10;
\`\`\`

The table has 2 million rows. What does the plan show, how fast is it, are the results
right, and what are the two ways to fix it?`,
        answer: `The plan shows a **sequential scan** plus a sort (a top-N heapsort), not an index scan:
\`vector_l2_ops\` supports \`<->\`, not \`<=>\`, so the planner can't use the index.

The results are **correct** — exact cosine ordering over every row — but slow: 2 million
distance calculations per query, likely seconds instead of milliseconds.

Two fixes:

1. Rebuild the index for cosine: \`CREATE INDEX ... USING hnsw (embedding vector_cosine_ops);\`
2. Or query with the operator the index supports: \`ORDER BY embedding <-> $1\` — which
   gives the same ranking as cosine **if the vectors are normalised**.

This is the "slow, not wrong" failure. It's the friendliest one, because a latency graph
will show it.`,
      },
      {
        mode: 'break',
        title: 'Remove the query setting and measure',
        body: `With Voyage (or any model with query/document modes): embed your chunks correctly with
\`input_type="document"\`. Then run your golden set twice — once embedding questions with
\`input_type="query"\`, once with no \`input_type\` at all.

Record recall@5 for both. Then add a test that would have caught it.`,
        answer: `Expect the version without \`input_type\` to score **lower** — often by a few points of
recall, sometimes much more on short, question-style queries. The exact size depends on
the model and corpus; the lesson doesn't:

**Nothing errors.** The only way to know is to measure.

A test that catches it: wrap embedding in two functions — \`embed_query()\` and
\`embed_document()\` — and ban direct calls to the client elsewhere (a grep in CI works).
Then the known-pairs sanity test from the slides runs through \`embed_query()\`, so a missing
setting fails the test instead of silently shipping.`,
      },
    ],
  },
  {
    id: 's3.2.t3',
    moduleId: 's3.2',
    title: 'Batching, caching and the cost of re-embedding',
    outcome: `You can embed a large corpus fast, never pay twice for the same text, and switch embedding models without downtime.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `\`npm install\` with a lockfile and a cache: packages that haven't changed aren't downloaded
again. An embedding cache keyed by a hash of the text does the same thing for your corpus.`,
    notes: `## The money is small; the time isn't

A 500-page corpus is roughly 300,000 tokens. At $0.02 per million (\`text-embedding-3-small\`)
that's under one cent. Embedding is usually the cheapest part of a RAG system.

What actually hurts:

- **Time.** One chunk per request, one request at a time: hours for a big corpus.
- **Rate limits.** Too many requests at once → 429s, retries, and it ends up slower.
- **Re-doing work.** Re-embedding everything because one document changed.

---

## Batching plus bounded concurrency

Embedding APIs accept a **list** of texts per request (up to a per-request limit on count
and total tokens — check your provider's). Combine that with the semaphore pattern from
Stage 1:

\`\`\`python
import asyncio

sem = asyncio.Semaphore(4)          # at most 4 requests in flight

async def embed_batch(texts: list[str]) -> list[list[float]]:
    async with sem:
        r = await vo.embed(texts, model="voyage-4-lite", input_type="document")
        return r.embeddings

async def embed_all(chunks: list[str], size: int = 128):
    batches = [chunks[i:i + size] for i in range(0, len(chunks), size)]
    results = await asyncio.gather(*(embed_batch(b) for b in batches))
    return [v for batch in results for v in batch]
\`\`\`

(\`vo\` here is Voyage's async client, \`voyageai.AsyncClient(max_retries=3)\` — check your
client's retry default; Voyage's is no retries.) Tune the batch size and the semaphore
against your rate limit, and make sure every 429 is retried with backoff.

---

## Never pay twice: a content-hash cache

\`\`\`python
import hashlib

def cache_key(text: str, model: str, dims: int, input_type: str) -> str:
    raw = f"{model}|{dims}|{input_type}|{text}"
    return hashlib.sha256(raw.encode()).hexdigest()
\`\`\`

Store \`key → vector\` in a table. Before embedding a batch, look up all keys at once
(\`WHERE key = ANY($1)\`), embed only the misses, and write them back with
\`ON CONFLICT DO NOTHING\`.

Re-ingesting 10,000 documents where 12 changed now embeds only the chunks of those 12. The
key includes the model, dimensions and input type, because the same text under a different
setting is a different vector.

---

## What forces re-embedding — and what doesn't

| Change | Re-embed? |
|---|---|
| A document's text changed | only its changed chunks (new hashes) |
| Chunking strategy changed | yes — every chunk's text is different |
| Text you prepend changed (e.g. a context line) | yes |
| Model, version or dimensions changed | yes, everything |
| Metadata changed (tags, permissions, title) | **no** — update the row, keep the vector |

For big one-off backfills, OpenAI's Batch API also accepts embedding jobs at half price,
with results within 24 hours — fine for a migration, useless for live ingestion.

---

## Switching models without downtime

The blue/green pattern:

1. Add a new column (\`embedding_v2\`) or a new table for the new model's vectors.
2. Backfill it in the background, with its own index.
3. Run the golden set against both. Only continue if v2 wins.
4. Flip a config flag so queries use the new model **and** the new column together.
5. Keep the old column for a week as a rollback, then drop it.

The rule underneath: the query embedding and the stored vectors must always come from the
same model. The flag switches both at once.`,
    docs: [
      {
        label: 'Voyage AI — Python library and batching',
        url: 'https://docs.voyageai.com/docs/embeddings',
      },
      {
        label: 'OpenAI — Batch API',
        url: 'https://platform.openai.com/docs/guides/batch',
      },
      {
        label: 'pgvector README — adding vectors and indexing',
        url: 'https://github.com/pgvector/pgvector',
      },
    ],
    glossary: [
      {
        term: 'batching',
        def: 'Sending many texts in one API request.',
      },
      {
        term: 'content hash',
        def: 'A fingerprint of some text (e.g. SHA-256); identical text gives the identical hash.',
      },
      {
        term: 'backfill',
        def: 'Filling a new column or table for existing rows, usually in the background.',
      },
      {
        term: 'blue/green',
        def: 'Running old and new versions side by side, then switching traffic with a flag.',
      },
    ],
    check: [
      {
        q: 'Why does the cache key include the model name and input type, not just the text?',
        a: `The same text gives a different, incompatible vector under a different model, dimension count or input type. A text-only key would return the wrong vector.`,
      },
      {
        q: 'A document\'s title and permissions change, but its text doesn\'t. Do you re-embed?',
        a: 'No. The vector depends only on the embedded text. Update the metadata columns and keep the vector.',
      },
      {
        q: 'Why cap concurrency instead of firing every batch at once?',
        a: `Unbounded concurrency hits the rate limit, triggering 429s and retries that end up slower than a steady, bounded flow.`,
      },
      {
        q: 'In a model migration, what must switch at the same moment?',
        a: `The model used to embed queries and the column or table of stored vectors. Mixing them breaks retrieval silently.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec the embedding cache',
        body: `Write the spec for an embedding cache in Postgres: the table, the key, and the
\`get_or_embed(texts, model, dims, input_type)\` function (batch lookup, embed the misses,
write back). Have AI implement it.

Review questions: what happens when two workers embed the same new text at the same time?
Does it normalise the text before hashing — and should it?`,
        answer: `\`\`\`sql
CREATE TABLE embedding_cache (
    key        text PRIMARY KEY,          -- sha256(model|dims|input_type|text)
    model      text NOT NULL,
    dims       int  NOT NULL,
    embedding  vector NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
\`\`\`

The function:

1. Compute keys for all texts.
2. \`SELECT key, embedding FROM embedding_cache WHERE key = ANY($1)\` — one round trip.
3. Embed only the misses, in batches.
4. \`INSERT ... ON CONFLICT (key) DO NOTHING\`.
5. Return vectors in the original input order (easy to get wrong — check it).

**Two workers, same text:** both miss, both embed, both insert; \`ON CONFLICT DO NOTHING\`
makes the second insert harmless. You paid twice for one text — acceptable. Don't add
locking for this.

**Normalising before hashing:** only trivially — normalise line endings and strip
trailing whitespace. Don't lowercase or remove punctuation: the model sees those, so two
texts that differ in case can legitimately have different vectors.

The vector column has no dimension (\`vector\`, not \`vector(1024)\`) so one cache can hold
several models. The real chunk table keeps a fixed dimension, which indexing needs.`,
      },
      {
        mode: 'tool',
        title: 'Find your throughput sweet spot',
        body: `Embed 5,000 chunks with batch sizes 1, 32 and 128, and concurrency 1, 4 and 8. Record
chunks per second and how many 429s you hit. Stop a run if it becomes clearly slower
than the others.`,
        answer: `The pattern you should see:

- **Batch size 1** is by far the slowest: each request pays network latency for one
  chunk.
- **Batch 32 → 128** improves throughput further, with diminishing returns.
- **Concurrency** helps until you hit the rate limit; after that, 429s appear, retries
  with backoff kick in, and throughput *falls*.

The sweet spot is usually the largest batch the API allows (within its token limit) and
the highest concurrency that produces no sustained 429s. Write both numbers into config
with a comment saying how you found them — rate limits differ per account tier, so they'll
need re-tuning.`,
      },
      {
        mode: 'decision',
        title: 'Plan a migration',
        body: `You have 2 million chunks (about 400 tokens each) embedded with \`text-embedding-3-small\`
in pgvector. The golden set says \`text-embedding-3-large\` at 1,536 dimensions would lift
recall@5 from 0.81 to 0.86.

Estimate the embedding cost, and write the step-by-step plan with the rollback.`,
        answer: `**Cost:** 2M × 400 = 800M tokens. At $0.13 per million for \`text-embedding-3-large\`:
about **$104**. Through the Batch API at half price: about $52. Small next to the value
of five points of recall.

**Plan:**

1. \`ALTER TABLE chunks ADD COLUMN embedding_v2 vector(1536);\` (1,536 via the
   \`dimensions\` parameter — also keeps it under pgvector's 2,000-dimension index limit).
2. Backfill in batches (or via the Batch API), resumable: \`WHERE embedding_v2 IS NULL\`.
3. \`CREATE INDEX CONCURRENTLY ... USING hnsw (embedding_v2 vector_cosine_ops);\`
4. Make ingestion write **both** columns during the transition, so new documents aren't
   missing from v2.
5. Run the golden set on v2. Confirm the gain holds on the full corpus, not just a sample.
6. Flip the flag: the query model and the column switch together.
7. **Rollback:** flip the flag back. Both columns are live, so it's instant.
8. After a week of normal metrics, stop writing v1, drop its index and column.

The step people forget is 4. Without it, every document added during the backfill is
invisible after the switch.`,
      },
    ],
  },
  {
    id: 's3.2.t4',
    moduleId: 's3.2',
    title: 'Seeing your corpus: projecting embeddings',
    outcome: `You can draw your whole corpus as a 2D map and use it to find junk, duplicates and gaps — and you know what the map can't tell you.`,
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
        query: 'UMAP explained visually',
        channel: '',
        reason: 'a short visual intuition for how UMAP works',
      },
    ],
    animations: [],
    analogy: `A satellite view of a city. Great for spotting neighbourhoods, a new building site, or a
suspicious empty patch. Useless for measuring the exact distance between two houses.`,
    notes: `## Why look at your vectors at all

A corpus of 20,000 chunks is impossible to read. A picture of it isn't. A 2D map shows:

- **Junk:** hundreds of near-identical footers or cookie banners form a tight blob.
- **Duplicates:** the same document ingested twice sits exactly on top of itself.
- **Parsing garbage:** outliers far from everything are often broken text.
- **Gaps:** a golden-set question landing far from its correct chunk is a vocabulary
  mismatch waiting to hurt recall.

---

## Squashing 1,024 dimensions into 2

- **PCA** — fast, simple, linear. A good first look; tends to show one big blob.
- **UMAP** — the usual choice. Keeps local neighbourhoods and some of the global layout.
- **t-SNE** — also keeps neighbourhoods, slower, and the overall layout means less.

\`\`\`python
import numpy as np, umap
import plotly.express as px

X = np.array(vectors)                     # shape (n_chunks, dims)
xy = umap.UMAP(n_neighbors=15, min_dist=0.1, metric="cosine",
               random_state=42).fit_transform(X)

fig = px.scatter(x=xy[:, 0], y=xy[:, 1], color=sources,
                 hover_data={"text": [t[:120] for t in texts]})
fig.write_html("corpus_map.html")
\`\`\`

Hover text is the key feature: you read what's in each blob.

---

## A routine for reading the map

1. **Colour by source or document type.** Do types separate? Is one source everywhere?
2. **Hover the tightest blobs first.** Tight = near-identical text. Usually boilerplate →
   remove it at ingestion.
3. **Hover the outliers.** Broken encodings, empty pages, OCR noise.
4. **Add your golden questions as a second colour.** A question sitting in the wrong
   neighbourhood predicts a retrieval miss.

Each finding becomes an ingestion rule or a golden-set question.

---

## What the map can't tell you

- **Distances are distorted.** Squashing 1,024 dimensions into 2 must bend something. Two
  points that look close may not be neighbours in the real space.
- **Cluster sizes and gaps between clusters mean little** in UMAP and t-SNE.
- **It changes with settings.** Different \`n_neighbors\` values give different pictures.

So: the map is for **asking questions**. The golden set **answers** them. Never tune
retrieval settings by looking at a picture.

Tools that do this for you: the TensorFlow Embedding Projector (in the browser), and
observability tools like Arize Phoenix. Writing it yourself once is still worth it.`,
    docs: [
      {
        label: 'UMAP documentation',
        url: 'https://umap-learn.readthedocs.io/',
      },
      {
        label: 'TensorFlow Embedding Projector',
        url: 'https://projector.tensorflow.org/',
      },
    ],
    glossary: [
      {
        term: 'projection',
        def: 'Squashing high-dimensional vectors into 2D or 3D so you can look at them.',
      },
      {
        term: 'UMAP',
        def: 'A projection method that keeps local neighbourhoods; the usual choice for embeddings.',
      },
      {
        term: 'PCA',
        def: 'A linear projection onto the directions of greatest spread.',
      },
      {
        term: 'outlier',
        def: 'A point far from all others — often broken or unusual text.',
      },
    ],
    check: [
      {
        q: 'Name three things a corpus map helps you find.',
        a: `Boilerplate clusters, duplicate documents, parsing-garbage outliers, and golden questions that land far from their correct chunks.`,
      },
      {
        q: 'Why shouldn\'t you measure distances on a UMAP plot?',
        a: `Projecting to 2D distorts distances; only local neighbourhoods are roughly kept. Real similarity must be measured in the original space.`,
      },
      {
        q: 'A golden question lands in the wrong cluster. What does that predict?',
        a: `A likely retrieval miss — the question's wording is closer to other topics than to its answer. Candidates for hybrid search, query rewriting or better chunk text.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Map your corpus',
        body: `Project your v1 corpus with UMAP, colour by source, and add hover text. Add your golden
questions in a different colour. Save it as HTML.

Write down three findings and the action each one leads to.`,
        answer: `Typical first findings, and what to do about each:

| Finding | Action |
|---|---|
| A dense blob of "Page 3 of 12 · Confidential" chunks | strip repeated headers and footers during ingestion (Module 3) |
| Two copies of the same policy at the same spot | content-hash de-duplication (Module 3) |
| Scattered points with text like "ﬁnancial" or "Ã©" | fix ligatures and encoding with a cleaning step (\`ftfy\`, Unicode NFKC) |
| A golden question far from its gold chunk | add a synonym-heavy variant to the golden set; plan hybrid search (Module 6) |
| One source spread across everything | often a table-of-contents or index page — drop it or chunk it differently |

The map itself isn't the deliverable. The list of ingestion rules it produces is.`,
      },
      {
        mode: 'primitive',
        title: 'PCA in five lines',
        body: `Before using UMAP, write a 2D PCA yourself with numpy's SVD: centre the data, take the
SVD, project onto the first two directions. Plot it next to the UMAP version.

What does PCA show that UMAP doesn't, and the other way round?`,
        answer: `\`\`\`python
import numpy as np

def pca_2d(X: np.ndarray) -> np.ndarray:
    Xc = X - X.mean(axis=0)                       # centre
    U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
    return Xc @ Vt[:2].T                          # project on top-2 directions
\`\`\`

**PCA** keeps the directions of largest overall spread, and distances along them are
honest — but with text embeddings the first two directions capture only a small share of
the variation, so you usually see one big overlapping cloud.

**UMAP** pulls apart local neighbourhoods, so topics separate into visible clusters — at
the cost of distorting global distances.

Doing PCA by hand once removes the magic: a projection is just "pick directions, project
onto them". UMAP is a cleverer way of choosing what to keep.`,
      },
    ],
  },
  {
    id: 's3.2.t5',
    moduleId: 's3.2',
    title: 'Shorter vectors and quantisation',
    outcome: `You can cut vector storage by 4 to 32 times with shorter or lower-precision vectors, and you know how to win most of the lost quality back.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-vector-footprint'],
    analogy: `Image compression. Shrink a 4K photo to 1080p (fewer dimensions), or save it as a lower
quality JPEG (fewer bits per number). For a thumbnail grid nobody notices. For the final
print, you go back to the original.`,
    notes: `## Where the cost comes from

Each number in a vector is normally a 32-bit float: **4 bytes**.

- 1 million chunks × 1,024 dims × 4 bytes ≈ **4.1 GB**
- 1 million chunks × 3,072 dims × 4 bytes ≈ **12.3 GB**

An HNSW index is fast when it fits in memory. At a few million chunks, vector size becomes
your database bill.

---

## Trick 1: shorter vectors (Matryoshka)

Some models are trained so the **first** numbers carry the most meaning — like Russian nesting
dolls, a smaller vector sits inside the big one. You can keep just the first 256 or 512.

- Voyage 4: choose 256, 512, 1,024 or 2,048 with \`output_dimension\`
- OpenAI \`text-embedding-3-*\`: the \`dimensions\` parameter
- Gemini: \`output_dimensionality\`

Two rules: **only do this with models trained for it** (cutting other models' vectors ruins
them), and **re-normalise** if you shorten a vector yourself — it's no longer length 1.

---

## Trick 2: fewer bits per number (quantisation)

| Type | Bytes per number | Saving | pgvector type |
|---|---|---|---|
| float32 | 4 | — | \`vector\` |
| float16 | 2 | 2× | \`halfvec\` |
| int8 | 1 | 4× | — (Voyage returns it with \`output_dtype="int8"\`) |
| binary | ⅛ | 32× | \`bit\` |

Binary keeps only the **sign** of each number: positive → 1, zero or negative → 0. Distance
becomes Hamming distance — counting differing bits, which CPUs do extremely fast.

---

## Winning the quality back: rescoring

Binary vectors alone lose noticeable recall. The fix: use them only to shortlist, then rank
the shortlist with the full vectors.

\`\`\`sql
CREATE INDEX ON chunks USING hnsw
  ((binary_quantize(embedding)::bit(1024)) bit_hamming_ops);

SELECT id FROM (
    SELECT id, embedding FROM chunks
    ORDER BY binary_quantize(embedding)::bit(1024) <~> binary_quantize($1)
    LIMIT 100                                   -- cheap shortlist
) shortlist
ORDER BY embedding <=> $1                       -- exact re-rank
LIMIT 10;
\`\`\`

The index is tiny and fast; only 100 full-precision comparisons happen per query.

---

## The 2,000-dimension trap

pgvector's HNSW and IVFFlat indexes support \`vector\` columns of **up to 2,000 dimensions**.
\`text-embedding-3-large\` returns 3,072 by default — so the index creation fails.

Two fixes:

\`\`\`sql
-- A: ask for fewer dimensions (dimensions=1536) and store vector(1536)

-- B: index a half-precision copy (halfvec indexes go up to 4,000 dims)
CREATE INDEX ON chunks USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
SELECT id FROM chunks ORDER BY embedding::halfvec(3072) <=> $1::halfvec(3072) LIMIT 10;
\`\`\`

---

## How to choose

Measure, on your golden set: full vectors, 512 dims, int8, binary alone, binary + rescoring.
Put recall@10, storage and p95 latency in one table.

Common outcomes: int8 and float16 lose very little; Matryoshka at 512 is often close to full;
binary alone loses clearly, and rescoring recovers most of it. "Often" and "most" are why
you measure.`,
    docs: [
      {
        label: 'pgvector README — half-precision and binary quantisation',
        url: 'https://github.com/pgvector/pgvector',
      },
      {
        label: 'Anthropic — embeddings FAQ (quantisation, Matryoshka)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/embeddings#faq',
      },
      {
        label: 'OpenAI — embeddings guide (dimensions parameter)',
        url: 'https://platform.openai.com/docs/guides/embeddings',
      },
    ],
    glossary: [
      {
        term: 'Matryoshka embedding',
        def: 'A vector trained so its first numbers carry the most meaning, allowing it to be shortened.',
      },
      {
        term: 'quantisation',
        def: 'Storing each number with fewer bits — float16, int8 or a single bit.',
      },
      {
        term: 'Hamming distance',
        def: 'The number of bit positions where two binary vectors differ.',
      },
      {
        term: 'rescoring',
        def: 'Re-ranking a cheap shortlist with the full-precision vectors.',
      },
      {
        term: 'halfvec',
        def: 'pgvector\'s half-precision (16-bit) vector type.',
      },
    ],
    check: [
      {
        q: 'How much storage do 1 million 1,024-dimension float32 vectors take?',
        a: 'About 4.1 GB: 1,000,000 × 1,024 × 4 bytes.',
      },
      {
        q: 'Why must you re-normalise a vector you shortened yourself?',
        a: 'The shortened vector\'s length is no longer 1, so dot product and cosine stop agreeing.',
      },
      {
        q: 'What is rescoring?',
        a: `Shortlist many candidates using cheap (binary or quantised) vectors, then rank the shortlist with the full-precision vectors.`,
      },
      {
        q: 'What\'s pgvector\'s dimension limit for indexing a `vector` column, and one workaround?',
        a: `2,000 dimensions. Use fewer dimensions from the model, or index a \`halfvec\` cast, which supports up to 4,000.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Binary quantisation by hand',
        body: `Write \`binarise(v) -> int\` (pack the signs into an integer, first value = most
significant bit) and \`hamming(a, b) -> int\`.

Check it against the example in Voyage's docs: the values
\`-0.0396, 0.0062, -0.0745, -0.0390, 0.0046, 0.0003, -0.0850, 0.0399\` should pack to
\`0b01001101\`, which is **77** as an unsigned byte.`,
        answer: `\`\`\`python
def binarise(v: list[float]) -> int:
    bits = 0
    for x in v:
        bits = (bits << 1) | (1 if x > 0 else 0)
    return bits

def hamming(a: int, b: int) -> int:
    return (a ^ b).bit_count()      # Python 3.10+

v = [-0.0396, 0.0062, -0.0745, -0.0390, 0.0046, 0.0003, -0.0850, 0.0399]
assert binarise(v) == 0b01001101 == 77
\`\`\`

XOR sets a bit wherever the two vectors disagree; counting the set bits is the Hamming
distance. That single CPU instruction (popcount) is why binary search is so fast — and
why it's worth losing some precision for a shortlist.

(Voyage's signed \`binary\` type stores the same byte as 77 − 128 = −51.)`,
      },
      {
        mode: 'tool',
        title: 'Build the trade-off table',
        body: `On your corpus and golden set, compare: full float32, Matryoshka 512 dims, \`halfvec\`,
binary alone, and binary + rescoring (top 100 → exact). Report recall@10, index size
(\`pg_relation_size\`), and p95 query latency.`,
        answer: `Your table:

| Variant | recall@10 | index size | p95 |
|---|---|---|---|
| float32, 1,024 | baseline | | |
| Matryoshka 512 | | ~½ | |
| halfvec | | ~½ | |
| binary alone | | ~1/32 of the vectors | |
| binary + rescore 100 | | ~1/32 + table reads | |

How to read it: pick the smallest variant within about a point of baseline recall. On
small corpora (under a few hundred thousand chunks) the honest answer is often "keep
float32 — the savings don't matter yet." Quantisation earns its place at millions of
vectors, and the table is how you'll know when you've arrived.

Get index sizes with \`SELECT pg_size_pretty(pg_relation_size('your_index_name'));\``,
      },
      {
        mode: 'decision',
        title: '10 million chunks, small budget',
        body: `10 million chunks, 1,024-dim float32 vectors, and your managed Postgres plan has 16 GB
of RAM. Latency target: p95 under 150 ms for retrieval.

Work out the storage for each option, then choose.`,
        answer: `Storage for the vectors alone:

- float32: 10M × 1,024 × 4 ≈ **41 GB** — far beyond 16 GB of RAM. The HNSW index would
  live on disk, and latency will suffer.
- halfvec: ≈ **20 GB** — still too big.
- Matryoshka 512 + halfvec: ≈ **10 GB** — fits, with little room left.
- binary: 10M × 128 bytes ≈ **1.3 GB** — fits easily.

**Choice:** a binary HNSW index for the shortlist (top 100–200), with rescoring against
full vectors that stay in the table on disk. Only ~100 full vectors are read per query,
so the disk reads are affordable. Then verify on the golden set that recall@10 is within
a point or two of float32, and check p95 under load.

Also worth saying in an interview: at this scale, a dedicated engine with built-in
quantisation and rescoring (Qdrant, for example) is a reasonable alternative. That's the
contrast Module 5 draws.`,
      },
    ],
  },
];
