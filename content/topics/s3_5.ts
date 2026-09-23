import type { Topic } from '@/lib/types';

export const s3_5: Topic[] = [
  {
    id: 's3.5.t1',
    moduleId: 's3.5',
    title: 'pgvector in production',
    outcome: `You can run pgvector the way production systems do: the right types and indexes, fast bulk loads, safe query settings behind a connection pooler, and a way to prove the index is used.`,
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
        query: 'pgvector tutorial postgres vector search HNSW',
        channel: '',
        reason: 'a hands-on pgvector setup',
      },
    ],
    animations: [],
    analogy: `You already keep users, orders and sessions in one database, with joins and transactions
between them. pgvector adds one more column type to that same database. The vectors live
next to the rows they describe — no second system to sync.`,
    notes: `## Why Postgres first

One database for rows, vectors and full-text search means:

- **Joins and filters** on real columns — tenant, permissions, dates — in one query.
- **Transactions:** a document and its chunks update together, or not at all.
- **One backup, one permission model** (including row-level security), one thing to monitor.
- **Hybrid search** (Module 6) without a second system.

pgvector runs on every major managed Postgres (AWS RDS and Aurora, Google Cloud SQL and
AlloyDB, Azure, Supabase, Neon). Locally: \`docker run -p 5432:5432 -e POSTGRES_PASSWORD=dev pgvector/pgvector:pg17\`.

---

## Types and setup

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE chunks ADD COLUMN embedding vector(1024);
\`\`\`

| Type | Use |
|---|---|
| \`vector(n)\` | normal 32-bit vectors; indexable up to 2,000 dims |
| \`halfvec(n)\` | 16-bit; half the size; indexable up to 4,000 dims |
| \`bit(n)\` | binary vectors, for Hamming search |
| \`sparsevec(n)\` | sparse vectors (mostly zeros) |

From Python, register the type once per connection:

\`\`\`python
from pgvector.asyncpg import register_vector

async def init(conn):
    await register_vector(conn)          # pass numpy arrays or lists directly

pool = await asyncpg.create_pool(DSN, init=init)
\`\`\`

---

## Loading lots of vectors

- **Load first, index after.** Building an HNSW index over loaded data is much faster than
  updating it row by row.
- **Use \`COPY\`**, not thousands of \`INSERT\`s (the \`pgvector\` Python package supports binary
  \`COPY\` with psycopg 3).
- **Give the build memory and workers:**

\`\`\`sql
SET maintenance_work_mem = '8GB';               -- the graph should fit in this
SET max_parallel_maintenance_workers = 7;       -- parallel HNSW build
CREATE INDEX CONCURRENTLY ON chunks USING hnsw (embedding vector_cosine_ops);
\`\`\`

Watch progress with \`pg_stat_progress_create_index\`. A notice saying the graph "no longer
fits into maintenance_work_mem" means the build will be much slower.

---

## Query settings and connection poolers

Search quality settings like \`hnsw.ef_search\` are per-session:

\`\`\`sql
SET hnsw.ef_search = 100;
\`\`\`

**Trap:** behind a transaction-mode pooler (PgBouncer, and most serverless Postgres
poolers), your next query may run on a different server connection, and a plain \`SET\` is
lost — or leaks into someone else's query. Set it inside the transaction instead:

\`\`\`sql
BEGIN;
SET LOCAL hnsw.ef_search = 100;
SELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 10;
COMMIT;
\`\`\`

---

## Prove the index is used

\`\`\`sql
EXPLAIN ANALYZE
SELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 10;
\`\`\`

You want \`Index Scan using chunks_embedding_idx\`. A \`Seq Scan\` plus \`Sort\` means the index
isn't used — usually an operator/opclass mismatch, a missing \`LIMIT\`, or an \`ORDER BY\` on
an expression the index doesn't cover.

---

## How far it goes

Millions of vectors on one well-sized machine is routine, as long as the index fits in
memory. Past that, the levers are: \`halfvec\` or binary quantisation (Module 2), partitioning,
read replicas — or a dedicated engine (topic 4). Move when **a measured limit** forces it,
not because a blog post said so.`,
    docs: [
      {
        label: 'pgvector README',
        url: 'https://github.com/pgvector/pgvector',
      },
      {
        label: 'pgvector-python (asyncpg, psycopg, SQLAlchemy)',
        url: 'https://github.com/pgvector/pgvector-python',
      },
      {
        label: 'PgBouncer — pooling modes',
        url: 'https://www.pgbouncer.org/features.html',
      },
    ],
    glossary: [
      {
        term: 'pgvector',
        def: 'A Postgres extension that adds vector types, distance operators and vector indexes.',
      },
      {
        term: 'maintenance_work_mem',
        def: 'Memory Postgres may use for maintenance tasks like building indexes.',
      },
      {
        term: 'transaction pooling',
        def: 'A pooler mode where each transaction may use a different server connection.',
      },
      {
        term: 'EXPLAIN ANALYZE',
        def: 'Runs a query and shows the plan Postgres actually used, with timings.',
      },
    ],
    check: [
      {
        q: 'Name two advantages of keeping vectors in Postgres with the rest of your data.',
        a: `Filters and joins on real columns in one query; transactions that update a document and its chunks together; one backup and permission model; hybrid search without a second system.`,
      },
      {
        q: 'Why load data before building an HNSW index?',
        a: `Building the graph over existing data in one pass is much faster than updating the index row by row during inserts.`,
      },
      {
        q: 'Why use `SET LOCAL` instead of `SET` behind a transaction pooler?',
        a: `With transaction pooling, the next query may run on a different server connection. SET LOCAL applies to the current transaction only, so it neither gets lost nor leaks into other clients' queries.`,
      },
      {
        q: 'What does a Seq Scan in the plan for a vector query usually mean?',
        a: `The index isn't being used — typically an operator that doesn't match the index's opclass, a missing LIMIT, or ordering by an expression the index doesn't cover.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Stand up pgvector properly',
        body: `Run \`pgvector/pgvector\` in Docker. Create the \`documents\` and \`chunks\` tables from
Module 3, bulk-load 50,000 chunks with \`COPY\`, then build an HNSW index with raised
\`maintenance_work_mem\`. Time the load and the build.

Finally, show \`EXPLAIN ANALYZE\` output proving a search uses the index.`,
        answer: `What a clean run looks like:

- **Load:** \`COPY\` of 50,000 rows with 1,024-dim vectors takes seconds, not minutes. If
  it's slow, you're probably inserting row by row or not using binary \`COPY\`.
- **Build:** with enough \`maintenance_work_mem\` it completes without the "no longer fits"
  notice; \`pg_stat_progress_create_index\` shows the phases while it runs.
- **Plan:** \`Index Scan using ..._embedding_idx on chunks\` with \`Limit\` above it, and an
  execution time in single-digit milliseconds.

Keep the setup as a script in your p-3.1 repo (\`scripts/setup_db.sql\`) — rebuilding a
variant for an experiment becomes one command, and a reviewer can reproduce it.`,
      },
      {
        mode: 'read',
        title: 'Find the bug behind the pooler',
        body: `A FastAPI app uses a transaction-mode pooler. On startup it runs
\`SET hnsw.ef_search = 200\` once per pool connection. Recall on the golden set is
sometimes as expected and sometimes clearly lower, for the same questions.

What's happening?`,
        answer: `With **transaction pooling**, each transaction may be served by a different server
connection. The app's \`SET\` ran on whichever server connections happened to serve it at
startup; other server connections still have the default \`ef_search\` of 40. Queries that
land on those get lower recall — so the same question gives different results.

(It can be worse: another app sharing the pooler can inherit your \`SET\`.)

Fix: \`SET LOCAL hnsw.ef_search = 200\` inside the same transaction as the search, or set it
per role or database (\`ALTER ROLE app SET hnsw.ef_search = 200\`) so every server
connection starts with it. Then add a check to your eval: run a few questions many times
and assert identical results.`,
      },
      {
        mode: 'decision',
        title: 'Postgres or something else — first decision',
        body: `You're starting p-3.1. Your app already uses Postgres for users and documents. The
corpus is 500 pages now, perhaps 50,000 pages in a year. A friend says "use Pinecone, it's
what real companies use."

What do you choose now, and what would make you change your mind later?`,
        answer: `**Choose pgvector now.** 50,000 pages is roughly 100,000–300,000 chunks — comfortably
within one Postgres instance. You get filters, permissions, transactions and hybrid
search in the database you already run, with no sync job between two systems.

**Change your mind when a measurement says so:**

- p95 retrieval latency above target at real scale, after tuning \`ef_search\`, memory and
  quantisation;
- filtered searches that still lose recall after iterative scans and partitioning (topic 3);
- operational needs your Postgres can't meet, like scaling search independently of the
  main database.

That answer — "start with what you run, move on evidence" — is what interviewers want to
hear, more than any product name.`,
      },
    ],
  },
  {
    id: 's3.5.t2',
    moduleId: 's3.5',
    title: 'HNSW and IVFFlat: the recall–latency dial',
    outcome: `You can explain how HNSW and IVFFlat find neighbours, tune their parameters, and measure the index's own recall against exact search.`,
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
        query: 'HNSW explained hierarchical navigable small world',
        channel: '',
        reason: 'a visual walk through the layered graph',
      },
    ],
    animations: ['anim-hnsw'],
    analogy: `Finding a house in a new city. You take the highway to the right district, main roads to
the right neighbourhood, then walk the lanes. HNSW is that: a few long links to get close
fast, then short local links to finish. Look at more lanes and you're more likely to find
the exact house — and it takes longer.`,
    notes: `## Exact search, and why we give it up

Exact search compares the query with **every** vector. Perfect results, and the time grows
with the table: fine for 50,000 chunks, slow for 50 million.

**Approximate nearest neighbour (ANN)** indexes check only a small, well-chosen fraction.
Much faster — and sometimes they miss the true best match. The trade is explicit, and you
control it with a parameter.

---

## HNSW: a graph you walk

- Every vector is a node linked to its near neighbours.
- There are **layers**: the top layers are sparse, with long links (the highway); the bottom
  layer has every node with short links (the lanes).
- Search starts at the top, walks greedily towards the query, drops a layer, repeats, and
  finishes with a careful search on the bottom layer.

| Parameter | When | Default | Effect |
|---|---|---|---|
| \`m\` | build | 16 | links per node: more = better recall, bigger index |
| \`ef_construction\` | build | 64 | effort while building: more = better graph, slower build |
| \`hnsw.ef_search\` | query | 40 | candidates kept while searching: more = better recall, slower |

---

## IVFFlat: clusters you search inside

- At build time, group the vectors into \`lists\` clusters (k-means).
- At query time, find the nearest \`probes\` clusters and search only inside them.

\`\`\`sql
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);
SET ivfflat.probes = 32;          -- default 1: fast, often poor recall
\`\`\`

pgvector's starting advice: \`lists\` = rows / 1,000 up to a million rows (√rows above that);
\`probes\` ≈ √lists. Build it **after** loading data — the clusters are learned from it.

---

## Which one

| | HNSW | IVFFlat |
|---|---|---|
| Speed vs recall | better | good |
| Build time | slower | faster |
| Memory | more | less |
| Empty table / changing data | fine | clusters go stale; rebuild as data shifts |

**Default to HNSW.** Consider IVFFlat when build time or memory is the constraint.

---

## Measure the index's recall

This is **not** your golden-set recall. It's "how often does the index return the same top
10 as exact search?"

\`\`\`sql
-- exact top 10, for comparison (forces a full scan)
BEGIN;
SET LOCAL enable_indexscan = off;
SELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 10;
COMMIT;
\`\`\`

For 100 sample queries: ANN recall@10 = average of |ANN ∩ exact| / 10. Then sweep
\`ef_search\` (40, 80, 160, 320) and plot recall against p95 latency. Pick the point where
recall stops improving meaningfully.

If your golden set fails, this tells you whether the **index** is to blame (low ANN recall)
or **retrieval itself** (the embedding or chunking) — two very different fixes.`,
    docs: [
      {
        label: 'pgvector README — HNSW and IVFFlat',
        url: 'https://github.com/pgvector/pgvector',
      },
      {
        label: 'The HNSW paper (Malkov & Yashunin)',
        url: 'https://arxiv.org/abs/1603.09320',
      },
    ],
    glossary: [
      {
        term: 'ANN',
        def: 'Approximate nearest neighbour search: fast, and occasionally misses the true best match.',
      },
      {
        term: 'HNSW',
        def: 'Hierarchical Navigable Small World: a layered graph index searched by walking towards the query.',
      },
      {
        term: 'IVFFlat',
        def: 'An index that clusters vectors and searches only the nearest clusters.',
      },
      {
        term: 'ef_search',
        def: 'How many candidates HNSW keeps while searching; the recall–latency dial.',
      },
      {
        term: 'probes',
        def: 'How many clusters IVFFlat searches per query.',
      },
    ],
    check: [
      {
        q: 'What do HNSW\'s upper layers do?',
        a: `They hold fewer nodes with long links, so the search can get close to the query quickly before refining on the dense bottom layer.`,
      },
      {
        q: 'What happens as you raise `hnsw.ef_search`?',
        a: 'The search keeps more candidates, so recall goes up and latency goes up.',
      },
      {
        q: 'Why must an IVFFlat index be built after loading data?',
        a: `Its clusters are learned from the data (k-means). Built on an empty or unrepresentative table, the clusters are poor and recall suffers.`,
      },
      {
        q: 'How is ANN recall different from golden-set recall?',
        a: `ANN recall compares the index's results with exact search — it measures the index. Golden-set recall checks whether the right evidence is found at all — it measures the whole retrieval pipeline.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Sweep ef_search',
        body: `On your 50,000-chunk table: pick 100 real questions, compute the exact top 10 for each,
then run HNSW search at \`ef_search\` = 20, 40, 80, 160 and 320. For each setting, report
ANN recall@10 and p95 latency.`,
        answer: `Your table:

| ef_search | ANN recall@10 | p95 (ms) |
|---|---|---|
| 20 | | |
| 40 | | |
| 80 | | |
| 160 | | |
| 320 | | |

The usual shape: recall climbs steeply at first and then flattens, while latency keeps
rising roughly in step with \`ef_search\`. At 50,000 rows everything is fast, so you'll
likely pick a generous value.

Two things to note for later: \`ef_search\` below 10 returns fewer than 10 results (an
HNSW scan returns at most \`ef_search\` rows, unless iterative scans are on — next topic),
and the curve shifts as the table grows, so re-run this sweep when the corpus is 10×
bigger.`,
      },
      {
        mode: 'primitive',
        title: 'IVF by hand',
        body: `Without a vector database: implement a toy IVF index with numpy. \`build(X, n_lists)\`
runs a few rounds of k-means and assigns each vector to its nearest centroid.
\`search(q, k, probes)\` searches only the \`probes\` nearest lists.

Measure recall@10 against brute force for probes = 1, 4 and 16.`,
        answer: `\`\`\`python
import numpy as np

def build(X, n_lists, iters=10, seed=0):
    rng = np.random.default_rng(seed)
    C = X[rng.choice(len(X), n_lists, replace=False)]
    for _ in range(iters):
        assign = np.argmax(X @ C.T, axis=1)          # unit vectors: max dot = nearest
        for j in range(n_lists):
            members = X[assign == j]
            if len(members):
                c = members.mean(axis=0)
                C[j] = c / np.linalg.norm(c)
    assign = np.argmax(X @ C.T, axis=1)
    lists = [np.where(assign == j)[0] for j in range(n_lists)]
    return C, lists

def search(X, C, lists, q, k=10, probes=1):
    nearest = np.argsort(-(C @ q))[:probes]
    cand = np.concatenate([lists[j] for j in nearest])
    return cand[np.argsort(-(X[cand] @ q))[:k]]

def exact(X, q, k=10):
    return np.argsort(-(X @ q))[:k]
\`\`\`

With 20,000 random unit vectors and 100 lists, you'll see recall rise sharply with
\`probes\` — 1 probe misses neighbours that sit just across a cluster boundary. (Random data
has no real clusters, which makes IVF look worse than on real embeddings; try it on your
own vectors too.)

The insight to keep: an ANN index is "search only where the answer probably is", and
every parameter is a knob on "probably".`,
      },
      {
        mode: 'decision',
        title: 'Tune for a latency budget',
        body: `Your retrieval step has a 60 ms p95 budget. With HNSW at \`ef_search = 40\`: ANN recall@10
is 0.91, p95 is 18 ms. At 200: recall 0.99, p95 41 ms. Your golden-set recall@10 is 0.74
at either setting.

What do you set, and where should you look next?`,
        answer: `**Set \`ef_search\` somewhere around 100–200.** The budget allows it, and index misses are
pure loss. But notice what the numbers say: going from 0.91 to 0.99 ANN recall barely
moved golden-set recall (0.74 either way).

So **the index isn't the bottleneck.** The true nearest neighbours often aren't the right
evidence. Look upstream and sideways:

- error analysis of the failures (Module 8): are they split answers, tables, jargon?
- **hybrid search and reranking** (Module 6) for exact terms and ranking quality;
- chunking and contextual retrieval (Module 4);
- the embedding model itself (Module 2).

This is exactly why you measure ANN recall separately: it stops you tuning the wrong knob.`,
      },
    ],
  },
  {
    id: 's3.5.t3',
    moduleId: 's3.5',
    title: 'Filtered search and the recall cliff',
    outcome: `You can explain why adding a WHERE clause can silently shrink vector search results, and fix it with iterative scans, partitioning or exact search.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-filter-cliff'],
    analogy: `A shop assistant brings you the 40 shirts closest to what you described, and *then* you
say "only in size M". Four are size M. You wanted ten. The assistant didn't fail — you just
applied your filter after they'd stopped looking.`,
    notes: `## The cliff

pgvector's approximate indexes apply \`WHERE\` filters **after** the index scan. An HNSW scan
returns at most \`ef_search\` candidates (40 by default).

So if a filter matches 10% of rows:

> 40 candidates × 10% ≈ **4 results** — even though you asked for \`LIMIT 10\`.

At 1%, you get 0 or 1. No error. Just fewer, worse results — and the more selective the
filter, the worse it gets. Tenant filters, permission filters and date filters all do this.

---

## Fix 1: iterative index scans (pgvector 0.8+)

Let the scan keep going until enough rows pass the filter:

\`\`\`sql
SET hnsw.iterative_scan = strict_order;   -- results in exact distance order
-- or
SET hnsw.iterative_scan = relaxed_order;  -- better recall; order approximately right
\`\`\`

\`hnsw.max_scan_tuples\` (20,000 by default) caps how far it goes. With \`relaxed_order\`,
re-sort at the end:

\`\`\`sql
WITH hits AS MATERIALIZED (
  SELECT id, embedding <=> $1 AS dist
  FROM chunks WHERE tenant_id = $2
  ORDER BY dist LIMIT 10
)
SELECT * FROM hits ORDER BY dist;
\`\`\`

---

## Fix 2: shape the data around the filter

- **Partitioning** by the filter column (\`PARTITION BY LIST (tenant_id)\` or by category):
  each partition has its own index, so a filtered query searches only matching rows.
- **Partial indexes** for a few very common filter values:
  \`CREATE INDEX ... USING hnsw (embedding vector_cosine_ops) WHERE doc_type = 'policy';\`

Both work well for a handful of large groups; neither scales to thousands of tiny tenants.

---

## Fix 3: exact search when the filter is tiny

If a filter matches only a few thousand rows, **skip the vector index**: use a B-tree index
on the filter column and compare distances exactly for those rows. It's fast at that size and
has perfect recall. Postgres's planner often picks this automatically once the B-tree index
exists and it can see the filter is selective.

---

## How other engines do it

Some dedicated engines filter **during** the graph walk — Qdrant, for example, adds extra
links for indexed payload fields so the graph stays connected within a filter. That's one of
the real reasons to consider them for filter-heavy workloads (next topic).

---

## Test it

Put filtered questions in your golden set ("in the Pune office…", "2024 policies only") and
track **how many results came back**, not just whether they were right. A result count below
your \`LIMIT\` is the cliff's fingerprint.`,
    docs: [
      {
        label: 'pgvector README — filtering and iterative scans',
        url: 'https://github.com/pgvector/pgvector#filtering',
      },
      {
        label: 'PostgreSQL — table partitioning',
        url: 'https://www.postgresql.org/docs/current/ddl-partitioning.html',
      },
      {
        label: 'Qdrant — filtering',
        url: 'https://qdrant.tech/documentation/concepts/filtering/',
      },
    ],
    glossary: [
      {
        term: 'post-filtering',
        def: 'Applying a filter after the vector search has picked its candidates.',
      },
      {
        term: 'recall cliff',
        def: 'The sharp drop in results when a selective filter is applied after an approximate search.',
      },
      {
        term: 'iterative index scan',
        def: 'A pgvector mode where the scan keeps going until enough rows pass the filter.',
      },
      {
        term: 'partitioning',
        def: 'Splitting one table into several physical tables by a column\'s value.',
      },
      {
        term: 'partial index',
        def: 'An index built only over rows matching a WHERE condition.',
      },
    ],
    check: [
      {
        q: `With HNSW, default settings and a filter matching 10% of rows, about how many results does LIMIT 10 return?`,
        a: `About 4: the scan returns at most 40 candidates (ef_search), and roughly 10% of them pass the filter.`,
      },
      {
        q: 'What do iterative index scans change?',
        a: `The scan continues past the first batch of candidates until enough rows pass the filter (up to a cap), so filtered queries return their full LIMIT.`,
      },
      {
        q: 'When is exact search the right answer for a filtered query?',
        a: `When the filter matches only a small number of rows — scanning those exactly is fast and gives perfect recall.`,
      },
      {
        q: 'What\'s the fingerprint of the recall cliff in your logs?',
        a: 'Queries returning fewer results than their LIMIT, especially for selective filters.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Predict the result counts',
        body: `HNSW index, \`ef_search = 40\`, no iterative scan, \`LIMIT 10\`. Roughly how many rows come
back for each filter, and which answers get worse?

1. \`tenant_id = 'acme'\` — Acme has 60% of all chunks.
2. \`tenant_id = 'tinyco'\` — TinyCo has 0.5% of chunks.
3. \`doc_type = 'policy' AND year = 2025\` — together about 5% of chunks.`,
        answer: `1. **About 10** (40 × 0.6 = 24 candidates pass; LIMIT 10 is filled). Fine.
2. **About 0** (40 × 0.005 = 0.2). TinyCo users mostly get **no results**, so the app
   says "I couldn't find that" for questions it could answer. Small customers are hit
   hardest — a nasty fairness bug for a multi-tenant product.
3. **About 2** (40 × 0.05). The top 2 might be fine, but the answer often needs
   evidence from rank 3–10.

Fixes by case: none needed for 1; exact search via a B-tree on \`tenant_id\` for 2 (few
rows — perfect recall); iterative scans for 3.`,
      },
      {
        mode: 'tool',
        title: 'Reproduce the cliff, then fix it',
        body: `Add a \`category\` column to your chunks with values spread 60% / 30% / 9% / 1%. Run 50
queries per category with \`LIMIT 10\`, record the average number of results returned,
then enable \`hnsw.iterative_scan = relaxed_order\` and run them again.`,
        answer: `Expected before: close to 10 results for the 60% and 30% categories, noticeably fewer
for 9%, almost none for 1%. After enabling iterative scans: close to 10 for all of them,
with somewhat higher latency for the rare categories (the scan walked further).

Then try the 1% category with \`iterative_scan = off\` and a B-tree index on \`category\`:
the planner may switch to exact search, giving 10 results with perfect recall. Compare
its latency with the iterative version at your table size.

Keep this experiment in the repo. "I found and fixed a filtered-search recall problem"
with before/after numbers is a strong interview story.`,
      },
      {
        mode: 'decision',
        title: 'Multi-tenant design',
        body: `Your product will have 5 large customers (together 80% of chunks) and ~2,000 small ones.
Every query filters by tenant. How do you store and index this in pgvector?`,
        answer: `A mixed design:

- **Large tenants:** their own partitions (\`PARTITION BY LIST (tenant_id)\`), each with its
  own HNSW index. Filtered queries search only their partition — fast, full recall.
- **Small tenants:** a shared "default" partition. Their queries filter a small number of
  rows, so **exact search** using a B-tree on \`tenant_id\` is fast and perfect. Iterative
  scans are the fallback if some small tenants grow.
- **Row-level security** on \`tenant_id\` everywhere, so a forgotten filter can't leak
  across tenants.

And measure: golden questions for a large *and* a small tenant, tracking result counts.
When a small tenant grows past a threshold, promote it to its own partition.`,
      },
    ],
  },
  {
    id: 's3.5.t4',
    moduleId: 's3.5',
    title: 'Qdrant: the dedicated-engine contrast',
    outcome: `You can build the same index in Qdrant, explain what a dedicated vector engine does better than pgvector, and say what it costs you.`,
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
        query: 'Qdrant tutorial python filtering payload',
        channel: 'Qdrant',
        reason: 'the official hands-on tutorials',
      },
    ],
    animations: [],
    analogy: `Postgres full-text search versus Elasticsearch. For many apps, Postgres is enough and one
system is simpler. For search-heavy products at scale, the specialised engine earns its
keep. Qdrant plays the Elasticsearch role for vectors.`,
    notes: `## The concepts, mapped

| Qdrant | pgvector equivalent |
|---|---|
| collection | table |
| point (id + vector + payload) | row |
| payload (JSON) | the other columns |
| payload index | a B-tree index on a column |
| named vectors | several vector columns |

Locally: \`docker run -p 6333:6333 qdrant/qdrant\`. Qdrant Cloud has a free tier.

---

## The same index, in Qdrant

\`\`\`python
from qdrant_client import QdrantClient, models

client = QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="chunks",
    vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
)
client.create_payload_index("chunks", field_name="tenant_id",
                            field_schema=models.PayloadSchemaType.KEYWORD)

client.upsert("chunks", points=[
    models.PointStruct(id=1, vector=vec,
                       payload={"tenant_id": "acme", "title": "Leave policy", "page": 4}),
])

hits = client.query_points(
    collection_name="chunks",
    query=qvec,
    query_filter=models.Filter(must=[
        models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme")),
    ]),
    limit=10,
).points
\`\`\`

---

## What it does better

- **Filtering during the search.** Payload indexes feed into the HNSW graph, so selective
  filters don't fall off the recall cliff.
- **Quantisation built in** — scalar (int8), binary and product quantisation, with
  oversampling and rescoring handled for you.
- **Hybrid in one query:** dense and sparse vectors on the same point, fused with the Query
  API (prefetch + RRF).
- **Scaling search separately:** sharding and replication, independent of your main database.

---

## What it costs you

- **A second system** to run, secure, monitor and back up.
- **Sync:** every document change must reach both Postgres and Qdrant. Now you need the
  incremental sync from Module 3 to write two places — and handle one of them failing.
- **No joins or transactions** with your app data. Permissions must be copied into payloads
  and kept in step.

---

## When to switch

Switch on evidence, such as:

- filtered-search recall or latency you can't fix in pgvector,
- vector counts where Postgres memory and index builds become the bottleneck,
- a team that needs search to scale and deploy independently.

For p-3.1, pgvector is the primary. Building the same retrieval in Qdrant once — and
comparing — is what gives you an informed answer to "why didn't you use a vector database?"`,
    docs: [
      {
        label: 'Qdrant documentation',
        url: 'https://qdrant.tech/documentation/',
      },
      {
        label: 'Qdrant — hybrid queries',
        url: 'https://qdrant.tech/documentation/concepts/hybrid-queries/',
      },
      {
        label: 'Qdrant — quantization',
        url: 'https://qdrant.tech/documentation/guides/quantization/',
      },
    ],
    glossary: [
      {
        term: 'collection',
        def: 'Qdrant\'s equivalent of a table.',
      },
      {
        term: 'payload',
        def: 'The JSON data stored with each Qdrant point, used for filtering and display.',
      },
      {
        term: 'dual write',
        def: 'Writing the same change to two systems, which needs care to keep them consistent.',
      },
      {
        term: 'transactional outbox',
        def: `Recording a change in the same transaction as the data, so a separate worker can reliably deliver it elsewhere.`,
      },
    ],
    check: [
      {
        q: 'What\'s a Qdrant \'point\', in Postgres terms?',
        a: 'A row: an id, one or more vectors, and a JSON payload (the other columns).',
      },
      {
        q: 'Why does Qdrant avoid the filtered-search recall cliff?',
        a: `It applies payload filters during the HNSW traversal, using payload indexes that are integrated with the graph, instead of filtering afterwards.`,
      },
      {
        q: 'What\'s the biggest ongoing cost of adding a dedicated vector engine?',
        a: `Keeping it in sync with the primary database — every add, change, delete and permission update must reach both, and failures must be handled.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Build it twice',
        body: `Load the same 50,000 chunks (vectors plus \`tenant_id\`, \`title\`, \`page\`) into Qdrant.
Run your golden set and the filtered-category experiment from the previous topic against
both pgvector and Qdrant. Compare results, recall, result counts and latency.`,
        answer: `What you'll typically find:

- **Unfiltered search:** near-identical top results and recall once both are tuned. The
  embedding and chunking decide quality, not the engine.
- **Rare-category filters:** Qdrant returns full result counts out of the box; pgvector
  needs iterative scans or exact search to match.
- **Latency:** both are fast at 50,000 points; differences at this size mostly reflect
  network hops and client overhead.

The write-up is the valuable part: "At our scale both engines give the same quality; we
chose pgvector for transactional sync and one system, and we know the threshold at which
we'd revisit." That's a senior-sounding answer backed by your own numbers.`,
      },
      {
        mode: 'decision',
        title: 'Design the dual-write',
        body: `Your team decides to move search to Qdrant but keep documents and permissions in
Postgres. Design how a document update reaches Qdrant reliably. What happens if the
Qdrant write fails after Postgres commits?`,
        answer: `Use the **transactional outbox** pattern:

1. In the same Postgres transaction that updates the document and its chunks, insert a
   row into an \`outbox\` table: \`{document_id, action: "upsert" | "delete", version}\`.
2. A worker reads the outbox, writes to Qdrant (upserts are idempotent by point id), and
   marks the row done.
3. If the Qdrant write fails, the outbox row stays; the worker retries with backoff.
   Postgres remains the source of truth; Qdrant catches up.

What this guarantees: Qdrant is never updated for a change that rolled back, and a change
that committed is never lost — at worst it's late.

Also: a nightly **reconciliation** job compares counts and hashes between the two and
repairs drift, and permission changes get their own fast path (as in Module 3).`,
      },
    ],
  },
  {
    id: 's3.5.t5',
    moduleId: 's3.5',
    title: 'The rest of the landscape',
    outcome: `You can place every vector database you'll hear about in one sentence — and explain why you learned one deeply instead of four shallowly.`,
    minutes: 20,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Knowing React well and knowing *of* Vue, Svelte and Angular. In an interview, depth in one
plus a clear one-line opinion on each of the others beats a shallow tour of all four.`,
    notes: `## One sentence each

- **Pinecone** — fully managed and serverless: no infrastructure at all, at the price of
  lock-in and cost at scale.
- **Weaviate** — open-source or hosted, with built-in hybrid search and modules that can
  embed data for you.
- **Chroma** — the friendliest for prototypes (runs inside your Python process); also has a
  server and a cloud version.
- **Milvus** (and Zilliz Cloud) — open-source and distributed, built for billions of
  vectors; more to operate.
- **LanceDB** — embedded, stores data in a columnar format on local disk or object storage;
  handy for multimodal and data-lake setups.
- **MongoDB Atlas Vector Search** — vectors inside your MongoDB documents, queried with a
  \`$vectorSearch\` aggregation stage. The natural choice for a MERN team already on Atlas.
- **Elasticsearch / OpenSearch** — if the company already runs them for search, kNN and
  BM25 live in one engine.
- **Redis** — in-memory vector search when you already run Redis and need very low latency.
- **FAISS** — not a database: a library of ANN indexes you embed in your own code. Many
  systems are built on it.

---

## How to choose, in order

1. **What do you already run?** Postgres → pgvector. MongoDB Atlas → Atlas Vector Search.
   Elasticsearch → its vector search. The best vector database is often the one you don't
   have to add.
2. **What does your eval say at your scale?** Recall, filtered result counts, p95 latency.
3. **What does operating it cost?** People, sync, backups, security review.
4. Only then: features and benchmarks.

---

## Why depth beats breadth here

Every engine above implements the same ideas: vectors, a distance, an ANN index with a
recall dial, filters, and maybe quantisation and hybrid search. You've now learned those
ideas through pgvector, and seen them again in Qdrant.

With that, any new engine takes a day to learn. Without it, four engines are four sets of
API calls you don't really understand.

---

## The interview answer

*"I used pgvector because the app already ran on Postgres — filters, permissions and hybrid
search in one query, and transactional updates. I benchmarked Qdrant on the same corpus: same
quality at our scale, better filtered search out of the box. I'd move when filtered recall or
latency at our scale forces it, and I know which numbers would tell me."*`,
    docs: [
      {
        label: 'MongoDB — Atlas Vector Search',
        url: 'https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/',
      },
      {
        label: 'Chroma documentation',
        url: 'https://docs.trychroma.com/',
      },
      {
        label: 'FAISS',
        url: 'https://github.com/facebookresearch/faiss',
      },
    ],
    glossary: [
      {
        term: 'managed service',
        def: 'A database someone else runs for you, billed by usage.',
      },
      {
        term: 'embedded database',
        def: 'A database that runs inside your application\'s process, with no separate server.',
      },
      {
        term: 'lock-in',
        def: 'How hard it is to leave a provider once your system depends on it.',
      },
    ],
    check: [
      {
        q: 'What\'s the first question when choosing a vector database?',
        a: `What you already run. Adding vectors to an existing database avoids a second system and the sync between them.`,
      },
      {
        q: 'Is FAISS a vector database?',
        a: `No. It's a library of ANN index implementations you embed in your own code; it has no server, persistence layer or filtering system of its own.`,
      },
      {
        q: 'Why does depth in one engine transfer to the others?',
        a: `They all implement the same ideas — vectors, distances, ANN indexes with a recall dial, filters, quantisation, hybrid search. Understanding those makes any engine quick to learn.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Pick the store',
        body: `Choose a vector store for each team, in one line each:

1. A MERN startup on MongoDB Atlas adding "chat with your notes".
2. A bank with a Postgres estate and a strict security review for every new system.
3. A consumer app with 2 billion image embeddings.
4. A solo developer's weekend prototype.
5. An e-commerce company that already runs Elasticsearch for product search.`,
        answer: `1. **Atlas Vector Search** — vectors next to the notes they describe, no new system.
2. **pgvector** — no new system to pass security review; RLS for permissions.
3. **A distributed engine** (Milvus, Qdrant in distributed mode, or a managed service) —
   billions of vectors is where dedicated, sharded engines earn their cost. Quantisation
   is mandatory.
4. **Chroma** (in-process) or pgvector in Docker — whatever gets to a working eval fastest.
5. **Elasticsearch's vector search** — hybrid search with the BM25 setup they've already
   tuned for years.

Notice none of these needed a benchmark to decide the first step. Existing infrastructure
and scale did most of the work.`,
      },
      {
        mode: 'read',
        title: 'Critique this architecture',
        body: `A design doc proposes: Postgres for app data, Pinecone for vectors, Elasticsearch for
keyword search, and Redis for "semantic caching", for an internal HR assistant over 3,000
documents with ~200 users.

What would you say in review?`,
        answer: `**Four data systems for 3,000 documents and 200 users is far more than needed.**

- 3,000 documents is perhaps 30,000–100,000 chunks: trivial for pgvector.
- Keyword search: Postgres full-text search handles hybrid retrieval at this size
  (Module 6), in the same query as the vectors.
- Every extra system adds sync jobs (documents, deletions *and permissions* to three
  places), security review, monitoring and on-call load — for an HR assistant where a
  permissions sync bug is a serious incident.
- A semantic cache for 200 users is unlikely to see enough repeated questions to pay off
  (Stage 5 covers when it does).

Suggest: Postgres + pgvector + full-text search, one sync pipeline, RLS for permissions.
Revisit with numbers if usage grows by orders of magnitude.`,
      },
    ],
  },
];
