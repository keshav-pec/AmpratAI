import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_6: Topic[] = [
  {
    id: 's1.6.t1',
    moduleId: 's1.6',
    title: 'MySQL to Postgres: what actually bites',
    outcome: 'You can move your SQL knowledge across without hitting the six differences that waste an afternoon.',
    minutes: 30,
    sources: [deck],
    animations: [],
    analogy: `You know SQL. This is not a SQL course. It is the diff — the handful of places
where what you know about MySQL is wrong in Postgres, and the places where Postgres gives
you something MySQL does not.`,
    notes: `## Why Postgres for this work

Not because it is better in general. Because of one specific thing: **\`pgvector\`** lets
you store and search vectors in the same database as your rows. Your documents, their
chunks, their embeddings, your users and your usage logs all live together, and a retrieval
query can filter by tenant and date in the same statement that does the vector search.

Add \`tsvector\` full-text search, which you need for hybrid retrieval in Stage 3, and one
database does what would otherwise be three.

---

## The differences that bite

**1. Auto-increment**

    -- MySQL
    id INT AUTO_INCREMENT PRIMARY KEY
    -- Postgres
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY

You will also see \`SERIAL\`, which is the older style and still everywhere. For AI work,
often you want a UUID instead, since ids travel between systems.

**2. Strings are case-sensitive, and quoting is different**

    'text'      -- a string, single quotes ONLY
    "column"    -- an identifier, not a string

In MySQL double quotes often work for strings. In Postgres \`"hello"\` means a column named
hello, and you get a confusing error.

\`WHERE name = 'Keshav'\` will not match \`'keshav'\`. Use \`ILIKE\` for case-insensitive
matching, or store a normalised column.

**3. RETURNING is excellent and you should use it**

    INSERT INTO docs (title) VALUES ('x') RETURNING id, created_at;

One round trip instead of insert-then-select. Works with UPDATE and DELETE too.

**4. Upsert syntax**

    INSERT INTO chunks (id, text) VALUES (...)
    ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;

This is your incremental re-ingestion in Stage 3 — re-running the pipeline updates changed
chunks instead of duplicating them.

**5. JSONB is genuinely good**

    metadata JSONB

Binary, indexable, queryable. \`WHERE metadata->>'tenant' = 'acme'\` with a GIN index is
fast. This is where the Mongo-shaped parts of your data live, and it means moving from Mongo
does not mean giving up flexible documents.

**6. No implicit type conversion**

MySQL happily compares a string to a number. Postgres refuses. This catches bugs, and it
catches you, in that order.

---

## Connecting from Python

    # async, what you will use
    from sqlalchemy.ext.asyncio import create_async_engine
    engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")

Note \`asyncpg\`, not \`psycopg2\`. The blocking driver inside an async handler is exactly
the mistake from the async module.

---

## Migrations

    alembic revision --autogenerate -m "add chunks table"
    alembic upgrade head

Alembic is the migration tool. **Always read what autogenerate produced before applying it** —
it is good at columns and bad at things like renames, which it will happily turn into a drop
plus an add.`,
    docs: [
      { label: 'PostgreSQL — the manual', url: 'https://www.postgresql.org/docs/current/' },
      { label: 'SQLAlchemy 2.0 — asyncio', url: 'https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html' },
      { label: 'Alembic', url: 'https://alembic.sqlalchemy.org/' },
    ],
    glossary: [
      { term: 'RETURNING', def: 'Gets back values from rows you just inserted or updated, in the same statement.' },
      { term: 'ON CONFLICT', def: 'Postgres upsert. Insert, or update if the row already exists.' },
      { term: 'JSONB', def: 'Binary JSON column type — indexable and queryable.' },
      { term: 'asyncpg', def: 'The async Postgres driver. Use this, not psycopg2, inside async code.' },
      { term: 'Alembic', def: 'The migration tool for SQLAlchemy.' },
    ],
    check: [
      { q: 'Why Postgres specifically for this work?', a: 'pgvector and tsvector mean one database holds your rows, your vectors and your full-text index — so a retrieval query can filter and search in one statement.' },
      { q: 'What do double quotes mean in Postgres?', a: 'An identifier, not a string. Strings are single quotes only.' },
      { q: 'What will you use ON CONFLICT for in Stage 3?', a: 'Incremental re-ingestion — updating changed chunks instead of duplicating them.' },
      { q: 'Which driver, and why?', a: 'asyncpg. psycopg2 is blocking and would freeze the event loop inside an async handler.' },
      { q: 'What should you always do with an autogenerated migration?', a: 'Read it before applying it. Autogenerate turns renames into a drop plus an add.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Translate one of your Mongo schemas',
        body: `Take a real collection from one of your projects. Design the Postgres version: real
tables, foreign keys, and \`JSONB\` for the parts that genuinely are flexible.

Write it yourself first, then have AI review your schema and argue with it. The interesting
question is which fields you kept in \`JSONB\` and whether you can defend each one — "it was
easier" is not a defence.`,
        answer: `An example: a MERN orders collection with the user and the line items embedded.

\`\`\`sql
CREATE TABLE users (
  id    uuid PRIMARY KEY,
  name  text NOT NULL,
  email text NOT NULL UNIQUE
);

CREATE TABLE orders (
  id               uuid PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES users(id),
  status           text NOT NULL CHECK (status IN ('pending','paid','shipped','cancelled')),
  shipping_address jsonb NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id         uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid NOT NULL REFERENCES products(id),
  qty              int NOT NULL CHECK (qty > 0),
  unit_price_paise bigint NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE INDEX ON orders (user_id, created_at DESC);
\`\`\`

Defending the choices:

- **\`shipping_address\` stays JSONB.** It is read as a unit, never filtered or joined on, and its shape varies by country.
- **Items became a table.** You will aggregate over them — revenue by product — which JSONB makes painful.
- **The embedded user name is gone; join instead.** Unless you need the name *as it was at order time* — then keep it deliberately, as a clearly named snapshot column.
- **Money is whole paise in an integer**, never a float.

The anti-pattern to avoid: one JSONB column holding the entire document. That is MongoDB inside Postgres, with none of the constraints you switched for.`,
      },
      {
        mode: 'tool',
        title: 'Run it locally',
        body: `Start Postgres in Docker. Create your schema with Alembic. Insert rows with
\`RETURNING\`, then run the same insert again with \`ON CONFLICT DO UPDATE\` and confirm you
get an update rather than a duplicate.

That upsert behaviour is exactly what makes re-ingestion safe in Stage 3.`,
        answer: `\`\`\`sql
INSERT INTO docs (id, title) VALUES ('d1', 'First draft') RETURNING id, title;

INSERT INTO docs (id, title) VALUES ('d1', 'Second draft')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
RETURNING id, title;
\`\`\`

The second statement updates the existing row instead of adding a duplicate. \`EXCLUDED\` refers to the row you *tried* to insert.

The usual snag: \`ON CONFLICT (col)\` needs a unique constraint or primary key on exactly that column set. Without one you get:

\`there is no unique or exclusion constraint matching the ON CONFLICT specification\`

In Stage 3, the conflict target is usually \`(tenant_id, doc_id, chunk_index)\` — so declare that constraint when you create the table.`,
      },
      {
        mode: 'read',
        title: 'Which of these fail, and why?',
        body: `    SELECT * FROM users WHERE name = "keshav";
    SELECT * FROM docs WHERE page_count = '5';
    INSERT INTO t (id) VALUES (1); -- id is GENERATED ALWAYS AS IDENTITY

The third one is the one that surprises people coming from MySQL.`,
        answer: `1. **\`WHERE name = "keshav"\`** — **fails**: \`column "keshav" does not exist\`. Double quotes mean an identifier; strings use single quotes.
2. **\`WHERE page_count = '5'\`** — **actually works.** A quoted literal in Postgres starts out untyped and is converted to match the column. What *does* fail is a value that arrives already typed as text — for example a driver sending a Python \`str\` as a parameter — which gives \`operator does not exist: integer = text\`. So this one bites through your code, not your SQL console.
3. **\`INSERT INTO t (id) VALUES (1)\`** on a \`GENERATED ALWAYS\` identity column — **fails**: \`cannot insert a non-DEFAULT value into column "id"\`. MySQL's \`AUTO_INCREMENT\` accepts explicit values; Postgres makes you say \`OVERRIDING SYSTEM VALUE\`. Use \`GENERATED BY DEFAULT\` if you need to insert ids yourself — during a migration, for example.`,
      },
    ],
  },

  {
    id: 's1.6.t2',
    moduleId: 's1.6',
    title: 'Reading EXPLAIN ANALYZE',
    outcome: 'You can look at a slow query and say why it is slow, instead of adding indexes at random.',
    minutes: 30,
    sources: [deck],
    animations: ['anim-index'],
    analogy: `MySQL's EXPLAIN gives you a table. Postgres gives you a tree, read from the
inside out. It is more information in a less friendly shape, and once you can read it you
stop guessing.`,
    notes: `## Run it against real data

    EXPLAIN ANALYZE SELECT * FROM chunks WHERE doc_id = 'abc';

\`EXPLAIN\` alone shows the plan. \`EXPLAIN ANALYZE\` actually runs it and shows real timings.
Use \`ANALYZE\`. A plan without timings tells you what Postgres intends, not what happened.

---

## Read it inside out

    Nested Loop  (cost=0.43..24.5 rows=8 width=120) (actual time=0.05..0.12 rows=8 loops=1)
      ->  Index Scan using idx_chunks_doc on chunks  (actual time=0.03..0.06 rows=8 loops=1)
            Index Cond: (doc_id = 'abc')
      ->  ...

The deepest, most indented line runs first. Work upward.

---

## The four words that matter

**Seq Scan** — read every row. Fine for a small table, a disaster for a large one. On a
large table this is usually your answer.

**Index Scan** — used an index. Good.

**Bitmap Heap Scan** — used an index, but matched many rows, so it collected them first.
Normal for medium-selectivity queries.

**Nested Loop / Hash Join** — how two tables were joined. A nested loop over a large table
is often the problem.

---

## The number that matters most

    rows=8 ... (actual ... rows=8000 ...)

**Estimated versus actual.** When they are wildly different, the planner is working from bad
statistics and is therefore choosing the wrong plan. Run \`ANALYZE tablename;\` to refresh
them. This is the single most useful thing to look at, and most people never notice it.

---

## Composite index order

    CREATE INDEX idx ON chunks (tenant_id, created_at);

This index helps:

    WHERE tenant_id = 'x'
    WHERE tenant_id = 'x' AND created_at > '2026-01-01'

This one it does not help:

    WHERE created_at > '2026-01-01'

Think of a phone book sorted by surname then first name. Finding all the Sharmas is easy.
Finding everyone called Priya is not. Left to right, no skipping.

In Stage 3 this exact rule decides whether your tenant-filtered retrieval is fast or slow.

One recent change worth knowing: Postgres 18 added *skip scan*, which can use an index like
this even without the first column, when that column has only a few distinct values. Useful —
but keep designing indexes left to right, and don't rely on it.

---

## Two more things worth knowing

An index makes reads faster and writes slower, and takes disk. Do not index every column;
index the ones queries actually filter on.

Postgres will ignore your index if it estimates that most rows match anyway — a sequential
scan really is faster then. That is the planner being right, not broken.`,
    docs: [
      { label: 'PostgreSQL — using EXPLAIN', url: 'https://www.postgresql.org/docs/current/using-explain.html' },
      { label: 'Use The Index, Luke', url: 'https://use-the-index-luke.com/' },
    ],
    glossary: [
      { term: 'Seq Scan', def: 'Reading every row in the table.' },
      { term: 'Index Scan', def: 'Using an index to jump straight to matching rows.' },
      { term: 'estimated vs actual rows', def: 'When these differ a lot, the planner has bad statistics and is choosing badly.' },
      { term: 'ANALYZE (the command)', def: 'Refreshes the statistics the planner uses.' },
      { term: 'composite index', def: 'An index on several columns. Usable left to right only.' },
    ],
    check: [
      { q: 'Which direction do you read a Postgres plan?', a: 'Inside out — the most indented line runs first.' },
      { q: 'What does a big gap between estimated and actual rows mean?', a: 'Stale statistics, so the planner picked the wrong plan. Run ANALYZE on the table.' },
      { q: 'Does an index on (tenant_id, created_at) help a query filtering only on created_at?', a: 'No. Composite indexes work left to right, like a phone book sorted by surname then first name.' },
      { q: 'Is a Seq Scan always bad?', a: 'No. On a small table, or when most rows match anyway, it is genuinely faster and the planner is right to choose it.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Make one query fast',
        body: `Create a table with 500,000 rows. Query it by a non-indexed column and run
\`EXPLAIN ANALYZE\`. Note the scan type and the time.

Add an index. Run it again. Compare both numbers.

Then add a composite index on two columns and write three queries: one that uses it fully,
one that uses only the first column, and one that filters only on the second. Predict which
will use the index before you run each.`,
        answer: `Typical numbers on 500,000 rows:

- **No index:** \`Seq Scan\`, tens of milliseconds.
- **With an index:** \`Index Scan\`, well under a millisecond.

For a composite index on \`(a, b)\`:

- \`WHERE a = ?\` → uses the index
- \`WHERE a = ? AND b > ?\` → uses the index fully
- \`WHERE b > ?\` → sequential scan

That last one has a newer twist. **Postgres 18 added "skip scan"**, which can still use such an index when the first column has only a few distinct values. It is useful — but still design indexes left to right, and don't count on it. The \`pg17\` image from the Docker module won't do it at all.

The usual snag: running each query once. The first run pays to load pages from disk, so repeat it and compare the warm numbers.`,
      },
      {
        mode: 'read',
        title: 'Diagnose these',
        body: `1. \`Seq Scan on chunks (actual rows=2,400,000)\` with a WHERE on \`doc_id\`
2. \`Index Scan ... rows=10 ... (actual rows=45000)\`
3. A query that got slower after you added a fourth index

For each: what is happening, and what do you do about it?`,
        answer: `1. **\`Seq Scan\` over 2.4 million rows, with a \`WHERE\` on \`doc_id\`** → there is no usable index on \`doc_id\`. Or there is one, but the query wraps \`doc_id\` in a function or a type cast, which makes it unusable. Add the index, and check the \`WHERE\` clause compares the bare column.
2. **\`rows=10\` estimated, 45,000 actual** → stale or insufficient statistics, so the planner probably chose a plan suited to 10 rows (like a nested loop). Run \`ANALYZE chunks;\`. If it is still wrong, raise that column's statistics target. If two columns are correlated, add extended statistics with \`CREATE STATISTICS\`.
3. **A query got slower after a fourth index** → if it is a **write**, every index adds work to every insert and update. If it is a **read**, the planner may be picking the new index on a bad estimate — compare \`EXPLAIN ANALYZE\` before and after. Either way, \`pg_stat_user_indexes\` shows indexes that are never used (\`idx_scan = 0\`), and those are safe to drop.`,
      },
    ],
  },

  {
    id: 's1.6.t3',
    moduleId: 's1.6',
    title: 'GIN, partial and expression indexes, and JSONB',
    outcome: 'You can index the things a plain B-tree cannot — arrays, JSON, expressions, and subsets of a table.',
    minutes: 25,
    sources: [deck],
    animations: [],
    analogy: `MySQL gives you B-tree and full-text and that is roughly it. Postgres has a
small family of index types, and three of them solve problems you will actually hit in
Stage 3.`,
    notes: `## GIN — for things that contain many values

A B-tree indexes one value per row. GIN indexes *many* values per row, which is what you
need for arrays, JSONB and full-text search.

    CREATE INDEX ON chunks USING GIN (metadata);
    SELECT * FROM chunks WHERE metadata @> '{"tenant": "acme"}';

    CREATE INDEX ON docs USING GIN (tags);
    SELECT * FROM docs WHERE tags @> ARRAY['policy'];

\`@>\` means "contains". This is how you filter retrieval results by metadata without a
separate table.

---

## Partial indexes — index only the rows you query

    CREATE INDEX ON jobs (created_at) WHERE status = 'pending';

Your jobs table has ten million finished rows and forty pending ones. You only ever query
the pending ones. A partial index covers exactly those forty.

Smaller index, faster writes, and it is used automatically when your query matches the
condition. Very useful for queue tables, which you will have in Stage 5.

---

## Expression indexes — index a computed value

    CREATE INDEX ON users (lower(email));
    SELECT * FROM users WHERE lower(email) = 'a@b.com';

Without the index, that query cannot use a plain index on \`email\` at all, because the
function on the left makes it unusable. This is a common silent cause of a slow query in an
otherwise well-indexed table.

---

## JSONB, practically

Use it for genuinely variable data. In Stage 3 that is chunk metadata, where different
document types carry different fields:

    metadata JSONB
    -- {"source": "rbi.pdf", "page": 42, "section": "4.2", "tenant": "acme"}

Query it:

    metadata->>'tenant'            -- as text
    metadata->'page'               -- as jsonb
    metadata @> '{"tenant":"x"}'   -- contains, uses the GIN index

**The discipline:** anything you filter on *every* query should be a real column, not a
JSONB key. \`tenant_id\` is the obvious one — it wants to be a real column with a real index
and a real foreign key, because it is the field that must never be forgotten.

JSONB is for the variable tail, not for the structure.`,
    docs: [
      { label: 'PostgreSQL — JSON types', url: 'https://www.postgresql.org/docs/current/datatype-json.html' },
      { label: 'PostgreSQL — index types', url: 'https://www.postgresql.org/docs/current/indexes-types.html' },
    ],
    glossary: [
      { term: 'GIN index', def: 'Indexes many values per row — arrays, JSONB keys, text search terms.' },
      { term: '@>', def: 'The "contains" operator for JSONB and arrays.' },
      { term: 'partial index', def: 'An index covering only rows that match a condition.' },
      { term: 'expression index', def: 'An index on a computed value, like lower(email).' },
    ],
    check: [
      { q: 'When do you need GIN instead of a B-tree?', a: 'When a row contains many values you want to search — arrays, JSONB keys, full-text terms.' },
      { q: 'What is a partial index good for?', a: 'A small hot subset of a big table, like pending rows in a job queue.' },
      { q: 'Why is WHERE lower(email) = ... slow with an index on email?', a: 'The function makes the plain index unusable. You need an expression index on lower(email).' },
      { q: 'Which fields should be real columns rather than JSONB keys?', a: 'Anything you filter on in every query — tenant_id above all, because it needs a real index and a real foreign key.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Design chunk metadata',
        body: `Spec the metadata for a chunk in a multi-tenant document system: source, title, page,
section path, date, version, tenant, and whatever else you would want to filter on.

Decide which are real columns and which live in \`JSONB\`, and write one sentence per
decision. Then write the queries you expect to run and check that each one is indexable.

You will use this exact design in Stage 3, and the tenant decision is the one that matters.`,
        answer: `**Real columns** — you filter, join or constrain on them:

- \`id\`, \`tenant_id\` (NOT NULL, foreign key), \`doc_id\` (foreign key), \`doc_version\`
- \`chunk_index\`, \`page_start\`, \`page_end\`, \`section_path\`
- \`content_hash\`, \`embedding_model\`, \`created_at\`
- \`text\`, \`embedding\`, and the generated \`search\` tsvector

**JSONB metadata** — varies by document type, and is rarely filtered:

- \`title\`, \`url\`, \`author\`, \`tags\`
- source-specific fields, like a circular number or a policy clause id

Queries, and what each one needs:

\`\`\`sql
-- by document, within a tenant           -> index on (tenant_id, doc_id)
WHERE tenant_id = $1 AND doc_id = ANY($2)
-- similarity, within a tenant            -> HNSW index on embedding, plus the tenant filter
WHERE tenant_id = $1 ORDER BY embedding <=> $2 LIMIT 5
-- tag containment                         -> GIN index on metadata
WHERE tenant_id = $1 AND metadata @> '{"tags": ["policy"]}'
-- idempotent re-ingest                    -> UNIQUE (tenant_id, doc_id, chunk_index)
\`\`\`

**The tenant decision:** a real column, NOT NULL, a foreign key, first in every composite index, and applied in the query layer so no handler can forget it. Postgres row-level security can enforce it a second time, as a safety net.`,
      },
      {
        mode: 'tool',
        title: 'Prove each index type',
        body: `Build a table with a JSONB column and 100,000 rows. Query it by a JSONB key with and
without a GIN index, and compare \`EXPLAIN ANALYZE\`.

Then make a partial index on a small subset and confirm the plan uses it.`,
        answer: `The shape you should see:

- **JSONB containment (\`@>\`) without a GIN index** → \`Seq Scan\`.
- **With \`USING GIN (metadata jsonb_path_ops)\`** → \`Bitmap Index Scan\`. The \`jsonb_path_ops\` variant is smaller and faster, but it only supports \`@>\`.
- **A partial index \`WHERE status = 'pending'\`** is used by \`WHERE status = 'pending' ORDER BY created_at LIMIT 10\`, and ignored by queries on other statuses.

The snag that catches everyone: **\`metadata->>'tenant' = 'x'\` does not use a GIN index on \`metadata\`.** GIN supports containment and key-existence operators, not extracting a value and comparing it. Either rewrite the query as containment — \`metadata @> '{"tenant": "x"}'\` — or add a B-tree **expression** index on \`(metadata->>'tenant')\`.`,
      },
    ],
  },

  {
    id: 's1.6.t4',
    moduleId: 's1.6',
    title: 'Full-text search with tsvector',
    outcome: 'You can do keyword search inside Postgres — the half of hybrid retrieval that is not vectors.',
    minutes: 30,
    sources: [deck],
    animations: [],
    analogy: `MySQL has FULLTEXT. This is the same idea with more control. The reason it is
in this stage rather than Stage 3 is that hybrid search needs it, and you do not want to be
learning two new things at once when you get there.`,
    notes: `## Why you need this even though you have vectors

Vector search finds things that *mean* something similar. It is good at paraphrase and bad
at exact strings.

Ask "what is the refund window for order AB-19472" and vector search will happily return
five chunks about refunds and miss the one containing \`AB-19472\`, because a product code
carries almost no semantic meaning.

Keyword search finds the code instantly and misses the paraphrase.

**Hybrid search runs both and combines the results.** In Stage 3 you will measure exactly
how much that is worth — it is usually a lot. This topic is the keyword half.

---

## The pieces

    -- turn text into searchable tokens
    SELECT to_tsvector('english', 'The refund policy is thirty days');
    -- 'day':6 'polici':3 'refund':2 'thirti':5

Notice: stop words dropped, words reduced to stems. \`policy\` and \`policies\` both become
\`polici\`, so they match each other.

    -- turn a query into a search
    SELECT to_tsquery('english', 'refund & policy');

---

## The practical setup

Store a generated column and index it:

    ALTER TABLE chunks
      ADD COLUMN search tsvector
      GENERATED ALWAYS AS (to_tsvector('english', text)) STORED;

    CREATE INDEX ON chunks USING GIN (search);

Generated means it updates itself when the text changes. One less thing to forget.

---

## Searching and ranking

    SELECT id, text, ts_rank(search, query) AS score
    FROM chunks, plainto_tsquery('english', 'refund policy') query
    WHERE search @@ query
    ORDER BY score DESC
    LIMIT 20;

\`@@\` is the match operator. \`ts_rank\` scores how well each row matched.

Use \`plainto_tsquery\` for user input — it takes ordinary text and handles the operators
for you. \`to_tsquery\` expects proper syntax and will error on a stray apostrophe.

---

## The limitation worth knowing now

English stemming does not help Hindi, and mixed Hinglish text stems badly in either
language. If your corpus is multilingual, keyword search will be weaker than the vector
side — which is an argument for hybrid, not against it.

---

## Where this goes

In Stage 3 you will take the ranked list from this query and the ranked list from a vector
search, and fuse them with Reciprocal Rank Fusion. Both lists come from the same database,
in the same query if you want. That is the payoff for putting vectors in Postgres.`,
    docs: [
      { label: 'PostgreSQL — full text search', url: 'https://www.postgresql.org/docs/current/textsearch.html' },
      { label: 'PostgreSQL — text search controls', url: 'https://www.postgresql.org/docs/current/textsearch-controls.html' },
    ],
    glossary: [
      { term: 'tsvector', def: 'Text processed into searchable, stemmed tokens.' },
      { term: 'tsquery', def: 'A search expression to match against a tsvector.' },
      { term: '@@', def: 'The match operator between a tsvector and a tsquery.' },
      { term: 'ts_rank', def: 'Scores how well a row matched, for ordering results.' },
      { term: 'stemming', def: 'Reducing words to a root form so policy and policies match.' },
      { term: 'hybrid search', def: 'Combining keyword and vector results into one ranking.' },
    ],
    check: [
      { q: 'Give a query where vector search fails and keyword search wins.', a: 'Anything containing an exact identifier — an order number, a product code, a section number. Those carry no semantic meaning.' },
      { q: 'Why use plainto_tsquery for user input?', a: 'It accepts ordinary text. to_tsquery expects operator syntax and errors on things like a stray apostrophe.' },
      { q: 'What does a generated tsvector column save you from?', a: 'Forgetting to update the search index when the text changes.' },
      { q: 'What is the weakness with Hinglish content?', a: 'English stemming does not apply, so keyword matching is weaker — which is an argument for hybrid search rather than against it.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Search a real corpus',
        body: `Load 500 paragraphs of real text into a table — any document set you can get. Add a
generated \`tsvector\` column and a GIN index.

Run five searches. Include one with an exact identifier in it and one that is a paraphrase
of something in the text. Note which kind of query keyword search handles well.

That contrast is the whole argument for hybrid retrieval, and you will have felt it before
you get there.`,
        answer: `What you should have seen:

- **The exact identifier query** finds its paragraph at or near rank 1.
- **The paraphrase query** — "can I get my money back?" against text that says "refund" — finds little or nothing, because the two share no stemmed words.

That is the keyword half of hybrid search, and why it needs a vector half.

The usual snags:

- **\`to_tsquery\` on raw user input** throws a syntax error on apostrophes and operators. Use \`plainto_tsquery\`, or \`websearch_to_tsquery\`, which also understands quotes, \`or\` and \`-\`, the way a search box does.
- **Mismatched configurations** — the column built with \`'english'\` and the query with \`'simple'\`. The stems don't match, and nothing is found.`,
      },
      {
        mode: 'primitive',
        title: 'Write Reciprocal Rank Fusion by hand',
        body: `One of the ten primitives, and it is about fifteen lines.

Given two ranked lists of ids, produce one combined ranking where an item's score is the sum
of \`1 / (k + rank)\` across the lists it appears in, with \`k\` around 60.

Test it: an item ranked 1st in one list and absent from the other, versus an item ranked 3rd
in both. Which should win, and does your implementation agree?

In Stage 3 you will use this exact function on your keyword and vector results.`,
        answer: `\`\`\`python
def rrf(*rankings: list[str], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    for ranking in rankings:
        for rank, item in enumerate(ranking, start=1):
            scores[item] = scores.get(item, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=scores.__getitem__, reverse=True)
\`\`\`

The test:

- **1st in one list, absent from the other:** \`1/61 ≈ 0.0164\`
- **3rd in both lists:** \`1/63 + 1/63 ≈ 0.0317\`

**3rd-in-both wins**, by nearly double. Two retrievers agreeing beats one strong vote from a single retriever — which is the whole point of fusing them.

Also notice what RRF ignores: the retrievers' own scores. It uses ranks only, which is why it can combine keyword scores and vector distances without making them comparable first.`,
      },
    ],
  },

  {
    id: 's1.6.t5',
    moduleId: 's1.6',
    title: 'pgvector: vectors in your database',
    outcome: 'You can store embeddings, search them by similarity, and explain what the index settings trade away.',
    minutes: 35,
    sources: [deck],
    animations: [],
    analogy: `A new column type and a new operator. That is genuinely most of it. The part
worth your attention is the index, because unlike a B-tree it is *approximate* — it can
return a slightly wrong answer on purpose, in exchange for being much faster.`,
    notes: `## Setup

    CREATE EXTENSION vector;

    CREATE TABLE chunks (
      id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      doc_id     TEXT NOT NULL,
      tenant_id  TEXT NOT NULL,
      text       TEXT NOT NULL,
      embedding  VECTOR(1536),
      metadata   JSONB
    );

\`VECTOR(1536)\` means 1536 numbers per row. The size is fixed by whichever embedding model
you use, and you cannot mix models in one column — changing model means re-embedding
everything.

---

## Searching

    SELECT id, text, embedding <=> $1 AS distance
    FROM chunks
    WHERE tenant_id = $2
    ORDER BY embedding <=> $1
    LIMIT 5;

\`<=>\` is cosine distance. Smaller is closer. There are others — \`<->\` for L2, \`<#>\` for
inner product — and **you must use the same one your index was built for**, or the index is
silently ignored and you get a slow sequential scan over every vector.

Look at that query again. It filters by tenant *and* searches by similarity in one
statement. That is the reason for keeping vectors in Postgres.

---

## The index, and the honest trade

    CREATE INDEX ON chunks
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64);

Without an index, every query compares against every row. At 50,000 chunks that is already
slow.

HNSW builds a navigable graph so a search visits a few hundred candidates instead of all of
them. It is **approximate**: it may miss a result that was genuinely in the true top five.

- \`m\` — connections per node. Higher is more accurate, bigger, slower to build.
- \`ef_construction\` — effort at build time. Higher is more accurate and slower to build.
- \`ef_search\` — effort at query time, and the one you tune live:

    SET hnsw.ef_search = 100;      -- higher: better recall, slower queries

**That is the dial.** In Stage 3 you will measure recall against your golden set at
different \`ef_search\` values and pick a point on the curve deliberately, rather than
accepting a default.

---

## The filtering trap

    WHERE tenant_id = 'x' ORDER BY embedding <=> $1 LIMIT 5

If tenant x holds 1% of your rows, the index may search the graph, find its nearest
neighbours, discard almost all of them for the wrong tenant, and return two results instead
of five. The query is correct and the recall is bad.

You will meet this properly in Stage 3. For now, know that **filtering and approximate
search interact**, and that a filtered vector query needs testing rather than assuming.

---

## Practical notes

- Build the index **after** bulk loading. Inserting into an existing HNSW index is much slower.
- 1536 dimensions is about 6KB a row. A million chunks is roughly 6GB before the index.
- Store the model name alongside the vector. When you switch embedding models — and you will — you need to know which rows are stale.`,
    docs: [
      { label: 'pgvector — README (read all of it)', url: 'https://github.com/pgvector/pgvector' },
      { label: 'pgvector — indexing', url: 'https://github.com/pgvector/pgvector#indexing' },
    ],
    glossary: [
      { term: 'embedding', def: 'A list of numbers representing the meaning of a piece of text.' },
      { term: 'cosine distance (<=>)', def: 'How far apart two vectors point. Smaller is more similar.' },
      { term: 'HNSW', def: 'A graph index for approximate nearest-neighbour search.' },
      { term: 'ef_search', def: 'How hard the search tries at query time. The recall-versus-speed dial.' },
      { term: 'approximate search', def: 'Search that may miss a true nearest neighbour in exchange for speed.' },
      { term: 'recall', def: 'The share of the genuinely-nearest results your search actually returned.' },
    ],
    check: [
      { q: 'What happens if your query operator does not match the index operator class?', a: 'The index is silently ignored and every row is compared. The query still works, just slowly.' },
      { q: 'What does ef_search control?', a: 'How hard the index searches at query time — the dial between recall and latency.' },
      { q: 'Why can a filtered vector query return fewer good results than expected?', a: 'The approximate search finds neighbours first, then the filter discards most of them. Filtering and approximation interact.' },
      { q: 'Why store the embedding model name next to the vector?', a: 'When you change models, you need to know which rows are stale — vectors from different models are not comparable.' },
      { q: 'When should you build the HNSW index?', a: 'After bulk loading. Inserting into an existing HNSW index is much slower.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write cosine similarity by hand',
        body: `One of the ten primitives, and it is four lines.

Write \`cosine(a, b)\` for two lists of floats, with no libraries. Then check your
understanding: what does it return for two identical vectors, two opposite ones, and two
perpendicular ones?

Now the part that matters: if both vectors are already normalised to length 1, what does
cosine similarity reduce to? That answer is why every embedding library talks about
normalisation.`,
        answer: `\`\`\`python
import math

def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        raise ValueError("a zero vector has no direction")
    return dot / (na * nb)
\`\`\`

- identical vectors → **1.0**
- perpendicular → **0.0**
- opposite → **−1.0**

If both vectors are already normalised to length 1, the denominator is 1, so **cosine similarity is just the dot product**. That is why embedding systems normalise once, when they store a vector, and then use the cheaper inner product at query time.

Two details in the code:

- **\`strict=True\` on \`zip\`** — without it, two vectors of different lengths are silently truncated to the shorter one, giving a wrong answer instead of an error.
- **pgvector's \`<=>\` returns cosine *distance***, which is \`1 − similarity\`. Smaller is closer.`,
      },
      {
        mode: 'tool',
        title: 'Build a tiny vector store',
        body: `Start Postgres with pgvector in Docker. Create the chunks table above. Insert 5,000
rows with random 1536-dimension vectors.

Query without an index and time it. Add an HNSW index and time it again. Then set
\`ef_search\` to 10, 40 and 200, and record the latency at each.

You now have a feel for the curve you will be measuring properly in Stage 3.`,
        answer: `The shape you should see on 5,000 rows:

- **No index:** a few milliseconds. Small tables are fast anyway; the difference grows with size.
- **HNSW index:** faster again.
- **\`ef_search\` 10 → 40 → 200:** latency climbs, and recall improves.

Three snags:

- **Random vectors are a poor recall test.** They have no clusters, so everything is roughly equally far away. Use real embeddings to judge recall.
- **The query must be \`ORDER BY embedding <=> $1 LIMIT k\`** for the index to be used at all.
- **An HNSW scan returns at most \`ef_search\` rows.** Ask for \`LIMIT 100\` with \`ef_search\` at 40 and you get 40 back. Raise \`ef_search\`, or turn on pgvector's iterative index scans — you will need those for filtered queries in Stage 3 anyway.`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Build your index with \`vector_cosine_ops\` and then query with \`<->\` instead of
\`<=>\`. Run \`EXPLAIN ANALYZE\` and watch it fall back to a sequential scan.

That silent fallback — correct answers, terrible performance, no error — is exactly the kind
of bug that survives into production.`,
        answer: `With the index built for \`vector_cosine_ops\` and the query using \`<->\`, which is L2 distance:

- \`EXPLAIN ANALYZE\` shows **\`Seq Scan\` plus a \`Sort\`**, not an index scan
- the results are **correct**, just ordered by L2 distance
- it is **slow**, and there is **no error or warning**

For normalised vectors, L2 and cosine even produce the same ordering — and the index is *still* not used, because the operator does not match the index's operator class.

This is the kind of bug that sails through testing on small data and shows up in production as "search got slow".`,
      },
    ],
  },
];
