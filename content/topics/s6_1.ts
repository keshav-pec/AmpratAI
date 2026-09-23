import type { Topic } from '@/lib/types';

export const s6_1: Topic[] = [
  {
    id: 's6.1.t1',
    moduleId: 's6.1',
    title: 'Scoping the capstone',
    outcome: `You can turn the capstone brief into a build plan: a thin version that works end to end first, a map of what you reuse from earlier projects, numbers to hit, and an order of work — with no dates.`,
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
        query: 'walking skeleton vertical slice software',
        channel: '',
        reason: 'the idea of a thin end-to-end first version',
      },
    ],
    animations: ['anim-capstone-architecture'],
    analogy: `Your first MERN app. Before any features, you made one request travel the whole way:
React → Express → Mongo → back to the screen. Only then did you add pages. The capstone
starts the same way — one thin path through every part, then widen it.`,
    notes: `## What you're building

The brief (project p-6.1) is an **AI hiring copilot**:

- **Candidates** see how well they match a job, why, and what's missing.
- **Recruiters** search candidates in plain language and see why each one fits.
- **Many companies** use it, and each company's data stays its own.

You name it. A name is a product decision: short, easy to say, free as a domain and a
GitHub repo. Give it one session, not five.

---

## Most of it is reuse

| Capstone piece | Comes from |
|---|---|
| Resume extraction | p-2.2, structured extraction |
| Job-posting extraction | the same pattern, a new schema |
| Hybrid retrieval and reranking | p-3.1 |
| Explanations with citations | Stage 3 citations |
| A person approves candidate-facing output | p-4.1 approval gates |
| Tracing, costs, eval gate, rate limits | p-5.1 |

The genuinely new parts are few: the **tenant model**, **explainable scoring**, the
**fairness review**, and **real users**. That's where your time goes.

---

## A walking skeleton first

A **walking skeleton** is the thinnest version that runs end to end, deployed: one resume
upload, one posting, one match, one explanation, traced. Ugly is fine.

Why first? The hardest bugs live *between* parts — auth and tenant, tenant and index,
index and explanation. A skeleton finds them while they're cheap.

Then widen it one **vertical slice** at a time. A slice is a thin feature that goes
through every layer and ships on its own:

1. Skeleton: one resume, one posting, one explained match, one company
2. Tenants: two companies, the tenant filter everywhere, the isolation test in CI
3. Match quality: hybrid search, reranking, a golden set of resume × posting pairs
4. Explanations: every score cites a requirement and a resume line
5. Candidate side: gap analysis and interview prep, behind human review
6. Recruiter search in plain language
7. Fairness review, cost dashboard, real users

---

## Numbers before code

Write the requirements as numbers, the Stage 5 way. Yours to choose — for example:

- **Scale:** 10 companies, 2,000 resumes, 50 postings. Small and honest.
- **Speed:** first explained match within 5 seconds; search results within 2 seconds.
- **Cost:** a published ceiling, such as ₹5 per match (one posting against the pool).
- **Quality:** recall@10 on the golden set; how often explanations cite real lines;
  how long a human review takes.

Each number needs a way to measure it. A number you can't measure is a wish.

---

## Non-goals protect you

The brief rules out payments, a mobile app, scraping job boards, training a model and
integrating with applicant-tracking systems (ATS). Put these in your README.

Add one of your own: **no custom design system.** Use a component library. You're judged
on matching, explanations, tenancy, evals and operations — not on button shadows.

When a shiny idea turns up, check it against the list. Most ideas can wait for "later".`,
    docs: [],
    glossary: [
      {
        term: 'walking skeleton',
        def: 'The thinnest end-to-end version of a system, deployed, that later work widens.',
      },
      {
        term: 'vertical slice',
        def: 'A thin feature cut through every layer, shippable on its own.',
      },
      {
        term: 'non-goal',
        def: 'Something you\'ve decided not to build, written down so it stays out.',
      },
      {
        term: 'cost ceiling',
        def: 'The most you allow one unit of work — here, one match — to cost.',
      },
    ],
    check: [
      {
        q: 'What is a walking skeleton, and why build it first?',
        a: `The thinnest version that runs end to end and is deployed. It exposes the bugs between parts — auth, tenant, index, explanation — while they're cheap to fix.`,
      },
      {
        q: 'Which parts of the capstone are genuinely new?',
        a: `The tenant model, explainable scoring, the fairness review and real users. The rest is reuse from earlier projects.`,
      },
      {
        q: 'What is a vertical slice?',
        a: 'A thin feature that goes through every layer — UI, API, data, model — and can ship on its own.',
      },
      {
        q: 'Why write non-goals down?',
        a: 'They stop scope creep. Every new idea gets checked against them before it takes your time.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Put the work in order',
        body: `These eight work items arrive shuffled. Put them in build order, and give a one-line
reason for anything that must come early.

a. Fairness review with counterfactual tests
b. Deploy one resume → one explained match, traced
c. Recruiter search in plain language
d. \`tenant_id\` on every table, row-level security, the isolation test in CI
e. Golden set of 100 resume × posting pairs, and an eval gate
f. Invite ten real users
g. Explanations that cite requirement and resume lines
h. Gap analysis and interview prep for candidates`,
        answer: `A sound order: **b → d → e → g → h → c → a → f**.

- **b first** — the walking skeleton finds the integration bugs.
- **d early** — retrofitting \`tenant_id\` into every table, query, cache key and trace
  later is painful and error-prone. With only a skeleton, it's a small change.
- **e before tuning** — without the golden set you can't tell if a change helped.
- **g before h and c** — gap analysis and search both reuse the per-requirement
  verdicts that explanations produce.
- **a before f** — the fairness review must pass before real people's resumes are scored.
- **f last** — but not "never". Real users are part of the brief.

Swapping c and h is fine. Putting d or e near the end is the mistake to avoid.`,
      },
      {
        mode: 'spec',
        title: 'Write the one-page plan',
        body: `Write the capstone's one-page plan with these headings:

1. Name (three candidates) and a one-line pitch
2. Users and the problem each one has
3. Requirements as numbers (scale, speed, cost, quality)
4. Reuse map
5. Slices, in order
6. Non-goals
7. Top three risks and what you'll do about each

Keep it to one page. Use Claude to tidy the wording, but every number is your call.`,
        answer: `An example to compare against. Your content will differ; the shape is what matters.

**1. Name:** three short options, domain checked. *Pitch:* "Matches candidates to
jobs — and shows exactly why."

**2. Users:** candidates (don't know why they're rejected), recruiters (keyword search
misses people who phrase skills differently), and you as operator (cost, abuse, privacy).

**3. Numbers:** 10 companies · 2,000 resumes · first explained match within 5 s ·
₹5 per match ceiling · recall@10 ≥ 0.8 on the golden set · 100% of shown claims cite a
real resume line.

**4. Reuse:** extraction from p-2.2 · retrieval from p-3.1 · approval gates from p-4.1 ·
tracing, limits and eval gate from p-5.1.

**5. Slices:** skeleton → tenants and isolation test → golden set and eval gate →
explanations → candidate side → recruiter search → fairness review → real users.

**6. Non-goals:** payments, mobile app, scraping, training models, ATS integration,
custom design system.

**7. Risks:**
- *Resumes arrive as scanned PDFs* → OCR fallback, and measure how often it's needed.
- *Explanations cite lines that don't exist* → check every citation in code.
- *API spend runs away* → per-company budgets and rate limits before any real user.`,
      },
      {
        mode: 'break',
        title: 'Find the scoping mistakes',
        body: `A friend's capstone plan. Find at least five problems.

> "Phase 1: design system and landing page. Phase 2: fine-tune an open model on
> resumes so it understands hiring. Phase 3: scrape LinkedIn for candidates. Phase 4:
> add companies (tenants) once the core works. Phase 5: evals if there's time. Launch
> when it's perfect."`,
        answer: `1. **UI first** — polish before anything works end to end. Start with a skeleton.
2. **Fine-tuning** is a stated non-goal, and unnecessary: extraction and matching work
   with prompting and retrieval (Stage 5's fine-tuning ladder).
3. **Scraping LinkedIn** is a non-goal, breaks LinkedIn's terms, and raises consent
   problems with personal data.
4. **Tenants last** — retrofitting isolation is where leaks come from. Do it second.
5. **"Evals if there's time"** — without them you can't show match quality, and the
   eval gate is a core requirement.
6. **"Launch when it's perfect"** — real users are the point. Launch small, early,
   with limits in place.
7. There are no numbers anywhere: no cost ceiling, no speed target, no quality bar.`,
      },
    ],
  },
  {
    id: 's6.1.t2',
    moduleId: 's6.1',
    title: 'Multi-tenancy, for real',
    outcome: `You can wall off each company's data — in the database, the vector index, caches, traces and limits — and prove it with a test that runs on every pull request.`,
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
        query: 'Postgres row level security multi-tenant SaaS',
        channel: '',
        reason: 'RLS walked through in a real multi-tenant app',
      },
    ],
    animations: ['anim-tenant-isolation-bug'],
    analogy: `An apartment building. One building (your app), many flats (tenants). The lifts and water
pipes are shared (servers, database), but every door has its own lock, and the guard
checks the key — not what the visitor *says* about which flat they live in. In Mongo
terms: every document carries an \`orgId\`, and every query includes it. The bug is the one
query that forgets.`,
    notes: `## Tenants, in one picture

A **tenant** is one customer organisation and everything it owns: users, postings,
resumes, embeddings, logs. One shared app and database; strictly separate data.

- Each **user** belongs to one tenant and has a role: admin, recruiter, candidate.
- Every **row** carries a \`tenant_id\`.

One decision to make early: a candidate who applies to two companies. The simplest rule
is that a resume belongs to the company it was submitted to. Candidates own nothing
shared. Write the decision down, with why.

---

## Where the tenant comes from

Always from the **verified login** — the token or session your server checked. Never from
a request body, a query string or a header the browser sets. Those can be edited.

\`\`\`python
async def current_tenant(user: User = Depends(current_user)) -> UUID:
    return user.tenant_id   # from the verified token, never from the request
\`\`\`

Handlers take the tenant from this dependency. No endpoint accepts \`tenant_id\` as input.

---

## Two layers in the database

**Layer 1:** every query filters by tenant. It fails the day someone forgets.

**Layer 2: row-level security (RLS).** Postgres checks a policy on *every row* of *every*
query. A forgotten \`WHERE\` returns nothing extra.

\`\`\`sql
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON resumes
  USING      (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
\`\`\`

At the start of each transaction, the app sets the tenant:

\`\`\`sql
SELECT set_config('app.tenant_id', $1, true);  -- true = only for this transaction
\`\`\`

---

## The RLS details that bite

- **\`NULLIF(..., '')\`** — once a session has set the value, it reads as an empty string
  afterwards, and \`''::uuid\` throws an error. \`NULLIF\` turns it into \`NULL\`, so a missing
  tenant quietly matches **zero rows**. It fails closed.
- **Per transaction, not per connection.** With a connection pool, a value set on the
  connection would carry into the next request. \`set_config(..., true)\` dies with the
  transaction.
- **Owners skip RLS.** Superusers and the table's owner bypass policies. Run migrations as
  an owner role; run the app as a separate role. Or add \`FORCE ROW LEVEL SECURITY\`.
- **\`WITH CHECK\`** stops tenant A *writing* a row labelled as tenant B.

---

## Beyond the database

- **Vector index:** in pgvector, the same RLS policy covers embeddings. With an
  approximate index, a heavily filtered search can return fewer than k results — Stage 3's
  filter cliff. pgvector's iterative index scans help. Other vector databases: index the
  tenant field and filter on it in every search.
- **Caches:** the tenant goes in every cache key (Stage 5). A semantic cache without it is
  a leak that only shows up under load.
- **Traces and logs:** tag every span with the tenant; restrict who can read them.
- **Limits and budgets:** a token bucket and a monthly spend cap per tenant.
- **Files:** a storage prefix per tenant; short-lived signed URLs.
- **Deletion:** removing a tenant removes rows, vectors, files and cache entries.

---

## The isolation test

Seed two tenants, A and B. Put a **canary** in B's data — a phrase that appears nowhere
else, like \`zebra-canary-42\`. Then, logged in as A:

- call **every** endpoint that returns data, and assert the canary never appears;
- request B's objects **by ID** and expect 404 — this catches an **IDOR** (insecure
  direct object reference: reaching another tenant's object by guessing its ID);
- warm the cache as B, then ask the same question as A;
- run background jobs, exports and search as A.

Run it in CI on every pull request. Give it a name that says it's the most important test
in the repo.`,
    docs: [
      {
        label: 'PostgreSQL — row security policies',
        url: 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html',
      },
      {
        label: 'pgvector (see iterative index scans)',
        url: 'https://github.com/pgvector/pgvector',
      },
      {
        label: 'Qdrant — multitenancy',
        url: 'https://qdrant.tech/documentation/guides/multiple-partitions/',
      },
    ],
    glossary: [
      {
        term: 'tenant',
        def: 'One customer organisation and everything it owns inside your app.',
      },
      {
        term: 'row-level security (RLS)',
        def: 'A database feature that checks a policy on every row of every query.',
      },
      {
        term: 'IDOR',
        def: 'Insecure direct object reference: reaching another tenant\'s object by its ID.',
      },
      {
        term: 'canary',
        def: 'A unique marker planted in data so a test can detect if it leaks.',
      },
      {
        term: 'fail closed',
        def: 'When something is missing or broken, deny access rather than allow it.',
      },
    ],
    check: [
      {
        q: 'Where must the tenant ID come from, and why?',
        a: `From the verified login (token or session). Anything the client sends — body, query string, header — can be edited to name another tenant.`,
      },
      {
        q: 'What does row-level security add on top of WHERE clauses?',
        a: `The database enforces the tenant on every row of every query, so a forgotten filter returns nothing extra.`,
      },
      {
        q: 'Why wrap current_setting in NULLIF(..., \'\')?',
        a: `After a session has set the value, it reads as an empty string, and casting '' to uuid errors. NULLIF makes it NULL, so a missing tenant matches zero rows — it fails closed.`,
      },
      {
        q: 'Why set the tenant per transaction rather than per connection?',
        a: `Pooled connections are reused across requests. A per-connection value could carry one tenant's ID into the next tenant's request.`,
      },
      {
        q: 'What is an IDOR, and how does the isolation test catch it?',
        a: `Insecure direct object reference: reaching another tenant's object by its ID. The test requests B's IDs while logged in as A and expects 404.`,
      },
    ],
    practice: [
      {
        mode: 'break',
        title: 'Find the leaks',
        body: `This FastAPI code has four tenant leaks. Find each one and fix it.

\`\`\`python
@app.get("/resumes/{resume_id}")
async def get_resume(resume_id: UUID, db=Depends(db_session)):
    return await db.fetch_one("SELECT * FROM resumes WHERE id = $1", resume_id)

@app.get("/search")
async def search(q: str, tenant_id: UUID, db=Depends(db_session)):
    key = f"search:{q}"
    if hit := await cache.get(key):
        return hit
    rows = await hybrid_search(db, q, tenant_id=tenant_id)
    await cache.set(key, rows)
    return rows

async def nightly_export():            # runs as the table owner
    async with owner_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM resumes")
        for tenant, group in groupby(rows, key=lambda r: r["tenant_id"]):
            await upload_csv(f"exports/{tenant}.csv", group)
\`\`\``,
        answer: `1. **\`get_resume\` has no tenant check.** Any logged-in user can read any resume by ID
   (an IDOR). Fix: take the tenant from \`current_tenant\`, set it for the transaction
   so RLS applies, and add \`AND tenant_id = $2\` as the first layer. Return 404, not 403,
   so the endpoint doesn't confirm the ID exists.
2. **\`search\` takes \`tenant_id\` from the query string.** Anyone can pass another
   company's ID. Fix: \`tenant_id: UUID = Depends(current_tenant)\`.
3. **The cache key has no tenant.** Company B's cached results are served to company A
   for the same query. Fix: \`key = f"search:{tenant_id}:{hash(q)}"\`.
4. **The export runs as the table owner**, so RLS is skipped. \`groupby\` also needs
   rows sorted by tenant, or one tenant's rows get split and the file overwritten.
   Fix: loop over tenants, and for each one open a transaction as the app role, set
   the tenant, and export only what RLS returns.`,
      },
      {
        mode: 'tool',
        title: 'Row-level security, hands on',
        body: `With Postgres running (Docker is fine: \`docker run -e POSTGRES_PASSWORD=pw -p 5432:5432 postgres:16\`):

1. Create a \`resumes\` table with \`tenant_id uuid\`, enable RLS and add the policy from
   the slides.
2. Create a separate login role \`app\`, grant it \`SELECT, INSERT\` on the table, and
   insert one row each for two tenants (as the owner).
3. Connect as \`app\`. Before setting any tenant, count the rows.
4. In a transaction, \`set_config\` tenant A, and select with **no WHERE clause**.
5. Still as A, try to insert a row labelled as tenant B.
6. After the transaction ends, count again.
7. Connect as the owner and count. Then add \`FORCE ROW LEVEL SECURITY\` and count again.

Predict each result before you run it.`,
        answer: `The results, checked on Postgres 16:

| Step | Result |
|---|---|
| 3. As \`app\`, no tenant set | \`0\` rows — \`NULL\` matches nothing |
| 4. As A, no WHERE | only A's row |
| 5. Insert labelled B | \`ERROR: new row violates row-level security policy\` (\`WITH CHECK\`) |
| 6. After the transaction | \`0\` rows again — the setting died with the transaction |
| 7a. As the owner | both rows — owners bypass RLS |
| 7b. Owner, after \`FORCE\` | \`0\` rows — now the owner is checked too |

Try step 6 with the policy **without** \`NULLIF\`: it errors with
\`invalid input syntax for type uuid: ""\`. That's the reason for \`NULLIF\`.

Setup script:

\`\`\`sql
CREATE ROLE app LOGIN PASSWORD 'app';
CREATE TABLE resumes (id serial PRIMARY KEY, tenant_id uuid NOT NULL, body text NOT NULL);
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON resumes
  USING      (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
GRANT SELECT, INSERT ON resumes TO app;
GRANT USAGE ON SEQUENCE resumes_id_seq TO app;
INSERT INTO resumes (tenant_id, body) VALUES
  ('11111111-1111-1111-1111-111111111111', 'A: Go developer'),
  ('22222222-2222-2222-2222-222222222222', 'B: zebra-canary-42');
\`\`\``,
      },
      {
        mode: 'spec',
        title: 'Write the isolation test',
        body: `Write the pytest module that proves tenant A can't reach tenant B. Assume fixtures
\`client_a\` (an HTTP client logged in as A) and \`seed\` (creates both tenants and returns
B's IDs; B's resume contains \`zebra-canary-42\`). Cover:

- every data-returning endpoint,
- direct access to B's objects by ID,
- the cache (warm it as B first),
- the export job.

Ask Claude to draft it, then check each assertion yourself: would it *fail* if the leak
existed?`,
        answer: `\`\`\`python
import pytest

CANARY = "zebra-canary-42"

READ_PATHS = [
    "/resumes",
    "/search?q=zebra",
    "/search?q=python developer",
    "/postings/{a_posting}/matches",
    "/candidates/search?q=anyone who knows zebra",
]

@pytest.mark.parametrize("path", READ_PATHS)
def test_a_never_sees_b_data(client_a, seed, path):
    r = client_a.get(path.format(**seed))
    assert r.status_code == 200
    assert CANARY not in r.text          # the canary lives only in B's data

@pytest.mark.parametrize("path", ["/resumes/{b_resume}", "/postings/{b_posting}"])
def test_a_cannot_fetch_b_objects_by_id(client_a, seed, path):
    r = client_a.get(path.format(**seed))
    assert r.status_code == 404          # not 403: don't confirm the ID exists

def test_cache_is_per_tenant(client_a, client_b, seed):
    warm = client_b.get("/search?q=zebra")
    assert CANARY in warm.text           # proves B's search really finds it
    r = client_a.get("/search?q=zebra")  # same query, same cache key if buggy
    assert CANARY not in r.text

def test_export_contains_only_own_tenant(client_a, seed, run_export):
    csv_text = run_export(tenant="A")
    assert CANARY not in csv_text
\`\`\`

What makes it trustworthy:

- **The canary is checked as B too** (\`warm\`). A test that only asserts "not found"
  also passes when search is simply broken. Proving B *can* see it makes A's result
  meaningful.
- **404 rather than 403** for foreign IDs.
- **The paths list is the risk.** New endpoints must be added to it — a reviewer
  checklist item, or generate the list from the app's route table.`,
      },
    ],
  },
  {
    id: 's6.1.t3',
    moduleId: 's6.1',
    title: 'Explainable matching and a fairness review',
    outcome: `You can score a candidate against a job so every point traces to a quoted requirement and a quoted resume line — and prove with tests that name, gender, age and college don't move the score.`,
    minutes: 45,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'bias in AI hiring tools explained audit',
        channel: '',
        reason: 'how bias enters hiring tools, and how audits catch it',
      },
    ],
    animations: [],
    analogy: `A good exam marking scheme. Each mark is tied to a specific point ("mentions X: 1 mark"),
so a student can see exactly why they got 7 out of 10, and two examiners give the same
score. Anonymous marking — hiding names — keeps the examiner's bias out. Your matcher
needs both.`,
    notes: `## Why "no unexplained scores"

A bare "82% match" can't be checked, can't be argued with, and can hide bias. An explained
match can be verified by a recruiter in seconds and understood by a candidate.

Laws are heading the same way. New York City's Local Law 144 requires bias audits of
automated hiring tools. The EU's AI Act treats AI used in recruitment as **high-risk**,
with duties around transparency and human oversight. You're not a lawyer — but building
explanations and human review in from the start is what these rules push towards.

---

## Step 1: requirements as data

Extract the posting with structured output (Stage 2). Every requirement keeps the
**exact quote** it came from:

\`\`\`json
{"requirements": [
   {"id": "r1", "text": "3+ years building APIs in Python", "kind": "must",
    "quote": "You have 3+ years building production APIs in Python"},
   {"id": "r2", "text": "Vector database experience", "kind": "nice",
    "quote": "Bonus: you've used a vector database"}],
 "seniority": "mid"}
\`\`\`

**Must-have** vs **nice-to-have** matters: they're weighted differently.

---

## Step 2: a verdict per requirement, with evidence

A resume is short, so give the model the whole thing with numbered lines. For each
requirement it returns a **verdict** — met, partly, not met, or no evidence — and the line
numbers it relied on.

Then **check in code**: the cited lines must exist and be in range. A "met" with no valid
citation becomes "no evidence". (Stage 3's citation check, again.)

Now every claim points at a real line. A recruiter can click it.

---

## Step 3: the score is arithmetic

Don't ask the model for a number. Compute it:

- weight: must = 3, nice = 1
- credit: met = 1, partly = 0.5, not met / no evidence = 0
- score = Σ(weight × credit) ÷ Σ(weight), as a percentage
- any must-have missing → the label can't be "strong"

Example: two musts (met, partly) and two nice-to-haves (met, not met):
(3×1 + 3×0.5 + 1×1 + 1×0) ÷ 8 = 5.5 ÷ 8 ≈ **69%**.

The model reads; code scores. Every point traces to a requirement and a line. That *is*
the explanation.

---

## The fairness review: what to exclude

Signals that shouldn't affect a match, and the proxies that leak them:

- **Name** → gender, religion, caste, region
- **Gender, marital status, photo**
- **Age** → date of birth, graduation year
- **Address** → community, income
- **College name or tier** → family income and privilege. If a job truly needs a
  degree, match the *degree*, not the college.

Two defences:

1. **Allowlist, don't blocklist.** Build the matcher's input from allowed fields only —
   skills, experience, projects. Then scrub the candidate's own name and college out of
   those texts.
2. **Test that it holds** — counterfactual tests.

---

## Counterfactual tests

Take a resume. Make a copy that changes **only** an excluded signal — a different name,
another college, an older graduation year — everywhere it appears. Then:

- **Input level:** the matcher's input must be *identical* for both. Deterministic, fast,
  runs in CI.
- **End to end,** on a sample: scores must match. First run the *same* resume twice to
  measure normal model noise, then allow only that much difference.

At scale, also compare **outcomes by group**, with consented, self-reported data. The US
"four-fifths rule" flags a group whose selection rate is below 80% of the highest group's.
With ten users you can't measure this — write down the method you'd use.

Put it all in \`FAIRNESS.md\`: what's excluded and why, how it's enforced, the test
results, and what you *can't* remove (writing style, for instance).`,
    docs: [
      {
        label: 'Claude — citations',
        url: 'https://platform.claude.com/docs/en/build-with-claude/citations',
      },
      {
        label: 'NYC — automated employment decision tools',
        url: 'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page',
      },
      {
        label: 'EU AI Act (Regulation 2024/1689)',
        url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
      },
    ],
    glossary: [
      {
        term: 'verdict',
        def: 'The per-requirement judgement: met, partly, not met, or no evidence.',
      },
      {
        term: 'allowlist',
        def: 'A list of what\'s permitted; anything not on it is left out by default.',
      },
      {
        term: 'proxy',
        def: 'A signal that stands in for a protected one, like graduation year for age.',
      },
      {
        term: 'counterfactual test',
        def: 'Change only one attribute and check that the result doesn\'t change.',
      },
      {
        term: 'four-fifths rule',
        def: 'A screening check: a group\'s selection rate below 80% of the top group\'s suggests adverse impact.',
      },
    ],
    check: [
      {
        q: 'Why compute the score in code instead of asking the model for a number?',
        a: `Code is consistent and traceable: each point maps to a requirement and a cited line. A model's numbers drift between runs and can't be explained.`,
      },
      {
        q: 'What does the citation check do?',
        a: `It confirms that every cited resume line exists. A 'met' verdict with no valid citation is downgraded to 'no evidence'.`,
      },
      {
        q: 'Name three excluded signals and a proxy for each.',
        a: 'Name → gender or region; age → graduation year; income → college name or address.',
      },
      {
        q: 'What is a counterfactual test?',
        a: `Change only an excluded attribute, everywhere it appears, and assert that the matcher's input — and so the score — doesn't change.`,
      },
      {
        q: 'Why allowlist fields rather than blocklist them?',
        a: `A blocklist misses whatever you didn't think of. An allowlist sends only what you chose, so new fields stay out by default.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Score it in code',
        body: `Write \`score(reqs, verdicts, n_lines)\` with these rules:

- \`reqs\`: a list of \`{"id", "kind"}\` where kind is \`"must"\` or \`"nice"\`
- \`verdicts\`: \`{req_id: {"verdict": ..., "lines": [int]}}\`; verdict is \`"met"\`,
  \`"partly"\`, \`"not_met"\` or \`"no_evidence"\`. A missing requirement means no evidence.
- Lines outside \`0..n_lines-1\` are invalid. A \`met\` or \`partly\` with no valid line
  becomes \`no_evidence\`.
- Weights: must 3, nice 1. Credit: met 1, partly 0.5, otherwise 0.
- Return \`score\` (a rounded percentage), \`must_missing\` (ids), and \`label\`:
  \`"strong"\` if score ≥ 75 and no must is missing; \`"partial"\` if score ≥ 40;
  otherwise \`"weak"\`.

Check it against: r1 must met [2] · r2 must partly [5] · r3 nice met [] · r4 nice
not_met, with 10 lines. Then change r2's lines to \`[99]\`.`,
        answer: `\`\`\`python
WEIGHT = {"must": 3, "nice": 1}
CREDIT = {"met": 1.0, "partly": 0.5, "not_met": 0.0, "no_evidence": 0.0}

def score(reqs, verdicts, n_lines):
    total = got = 0.0
    must_missing = []
    for r in reqs:
        v = verdicts.get(r["id"], {"verdict": "no_evidence", "lines": []})
        verdict = v["verdict"]
        lines = [i for i in v.get("lines", []) if 0 <= i < n_lines]
        if verdict in ("met", "partly") and not lines:
            verdict = "no_evidence"          # a claim needs a real citation
        w = WEIGHT[r["kind"]]
        total += w
        got += w * CREDIT[verdict]
        if r["kind"] == "must" and CREDIT[verdict] == 0:
            must_missing.append(r["id"])
    pct = round(100 * got / total) if total else 0
    if pct >= 75 and not must_missing:
        label = "strong"
    elif pct >= 40:
        label = "partial"
    else:
        label = "weak"
    return {"score": pct, "must_missing": must_missing, "label": label}
\`\`\`

**First case:** r3 has no lines, so it becomes no evidence.
Score = (3×1 + 3×0.5 + 0 + 0) ÷ 8 = 4.5 ÷ 8 = **56**, \`must_missing = []\`, label
**partial**.

**With r2's lines = [99]:** r2 becomes no evidence and counts as a missing must.
Score = 3 ÷ 8 = **38** (37.5, which Python's \`round\` takes to the even 38),
\`must_missing = ["r2"]\`, label **weak**.

Watch the rounding: Python rounds halves to the nearest even number. If you'd rather
always round halves up, write \`int(x + 0.5)\` — and write the choice down.`,
      },
      {
        mode: 'spec',
        title: 'Counterfactual tests for the matcher\'s input',
        body: `Resumes are already extracted into fields (p-2.2):
\`name, gender, college, grad_year, skills, experience, projects\`.

1. Write \`matcher_input(resume)\` that keeps only \`skills\`, \`experience\` and \`projects\`,
   and scrubs the candidate's name parts and college out of their text, plus any
   four-digit year.
2. Write \`swap(resume, field, new)\` that changes a field **and** every place its old
   value appears in the text fields.
3. Write a parametrised pytest asserting that swapping name, college or graduation year
   leaves \`matcher_input\` unchanged.

Why does \`swap\` need to edit the text too?`,
        answer: `\`\`\`python
import re
import pytest

ALLOWED = ("skills", "experience", "projects")

def matcher_input(resume: dict) -> dict:
    scrub = [p for p in resume.get("name", "").split() if len(p) > 1]
    if resume.get("college"):
        scrub.append(resume["college"])

    def clean(text: str) -> str:
        for s in sorted(scrub, key=len, reverse=True):
            text = re.sub(re.escape(s), "[REDACTED]", text, flags=re.IGNORECASE)
        return re.sub(r"\\b(19|20)\\d{2}\\b", "[YEAR]", text)

    return {k: [clean(x) for x in resume.get(k, [])] for k in ALLOWED}

def swap(resume: dict, field: str, new) -> dict:
    old = str(resume[field])
    out = {**resume, field: new}
    for k in ALLOWED:
        out[k] = [x.replace(old, str(new)) for x in resume.get(k, [])]
    if field == "name":        # first names appear on their own, too
        for o, n in zip(old.split(), str(new).split()):
            out = {**out, **{k: [x.replace(o, n) for x in out[k]] for k in ALLOWED}}
    return out

BASE = {
    "name": "Rahul Sharma", "gender": "male", "college": "IIT Delhi", "grad_year": 2019,
    "skills": ["Python", "FastAPI", "Postgres"],
    "experience": ["Built payment APIs at Acme, 2019-2023",
                   "Rahul mentored juniors at the IIT Delhi coding club"],
    "projects": ["RAG over 2M documents"],
}

@pytest.mark.parametrize("field,new", [
    ("name", "Priya Nair"), ("name", "Mohammed Iqbal"),
    ("college", "Government Engineering College, Bhuj"), ("grad_year", 2005),
])
def test_excluded_signal_does_not_reach_matcher(field, new):
    assert matcher_input(swap(BASE, field, new)) == matcher_input(BASE)
\`\`\`

All four cases pass.

**Why \`swap\` edits the text:** in real resumes the college and name appear inside the
text ("mentored juniors at the IIT Delhi coding club"). If you changed only the field,
the text would still say "IIT Delhi", the inputs would differ, and the test would fail
for the wrong reason. A real counterfactual changes the attribute everywhere.

**A trade-off to note in \`FAIRNESS.md\`:** scrubbing years also removes "2019-2023",
which the matcher needs for "3+ years". Fix it upstream: compute \`years_experience\`
during extraction, and pass that number instead of raw dates.`,
      },
      {
        mode: 'decision',
        title: 'Should this signal count?',
        body: `For each, decide: **use it**, **exclude it**, or **use it carefully** — and say why.

1. A two-year gap in employment
2. A degree from a top-ranked college
3. A CS degree, when the posting says "CS degree or equivalent experience"
4. Lives in Pune, for an on-site role in Pune
5. Is 45 years old
6. Writes "led the migration" rather than "helped with the migration"
7. A GitHub link with recent activity`,
        answer: `1. **Exclude from scoring.** Gaps often come from caregiving, illness or study, and they
   hit some groups harder. Match on skills and experience instead.
2. **Exclude the college.** It's a strong proxy for family income. If a degree is
   truly required, check the degree.
3. **Use it carefully.** Credit the degree *or* equivalent experience, as the posting
   says, so it's never the only route to "met".
4. **Use it carefully.** Willingness to work on site is a real job need — but ask the
   candidate, rather than inferring it from an address.
5. **Exclude.** Age isn't job-relevant, and in many places using it is illegal.
6. **Use it carefully.** The ownership is real signal, but wording style varies by
   culture and confidence. Ask the model for evidence of what was done, not for the
   verb used.
7. **Use it carefully.** It's a good signal when present, but many strong engineers
   can't publish their work. Its absence mustn't count against anyone.`,
      },
    ],
  },
  {
    id: 's6.1.t4',
    moduleId: 's6.1',
    title: 'Real users: launch, listen, improve',
    outcome: `You can get ten real people using the capstone safely, turn what they do and say into eval cases and fixes, and write up what they did that you didn't predict.`,
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
        query: 'how to get your first users for a side project',
        channel: '',
        reason: 'practical ways to find early users',
      },
    ],
    animations: [],
    analogy: `The first time you showed a MERN app to friends: within five minutes someone clicked the
button you forgot to disable, and typed an emoji into the phone field. Real users find bugs
faster than any test suite — and they're the only way to learn what people actually want.`,
    notes: `## Why ten users is enough

Ten real users give you what solo testing can't: surprising inputs, real questions, and
the exact place people give up.

It also changes what you can say in an interview. "Eleven recruiters ran 140 searches, and
here's what broke" beats "it works on my machine" every time.

---

## Finding them

- **Candidates:** classmates and juniors in placement season. They have resumes and
  real postings.
- **Recruiters and hiring managers:** founders and alumni you know, small startups
  without big hiring tools, your college placement cell.
- **The ask:** "Try it on one real posting and tell me what's wrong — 20 minutes."
  Offer something back, like a free review of their job description.
- **Don't** spam groups or scrape anyone.

---

## Before anyone logs in: consent and safety

Resumes are personal data. India's Digital Personal Data Protection Act, 2023 (DPDP)
expects consent for a clear purpose, and lets people have their data erased. In practice:

- A plain-language **privacy note**: what you store, why, for how long, who sees it.
- **Consent** at upload, and a **delete my data** button that really deletes — rows,
  vectors, files and cache entries.
- **Budgets and rate limits** per company and per user, so one curious person can't burn
  your API budget (Stage 5).
- **Synthetic resumes** in demo videos. Never a real person's.

---

## Measure what people do

Record **events**: \`signed_up\`, \`uploaded_resume\`, \`created_posting\`, \`ran_match\`,
\`opened_explanation\`, \`marked_match\` (right or wrong, with a reason), \`returned\`.

A Postgres table is enough. PostHog's free tier works too.

Then a **funnel** — how many people reach each step:
signed up → ran a match → marked a match → came back. The step where most people drop
is where to work next.

---

## Feedback becomes evals

Every "this match is wrong, because…" is a free eval case. Each round:

1. Read all the new feedback, plus 20 random traces.
2. Group the failures into categories (Stage 5's error analysis).
3. Add representative cases to the golden set, after checking the label yourself.
4. Fix the biggest category. Show the metric moved. Ship through the eval gate.
5. Tell the people who reported it. People keep using things that listen.

---

## "What real users did that I didn't predict"

The brief asks for this write-up. Keep each entry short and specific:

> **Observation:** recruiters pasted whole postings, benefits included; the extractor
> listed "free lunch" as a requirement.
> **Evidence:** 9 of 31 postings had one or more non-requirements.
> **Change:** the schema separates requirements from benefits; a new eval case per type.
> **Result:** 0 of 31 after the fix.

In interviews, this document is evidence you've run a real system — which is rarer than
having built one.`,
    docs: [
      {
        label: 'PostHog docs',
        url: 'https://posthog.com/docs',
      },
      {
        label: 'PostgreSQL — aggregate FILTER clause',
        url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES',
      },
    ],
    glossary: [
      {
        term: 'funnel',
        def: 'Counts of users reaching each step of a flow, in order.',
      },
      {
        term: 'event',
        def: 'A record that a user did something, with a time and details.',
      },
      {
        term: 'DPDP Act',
        def: `India's Digital Personal Data Protection Act, 2023: consent, purpose and erasure rules for personal data.`,
      },
      {
        term: 'synthetic data',
        def: 'Realistic but made-up data, used where real personal data would be risky.',
      },
    ],
    check: [
      {
        q: 'What has to exist before the first real resume is uploaded?',
        a: `A privacy note, consent at upload, a working delete-my-data path, and per-company and per-user budgets and rate limits.`,
      },
      {
        q: 'What is a funnel, and what do you do with one?',
        a: 'Counts of how many users reach each step in order. You work on the step where the most people drop.',
      },
      {
        q: 'How does a user\'s feedback become an eval case?',
        a: `Take the input, the expected judgement and the reason; check the label yourself; add it to the golden set.`,
      },
      {
        q: 'Why write up what users did that you didn\'t predict?',
        a: `It's evidence you've operated a real system and learned from it — rarer, and more convincing, than a feature list.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Triage this round\'s feedback',
        body: `Eight pieces of feedback came in. Group them into categories, pick the one fix to do
first, and say which ones become eval cases.

1. "Candidate #14 is a 'strong' match but has never used Python — the posting's
   must-have."
2. "The page took forever with 300 candidates."
3. "Explanation says this candidate led a team; the resume doesn't say that."
4. "Can't upload my resume" (the PDF is a scanned image).
5. "Why is 'free snacks' listed as a requirement?"
6. "It said my Go experience doesn't count for 'backend experience'."
7. "Another scanned PDF failed."
8. "The explanation quotes a line from a different candidate's resume!"`,
        answer: `**Categories:**

- **Wrong verdicts:** 1, 6 — a must-have missed; synonyms not recognised.
- **Unfaithful explanations:** 3, 8 — claims without support.
- **Extraction:** 5 (a benefit taken as a requirement); 4, 7 (no text layer, so OCR).
- **Speed:** 2.

**First fix: #8.** A quote from *another candidate's* resume could be a **tenant or
data leak**, not just a model error. Treat it as a security incident. Check whether
the other candidate belongs to another company; check the retrieval filter and the
citation check. Then fix #3 by enforcing "every cited line must exist in *this*
resume" in code.

**Eval cases:** 1, 3, 5, 6 and 8 become golden-set cases with checked labels, and 8
also becomes a regression test in the isolation suite. 4 and 7 become ingestion tests
with scanned PDFs. 2 is a load-test scenario, not an eval case.`,
      },
      {
        mode: 'spec',
        title: 'The events table and the funnel query',
        body: `Design an \`events\` table for the capstone, and write one SQL query that returns, per
funnel step, how many users reached it:

1. \`signed_up\`
2. \`ran_match\` (after signing up)
3. \`marked_match\` (after their first match)
4. came back: any event at least 7 days after signing up`,
        answer: `\`\`\`sql
CREATE TABLE events (
  id         bigserial PRIMARY KEY,
  tenant_id  uuid        NOT NULL,
  user_id    uuid        NOT NULL,
  name       text        NOT NULL,              -- 'signed_up', 'ran_match', ...
  props      jsonb       NOT NULL DEFAULT '{}', -- e.g. {"correct": false, "reason": "..."}
  at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON events (user_id, at);
CREATE INDEX ON events (name, at);

WITH firsts AS (
  SELECT user_id,
         MIN(at) FILTER (WHERE name = 'signed_up')    AS signed_up,
         MIN(at) FILTER (WHERE name = 'ran_match')    AS ran_match,
         MIN(at) FILTER (WHERE name = 'marked_match') AS marked_match,
         MAX(at)                                      AS last_seen
  FROM events
  GROUP BY user_id
)
SELECT
  COUNT(signed_up)                                                  AS signed_up,
  COUNT(*) FILTER (WHERE ran_match >= signed_up)                    AS ran_a_match,
  COUNT(*) FILTER (WHERE marked_match >= ran_match
                     AND ran_match >= signed_up)                    AS marked_a_match,
  COUNT(*) FILTER (WHERE last_seen >= signed_up + interval '7 days') AS came_back
FROM firsts;
\`\`\`

Notes:

- \`MIN(...) FILTER (WHERE ...)\` finds each user's **first** time at each step, in one
  pass over the table.
- Comparisons with \`NULL\` are false, so users who never reached a step drop out of
  that count on their own.
- "Came back" uses the user's last event, so one query answers all four steps.
- Keep \`tenant_id\` on events too — usage data is tenant data, and RLS applies to it.`,
      },
    ],
  },
];
