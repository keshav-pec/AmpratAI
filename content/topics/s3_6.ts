import type { Topic } from '@/lib/types';

export const s3_6: Topic[] = [
  {
    id: 's3.6.t1',
    moduleId: 's3.6',
    title: 'Hybrid search with Reciprocal Rank Fusion',
    outcome: `You can combine keyword and vector search in one Postgres query, fuse the rankings with RRF, and show on your golden set which questions each half rescued.`,
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
        query: 'hybrid search BM25 vector reciprocal rank fusion explained',
        channel: '',
        reason: 'a visual explanation of fusing keyword and vector results',
      },
    ],
    animations: ['anim-hybrid-rrf'],
    analogy: `Searching your phone's contacts. Type "Sharma" and you want every exact Sharma — that's
keyword search. Type "the plumber from last month" and you want meaning — that's vector
search. Real questions mix both, so you run both and merge the lists.`,
    notes: `## Why vectors alone miss things

Vector search is great at **paraphrase**: "time off after a baby" finds "paternity leave".
It's weak at **exact strings**:

- error codes and IDs: \`ERR-2210\`, \`INV-00417\`
- product names and SKUs, section numbers ("clause 7.3.2")
- acronyms and rare names: "LTA", "Krishnamurthy"

Embeddings blur these into "something code-like". Keyword search matches them exactly.
Each finds what the other misses — so hybrid search almost always beats either alone.

---

## Keyword search in Postgres

\`\`\`sql
ALTER TABLE chunks ADD COLUMN tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', text)) STORED;
CREATE INDEX ON chunks USING gin (tsv);

SELECT id, ts_rank_cd(tsv, q) AS score
FROM chunks, websearch_to_tsquery('english', 'paternity leave "ERR-2210"') q
WHERE tsv @@ q
ORDER BY score DESC LIMIT 50;
\`\`\`

\`websearch_to_tsquery\` accepts search-box syntax: quotes, \`OR\`, \`-word\`. The \`'english'\`
configuration stems words ("leaves" → "leav"); use \`'simple'\` for text where stemming
hurts, like codes or mixed languages.

Postgres's built-in ranking isn't BM25 (the classic search-engine formula). For hybrid RAG
it's usually good enough; extensions like ParadeDB's \`pg_search\` add real BM25 if you need it.

---

## Fusing two rankings: RRF

The two searches produce scores on different scales (a cosine distance and a \`ts_rank\`), so
you can't just add them. **Reciprocal Rank Fusion** ignores scores and uses **ranks**:

> score(d) = Σ 1 / (k + rank of d in each list), with k = 60

- Chunk X: vector rank 1, keyword rank 5 → 1/61 + 1/65 = **0.0318**
- Chunk Z: keyword rank 1 only → 1/61 = **0.0164**
- Chunk Y: vector rank 2 only → 1/62 = **0.0161**

Showing up in **both** lists beats being first in one. The constant 60 (from the 2009 paper
that introduced RRF) stops the very top ranks from dominating.

---

## The whole thing in one query

\`\`\`sql
WITH semantic AS (
  SELECT id, row_number() OVER (ORDER BY embedding <=> $1) AS rank
  FROM chunks WHERE tenant_id = $3
  ORDER BY embedding <=> $1 LIMIT 50
),
keyword AS (
  SELECT id, row_number() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rank
  FROM chunks, websearch_to_tsquery('english', $2) q
  WHERE tsv @@ q AND tenant_id = $3
  ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 50
)
SELECT id,
       coalesce(1.0 / (60 + s.rank), 0) + coalesce(1.0 / (60 + k.rank), 0) AS score
FROM semantic s FULL OUTER JOIN keyword k USING (id)
ORDER BY score DESC
LIMIT 20;
\`\`\`

One round trip, one database, filters applied to both halves.

---

## Measure what each half contributes

Run the golden set three ways — vector only, keyword only, hybrid — and look **per question**:

- which questions only keyword search found (usually codes, names, acronyms)
- which only vector search found (paraphrases, Hinglish)
- whether hybrid lost anything either one found alone

That table is how you *know* hybrid helped, and it's a great p-3.1 row.`,
    docs: [
      {
        label: 'PostgreSQL — full text search',
        url: 'https://www.postgresql.org/docs/current/textsearch.html',
      },
      {
        label: 'pgvector-python — hybrid search examples',
        url: 'https://github.com/pgvector/pgvector-python/tree/master/examples/hybrid_search',
      },
      {
        label: 'RRF paper (Cormack, Clarke & Büttcher, 2009)',
        url: 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf',
      },
    ],
    glossary: [
      {
        term: 'hybrid search',
        def: 'Running keyword and vector search together and merging the results.',
      },
      {
        term: 'tsvector',
        def: 'Postgres\'s pre-processed, searchable form of a text for full-text search.',
      },
      {
        term: 'GIN index',
        def: 'The Postgres index type used for full-text search.',
      },
      {
        term: 'RRF',
        def: 'Reciprocal Rank Fusion: merging rankings by summing 1 / (k + rank).',
      },
      {
        term: 'stemming',
        def: 'Reducing words to a root form so "leaves" matches "leave".',
      },
    ],
    check: [
      {
        q: 'Name three kinds of query where keyword search beats vector search.',
        a: `Exact identifiers (error codes, invoice IDs), product names or section numbers, and acronyms or rare names.`,
      },
      {
        q: 'Why does RRF use ranks instead of scores?',
        a: `Vector distances and keyword scores are on different, incomparable scales. Ranks are comparable, so no normalisation is needed.`,
      },
      {
        q: 'A chunk is 1st in vector search only; another is 3rd in both. Which does RRF prefer (k = 60)?',
        a: 'The one in both lists: 1/63 + 1/63 ≈ 0.0317 beats 1/61 ≈ 0.0164.',
      },
      {
        q: 'When would you use the \'simple\' text-search configuration instead of \'english\'?',
        a: 'When stemming hurts — codes, identifiers, or text in mixed or non-English languages.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'RRF by hand',
        body: `Without AI: \`rrf(rankings: list[list[str]], k: int = 60, top: int = 10) -> list[tuple[str, float]]\`.
Each ranking is a list of IDs, best first. Return the fused top IDs with scores.

Check: \`rrf([["x", "y", "w"], ["z", "q", "r", "s", "x"]])\` must rank x first, then z, then y.`,
        answer: `\`\`\`python
from collections import defaultdict

def rrf(rankings: list[list[str]], k: int = 60, top: int = 10) -> list[tuple[str, float]]:
    scores: dict[str, float] = defaultdict(float)
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] += 1 / (k + rank)
    return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:top]

fused = rrf([["x", "y", "w"], ["z", "q", "r", "s", "x"]])
assert [d for d, _ in fused[:3]] == ["x", "z", "y"]
\`\`\`

x: 1/61 + 1/65 = 0.0318; z: 1/61 = 0.0164; y: 1/62 = 0.0161.

Notice how small the gap between z and y is — a single rank. RRF is robust exactly because
no single list can dominate. It also extends to any number of lists: the same function
fuses the results of the multi-query rewriting in topic 4.`,
      },
      {
        mode: 'tool',
        title: 'Hybrid vs vector vs keyword',
        body: `Add a \`tsv\` column and GIN index to your chunks. Implement the hybrid query. Run your
golden set three ways — vector only, keyword only, hybrid — and produce a per-question
comparison: which questions each method found in its top 5.`,
        answer: `Report two things.

**The summary:**

| Method | recall@5 | MRR |
|---|---|---|
| vector only | | |
| keyword only | | |
| hybrid (RRF) | | |

**The rescue list:** questions only one method found. Typically keyword-only rescues are
codes, clause numbers, acronyms and names; vector-only rescues are paraphrases and
questions in a different register ("time off for a new dad").

Also check for **hybrid losses** — questions a single method found that hybrid didn't.
They're usually cases where one list ranked the evidence at 1 and the other didn't have it
at all, while another chunk appeared mid-way in both. If you see several, try a weighted
RRF (for example 1.5× for the keyword list) and re-measure.`,
      },
      {
        mode: 'read',
        title: 'Predict the fused ranking',
        body: `Vector top 4: **A, B, C, D**. Keyword top 4: **E, C, A, F**. Using RRF with k = 60, give
the fused top 3 in order, with scores to four decimal places.`,
        answer: `- **A:** vector 1, keyword 3 → 1/61 + 1/63 = 0.0164 + 0.0159 = **0.0323**
- **C:** vector 3, keyword 2 → 1/63 + 1/62 = 0.0159 + 0.0161 = **0.0320**
- **E:** keyword 1 → 1/61 = **0.0164**
- B: vector 2 → 1/62 = 0.0161; D: 1/64 = 0.0156; F: 1/64 = 0.0156

Fused top 3: **A, C, E**.

C — third in vector search — rises to second because both methods agreed on it. That's
the typical effect: agreement between two different signals is strong evidence.`,
      },
    ],
  },
  {
    id: 's3.6.t2',
    moduleId: 's3.6',
    title: 'Reranking',
    outcome: `You can add a reranker that reads each candidate with the question, measure what it buys in MRR and recall@5, and weigh that against its latency and cost.`,
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
        query: 'reranking cross encoder vs bi encoder RAG',
        channel: '',
        reason: 'a visual explanation of two-stage retrieval',
      },
    ],
    animations: ['anim-reranker'],
    analogy: `A recruiter screens 200 CVs with a quick keyword filter and keeps 20. Then the hiring
manager actually reads those 20 against the job description and picks 3. Retrieval is the
quick filter; the reranker is the manager who reads.`,
    notes: `## Two kinds of model

- **Embedding model (bi-encoder):** turns the question and each chunk into vectors
  *separately*. Chunk vectors are computed once, ahead of time — which is why search is fast.
- **Reranker (cross-encoder):** reads the question and one chunk **together** and outputs a
  relevance score. It sees how the words of both relate, so it's much more accurate — but
  it has to run at query time, once per candidate.

So you use both: a fast, wide net, then a slow, careful sort.

---

## The pattern

1. Retrieve **50–100** candidates with hybrid search.
2. Rerank them all against the question.
3. Keep the top **5–10** for the prompt.

In many RAG systems, this is the single biggest quality jump per line of code.

---

## In code

A hosted reranker (Voyage):

\`\`\`python
result = vo.rerank(query=question, documents=[c.text for c in candidates],
                   model="rerank-2.5", top_k=8)
top = [candidates[r.index] for r in result.results]
\`\`\`

An open model you run yourself:

\`\`\`python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("BAAI/bge-reranker-v2-m3")
scores = reranker.predict([(question, c.text) for c in candidates])
top = [c for _, c in sorted(zip(scores, candidates), key=lambda p: -p[0])][:8]
\`\`\`

Other options: Cohere Rerank, smaller English cross-encoders (fast on CPU), or a general
model asked to rank (accurate but slower and costlier). Model names change — check current
ones.

---

## What it costs

- **Latency:** it runs per candidate, at query time. 50 candidates can add tens to a few
  hundred milliseconds depending on the model, hardware and chunk length. Measure your p95.
- **Money:** hosted rerankers charge per token or per search.
- **Tuning:** how many candidates in (more = better recall, slower), how many out.

---

## Measure it properly

- **MRR and recall@k at the k you send** should rise. That's the reranker's whole job.
- **Recall@50 before reranking** caps what it can do: a reranker can only promote what
  retrieval found.
- Rerank scores aren't comparable across questions, so a fixed cut-off ("drop below 0.3")
  needs tuning on your golden set before you trust it.

A row for p-3.1: "hybrid → hybrid + rerank: MRR 0.58 → 0.74, recall@5 0.77 → 0.86, +120 ms
p95". Numbers like that end debates.`,
    docs: [
      {
        label: 'Voyage AI — rerankers',
        url: 'https://docs.voyageai.com/docs/reranker',
      },
      {
        label: 'Sentence Transformers — cross-encoders',
        url: 'https://sbert.net/docs/cross_encoder/usage/usage.html',
      },
      {
        label: 'Anthropic — contextual retrieval (reranking results)',
        url: 'https://www.anthropic.com/engineering/contextual-retrieval',
      },
    ],
    glossary: [
      {
        term: 'bi-encoder',
        def: `A model that embeds the question and each chunk separately; fast because chunk vectors are precomputed.`,
      },
      {
        term: 'cross-encoder',
        def: 'A model that reads the question and a chunk together to score relevance; accurate but run per pair.',
      },
      {
        term: 'reranking',
        def: 'Re-scoring a candidate list with a more careful model, keeping the best few.',
      },
      {
        term: 'candidate pool',
        def: 'The set of results retrieved in the first stage for the reranker to sort.',
      },
    ],
    check: [
      {
        q: 'Why is a cross-encoder more accurate than comparing embeddings?',
        a: `It reads the question and chunk together, so it can judge how they actually relate, instead of comparing two vectors made separately.`,
      },
      {
        q: 'Why can\'t you use a cross-encoder for the first-stage search?',
        a: `It must run once per question–chunk pair at query time; running it over the whole corpus would be far too slow.`,
      },
      {
        q: 'What limits how much a reranker can help?',
        a: 'Recall of the first stage: it can only reorder candidates that retrieval already found.',
      },
      {
        q: 'Which metrics should a reranker improve?',
        a: 'MRR and recall at the k you actually send to the model.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Add a reranker and measure it',
        body: `Add a reranker on top of your hybrid search: retrieve 50, rerank, keep 8. Run the golden
set with and without. Report recall@5, MRR and p95 retrieval latency for both. Then try
20 and 100 candidates.`,
        answer: `Your table:

| Setup | recall@5 | MRR | p95 latency |
|---|---|---|---|
| hybrid | | | |
| hybrid → rerank 20 | | | |
| hybrid → rerank 50 | | | |
| hybrid → rerank 100 | | | |

The usual pattern: a clear jump in MRR and recall@5 from adding the reranker at all; a
smaller gain from 20 → 50 candidates; little or none from 50 → 100, at extra latency.
Pick the knee of the curve.

Also compute **recall@50 before reranking**. If it's, say, 0.93 while recall@5 after
reranking is 0.86, the reranker is doing most of what it can; the remaining misses are
retrieval's to fix. If recall@50 is itself low, no reranker will save you.`,
      },
      {
        mode: 'read',
        title: 'Where did the time go?',
        body: `After adding a reranker, p95 latency for the whole answer went from 2.1 s to 3.4 s. The
reranker's own timing shows 180 ms. Candidates: 100 chunks of about 800 tokens each.

What might explain the extra second, and what would you try?`,
        answer: `180 ms is the reranker's compute. The other ~1.1 s probably comes from around it:

- **Fetching 100 full chunks** (80,000 tokens of text) from the database and sending them
  over the network to a hosted reranker — the payload is large.
- **The prompt got bigger.** If the "keep" count went up at the same time (say 5 → 10
  chunks of 800 tokens), the model now reads 4,000 more tokens, and time-to-first-token
  grows.
- **Sequential calls** where parallel ones were possible (e.g. query embedding and
  keyword search could run concurrently).

Try: 50 candidates instead of 100; trim candidates to their first ~300 tokens for
reranking (while sending full chunks to the model); keep the final count at 5–8; and
trace the request (Stage 5) to see each step's time rather than guessing.`,
      },
      {
        mode: 'decision',
        title: 'Reranker or not?',
        body: `Decide for each system:

1. An internal FAQ bot over 300 short Q&A pairs; recall@5 is already 0.95.
2. A contracts assistant; recall@50 is 0.94 but recall@5 is 0.61.
3. A voice assistant with a strict 400 ms budget for everything before the model speaks.`,
        answer: `1. **No.** Little to gain at 0.95, and every component is something to run and monitor.
2. **Yes — the textbook case.** The evidence is almost always in the top 50 but ranked too
   low. A reranker targets exactly that gap.
3. **Probably not a large one.** Try a small, fast cross-encoder on a few candidates if
   measurement shows it fits the budget; otherwise improve first-stage ranking (hybrid
   weights, contextual chunks) and send fewer, better chunks.`,
      },
    ],
  },
  {
    id: 's3.6.t3',
    moduleId: 's3.6',
    title: 'Filters and permission-aware retrieval',
    outcome: `You can enforce who-sees-what at every layer of a RAG system — query, database, cache, logs and citations — and turn phrases like "2024 policies" into safe filters.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `An office with a keycard system. It isn't enough that the lift won't go to the finance
floor — the doors, the printers and the shredding bins all need to respect the same card.
In RAG, the permission check has to hold everywhere the text can travel.`,
    notes: `## Everywhere the text travels

Restricted text can leak through more than the answer:

1. **Retrieval** — the query must only return permitted chunks.
2. **The prompt** — the model must never see what the user can't.
3. **Caches** — a cached answer for one user must not be served to another.
4. **Logs and traces** — they contain retrieved text; restrict who can read them.
5. **Citations** — a link to a document must check access when clicked.

Most leaks are in 3–5, not 1.

---

## Layer 1: filter in the query

\`\`\`sql
SELECT id, text FROM chunks
WHERE tenant_id = $1
  AND acl_groups && $2           -- user's groups, looked up per request
ORDER BY embedding <=> $3
LIMIT 50;
\`\`\`

Filter **inside** the database query, never by dropping results in Python afterwards (which
still pulls restricted text into your app, and returns too few results).

---

## Layer 2: row-level security as the safety net

\`\`\`sql
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON chunks
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
\`\`\`

Per request, inside the transaction:

\`\`\`sql
SELECT set_config('app.tenant_id', $1, true);   -- true = only for this transaction
\`\`\`

Now a query that *forgets* the \`WHERE tenant_id\` still can't cross tenants. Connect as a
role that doesn't own the table — owners bypass RLS unless you also \`FORCE\` it.

---

## Filters from the question

"What did the **2024** travel policy say?" contains a filter. A small model can extract it
with structured outputs:

\`\`\`python
class Filters(BaseModel):
    year: int | None = None
    doc_type: Literal["policy", "contract", "faq"] | None = None
\`\`\`

Then **validate** before using it (is 2024 a year you have?), and fall back to no filter
when unsure — a wrong filter returns nothing, which is worse than no filter.

---

## Caches, logs and links

- **Cache keys** must include everything that changes the answer's permitted inputs:
  tenant, and the user's group set (or a hash of it).
- **Traces** of RAG requests contain retrieved text — treat them as sensitive as the
  documents themselves.
- **Citation links** go through your API, which checks access and issues a short-lived link;
  never a public URL to the file.

---

## Test it like a security feature

An automated test with two users in different groups: the same question must never return
the other group's documents — checked at retrieval, in the prompt sent, and in the cache.
Run it in CI. Permissions bugs are incidents, not quality issues.`,
    docs: [
      {
        label: 'PostgreSQL — row security policies',
        url: 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html',
      },
      {
        label: 'PostgreSQL — set_config',
        url: 'https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SET',
      },
      {
        label: 'OWASP — Top 10 for LLM applications',
        url: 'https://genai.owasp.org/llm-top-10/',
      },
    ],
    glossary: [
      {
        term: 'row-level security',
        def: 'Postgres policies that restrict which rows a session can see, applied to every query.',
      },
      {
        term: 'permission scope',
        def: 'The set of documents a user may see — tenant plus groups.',
      },
      {
        term: 'signed URL',
        def: 'A link that grants temporary access to one file.',
      },
      {
        term: 'self-query',
        def: 'Extracting structured filters (year, type) from a natural-language question.',
      },
    ],
    check: [
      {
        q: 'Name three places restricted text can leak in a RAG system other than the answer.',
        a: `Caches, logs and traces, and citation links — plus the prompt itself if filtering happens after retrieval.`,
      },
      {
        q: 'What does row-level security add if queries already filter by tenant?',
        a: 'A safety net: a query that forgets the filter still can\'t read another tenant\'s rows.',
      },
      {
        q: 'Why validate a filter extracted from the question?',
        a: `A wrong filter (a year you don't have, a misread type) returns nothing — worse than no filter. Validate and fall back when unsure.`,
      },
      {
        q: 'What must a semantic or answer cache key include in a multi-user RAG app?',
        a: `Tenant and the user's permission scope (their groups, or a hash of them), so one user's answer is never served to someone who can't see its sources.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec permission-aware retrieval',
        body: `Write the spec for permission-aware retrieval in your p-3.1 app: where the user's groups
come from, how they reach the SQL, the RLS policy, how the cache is keyed, who can read
traces, and how citation links are served. Have AI implement it, then write the two-user test.`,
        answer: `Spec essentials:

- **Identity:** the user's groups come from your auth provider on login, cached for a few
  minutes; never taken from the request body.
- **SQL:** every retrieval query takes \`tenant_id\` and \`groups\` parameters —
  \`acl_groups && $groups\` — through one repository function; nothing else queries
  \`chunks\` directly.
- **RLS:** tenant isolation policy; the app connects as a non-owner role; \`set_config\` per
  transaction.
- **Cache:** key = hash(normalised question, tenant, sorted groups, pipeline version).
- **Traces:** stored with the tenant; only admins of that tenant (and you, for debugging
  with consent) can read them.
- **Citations:** \`/docs/{id}/view\` checks access on each request, then returns a
  short-lived signed URL.

**The test:** users U1 (group HR) and U2 (group Eng) ask the same question whose best
evidence is an HR-only document. Assert: U2's retrieved IDs contain no HR documents;
U2's prompt text contains no HR text; U2 after U1 does not get U1's cached answer;
U2 clicking an HR citation URL gets 403.`,
      },
      {
        mode: 'read',
        title: 'Find the leak',
        body: `Retrieval filters correctly by group. But an Engineering user asks "What's the salary
band for L5?" and gets the correct number — which only lives in an HR-restricted
document. Logs show the retrieval returned no HR chunks for this user.

Where could it have come from?`,
        answer: `Candidates, in order of likelihood:

1. **The answer cache.** An HR user asked the same question earlier; the cache key
   didn't include the permission scope, so the Engineering user got HR's cached answer.
2. **A semantic cache** matching a *similar* question from an HR user — same problem,
   harder to spot.
3. **Conversation memory** shared across users (a bug in session handling), carrying
   earlier HR context.
4. **The model's own knowledge** — unlikely for a company-specific number, but possible
   if the band had been published publicly.

Fix the key (tenant + groups in every cache key), add the two-user cache test, and check
how long the leaked entry was served — this is an incident to report, not just a bug to fix.`,
      },
      {
        mode: 'decision',
        title: 'Filter or not?',
        body: `Your filter extractor turns questions into filters. What should happen for each?

1. "What was the 2019 travel policy?" — you only have policies from 2021 onward.
2. "Latest leave rules?"
3. "Travel policy for Pune?" — \`office\` is a metadata field, and Pune is one of its values.
4. "Leave rules like last year?"`,
        answer: `1. **Don't silently filter to 2019** (zero results). Tell the user you have policies from
   2021 onward, and offer the earliest one — a clear "not available" beats an empty answer.
2. **\`is_latest = true\`** — which should be the default anyway.
3. **Apply \`office = 'Pune'\`**, but include company-wide documents too
   (\`office = 'Pune' OR office IS NULL\`); many policies apply everywhere, and a strict
   filter would hide them.
4. **No filter, or ask.** "Like last year" is ambiguous (last calendar year? the previous
   version?). Retrieve without a year filter, or ask a short clarifying question.

The general rule: a filter is a hard constraint that can hide the answer entirely. Apply
only what's clearly meant and valid; everything else stays soft.`,
      },
    ],
  },
  {
    id: 's3.6.t4',
    moduleId: 's3.6',
    title: 'Query rewriting and multi-query',
    outcome: `You can turn follow-up questions into standalone searches, generate alternative phrasings and fuse their results, and prove the rewriting helps rather than drifts.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-query-rewriting'],
    analogy: `A good librarian doesn't search for exactly what you mumbled. "The one about leave for new
dads — the other one, for managers" becomes a clear search: "paternity leave policy for
managers". Query rewriting is the librarian step.`,
    notes: `## Follow-ups can't be searched as-is

In a chat:

> **User:** What's the notice period?
> **Bot:** 60 days for most employees.
> **User:** And for managers?

Searching for "And for managers?" retrieves nothing useful. It has to become **"What is the
notice period for managers?"** — using the conversation.

This is the one rewrite every chat RAG system needs.

---

## The standalone rewrite

\`\`\`python
REWRITE = '''Rewrite the user's last message as a standalone search query, using the
conversation for missing context. Keep the user's meaning exactly; don't add facts or
assumptions. If it's already standalone, return it unchanged.

<conversation>
{history}
</conversation>
<last_message>{message}</last_message>'''
\`\`\`

A small, fast model does this well. Return plain text (or a structured field), log both the
original and the rewrite, and search with the rewrite.

---

## Multi-query: several phrasings, fused

One phrasing can miss; a few different phrasings, each retrieved and then fused with RRF,
miss less:

- "notice period for managers"
- "resignation notice required for people managers"
- "how many days notice M1 M2 grade"

Cost: an extra model call plus N searches. Fusion is the \`rrf()\` function from topic 1.

---

## Cheap, deterministic rewrites

Not everything needs a model:

- **An acronym glossary** — "LTA" → "Leave Travel Allowance", from a table you maintain.
- **Spelling fixes** for common typos in your domain.
- **Normalising language** — for Hinglish queries, either rely on a multilingual embedding
  model, or translate to the corpus language first. Test both on your golden set.

---

## Rewrites can drift

A rewriter can quietly change the question:

> "Can I **not** take my leave this year?" → "annual leave entitlement"

So:

- **Evaluate the rewriter itself:** for golden-set follow-ups, does the rewrite retrieve the
  same evidence as a hand-written standalone version?
- **Keep the original question** for the final prompt — the model answers what the user
  actually asked, using what the rewrite retrieved.
- **Skip rewriting** when the message is already a clear standalone question (a cheap check
  saves latency).`,
    docs: [
      {
        label: 'LangChain — multi-query retriever',
        url: 'https://python.langchain.com/docs/how_to/MultiQueryRetriever/',
      },
      {
        label: 'Anthropic — prompting best practices',
        url: `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices`,
      },
    ],
    glossary: [
      {
        term: 'query rewriting',
        def: 'Changing the user\'s query before searching, to make it easier to retrieve for.',
      },
      {
        term: 'standalone question',
        def: 'A question that makes sense without the conversation before it.',
      },
      {
        term: 'multi-query',
        def: 'Retrieving with several phrasings of a question and fusing the results.',
      },
      {
        term: 'query drift',
        def: 'A rewrite that changes the question\'s meaning.',
      },
    ],
    check: [
      {
        q: 'Why does chat RAG need a standalone rewrite?',
        a: `Follow-up messages depend on earlier turns ("and for managers?"). Searched as-is, they retrieve nothing useful.`,
      },
      {
        q: 'What does multi-query add, and what does it cost?',
        a: `Several phrasings retrieved separately and fused with RRF catch evidence one phrasing misses. It costs a model call plus several searches.`,
      },
      {
        q: 'Which question should the final prompt contain — the original or the rewrite?',
        a: 'The original, so the model answers what the user actually asked; the rewrite is only for retrieval.',
      },
      {
        q: 'How do you test a rewriter?',
        a: `Check that rewritten follow-ups retrieve the same evidence as hand-written standalone versions of the same questions.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Add a standalone rewrite to your chat',
        body: `Add 10 follow-up questions to your golden set, each with its conversation history and a
hand-written standalone version. Implement the rewrite with a small model. Measure recall@5
for: the raw follow-up, the model's rewrite, and your hand-written version.`,
        answer: `Expect something like:

| Query used | recall@5 on follow-ups |
|---|---|
| raw follow-up | very low |
| model rewrite | close to the hand-written version |
| hand-written standalone | the ceiling |

Read every case where the rewrite scored below the hand-written one. Typical causes:
the rewrite dropped a qualifier ("for managers"), resolved "it" to the wrong earlier
topic, or added words that weren't asked ("in India"). Each becomes a line in the rewrite
prompt or a new example — and the 10 follow-ups stay in the golden set to catch regressions.`,
      },
      {
        mode: 'primitive',
        title: 'The acronym expander',
        body: `Without AI: \`expand(query: str, glossary: dict[str, str]) -> str\` that appends the
expansion of any acronym found as a whole word (case-insensitive), without duplicating it
if the expansion is already in the query.

\`expand("LTA rules for PL", {"LTA": "Leave Travel Allowance", "PL": "privilege leave"})\`
→ \`"LTA rules for PL (Leave Travel Allowance) (privilege leave)"\`.`,
        answer: `\`\`\`python
import re

def expand(query: str, glossary: dict[str, str]) -> str:
    additions = []
    for short, long in glossary.items():
        if re.search(rf"\\b{re.escape(short)}\\b", query, flags=re.IGNORECASE):
            if long.lower() not in query.lower():
                additions.append(f"({long})")
    return " ".join([query, *additions])
\`\`\`

- \`\\b...\\b\` avoids expanding "PL" inside "PLAN" or "apply".
- \`re.escape\` handles acronyms with dots, like "T.A.".
- Appending (rather than replacing) keeps the original acronym for keyword search, which
  may match documents that use the short form.

Deterministic, instant, free — and often worth more than a model rewrite for
jargon-heavy corpora. Build the glossary from your error analysis.`,
      },
      {
        mode: 'read',
        title: 'Did the rewrite drift?',
        body: `Conversation: "What's the reimbursement limit for hotels?" → "₹6,000 per night for most
grades." → "What if I'm travelling with my family?"

Rewrite produced: *"What is the hotel reimbursement limit for family travel?"*

Is this a good rewrite? What could go wrong downstream?`,
        answer: `**Mostly good** — it's standalone and keeps the topic. But look closely:

- The user's real question may be **"are family members' costs covered?"** or **"does the
  limit change?"**. The rewrite narrowed it to "the limit", which may retrieve the limit
  table and miss the clause saying family costs aren't reimbursable at all.
- If the policy has a separate "personal travel combined with business" section, the
  rewrite's wording might not match it.

Mitigations: multi-query (add "Are family members' travel costs reimbursed?" as a second
phrasing); keep the original message in the final prompt so the model answers what was
asked; and add this case to the follow-up golden set.`,
      },
    ],
  },
  {
    id: 's3.6.t5',
    moduleId: 's3.6',
    title: 'HyDE, decomposition and step-back questions',
    outcome: `You can use a hypothetical answer, sub-questions or a broader question to retrieve what a single literal query misses — and measure whether the extra model call pays for itself.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Searching a library catalogue for "why does my bread not rise" finds little; searching for
the kind of sentence a baking book would contain — "yeast activity depends on water
temperature" — finds the right shelf. HyDE searches with the answer-shaped text.`,
    notes: `## HyDE: search with a hypothetical answer

From a 2022 paper, *Precise Zero-Shot Dense Retrieval without Relevance Labels*:

1. Ask a model to **write a short passage that would answer** the question — without
   retrieval.
2. Embed that passage, and search with it instead of (or as well as) the question.

Why it works: an answer-shaped passage sits closer to real answer passages in embedding
space than a short question does.

Watch out:

- the hypothetical answer can be **wrong** and steer search toward wrong documents;
- it adds a generation step, so **latency**;
- models with query/document modes (like Voyage's \`input_type\`) already close some of this
  gap. Measure before adopting.

---

## Decomposition: split multi-part questions

> "Compare the Pune and Chennai travel allowances for M2 managers."

One search tends to return mostly Pune *or* mostly Chennai. Split it:

1. "Pune travel allowance for M2 managers"
2. "Chennai travel allowance for M2 managers"

Retrieve for each, give the model **both** sets of evidence, then answer the comparison.
A small model can do the splitting with structured outputs (a list of sub-questions).

---

## Step-back: ask a broader question first

> "Can I claim a taxi from the airport at 2 a.m. in Bengaluru?"

The specific answer may depend on a general rule ("late-night travel", "ground
transportation"). A step-back question — "What are the rules for ground transport
reimbursement?" — retrieves the rule; the original retrieves the specifics. Send both.

---

## A decision table

| Pattern | Try it when | Cost |
|---|---|---|
| HyDE | short queries miss answer-style passages | 1 generation + 1 search |
| Decomposition | questions compare or combine several things | 1 generation + N searches |
| Step-back | answers depend on a general rule stated elsewhere | 1 generation + 2 searches |

All three are **candidates**, not defaults. Each adds a model call on the critical path.
Keep it only if your golden set (tagged by question type) shows it wins where it should
without losing elsewhere.`,
    docs: [
      {
        label: 'HyDE paper (Gao et al., 2022)',
        url: 'https://arxiv.org/abs/2212.10496',
      },
      {
        label: 'Step-back prompting (Zheng et al., 2023)',
        url: 'https://arxiv.org/abs/2310.06117',
      },
    ],
    glossary: [
      {
        term: 'HyDE',
        def: 'Hypothetical Document Embeddings: search with the embedding of a model-written answer.',
      },
      {
        term: 'query decomposition',
        def: 'Splitting a multi-part question into sub-questions retrieved separately.',
      },
      {
        term: 'step-back prompting',
        def: 'Asking a broader question to retrieve the general principle an answer depends on.',
      },
    ],
    check: [
      {
        q: 'How does HyDE change what gets embedded?',
        a: 'It embeds a model-written hypothetical answer passage instead of (or alongside) the short question.',
      },
      {
        q: 'What\'s the main risk of HyDE?',
        a: `The hypothetical answer can be wrong, pulling retrieval toward the wrong documents — plus the added latency of a generation step.`,
      },
      {
        q: 'Why does a comparison question benefit from decomposition?',
        a: `A single search tends to favour one side of the comparison; separate sub-questions retrieve evidence for each part.`,
      },
      {
        q: 'What\'s a step-back question?',
        a: 'A broader version of the question that retrieves the general rule the specific answer depends on.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Test decomposition on comparison questions',
        body: `Tag 8 golden questions as \`comparison\` (add some if needed). Implement decomposition with
a small model returning a list of sub-questions. Compare recall — counting a question as
found only if evidence for **every** part is in the context — with and without.`,
        answer: `The metric matters here: for a comparison, finding Pune's allowance but not Chennai's is a
failure. Define "all parts found" as your hit rule for this tag.

Typical results: plain retrieval often finds one side and misses the other; decomposition
raises the all-parts rate substantially on this tag, at the cost of one extra model call
and a second search.

Then check the other tags: decomposition should be **routed** — only applied when the
question looks multi-part — because running it on simple lookups adds latency for nothing
and can split questions that shouldn't be split.`,
      },
      {
        mode: 'read',
        title: 'When HyDE backfires',
        body: `Question: "What's our policy on moonlighting?" (working a second job). The corpus has a
section titled "Outside Employment".

HyDE's hypothetical answer: *"Moonlighting refers to the practice of running
side projects under a pseudonym on the weekends, often in the creative industries…"*

What happens to retrieval, and what would you do?`,
        answer: `The hypothetical answer went off in the wrong direction (it described a different meaning
of "moonlighting"), so its embedding points toward creative projects and pseudonyms — away
from "Outside Employment". Retrieval gets worse than searching with the plain question.

What to do:

- **Search with both** the question and the hypothetical, and fuse with RRF — a bad
  hypothetical then only costs some ranking, not the whole result.
- Better: **fix the vocabulary gap directly** — add "moonlighting" to the glossary as a
  synonym of "outside employment", or rely on contextual chunks that mention common
  synonyms.
- Put this question in the golden set with a \`synonym\` tag.`,
      },
    ],
  },
  {
    id: 's3.6.t6',
    moduleId: 's3.6',
    title: 'Diversity: MMR and de-duplication',
    outcome: `You can stop your top results from being five copies of the same passage, using de-duplication and Maximal Marginal Relevance — without throwing away evidence that only looks similar.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Asking five friends for restaurant tips and all five name the same place. You got one
recommendation, not five. A good top-5 covers different useful things.`,
    notes: `## The problem

Top-5 results for "notice period":

1. Leave policy v3, section 4 — "The notice period is 60 days…"
2. Leave policy v3 (duplicate upload) — same text
3. An email quoting section 4
4. Chunk overlapping result 1 (thanks to overlap)
5. Leave policy v3, section 4 again, from the HTML version

One fact, five slots — and the answer about notice periods *during probation* got pushed
out.

---

## Step 1: de-duplicate

Before anything clever:

- collapse **exact duplicates** by content hash;
- collapse **near-duplicates** (cosine similarity above ~0.95) — keep the best-ranked one;
- cap **chunks per document** where that suits the question type.

Better still, fix it at ingestion (Module 3). Retrieval-time de-duplication catches what's
left.

---

## Step 2: MMR

**Maximal Marginal Relevance** picks results one at a time. Each pick maximises:

> λ × similarity(question, chunk) − (1 − λ) × max similarity(chunk, already picked)

- λ = 1 → pure relevance (the plain ranking)
- λ = 0 → pure diversity
- λ ≈ 0.5–0.7 → relevant, but not repetitive

Retrieve a larger pool (say 30), then MMR-select the final 5–8.

---

## The trap: complementary chunks look similar

Chunk 7 says "Notice period: 60 days." Chunk 8, the next paragraph, says "During probation,
the notice period is 15 days." They're very similar — same topic, same words — and MMR may
drop chunk 8 as "redundant". But it's the other half of the answer.

Guards:

- **Don't penalise adjacent chunks from the same section** — merge them into one passage
  instead (next module).
- Use a moderate λ (0.6–0.7), not 0.3.
- Check the golden set's \`exception\` tag after enabling MMR — that's where this bites.

---

## Where it matters most

- Corpora with **many versions and copies** (email threads, wikis, uploaded duplicates).
- **Broad questions** ("what are the benefits of X?") where coverage matters.
- Less so for precise lookups, where the single best chunk is all you need.`,
    docs: [
      {
        label: 'MMR paper (Carbonell & Goldstein, 1998)',
        url: 'https://www.cs.cmu.edu/~jgc/publication/The_Use_MMR_Diversity_Based_LTMIR_1998.pdf',
      },
      {
        label: 'LangChain — MMR search',
        url: 'https://python.langchain.com/docs/how_to/example_selectors_mmr/',
      },
    ],
    glossary: [
      {
        term: 'de-duplication',
        def: 'Removing results that are exact or near copies of each other.',
      },
      {
        term: 'MMR',
        def: `Maximal Marginal Relevance: picking results that are relevant but not redundant with those already picked.`,
      },
      {
        term: 'lambda (λ)',
        def: 'The MMR dial between relevance and diversity.',
      },
    ],
    check: [
      {
        q: 'What should run before MMR?',
        a: 'De-duplication: collapse exact and near-duplicate chunks (and ideally fix duplicates at ingestion).',
      },
      {
        q: 'What does λ control in MMR?',
        a: `The balance between relevance to the question (λ = 1) and difference from already-picked results (λ = 0).`,
      },
      {
        q: 'Why can MMR hurt answers with exceptions?',
        a: `The exception often sits in the next, very similar paragraph, which MMR may drop as redundant — losing half the answer.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'MMR by hand',
        body: `Without AI: \`mmr(q, cands, k, lam=0.7)\` where \`q\` is a unit query vector and \`cands\` a
list of \`(id, unit_vector)\`. Return \`k\` IDs using MMR. Use numpy for dot products only.`,
        answer: `\`\`\`python
import numpy as np

def mmr(q, cands, k, lam=0.7):
    ids = [c[0] for c in cands]
    V = np.array([c[1] for c in cands])
    rel = V @ q                               # similarity to the question
    chosen: list[int] = []
    while len(chosen) < min(k, len(cands)):
        best, best_score = None, -np.inf
        for i in range(len(cands)):
            if i in chosen:
                continue
            red = max((float(V[i] @ V[j]) for j in chosen), default=0.0)
            score = lam * rel[i] - (1 - lam) * red
            if score > best_score:
                best, best_score = i, score
        chosen.append(best)
    return [ids[i] for i in chosen]
\`\`\`

The first pick is always the most relevant chunk (nothing chosen yet, so redundancy is
0). Each later pick trades relevance against similarity to what's already in the set.
This is O(k × n × k) — fine for a pool of 30; precompute the pairwise similarity matrix
if the pool is large.`,
      },
      {
        mode: 'tool',
        title: 'Measure MMR on your golden set',
        body: `Add de-duplication and MMR (pool 30, keep 6) after reranking. Run the golden set at
λ = 1.0 (off), 0.7 and 0.5. Report recall@6 overall, and for the \`exception\` and
\`comparison\` tags.`,
        answer: `Typical outcome:

- **De-duplication alone** often gives a small, safe gain on corpora with copies.
- **λ = 0.7** helps broad and comparison questions (more distinct evidence) and is
  roughly neutral elsewhere.
- **λ = 0.5** starts hurting the \`exception\` tag — the complementary-paragraph trap.

If exception questions drop at any λ, merge adjacent same-section chunks before MMR (so
the pair becomes one passage), then re-run. Report the chosen λ with the per-tag table —
"helps comparisons, neutral elsewhere" is the kind of nuanced result that reads as
senior.`,
      },
    ],
  },
];
